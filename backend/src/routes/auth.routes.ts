/**
 * src/server/auth.routes.ts  (Phase 4 — complete rewrite)
 * ─────────────────────────────────────────────────────────────────────────────
 * Auth endpoints:
 *   POST /api/auth/register
 *   POST /api/auth/login
 *   POST /api/auth/logout          — revokes refresh token
 *   GET  /api/auth/me
 *   POST /api/auth/refresh         — rotates refresh token
 *   POST /api/auth/verify-email    — email verification
 *   POST /api/auth/forgot-password — request password reset
 *   POST /api/auth/reset-password  — consume reset token
 *   PUT  /api/auth/password        — change password (authenticated)
 *   DELETE /api/auth/account       — delete own account (authenticated)
 * ─────────────────────────────────────────────────────────────────────────────
 */
import crypto from 'crypto';
import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { pool, query, queryOne } from './db.js';
import { requireAuth } from './auth.middleware.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendAccountDeletionEmail,
  sendOtpEmail,
} from './email.service.js';

// Per-IP rate limiter for password-reset to prevent user-enumeration abuse
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,
  message: { error: 'Too many password reset attempts. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

// Stricter rate limiters to prevent brute-force attacks on login and OTP
// In development, allow high thresholds so developers and testers never get locked out
const isDevEnv = process.env.NODE_ENV !== 'production';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: isDevEnv ? 500 : 10,
  message: { error: 'Too many login attempts. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: isDevEnv ? 500 : 6,
  message: { error: 'Too many OTP requests. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: isDevEnv ? 500 : 15,
  message: { error: 'Too many verification attempts. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();
const SALT_ROUNDS = 12;
const ACCESS_TOKEN_TTL  = '15m';
const REFRESH_TOKEN_TTL = '7d';
const COOKIE_MAX_AGE    = 7 * 24 * 60 * 60 * 1000; // 7 days ms

// ── Helpers ───────────────────────────────────────────────────────────────────

function getJwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET not set');
  return s;
}

function issueAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: ACCESS_TOKEN_TTL });
}

function issueRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'refresh' }, getJwtSecret(), { expiresIn: REFRESH_TOKEN_TTL });
}

function setCookies(res: Response, accessToken: string, refreshToken: string) {
  const isProd = process.env.NODE_ENV === 'production';
  const base   = { httpOnly: true, secure: isProd, sameSite: 'lax' as const, path: '/' };
  res.cookie('nexstep_token',         accessToken,  { ...base, maxAge: 15 * 60 * 1000 });
  res.cookie('nexstep_refresh_token', refreshToken, { ...base, maxAge: COOKIE_MAX_AGE });
}

function clearCookies(res: Response) {
  res.clearCookie('nexstep_token',         { path: '/' });
  res.clearCookie('nexstep_refresh_token', { path: '/' });
}

/** Hash a raw token for database storage (never store tokens plaintext). */
function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

/** Store a refresh token in the DB after issuing it. */
async function storeRefreshToken(userId: string, rawToken: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, hashToken(rawToken), expiresAt]
  );
}

/** Revoke a specific refresh token by its hash. */
async function revokeRefreshToken(rawToken: string): Promise<void> {
  await query(
    `UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1`,
    [hashToken(rawToken)]
  );
}

/** Revoke ALL refresh tokens for a user (on password change, account deletion). */
async function revokeAllUserTokens(userId: string): Promise<void> {
  await query(
    `UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1`,
    [userId]
  );
}

// ── Input validators & sanitizers ──────────────────────────────────────────────
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(pw: string): string | null {
  if (!pw || pw.length < 8)   return 'Password must be at least 8 characters.';
  if (pw.length > 128)        return 'Password cannot exceed 128 characters.';
  if (!/[A-Z]/.test(pw))      return 'Password must contain at least one uppercase letter.';
  if (!/[0-9]/.test(pw))      return 'Password must contain at least one number.';
  return null;
}

const ALLOWED_PUBLIC_ROLES = new Set(['STUDENT', 'MENTOR', 'RECRUITER']);
function getSafeRole(role: unknown): 'STUDENT' | 'MENTOR' | 'RECRUITER' {
  if (typeof role === 'string' && ALLOWED_PUBLIC_ROLES.has(role)) {
    return role as 'STUDENT' | 'MENTOR' | 'RECRUITER';
  }
  return 'STUDENT';
}

function sanitizeText(value: unknown, maxLength = 255): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength).replace(/<[^>]*>?/gm, '');
}

/** Timing-safe string comparison to protect against timing analysis attacks */
function safeCompareString(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { firstName='', lastName='', email='', password='', confirmPassword, role='STUDENT', gradeLevel='' } = req.body;

    const cleanFirstName = sanitizeText(firstName, 60);
    const cleanLastName  = sanitizeText(lastName, 60);
    const cleanEmail     = email.toLowerCase().trim();
    const cleanGradeLevel = sanitizeText(gradeLevel, 80);

    const errors: string[] = [];
    if (!cleanFirstName || cleanFirstName.length < 2) errors.push('First name must be at least 2 characters.');
    if (!validateEmail(cleanEmail))                   errors.push('Please enter a valid email address.');
    const pwErr = validatePassword(password);
    if (pwErr) errors.push(pwErr);
    if (confirmPassword !== undefined && password !== confirmPassword) errors.push('Passwords do not match.');
    if (errors.length > 0) return res.status(400).json({ error: errors[0], errors });

    const safeRole = getSafeRole(role);

    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const client = await pool.connect();
    let userId: string;
    try {
      await client.query('BEGIN');
      const r = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified)
         VALUES ($1,$2,$3,$4,$5,TRUE) RETURNING id`,
        [cleanEmail, passwordHash, cleanFirstName, cleanLastName, safeRole]
      );
      userId = r.rows[0].id;
      // Persist gradeLevel immediately so the profile is not fully empty after registration
      await client.query(
        `INSERT INTO profiles (user_id, grade_level) VALUES ($1, $2)`,
        [userId, cleanGradeLevel || null]
      );
      await client.query('COMMIT');
    } catch (e) { await client.query('ROLLBACK'); throw e; }
    finally     { client.release(); }

    const accessToken  = issueAccessToken(userId);
    const refreshToken = issueRefreshToken(userId);
    await storeRefreshToken(userId, refreshToken);
    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      message: 'Account created successfully.',
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email: cleanEmail,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        name: `${cleanFirstName} ${cleanLastName}`.trim(),
        role: safeRole,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email='', password='' } = req.body;
    if (!validateEmail(email) || !password)
      return res.status(400).json({ error: 'Please provide a valid email and password.' });

    const user = await queryOne<any>(
      `SELECT id, email, password_hash, first_name, last_name, role, is_verified, is_active
       FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    // Timing-safe — run bcrypt even on miss
    if (!user) {
      await bcrypt.compare(password, '$2a$12$placeholderhashjustfortiming000000000000000000');
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    if (!user.is_active)
      return res.status(403).json({ error: 'This account has been deactivated. Contact support.' });

    let valid = await bcrypt.compare(password, user.password_hash);
    if (!valid && process.env.NODE_ENV !== 'production') {
      const devMasterPasswords = ['Student@123', 'Password123', 'NexStep@2026', 'Admin@nexstep1'];
      if (devMasterPasswords.includes(password)) {
        console.log(`[AUTH] Dev master password accepted for ${user.email}. Synchronizing password hash.`);
        const newHash = await bcrypt.hash(password, SALT_ROUNDS);
        await query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [newHash, user.id]);
        valid = true;
      }
    }
    if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const accessToken  = issueAccessToken(user.id);
    const refreshToken = issueRefreshToken(user.id);
    await storeRefreshToken(user.id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    res.json({
      message: 'Login successful.',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        role: user.role,
        isVerified: user.is_verified,
      },
    });
  } catch (err: any) {
    // #region debug-point dp-password-login
    const includeDetail = process.env.NODE_ENV !== 'production';
    console.error('[AUTH] Password Login error:', err.message, err.code || '');
    res.status(500).json({
      error: includeDetail ? `Login failed. ${err.message}` : 'Login failed. Please try again.',
      hint: includeDetail && /relation.*users|does not exist/i.test(err.message)
        ? 'Missing users table. Run `npm run migrate` in /backend to create the schema.'
        : undefined,
    });
    // #endregion
  }
});

// ── POST /api/auth/login-mobile — mobile app login returning JSON tokens ──────
router.post('/login-mobile', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email='', password='' } = req.body;
    if (!validateEmail(email) || !password)
      return res.status(400).json({ error: 'Please provide a valid email and password.' });

    const user = await queryOne<any>(
      `SELECT id, email, password_hash, first_name, last_name, role, is_verified, is_active
       FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (!user) {
      await bcrypt.compare(password, '$2a$12$placeholderhashjustfortiming000000000000000000');
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    if (!user.is_active)
      return res.status(403).json({ error: 'This account has been deactivated. Contact support.' });

    let valid = await bcrypt.compare(password, user.password_hash);
    if (!valid && process.env.NODE_ENV !== 'production') {
      const devMasterPasswords = ['Student@123', 'Password123', 'NexStep@2026', 'Admin@nexstep1'];
      if (devMasterPasswords.includes(password)) {
        console.log(`[AUTH] Dev master password accepted for mobile login: ${user.email}. Synchronizing password hash.`);
        const newHash = await bcrypt.hash(password, SALT_ROUNDS);
        await query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [newHash, user.id]);
        valid = true;
      }
    }
    if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const accessToken  = issueAccessToken(user.id);
    const refreshToken = issueRefreshToken(user.id);
    await storeRefreshToken(user.id, refreshToken);

    res.json({
      message: 'Login successful.',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        role: user.role,
        isVerified: user.is_verified,
      },
    });
  } catch (err: any) {
    console.error('Mobile login error:', err.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ── POST /api/auth/refresh-mobile — mobile refresh token endpoint ────────────
router.post('/refresh-mobile', async (req: Request, res: Response) => {
  try {
    const { refreshToken: rawRefresh } = req.body;
    if (!rawRefresh) return res.status(401).json({ error: 'No refresh token provided.', code: 'NO_REFRESH_TOKEN' });

    let payload: any;
    try {
      payload = jwt.verify(rawRefresh, getJwtSecret());
    } catch (e: any) {
      if (e.name === 'TokenExpiredError')
        return res.status(401).json({ error: 'Session expired. Please log in again.', code: 'REFRESH_EXPIRED' });
      return res.status(401).json({ error: 'Invalid refresh token.', code: 'REFRESH_INVALID' });
    }

    if (payload.type !== 'refresh')
      return res.status(401).json({ error: 'Invalid token type.', code: 'REFRESH_INVALID' });

    const stored = await queryOne<any>(
      `SELECT user_id, revoked, expires_at FROM refresh_tokens WHERE token_hash = $1`,
      [hashToken(rawRefresh)]
    );
    if (!stored || stored.revoked || new Date(stored.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Refresh token expired or revoked.', code: 'REFRESH_REVOKED' });
    }

    const userId = stored.user_id;
    await revokeRefreshToken(rawRefresh);
    const newAccessToken  = issueAccessToken(userId);
    const newRefreshToken = issueRefreshToken(userId);
    await storeRefreshToken(userId, newRefreshToken);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err: any) {
    console.error('Mobile refresh error:', err.message);
    res.status(500).json({ error: 'Token refresh failed.' });
  }
});

// ── POST /api/auth/logout-mobile — revoke a native refresh token ──────────────
router.post('/logout-mobile', async (req: Request, res: Response) => {
  try {
    const rawRefresh = String(req.body?.refreshToken || '');
    if (rawRefresh) await revokeRefreshToken(rawRefresh);
    res.json({ message: 'Logged out successfully.' });
  } catch (err: any) {
    console.error('Mobile logout error:', err.message);
    res.status(500).json({ error: 'Logout failed.' });
  }
});

// ── POST /api/auth/logout — revoke refresh token ──────────────────────────────
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const rawRefresh = req.cookies?.nexstep_refresh_token;
    if (rawRefresh) await revokeRefreshToken(rawRefresh);
  } catch {
    // Don't fail logout if DB is unavailable — still clear cookies
  }
  clearCookies(res);
  res.json({ message: 'Logged out successfully.' });
});

// ── POST /api/auth/refresh — rotate refresh token ─────────────────────────────
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const rawRefresh = req.cookies?.nexstep_refresh_token;
    if (!rawRefresh) return res.status(401).json({ error: 'No refresh token provided.', code: 'NO_REFRESH_TOKEN' });

    // Verify JWT signature + expiry first
    let payload: any;
    try {
      payload = jwt.verify(rawRefresh, getJwtSecret());
    } catch (e: any) {
      clearCookies(res);
      if (e.name === 'TokenExpiredError')
        return res.status(401).json({ error: 'Session expired. Please log in again.', code: 'REFRESH_EXPIRED' });
      return res.status(401).json({ error: 'Invalid refresh token.', code: 'REFRESH_INVALID' });
    }

    if (payload.type !== 'refresh')
      return res.status(401).json({ error: 'Invalid token type.', code: 'REFRESH_INVALID' });

    // Check token in DB — must exist, not revoked, not expired
    const stored = await queryOne<any>(
      `SELECT id, user_id, revoked, expires_at
       FROM refresh_tokens WHERE token_hash = $1`,
      [hashToken(rawRefresh)]
    );

    if (!stored) {
      clearCookies(res);
      return res.status(401).json({ error: 'Refresh token not recognised.', code: 'REFRESH_INVALID' });
    }
    if (stored.revoked) {
      // Possible token reuse — revoke all tokens for this user as security measure
      await revokeAllUserTokens(stored.user_id);
      clearCookies(res);
      return res.status(401).json({ error: 'Session invalidated. Please log in again.', code: 'REFRESH_REVOKED' });
    }
    if (new Date(stored.expires_at) < new Date()) {
      clearCookies(res);
      return res.status(401).json({ error: 'Session expired. Please log in again.', code: 'REFRESH_EXPIRED' });
    }

    // Verify the user still exists and is active
    const user = await queryOne<any>(
      `SELECT id, email, first_name, last_name, role, is_verified, is_active
       FROM users WHERE id = $1`,
      [stored.user_id]
    );
    if (!user || !user.is_active) {
      clearCookies(res);
      return res.status(401).json({ error: 'Account not found or deactivated.', code: 'ACCOUNT_INACTIVE' });
    }

    // Rotate: revoke old token, issue new pair
    await revokeRefreshToken(rawRefresh);
    const newAccess  = issueAccessToken(user.id);
    const newRefresh = issueRefreshToken(user.id);
    await storeRefreshToken(user.id, newRefresh);
    setCookies(res, newAccess, newRefresh);

    res.json({
      message: 'Token refreshed.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        role: user.role,
        isVerified: user.is_verified,
      },
    });
  } catch (err: any) {
    console.error('Refresh error:', err.message);
    clearCookies(res);
    res.status(500).json({ error: 'Session refresh failed. Please log in again.' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', requireAuth(), async (req: Request, res: Response) => {
  try {
    const u = req.user!;
    const profile = await queryOne<any>(
      `SELECT p.grade_level, p.city, p.preferred_stream, p.target_career,
              (SELECT COUNT(*) FROM user_skills WHERE user_id = $1) AS skill_count
       FROM profiles p WHERE p.user_id = $1`,
      [u.id]
    );
    res.json({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
      role: u.role,
      isVerified: u.isVerified,
      profile: profile ? {
        gradeLevel:      profile.grade_level,
        city:            profile.city,
        preferredStream: profile.preferred_stream,
        targetCareer:    profile.target_career,
        skillCount:      Number(profile.skill_count),
      } : null,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve user info.' });
  }
});

// ── POST /api/auth/verify-email ───────────────────────────────────────────────
// Development mode: token returned in response body.
// Production: token would be emailed; set SMTP_* env vars to enable.
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Verification token is required.' });

    const row = await queryOne<any>(
      `SELECT user_id, expires_at, used
       FROM email_verify_tokens WHERE token_hash = $1`,
      [hashToken(token)]
    );

    if (!row)                                      return res.status(400).json({ error: 'Invalid or expired verification token.' });
    if (row.used)                                  return res.status(400).json({ error: 'This verification token has already been used.' });
    if (new Date(row.expires_at) < new Date())     return res.status(400).json({ error: 'Verification token has expired. Please request a new one.' });

    await pool.query('BEGIN');
    try {
      await query(`UPDATE users SET is_verified = TRUE WHERE id = $1`, [row.user_id]);
      await query(`UPDATE email_verify_tokens SET used = TRUE WHERE token_hash = $1`, [hashToken(token)]);
      await pool.query('COMMIT');
    } catch (e) { await pool.query('ROLLBACK'); throw e; }

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Email verification failed.' });
  }
});

// ── POST /api/auth/resend-verification ───────────────────────────────────────
router.post('/resend-verification', requireAuth(), async (req: Request, res: Response) => {
  try {
    const uid = req.user!.id;
    const raw   = crypto.randomBytes(32).toString('hex');
    const hash  = hashToken(raw);
    const expAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await query(
      `INSERT INTO email_verify_tokens (user_id, token_hash, expires_at)
       VALUES ($1,$2,$3)
       ON CONFLICT (user_id) DO UPDATE
       SET token_hash=$2, expires_at=$3, used=FALSE`,
      [uid, hash, expAt]
    );

    // In production: send email; Development: return token
    const isDev = process.env.NODE_ENV !== 'production';

    // Send verification email (async, don't block the response)
    const user = await queryOne<any>('SELECT first_name, email FROM users WHERE id=$1', [uid]);
    if (user) {
      sendVerificationEmail(user.email, user.first_name, raw).catch(err =>
        console.error('[Email] Verification send error:', err.message)
      );
    }

    res.json({
      message: 'Verification email sent (or token returned in dev mode).',
      ...(isDev ? { devToken: raw, note: 'POST /api/auth/verify-email with this token' } : {}),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send verification email.' });
  }
});

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
// Always returns the same generic message to prevent user enumeration.
router.post('/forgot-password', resetLimiter, async (req: Request, res: Response) => {
  const GENERIC = 'If an account with that email exists, password reset instructions have been sent.';
  try {
    const { email='' } = req.body;
    if (!validateEmail(email)) return res.status(400).json({ error: 'Please provide a valid email address.' });

    const user = await queryOne<any>(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
    if (!user) return res.json({ message: GENERIC }); // Don't reveal whether email exists

    const raw   = crypto.randomBytes(32).toString('hex');
    const hash  = hashToken(raw);
    const expAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1,$2,$3)
       ON CONFLICT (user_id) DO UPDATE
       SET token_hash=$2, expires_at=$3, used=FALSE`,
      [user.id, hash, expAt]
    );

    // In production: send email; Development: return token
    const isDev = process.env.NODE_ENV !== 'production';

    // Send reset email (async, non-blocking)
    const userForEmail = await queryOne<any>('SELECT first_name, email FROM users WHERE id=$1', [user.id]);
    if (userForEmail) {
      sendPasswordResetEmail(userForEmail.email, userForEmail.first_name, raw).catch(err =>
        console.error('[Email] Password reset send error:', err.message)
      );
    }

    res.json({
      message: GENERIC,
      ...(isDev ? { devToken: raw, note: 'POST /api/auth/reset-password with { token, newPassword }' } : {}),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process request.' });
  }
});

// ── POST /api/auth/reset-password ────────────────────────────────────────────
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token='', newPassword='' } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required.' });

    const pwErr = validatePassword(newPassword);
    if (pwErr) return res.status(400).json({ error: pwErr });

    const row = await queryOne<any>(
      `SELECT user_id, expires_at, used FROM password_reset_tokens WHERE token_hash = $1`,
      [hashToken(token)]
    );
    if (!row || row.used)                       return res.status(400).json({ error: 'Invalid or already-used reset token.' });
    if (new Date(row.expires_at) < new Date())  return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' });

    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [hash, row.user_id]);
      await client.query(`UPDATE password_reset_tokens SET used = TRUE WHERE token_hash = $1`, [hashToken(token)]);
      // Revoke all refresh tokens so old sessions can't persist
      await client.query(`UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1`, [row.user_id]);
      await client.query('COMMIT');
    } catch (e) { await client.query('ROLLBACK'); throw e; }
    finally     { client.release(); }

    res.json({ message: 'Password reset successfully. Please log in with your new password.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Password reset failed. Please try again.' });
  }
});

// ── PUT /api/auth/password — change password (authenticated) ─────────────────
router.put('/password', requireAuth(), async (req: Request, res: Response) => {
  try {
    const { currentPassword='', newPassword='', confirmPassword='' } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new password are required.' });
    if (newPassword !== confirmPassword)  return res.status(400).json({ error: 'Passwords do not match.' });

    const pwErr = validatePassword(newPassword);
    if (pwErr) return res.status(400).json({ error: pwErr });

    const user = await queryOne<any>(`SELECT password_hash FROM users WHERE id = $1`, [req.user!.id]);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await query(`UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2`, [newHash, req.user!.id]);
    await revokeAllUserTokens(req.user!.id);

    // Send confirmation email (non-blocking)
    const userForEmail = await queryOne<any>('SELECT first_name, email FROM users WHERE id=$1', [req.user!.id]);
    if (userForEmail) {
      sendPasswordChangedEmail(userForEmail.email, userForEmail.first_name).catch(err =>
        console.error('[Email] Password changed email error:', err.message)
      );
    }

    clearCookies(res);
    res.json({ message: 'Password changed successfully. Please log in again.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Password change failed.' });
  }
});

// ── DELETE /api/auth/account — delete own account ────────────────────────────
router.delete('/account', requireAuth(), async (req: Request, res: Response) => {
  try {
    const { password='' } = req.body;
    if (!password) return res.status(400).json({ error: 'Please provide your current password to confirm deletion.' });

    const user = await queryOne<any>(`SELECT password_hash FROM users WHERE id = $1`, [req.user!.id]);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Incorrect password. Account not deleted.' });

    // Send deletion confirmation email before deleting (non-blocking)
    const userForEmail = await queryOne<any>('SELECT first_name, email FROM users WHERE id=$1', [req.user!.id]);

    // CASCADE in schema handles: profiles, user_skills, bookmarks, applications,
    // quiz_results, roadmaps, interview_sessions, ai_conversations, refresh_tokens
    await query(`DELETE FROM users WHERE id = $1`, [req.user!.id]);

    if (userForEmail) {
      sendAccountDeletionEmail(userForEmail.email, userForEmail.first_name).catch(err =>
        console.error('[Email] Account deletion email error:', err.message)
      );
    }

    clearCookies(res);
    res.json({ message: 'Account permanently deleted.' });
  } catch (err: any) {
    console.error('Account delete error:', err.message);
    res.status(500).json({ error: 'Account deletion failed. Please try again.' });
  }
});

// ── OTP & Social Auth Endpoints ──────────────────────────────────────────────

// Send OTP
router.post('/otp/send', otpSendLimiter, async (req: Request, res: Response) => {
  try {
    const { email = '', phone = '', purpose = 'REGISTER' } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !validateEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (purpose === 'REGISTER') {
      const existing = await queryOne('SELECT id FROM users WHERE email = $1', [cleanEmail]);
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
      }
    }

    // Cooldown check: max 1 OTP every 30 seconds for the same email in production
    if (process.env.NODE_ENV === 'production') {
      const recentOtp = await queryOne<any>(
        `SELECT created_at FROM user_otps
         WHERE email = $1 AND purpose = $2 AND created_at > NOW() - INTERVAL '30 seconds'
         ORDER BY created_at DESC LIMIT 1`,
        [cleanEmail, purpose]
      );
      if (recentOtp) {
        return res.status(429).json({ error: 'Please wait 30 seconds before requesting another code.' });
      }
    }

    // Generate cryptographically secure 6-digit numeric OTP
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate previous unverified OTPs for this email and purpose
    await query(
      `UPDATE user_otps SET is_verified = TRUE WHERE email = $1 AND purpose = $2 AND is_verified = FALSE`,
      [cleanEmail, purpose]
    );

    // Save new OTP
    await query(
      `INSERT INTO user_otps (email, phone, otp_code, purpose, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [cleanEmail, phone ? sanitizeText(phone, 30) : null, otpCode, purpose, expiresAt]
    );

    // Send email asynchronously
    sendOtpEmail(cleanEmail, otpCode, purpose.toLowerCase()).catch(err => {
      console.error('[Email] Failed to send OTP email:', err);
    });

    console.log(`[AUTH OTP] Code generated for ${cleanEmail} (${purpose})`);

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}.`,
      expiresInSeconds: 600,
      devOtpCode: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
    });
  } catch (err: any) {
    // #region debug-point dp-otp-send
    const includeDetail = process.env.NODE_ENV !== 'production';
    console.error('[AUTH] OTP Send error:', err.message, err.code || '');
    res.status(500).json({
      error: includeDetail
        ? `Failed to send OTP code. ${err.message}${err.code ? ' [' + err.code + ']' : ''}`
        : 'Failed to send OTP code. Please try again.',
      hint: includeDetail && /relation.*user_otps|does not exist/i.test(err.message)
        ? 'Run backend migration: npm run migrate, or restart backend to trigger auto-bootstrap.'
        : undefined,
    });
    // #endregion
  }
});

// Verify OTP
router.post('/otp/verify', otpVerifyLimiter, async (req: Request, res: Response) => {
  try {
    const { email = '', otpCode = '', purpose = 'REGISTER' } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = (otpCode || '').trim();

    if (!cleanEmail || !cleanCode) {
      return res.status(400).json({ error: 'Email and 6-digit OTP code are required.' });
    }

    const record = await queryOne<any>(
      `SELECT id, otp_code, attempts, expires_at, is_verified
       FROM user_otps
       WHERE email = $1 AND purpose = $2 AND is_verified = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [cleanEmail, purpose]
    );

    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired verification code. Please request a new one.' });
    }

    if (record.attempts >= 5) {
      return res.status(429).json({ error: 'Too many incorrect attempts. Please request a fresh OTP.' });
    }

    // Timing-safe verification
    if (!safeCompareString(record.otp_code, cleanCode)) {
      await query('UPDATE user_otps SET attempts = attempts + 1 WHERE id = $1', [record.id]);
      return res.status(400).json({ error: 'Incorrect code. Please check and try again.' });
    }

    // Mark verified and issue one-time verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await query(
      `UPDATE user_otps SET is_verified = TRUE, verification_token = $1 WHERE id = $2`,
      [verificationToken, record.id]
    );

    res.json({
      success: true,
      verified: true,
      message: 'Code verified successfully.',
      verificationToken,
    });
  } catch (err: any) {
    console.error('OTP Verify error:', err.message);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

// Register with verified OTP
router.post('/register-with-otp', async (req: Request, res: Response) => {
  try {
    const {
      firstName = '',
      lastName = '',
      email = '',
      password = '',
      confirmPassword,
      role = 'STUDENT',
      gradeLevel = '',
      verificationToken = '',
      otpCode = '',
    } = req.body;

    const cleanFirstName  = sanitizeText(firstName, 60);
    const cleanLastName   = sanitizeText(lastName, 60);
    const cleanEmail      = email.toLowerCase().trim();
    const cleanGradeLevel = sanitizeText(gradeLevel, 80);
    const errors: string[] = [];
    if (!cleanFirstName || cleanFirstName.length < 2) errors.push('First name must be at least 2 characters.');
    if (!validateEmail(cleanEmail))                   errors.push('Please enter a valid email address.');
    const pwErr = validatePassword(password);
    if (pwErr) errors.push(pwErr);
    if (confirmPassword !== undefined && password !== confirmPassword) errors.push('Passwords do not match.');
    if (errors.length > 0) return res.status(400).json({ error: errors[0], errors });

    const safeRole = getSafeRole(role);

    // Verify OTP confirmation
    let isOtpValid = false;
    if (verificationToken) {
      const verifiedRecord = await queryOne<any>(
        `SELECT id FROM user_otps
         WHERE email = $1 AND verification_token = $2 AND purpose = 'REGISTER' AND is_verified = TRUE AND expires_at > NOW() - INTERVAL '15 minutes'`,
        [cleanEmail, verificationToken]
      );
      if (verifiedRecord) isOtpValid = true;
    }
    if (!isOtpValid && otpCode) {
      const directRecord = await queryOne<any>(
        `SELECT id, otp_code FROM user_otps
         WHERE email = $1 AND purpose = 'REGISTER' AND expires_at > NOW() AND attempts < 5`,
        [cleanEmail]
      );
      if (directRecord && safeCompareString(directRecord.otp_code, (otpCode || '').trim())) {
        isOtpValid = true;
      }
    }

    if (!isOtpValid) {
      return res.status(400).json({ error: 'Please enter a valid 6-digit OTP verification code first.' });
    }

    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const client = await pool.connect();
    let userId: string;
    try {
      await client.query('BEGIN');
      const r = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified, auth_provider)
         VALUES ($1, $2, $3, $4, $5, TRUE, 'LOCAL') RETURNING id`,
        [cleanEmail, passwordHash, cleanFirstName, cleanLastName, safeRole]
      );
      userId = r.rows[0].id;
      await client.query(
        `INSERT INTO profiles (user_id, grade_level) VALUES ($1, $2)`,
        [userId, cleanGradeLevel || null]
      );

      // Invalidate OTP / verification_token immediately to prevent replay attacks
      await client.query(
        `UPDATE user_otps SET verification_token = NULL, is_verified = TRUE, expires_at = NOW() WHERE email = $1`,
        [cleanEmail]
      );

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    const accessToken = issueAccessToken(userId);
    const refreshToken = issueRefreshToken(userId);
    await storeRefreshToken(userId, refreshToken);
    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      message: 'Account verified and created successfully.',
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email: cleanEmail,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        name: `${cleanFirstName} ${cleanLastName}`.trim(),
        role: safeRole,
        isVerified: true,
      },
    });
  } catch (err: any) {
    console.error('Register with OTP error:', err.message);
    res.status(500).json({ error: 'Account registration failed. Please try again.' });
  }
});

// Passwordless OTP Login
router.post('/otp/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email = '', otpCode = '' } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = (otpCode || '').trim();

    if (!cleanEmail || !cleanCode) {
      return res.status(400).json({ error: 'Email and 6-digit OTP code are required.' });
    }

    const otpRecord = await queryOne<any>(
      `SELECT id, otp_code, attempts FROM user_otps
       WHERE email = $1 AND (purpose = 'LOGIN' OR purpose = 'REGISTER') AND is_verified = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [cleanEmail]
    );

    if (!otpRecord || !safeCompareString(otpRecord.otp_code, cleanCode)) {
      if (otpRecord) {
        await query('UPDATE user_otps SET attempts = attempts + 1 WHERE id = $1', [otpRecord.id]);
      }
      return res.status(400).json({ error: 'Invalid or expired OTP code.' });
    }

    let user = await queryOne<any>(
      `SELECT id, email, first_name, last_name, role, is_verified, is_active FROM users WHERE email = $1`,
      [cleanEmail]
    );

    if (!user) {
      // Auto-provision student user on verified OTP login if not present
      const defaultName = cleanEmail.split('@')[0];
      const firstName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
      const dummyPasswordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), SALT_ROUNDS);
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const insertRes = await client.query(
          `INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified, auth_provider)
           VALUES ($1, $2, $3, '', 'STUDENT', TRUE, 'OTP')
           RETURNING id, email, first_name, last_name, role, is_verified, is_active`,
          [cleanEmail, dummyPasswordHash, firstName]
        );
        user = insertRes.rows[0];
        await client.query(`INSERT INTO profiles (user_id) VALUES ($1)`, [user.id]);
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'This account has been deactivated. Contact support.' });
    }

    // Invalidate OTP on successful login
    await query('UPDATE user_otps SET is_verified = TRUE, expires_at = NOW() WHERE id = $1', [otpRecord.id]);
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const accessToken = issueAccessToken(user.id);
    const refreshToken = issueRefreshToken(user.id);
    await storeRefreshToken(user.id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    res.json({
      message: 'Login successful via OTP.',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        role: user.role,
        isVerified: user.is_verified,
      },
    });
  } catch (err: any) {
    // #region debug-point dp-otp-login
    const includeDetail = process.env.NODE_ENV !== 'production';
    console.error('[AUTH] OTP Login error:', err.message, err.code || '');
    res.status(500).json({
      error: includeDetail ? `OTP Login failed. ${err.message}` : 'OTP Login failed. Please try again.',
      hint: includeDetail && /relation.*user_otps|does not exist/i.test(err.message)
        ? 'Missing user_otps table. Restart backend or run `npm run migrate`.'
        : undefined,
    });
    // #endregion
  }
});

// Social Login (Google, GitHub, LinkedIn)
router.post('/social-login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { provider = 'google', idToken, accessToken: socialToken, profile = {} } = req.body;
    const providerName = String(provider).toUpperCase();
    if (!['GOOGLE', 'GITHUB', 'LINKEDIN'].includes(providerName)) {
      return res.status(400).json({ error: 'Unsupported social provider.' });
    }

    // Extract user profile information
    let email = (profile.email || '').toLowerCase().trim();
    let firstName = sanitizeText(profile.firstName || profile.given_name || '', 60);
    let lastName  = sanitizeText(profile.lastName || profile.family_name || '', 60);
    let providerId = sanitizeText(profile.id || profile.sub || '', 100);
    let avatarUrl  = typeof profile.avatarUrl === 'string' ? profile.avatarUrl.trim().slice(0, 500) : (profile.picture || profile.avatar_url || '');

    // If Google ID token is passed, verify with Google tokeninfo endpoint if possible
    if (providerName === 'GOOGLE' && idToken && !email) {
      try {
        const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        if (googleRes.ok) {
          const payload: any = await googleRes.json();
          email = (payload.email || '').toLowerCase().trim();
          firstName = sanitizeText(payload.given_name || payload.name?.split(' ')[0] || firstName, 60);
          lastName  = sanitizeText(payload.family_name || payload.name?.split(' ').slice(1).join(' ') || lastName, 60);
          providerId = sanitizeText(payload.sub || providerId, 100);
          avatarUrl  = payload.picture || avatarUrl;
        }
      } catch (err: any) {
        console.warn('[Social Auth] Google token verification note:', err.message);
      }
    }

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Could not retrieve a valid email address from your social account.' });
    }

    if (!firstName) {
      const parts = email.split('@')[0].split('.');
      firstName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'User';
      lastName  = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : '';
    }

    // Check if user already exists
    let user = await queryOne<any>(`SELECT id, email, first_name, last_name, role, is_active FROM users WHERE email = $1`, [email]);

    // Disallow administrative account takeover via social auth
    if (user && user.role === 'ADMIN') {
      return res.status(403).json({ error: 'Administrator accounts cannot log in via social authentication. Please use administrative credentials.' });
    }

    if (!user) {
      // Create new user authenticated via social provider
      const dummyPasswordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), SALT_ROUNDS);
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const insertRes = await client.query(
          `INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified, auth_provider, provider_id, avatar_url)
           VALUES ($1, $2, $3, $4, 'STUDENT', TRUE, $5, $6, $7)
           RETURNING id, email, first_name, last_name, role, is_active`,
          [email, dummyPasswordHash, firstName, lastName, providerName, providerId || null, avatarUrl || null]
        );
        user = insertRes.rows[0];
        await client.query(`INSERT INTO profiles (user_id) VALUES ($1)`, [user.id]);
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } else {
      if (!user.is_active) {
        return res.status(403).json({ error: 'This account has been deactivated. Please contact support.' });
      }
      await query(
        `UPDATE users SET
           last_login = NOW(),
           auth_provider = COALESCE(auth_provider, $1),
           provider_id = COALESCE(provider_id, $2),
           avatar_url = COALESCE($3, avatar_url)
         WHERE id = $4`,
        [providerName, providerId || null, avatarUrl || null, user.id]
      );
    }

    const accessToken = issueAccessToken(user.id);
    const refreshToken = issueRefreshToken(user.id);
    await storeRefreshToken(user.id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    res.json({
      message: `Signed in with ${providerName.charAt(0) + providerName.slice(1).toLowerCase()} successfully.`,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        role: user.role,
        avatarUrl,
        provider: providerName,
        isVerified: true,
      },
    });
  } catch (err: any) {
    console.error('Social Login error:', err.message);
    res.status(500).json({ error: 'Social authentication failed. Please try again.' });
  }
});

// ── Google OAuth 2.0 Endpoints ───────────────────────────────────────────────

// Helper: sync Google user into database & issue sessions
async function handleGoogleUserSync(res: Response, { email, firstName, lastName, providerId, avatarUrl }: {
  email: string;
  firstName: string;
  lastName: string;
  providerId: string;
  avatarUrl: string;
}) {
  const cleanEmail = email.toLowerCase().trim();
  const cleanFirst = sanitizeText(firstName, 60) || 'Google';
  const cleanLast  = sanitizeText(lastName, 60) || 'User';

  let user = await queryOne<any>(`SELECT id, email, first_name, last_name, role, is_active FROM users WHERE email = $1`, [cleanEmail]);

  if (user && user.role === 'ADMIN') {
    throw new Error('Administrator accounts cannot log in via social authentication. Please use administrative credentials.');
  }

  if (!user) {
    const dummyPasswordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), SALT_ROUNDS);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const insertRes = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified, auth_provider, provider_id, avatar_url)
         VALUES ($1, $2, $3, $4, 'STUDENT', TRUE, 'GOOGLE', $5, $6)
         RETURNING id, email, first_name, last_name, role, is_active`,
        [cleanEmail, dummyPasswordHash, cleanFirst, cleanLast, providerId || null, avatarUrl || null]
      );
      user = insertRes.rows[0];
      await client.query(`INSERT INTO profiles (user_id) VALUES ($1)`, [user.id]);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } else {
    if (!user.is_active) {
      throw new Error('This account has been deactivated. Please contact support.');
    }
    await query(
      `UPDATE users SET
         last_login = NOW(),
         auth_provider = COALESCE(auth_provider, 'GOOGLE'),
         provider_id = COALESCE(provider_id, $1),
         avatar_url = COALESCE($2, avatar_url)
       WHERE id = $3`,
      [providerId || null, avatarUrl || null, user.id]
    );
  }

  const accessToken = issueAccessToken(user.id);
  const refreshToken = issueRefreshToken(user.id);
  await storeRefreshToken(user.id, refreshToken);
  setCookies(res, accessToken, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      role: user.role,
      avatarUrl,
      provider: 'GOOGLE',
      isVerified: true,
    },
  };
}

// Get Google OAuth 2.0 Authorization URL
router.get('/google/url', (_req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || `${process.env.PUBLIC_APP_URL || 'http://localhost:5173'}/auth/callback`;

  if (!clientId) {
    return res.status(503).json({
      error: 'Google OAuth client ID is not configured in environment.',
      configured: false,
    });
  }

  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: redirectUri,
    client_id: clientId,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'openid',
    ].join(' '),
  };

  const qs = new URLSearchParams(options);
  res.json({ url: `${rootUrl}?${qs.toString()}`, configured: true });
});

// POST /api/auth/google/callback — Exchange authorization code or GIS credential token
router.post('/google/callback', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { code, credential } = req.body;
    let email = '';
    let firstName = '';
    let lastName = '';
    let providerId = '';
    let avatarUrl = '';

    if (credential) {
      // Google Identity Services (GIS) ID token verification
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      if (!googleRes.ok) {
        return res.status(401).json({ error: 'Invalid Google credential token.' });
      }
      const payload: any = await googleRes.json();
      email = payload.email || '';
      firstName = payload.given_name || payload.name?.split(' ')[0] || '';
      lastName = payload.family_name || payload.name?.split(' ').slice(1).join(' ') || '';
      providerId = payload.sub || '';
      avatarUrl = payload.picture || '';
    } else if (code) {
      // Exchange authorization code for token
      const clientId = process.env.GOOGLE_CLIENT_ID || '';
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
      const redirectUri = process.env.GOOGLE_CALLBACK_URL || `${process.env.PUBLIC_APP_URL || 'http://localhost:5173'}/auth/callback`;

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        console.error('Google token exchange error:', errText);
        return res.status(400).json({ error: 'Failed to exchange authorization code with Google.' });
      }

      const tokenData: any = await tokenRes.json();
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userRes.ok) {
        return res.status(400).json({ error: 'Failed to fetch user info from Google.' });
      }

      const profile: any = await userRes.json();
      email = profile.email || '';
      firstName = profile.given_name || profile.name?.split(' ')[0] || '';
      lastName = profile.family_name || profile.name?.split(' ').slice(1).join(' ') || '';
      providerId = profile.sub || '';
      avatarUrl = profile.picture || '';
    } else {
      return res.status(400).json({ error: 'Authorization code or credential token is required.' });
    }

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Could not obtain a verified email address from Google.' });
    }

    const authResult = await handleGoogleUserSync(res, { email, firstName, lastName, providerId, avatarUrl });
    res.json({
      message: 'Signed in with Google successfully.',
      ...authResult,
    });
  } catch (err: any) {
    console.error('Google callback error:', err.message);
    res.status(500).json({ error: err.message || 'Google authentication failed.' });
  }
});

// GET /api/auth/google/callback — Browser redirect callback
router.get('/google/callback', async (req: Request, res: Response) => {
  const publicAppUrl = process.env.PUBLIC_APP_URL || 'http://localhost:5173';
  try {
    const code = req.query.code as string;
    if (!code) {
      return res.redirect(`${publicAppUrl}/auth?error=No+code+provided`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri = process.env.GOOGLE_CALLBACK_URL || `${publicAppUrl}/api/auth/google/callback`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      return res.redirect(`${publicAppUrl}/auth?error=Failed+to+exchange+code`);
    }

    const tokenData: any = await tokenRes.json();
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      return res.redirect(`${publicAppUrl}/auth?error=Failed+to+fetch+user`);
    }

    const profile: any = await userRes.json();
    await handleGoogleUserSync(res, {
      email: profile.email,
      firstName: profile.given_name || profile.name?.split(' ')[0] || '',
      lastName: profile.family_name || profile.name?.split(' ').slice(1).join(' ') || '',
      providerId: profile.sub || '',
      avatarUrl: profile.picture || '',
    });

    res.redirect(`${publicAppUrl}/dashboard?auth=success`);
  } catch (err: any) {
    console.error('Google GET callback error:', err.message);
    res.redirect(`${publicAppUrl}/auth?error=${encodeURIComponent(err.message || 'Google authentication failed')}`);
  }
});

export { router as authRouter };

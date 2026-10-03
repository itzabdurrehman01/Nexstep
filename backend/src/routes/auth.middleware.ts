/**
 * src/server/auth.middleware.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Authentication and authorization middleware.
 *
 *  requireAuth()        — verifies JWT from HttpOnly cookie, attaches req.user
 *  requireRole(role)    — verifies user has the specified role
 *  requirePlan(plan)    — verifies an active subscription meets a feature tier
 *  optionalAuth()       — attaches req.user if token present, doesn't reject
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { queryOne } from './db.js';

export interface AuthUser {
  id:         string;
  email:      string;
  firstName:  string;
  lastName:   string;
  role:       'STUDENT' | 'ADMIN' | 'MENTOR' | 'RECRUITER';
  isVerified: boolean;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return secret;
}

function extractToken(req: Request): string | null {
  // 1. HttpOnly cookie (preferred — not accessible to JS)
  if (req.cookies?.nexstep_token) return req.cookies.nexstep_token;
  // 2. Authorization header fallback (for API testing)
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export function requireAuth() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required.',
        code:  'UNAUTHENTICATED',
      });
    }

    try {
      const payload = jwt.verify(token, getJwtSecret()) as { sub: string };

      const user = await queryOne<any>(
        `SELECT id, email, first_name, last_name, role, is_verified, is_active
         FROM users WHERE id = $1`,
        [payload.sub]
      );

      if (!user || !user.is_active) {
        return res.status(401).json({
          error: 'Account not found or deactivated.',
          code:  'ACCOUNT_INACTIVE',
        });
      }

      req.user = {
        id:         user.id,
        email:      user.email,
        firstName:  user.first_name,
        lastName:   user.last_name,
        role:       user.role,
        isVerified: user.is_verified,
      };

      next();
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Session expired. Please log in again.',
          code:  'TOKEN_EXPIRED',
        });
      }
      return res.status(401).json({
        error: 'Invalid authentication token.',
        code:  'TOKEN_INVALID',
      });
    }
  };
}

export function requireRole(...roles: AuthUser['role'][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.', code: 'UNAUTHENTICATED' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(' or ')}.`,
        code:  'FORBIDDEN',
      });
    }
    next();
  };
}

const PLAN_RANK: Record<string, number> = {
  free: 0,
  premium: 1,
  pro: 2,
};

/**
 * Enforce premium features on the server rather than relying on a hidden UI.
 * The caller must have passed through requireAuth() first.
 */
export function requirePlan(minimumPlan: 'premium' | 'pro') {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.', code: 'UNAUTHENTICATED' });
    }

    // Administrators need access for support, moderation, and verification.
    if (req.user.role === 'ADMIN') return next();

    try {
      const subscription = await queryOne<{ plan_slug: string }>(
        `SELECT p.slug AS plan_slug
         FROM subscriptions s
         JOIN plans p ON p.id = s.plan_id
         WHERE s.user_id = $1
           AND s.status = 'ACTIVE'
           AND (s.expires_at IS NULL OR s.expires_at > NOW())
         ORDER BY s.started_at DESC
         LIMIT 1`,
        [req.user.id]
      );
      const activePlan = subscription?.plan_slug || 'free';

      if ((PLAN_RANK[activePlan] ?? 0) < PLAN_RANK[minimumPlan]) {
        return res.status(403).json({
          error: `${minimumPlan[0].toUpperCase()}${minimumPlan.slice(1)} plan required for this feature.`,
          code: 'PLAN_REQUIRED',
          requiredPlan: minimumPlan,
          activePlan,
        });
      }

      return next();
    } catch {
      return res.status(503).json({ error: 'Unable to verify subscription access.', code: 'SUBSCRIPTION_UNAVAILABLE' });
    }
  };
}

export function optionalAuth() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = extractToken(req);
    if (!token) return next();

    try {
      const payload = jwt.verify(token, getJwtSecret()) as { sub: string };
      const user = await queryOne<any>(
        `SELECT id, email, first_name, last_name, role, is_verified
         FROM users WHERE id = $1 AND is_active = TRUE`,
        [payload.sub]
      );
      if (user) {
        req.user = {
          id:         user.id,
          email:      user.email,
          firstName:  user.first_name,
          lastName:   user.last_name,
          role:       user.role,
          isVerified: user.is_verified,
        };
      }
    } catch {
      // Ignore invalid token for optional auth
    }
    next();
  };
}

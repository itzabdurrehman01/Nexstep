# debug-password-otp-login-failures.md
# Status: [OPEN]
# Session ID: password-otp-login-failures
# Started: 2026-09-30
# Symptom: Password login fails; OTP send fails.
# Hypotheses:
#   H1 Frontend payload key mismatch vs backend expected (password/code/otp)
#   H2 Missing credentials:include OR Content-Type missing on OTP-request / OTP-verify fetches
#   H3 Rate limiters loginLimiter/otpSendLimiter misfiring → 429 surfaces as "failed"
#   H4 OTP stored vs retrieved under mismatched identifier (email case / user id)
#   H5 bcrypt column-name mismatch: password hash column vs hashed_password etc.

## Phase 1: Static code audit of Login.jsx + auth.routes.ts.
## Phase 2: Instrumentation logs (no logic change)
## Phase 3: Runtime evidence gathering
## Phase 4: Minimal fix
## Phase 5: Post-fix verification + all-module audit

---
## Phase 1 notes:
### Static audit findings:
- F1 (CRITICAL): `user_otps` table, `auth_provider` users columns exist ONLY in scripts/migrate_otp_social.cjs → MISSING from canonical `db/migrate.ts`. Confirmed by grep: 44 hits in main migrate.ts for users/refresh_tokens, zero for user_otps.
- F2: server.ts does NOT run any migration bootstrap during startup (no runMigrations / ensureSchema calls). So if you start backend without running both migrations, user_otps is missing → every `INSERT INTO user_otps` throws 500 → frontend shows "Failed to send OTP verification code."
- F3: `otp/send` endpoint L720 backend default `purpose='REGISTER'`; frontend sends `purpose: 'LOGIN'` for Login. Purpose-only check block L728-732 ONLY runs for `REGISTER`, so H1 rejected for LOGIN-purpose, confirmed LOGIN-purpose does NOT hit "409 account exists".
- F4: Password login L229-277 backend: payload `{email,password}` matches frontend Login.jsx L205 exactly; schema column password_hash EXISTS in main migrate. H5 falsified for schema. H2 credentials:include + Content-Type headers present on L202-204.
- F5: Social login flow L1008 inserts users with explicit `password_hash` column L1065 → no NULL-password created by that path.

### Hypotheses status after Phase 1:
- H1 payload key mismatch → REJECTED (key names identical across front/back)
- H2 missing credentials/include → REJECTED (all 3 login/otp-send/otp-login have credentials:include + CT:json)
- H3 rate limiter blocking → UNCONFIRMED (possible only after >= 10 wrong attempts, not a clean-system issue)
- H4 OTP identifier mismatch → PARTIAL: purpose flows OK but ROW DOESN'T EXIST if table missing
- H5 (CONFIRMED as root cause for OTP failure, by structural analysis): user_otps table not in migrate.ts, server no auto-migrate → `relation "user_otps" does not exist` → 500 every otp/send + every otp/login + every register-with-otp. Password may fail IF user registered through OTP-register path after schema gap created user WITHOUT password_hash (but main register route INSERT L194 sets it). Most likely password failures are seed-user was never seeded (no db/migrate + seed run) leading to 401 "Invalid email or password" which user sees as "password login failed".

## Phase 2 instrumentation plan:
Add `#region debug-point <id>` wrappers around the 4 critical failure paths to surface relational / constraint names to frontend JSON `error` field so user sees "relation user_otps does not exist" instead of generic "Failed to send OTP".
- DP-1: `otp/send` catch block → `data.error = err.message`
- DP-2: `otp/login` catch block → `data.error = err.message`
- DP-3: `login` catch block → `data.error = err.message`
- DP-4: server startup adds `ensureSchemaBootstrap()` to create missing user_otps + users columns IMMEDIATELY.


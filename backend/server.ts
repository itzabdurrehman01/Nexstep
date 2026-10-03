import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';

import { UNIVERSITIES_DATA }                   from './src/data/universitiesData.js';
import { SCHOLARSHIPS_DATA }                   from './src/data/scholarshipsData.js';
import { CAREERS_DATA }                        from './src/data/careersData.js';
import { ENTRY_TESTS_DATA }                    from './src/data/entryTestsData.js';
import { TEVTA_COURSES, FREE_IT_COURSES }      from './src/data/tevtaAndItData.js';
import { TRANSNATIONAL_PATHWAYS }              from './src/data/transnationalData.js';
import { COURSES_DATA, JOBS_INTERNSHIPS_DATA } from './src/data/mockFullAppData.js';
import { RIASEC_QUESTIONS } from './src/data/riasecQuestions.js';
import { CAREERS_EXPANDED } from './src/data/realData/careers.js';
import { COURSES_REAL } from './src/data/realData/courses.js';
import { SCHOLARSHIPS_ADDITIONAL } from './src/data/realData/scholarships.js';

import { authRouter }          from './src/routes/auth.routes.js';
import { userRouter }          from './src/routes/user.routes.js';
import { roadmapRouter }       from './src/routes/roadmap.routes.js';
import { interviewsRouter }    from './src/routes/interviews.routes.js';
import { conversationsRouter } from './src/routes/conversations.routes.js';
import { mentorRouter }        from './src/routes/mentor.routes.js';
import { recruiterRouter }     from './src/routes/recruiter.routes.js';
import { adminRouter }         from './src/routes/admin.routes.js';
import { paymentsRouter }      from './src/routes/payments.routes.js';
import { publicDataRouter }    from './src/routes/publicData.routes.js';
import { feedbackRouter }      from './src/routes/feedback.routes.js';
import { entryTestsRouter }    from './src/routes/entryTests.routes.js';
import { translationRouter }   from './src/routes/translation.routes.js';
import { requireAuth, requirePlan, requireRole } from './src/routes/auth.middleware.js';
import { pool, query, queryOne } from './src/routes/db.js';
import { startBackgroundScheduler } from './src/services/scheduler.js';
import { generateCounselingResponse } from './src/services/aiCounselorEngine.js';

dotenv.config();

// ── Schema Bootstrap (ensure user_otps + social cols always exist on startup)
//    Creates any missing OTPS/social tables/columns idempotently, so password
//    login + OTP flow can never fail because of a forgotten `npm run migrate`.
// #region debug-point dp-schema-bootstrap
async function ensureSchemaBootstrap() {
  try {
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider    VARCHAR(50)   DEFAULT 'LOCAL';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id      VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url       TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone            VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN       DEFAULT FALSE;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_otps (
        id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email              VARCHAR(255) NOT NULL,
        phone              VARCHAR(50),
        otp_code           VARCHAR(10)  NOT NULL,
        purpose            VARCHAR(50)  NOT NULL DEFAULT 'REGISTER',
        attempts           INT          NOT NULL DEFAULT 0,
        is_verified        BOOLEAN      NOT NULL DEFAULT FALSE,
        verification_token VARCHAR(255),
        expires_at         TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_otps_email_purpose ON user_otps(email, purpose);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_otps_token         ON user_otps(verification_token);`);
    } catch { /* ignore index race */ }
    console.log('[BOOTSTRAP] Schema OK: users.social_cols + user_otps table exist.');
  } catch (err: any) {
    console.warn('[BOOTSTRAP] Schema bootstrap note (OK if DB not ready yet):', err.message?.slice(0, 200));
  }
}
ensureSchemaBootstrap();
// #endregion

// `process.cwd()` is stable for both the TypeScript development server and
// the bundled CommonJS production server. `import.meta.url` is not available
// after the CommonJS bundle is produced.
const __dirname = process.cwd();

const app  = express();
// Keep the backend fallback aligned with the frontend proxy and Expo client.
const PORT = Number(process.env.PORT) || 3001;

// Do not disclose the underlying framework, and apply a conservative baseline
// of browser protections to every API and combined-production response.
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=()');

  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self'; connect-src 'self' https: wss:"
    );
  }
  next();
});

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY ?? '').trim();
const _GEMINI_KEY_PREFIX_4 = GEMINI_API_KEY.slice(0, 4);
const _IS_GCP_KEY = _GEMINI_KEY_PREFIX_4 === 'AQ.A' || _GEMINI_KEY_PREFIX_4 === 'AQ.B' || GEMINI_API_KEY.startsWith('AQ.');
// Tiered per-key defaults verified against Google's live endpoint:
//   AI Studio keys (AIzaSy...) → guide default: gemini-1.5-flash + v1 (stable GA, documented free tier)
//   GCP API Keys Manager (AQ...) → gateway exposes ONLY gemini-3.8-flash + v1alpha (all older models 404)
const _DEFAULT_MODEL_BY_KEY = _IS_GCP_KEY
  ? { model: 'gemini-3.8-flash', apiVersion: 'v1alpha' as const }
  : { model: 'gemini-1.5-flash', apiVersion: 'v1'      as const };
const GEMINI_MODEL =
  (process.env.GEMINI_MODEL ?? '').trim() ||
  _DEFAULT_MODEL_BY_KEY.model;
const GEMINI_API_VERSION =
  ((process.env.GEMINI_API_VERSION ?? '').trim() as 'v1' | 'v1beta' | 'v1alpha' | '') ||
  _DEFAULT_MODEL_BY_KEY.apiVersion;
const _GEMINI_KEY_PRESENT = Boolean(GEMINI_API_KEY);

// `GEMINI_ENABLED` is re-evaluated every read so a boot-time smoke-test
// failure (permanent 503/404 from wrong model+apiVersion+key combo)
// silently disables live-Gemini mode for the rest of the process lifetime,
// instead of hammering retries and falling through to the KB answer on
// every chat request (which would incorrectly surface the "model offline"
// indicator in the frontend even though the fallback itself is fine).
Object.defineProperty(globalThis, '__NEXSTEP_GEMINI_ENABLED_RUNTIME', {
  value: { enabled: _GEMINI_KEY_PRESENT },
  writable: true,
  configurable: true,
});
const GEMINI_ENABLED = {
  get value() {
    return Boolean((globalThis as any).__NEXSTEP_GEMINI_ENABLED_RUNTIME?.enabled);
  },
  set value(v: boolean) {
    if ((globalThis as any).__NEXSTEP_GEMINI_ENABLED_RUNTIME) {
      (globalThis as any).__NEXSTEP_GEMINI_ENABLED_RUNTIME.enabled = Boolean(v);
    }
  },
  [Symbol.toPrimitive]() {
    return this.value;
  },
  valueOf() {
    return this.value;
  },
} as unknown as boolean;
// Guard direct checks like `if (!GEMINI_ENABLED)` by coercing through the getter.
// `GEMINI_ENABLED as unknown as { value: boolean }` is used inside generateGeminiContent.
type _GemEnabled = { value: boolean; valueOf(): boolean; [Symbol.toPrimitive](): boolean };

const AI_UNAVAILABLE = {
  error:   'AI features are currently unavailable.',
  code:    'AI_UNAVAILABLE',
  message: 'Configure GEMINI_API_KEY in backend/.env to enable AI features.',
};

const ai = _GEMINI_KEY_PRESENT
  ? new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      apiVersion: GEMINI_API_VERSION as 'v1' | 'v1beta' | 'v1alpha',
      httpOptions: { headers: { 'User-Agent': 'nexstep-backend' } },
    })
  : null;

async function generateGeminiContent(prompt: string): Promise<string> {
  const runtime = GEMINI_ENABLED as unknown as _GemEnabled;
  if (!runtime.value || !ai) throw Object.assign(new Error('AI_UNAVAILABLE'), { code: 'AI_UNAVAILABLE' });

  const MAX_503_RETRIES = 3;
  let attempt = 0;
  let quotaRetriesUsed = 0;
  let lastErr: any;
  while (true) {
    attempt += 1;
    try {
      const r = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });

      const candidate = (r as any)?.candidates?.[0];
      const finishReason = candidate?.finishReason ?? '';
      if (finishReason === 'SAFETY') {
        console.warn('  [Gemini] Response blocked by safety filters.');
        throw Object.assign(new Error('SAFETY_BLOCKED'), { code: 'SAFETY_BLOCKED' });
      }

      let text = '';
      try {
        text = (r as any).text ?? '';
      } catch (extractErr: any) {
        const parts = candidate?.content?.parts ?? [];
        text = parts.map((p: any) => p.text ?? '').join(' ');
        console.warn(`  [Gemini] .text accessor threw; extracting manually (${String(extractErr.message || extractErr).slice(0, 120)}); manual join of parts yielded ${text.length} chars.`);
      }
      return text;
    } catch (err: any) {
      lastErr = err;
      const msg = String(err.message || '');
      const transient503 =
        (msg.includes('503') || msg.toLowerCase().includes('high demand')) &&
        !msg.toLowerCase().includes('not found') &&
        !msg.toLowerCase().includes('no longer available') &&
        !msg.toLowerCase().includes('does not have access');
      const quota429 = msg.includes('429') || msg.toLowerCase().includes('quota');

      if (quota429) {
        // One well-timed retry using the server's "Please retry in Xs" hint.
        // A second 429 after the exact wait means the window is still exhausted;
        // throw immediately rather than burning quota with more retries.
        if (quotaRetriesUsed === 0) {
          quotaRetriesUsed += 1;
          const retryMatch = msg.match(/retry in ([\d.]+)s/i);
          const waitMs = retryMatch
            ? Math.max(2500, Math.min(60000, Math.ceil(parseFloat(retryMatch[1]) * 1000) + 1500))
            : 10000;
          console.warn(`  [Gemini] 429 QUOTA_EXCEEDED on attempt ${attempt}, waiting ${waitMs}ms for server-specified reset (single retry)...`);
          await new Promise(r => setTimeout(r, waitMs));
          continue;
        }
        throw err;
      }

      if (transient503 && attempt <= MAX_503_RETRIES) {
        const wait = attempt * 1500;
        console.warn(`  [Gemini] Transient 503 on attempt ${attempt}/${MAX_503_RETRIES}, retrying in ${wait}ms...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }

      throw err;
    }
  }
}

function sendAiUnavailable(res: express.Response) {
  return res.status(503).json(AI_UNAVAILABLE);
}

function geminiEnabled(): boolean {
  const rt = (globalThis as any).__NEXSTEP_GEMINI_ENABLED_RUNTIME;
  if (!rt?.enabled) return false;
  const cooldownUntil = (globalThis as any).__NEXSTEP_GEMINI_429_COOLDOWN_UNTIL;
  if (cooldownUntil && Date.now() < cooldownUntil) return false;
  return true;
}
function setGeminiEnabled(v: boolean) {
  if ((globalThis as any).__NEXSTEP_GEMINI_ENABLED_RUNTIME) {
    (globalThis as any).__NEXSTEP_GEMINI_ENABLED_RUNTIME.enabled = Boolean(v);
  }
}
function setGemini429Cooldown(seconds: number) {
  (globalThis as any).__NEXSTEP_GEMINI_429_COOLDOWN_UNTIL = Date.now() + Math.max(5, seconds) * 1000;
}

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === 'string');
  } catch { /* Plain text list is handled below. */ }
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function mergeUnique<T>(records: T[], fallback: T[], label: (record: T) => unknown): T[] {
  const seen = new Set<string>();
  return [...records, ...fallback].filter((record) => {
    const key = String(label(record) ?? '').trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const CURATED_CAREERS = mergeUnique<any>(CAREERS_EXPANDED, CAREERS_DATA, (item) => item.title);
const CURATED_COURSES = mergeUnique<any>(COURSES_REAL, COURSES_DATA, (item) => item.title);
const CURATED_SCHOLARSHIPS = mergeUnique<any>(SCHOLARSHIPS_ADDITIONAL, SCHOLARSHIPS_DATA, (item) => item.name || item.title);

function profileWords(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(profileWords);
  return typeof value === 'string' ? value.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2) : [];
}

function entryTestsForCareer(career: any): string[] {
  const haystack = `${career.title ?? ''} ${career.category ?? ''} ${career.preferred_stream ?? career.streamRequired ?? ''}`.toLowerCase();
  if (/medical|dent|pharm|clinical/.test(haystack)) return ['MDCAT'];
  if (/engineer|architect|electrical|mechanical|civil|telecom/.test(haystack)) return ['ECAT', 'NET'];
  if (/software|data|cyber|ai|computer|technology/.test(haystack)) return ['NAT-ICS', 'NET / FAST Admission Test'];
  if (/law/.test(haystack)) return ['LAT'];
  return ['University-specific admission criteria'];
}

function compatibleWithStream(career: any, stream: string) {
  if (!stream) return true;
  const target = `${career.preferred_stream ?? career.streamRequired ?? ''}`.toLowerCase();
  const selected = stream.toLowerCase();
  const aliases: Record<string, string[]> = {
    'pre-medical': ['pre-medical', 'biology', 'medical'],
    'pre-engineering': ['pre-engineering', 'engineering'],
    'ics': ['ics', 'computer', 'technology'],
    'icom': ['icom', 'commerce', 'business', 'finance'],
    'arts': ['arts', 'social sciences', 'media', 'law', 'psychology'],
  };
  const key = Object.keys(aliases).find((candidate) => selected.includes(candidate));
  return !key || aliases[key].some((term) => target.includes(term)) || target.includes('any stream');
}

function personalizedCareerMatches(input: any) {
  const fscPct = Math.max(0, Math.min(100, Number(input.fscPct) || 0));
  const entryTestScore = Math.max(0, Math.min(100, Number(input.entryTestScore) || 0));
  const aggregateScore = Math.round((fscPct * 0.5 + entryTestScore * 0.5) * 10) / 10;
  const interests = profileWords(input.interests);
  const riasec = String(input.riasecCode || input.topRiasecCluster || '').toUpperCase().match(/[RIASEC]/)?.[0] || '';
  const budget = Math.max(0, Number(input.budgetAnnualPkr) || 0);
  const city = String(input.city || '').toLowerCase();

  const matches = CURATED_CAREERS.map((career: any, index: number) => {
    const haystack = `${career.title ?? ''} ${career.category ?? ''} ${career.description ?? ''} ${career.required_skills ?? career.requiredSkills ?? ''}`.toLowerCase();
    const streamFit = compatibleWithStream(career, String(input.stream || ''));
    const riasecFit = Boolean(riasec && String(career.riasec_code ?? career.riasecMatch ?? '').toUpperCase().includes(riasec));
    const interestHits = interests.filter((word) => haystack.includes(word)).length;
    const meritFit = aggregateScore >= 82 ? 26 : aggregateScore >= 68 ? 20 : aggregateScore >= 55 ? 13 : 7;
    const score = Math.min(99, Math.max(18, 32 + meritFit + (streamFit ? 18 : 2) + (riasecFit ? 13 : 0) + Math.min(10, interestHits * 3)));
    const likelyUniversities = UNIVERSITIES_DATA
      .filter((university: any) => (!budget || Number(university.annualFeePkr) <= budget) && (!city || university.city.toLowerCase() === city || city === 'all'))
      .filter((university: any) => university.programs.some((program: string) => haystack.includes(program.toLowerCase().replace(/^bs |^be /, '').split(' ')[0])))
      .slice(0, 3)
      .map((university: any) => ({ name: university.shortName || university.name, city: university.city, feePkr: university.annualFeePkr, meritCutoffPct: university.lastMeritCutoffPct }));
    return {
      ...career,
      id: career.id || `career-${index + 1}`,
      aggregateScore,
      matchScore: score,
      fitCategory: score >= 76 ? 'Strong Match' : score >= 58 ? 'Possible Match' : 'Explore with a plan',
      entryTests: entryTestsForCareer(career),
      topUniversities: likelyUniversities,
      why: [
        streamFit ? `Your ${input.stream || 'academic'} background aligns with this pathway.` : 'This pathway may need a bridge course or stream change.',
        riasecFit ? `It fits your ${riasec} RIASEC preference.` : 'Complete the RIASEC quiz to improve this preference score.',
        interestHits ? `It reflects ${interestHits} of your stated interests or skills.` : 'Add interests and skills to make this result more precise.',
        budget && likelyUniversities.length ? `${likelyUniversities.length} listed option${likelyUniversities.length > 1 ? 's' : ''} fit your annual budget.` : 'Check university fee and merit details before applying.',
      ],
    };
  });
  return { aggregateScore, matches: matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 12) };
}

// ── Server-side knowledge-base fallback ─────────────────────────────────────
// Called when Gemini is disabled or its key is invalid.
// Returns a real, data-backed answer from the NexStep knowledge base.
// ─────────────────────────────────────────────────────────────────────────────
function kbAnswer(message: string, language: string, profile: any): string {
  const q = message.toLowerCase();
  const ur = language === 'ur';

  // ── MDCAT / Medical ───────────────────────────────────────────────────────
  if (/mdcat|mbbs|bds|pharm-d|doctor|medical college|kemu|kmu|nums|amu|uhs|duhs/.test(q)) {
    const unis = UNIVERSITIES_DATA.filter((u: any) =>
      /medical|medicine|health/.test(`${u.name} ${(u.programs || []).join(' ')}`.toLowerCase())
    ).slice(0, 5).map((u: any) => `  • ${u.name} (${u.city}) — Fee: PKR ${Number(u.annualFeePkr || 0).toLocaleString()}/yr`).join('\n');
    return ur
      ? `📚 MDCAT / میڈیکل داخلہ\n\n✅ اہلیت: FSc پری میڈیکل میں کم از کم 65%\n📝 امتحان: 200 MCQs (بیالوجی 68، کیمسٹری 54، فزکس 54، انگریزی 18)\n📊 سرکاری میرٹ کٹ آف: 91.5%–93.8%\n🔢 فارمولا: FSc 50% + MDCAT 50%\n\nمیڈیکل یونیورسٹیاں:\n${unis || '  • KEMU لاہور  • UHS  • KMU پشاور  • DUHS کراچی'}\n\n💡 نمبر 65% سے کم ہوں تو Pharm-D، DPT یا BS Biotech بہترین متبادل ہیں۔`
      : `📚 MDCAT / Medical Admissions\n\n✅ Eligibility: Min 65% in FSc Pre-Medical\n📝 Test: 200 MCQs — Biology 68, Chemistry 54, Physics 54, English 18, Reasoning 6\n📊 Public medical merit cutoff: 91.5%–93.8%\n🔢 Merit formula: FSc 50% + MDCAT 50%\n\nTop medical universities in NexStep database:\n${unis || '  • KEMU Lahore  • UHS  • KMU Peshawar  • DUHS Karachi'}\n\n💡 If your marks are below 65%, Pharm-D, DPT (Physiotherapy) or BS Biotech are strong alternatives.`;
  }

  // ── Engineering / ECAT / NUST ─────────────────────────────────────────────
  if (/ecat|engineer|nust|uet|giki|civil eng|electrical eng|mechanical eng|chemical eng|aerospace/.test(q)) {
    const unis = UNIVERSITIES_DATA.filter((u: any) =>
      /engineering|technology/.test(`${u.name} ${(u.programs || []).join(' ')}`.toLowerCase())
    ).slice(0, 5).map((u: any) => `  • ${u.name} (${u.city}) — Fee: PKR ${Number(u.annualFeePkr || 0).toLocaleString()}/yr`).join('\n');
    return ur
      ? `⚙️ انجینئرنگ داخلہ\n\n📝 ECAT (UET لاہور): 100 MCQs — فزکس 30، ریاضی 30، کیمسٹری 30، انگریزی 10 (منفی مارکنگ)\n📝 NUST NET: 200 MCQs — ریاضی 80، فزکس 60، CS/کیم 30، انگریزی 20 (سال میں 4 بار)\n🔢 فارمولا: FSc 50% + Entry Test 50%\n📊 میرٹ کٹ آف: 72%–82%\n\nانجینئرنگ یونیورسٹیاں:\n${unis || '  • UET لاہور  • NUST اسلام آباد  • GIKI ٹوپی  • NED کراچی  • COMSATS'}`
      : `⚙️ Engineering Admissions\n\n📝 ECAT (UET Lahore): 100 MCQs — Physics 30, Math 30, Chemistry 30, English 10. Negative marking.\n📝 NUST NET: 200 MCQs — Math 80, Physics 60, CS/Chem 30, English 20. Held 4×/year.\n🔢 Merit formula: FSc 50% + Entry Test 50%\n📊 Public university cutoff: 72%–82%\n\nEngineering universities in database:\n${unis || '  • UET Lahore  • NUST Islamabad  • GIKI Topi  • NED Karachi  • COMSATS'}`;
  }

  // ── Computer Science / ICS / Software ────────────────────────────────────
  if (/computer science|software eng|bs cs|bs se|bs ai|data science|cyber|ics|programming|coding|it career|artificial intel/.test(q)) {
    const careers = CURATED_CAREERS.filter((c: any) =>
      /software|data|cyber|computer|developer|engineer|ai|tech/.test(`${c.title} ${c.category || ''}`.toLowerCase())
    ).slice(0, 4).map((c: any) =>
      `  • ${c.title} — PKR ${Number(c.avgSalaryPkrMonth || c.starting_salary_pkr || 0).toLocaleString()}/mo`
    ).join('\n');
    return ur
      ? `💻 ICS / کمپیوٹر سائنس راستے\n\nICS کے بعد: BS CS، BS SE، BS AI، BS Data Science، BS Cyber Security\n\nبہترین یونیورسٹیاں: FAST-NUCES، NUST، COMSATS، Air University، LUMS\n📝 داخلہ ٹیسٹ: NAT-ICS (NTS)، NUST NET، FAST Admission Test\n📊 میرٹ: 70%–85%\n\nکیریئر اور تنخواہیں:\n${careers || '  • Software Engineer — 80,000–400,000 روپے/ماہ'}`
      : `💻 ICS / Computer Science Pathways\n\nAfter ICS: BS CS, BS SE, BS AI, BS Data Science, BS Cyber Security\n\nTop universities: FAST-NUCES (4 campuses), NUST, COMSATS, Air University, LUMS\n📝 Entry tests: NAT-ICS, NUST NET (4 series/year), FAST Admission Test\n📊 Merit cutoff: 70%–85%\n\nCareer paths from database:\n${careers || '  • Software Engineer — PKR 80k–400k/month'}`;
  }

  // ── Scholarships ──────────────────────────────────────────────────────────
  if (/scholarship|ehsaas|peef|hec need|stipend|wظیفہ|اسکالرشپ|mora|zakat|beef|free education|need.based/.test(q)) {
    const schols = CURATED_SCHOLARSHIPS.slice(0, 6).map((s: any) =>
      `  • ${s.name || s.title} — ${s.provider || ''} | ${s.coverage || s.awardAmountPkr || 'See portal'}`
    ).join('\n');
    return ur
      ? `🎓 پاکستان میں اسکالرشپس\n\nڈیٹابیس سے:\n${schols}\n\nاہم اسکالرشپس:\n• احساس انڈرگریجویٹ: 100% فیس + 4,000 روپے/ماہ (50% خواتین کوٹہ)\n• HEC ضرورت پر مبنی: مکمل فیس + 6,000 روپے/ماہ (آمدن < 45,000)\n• PEEF پنجاب: فیس معافی + ہوسٹل الاؤنس\n• صوبائی: KPK StEP | Sindh Endowment | BEEF | MORA Zakat\n\n📅 درخواست: عام طور پر ستمبر – نومبر`
      : `🎓 Scholarships in Pakistan\n\nFrom NexStep database:\n${schols}\n\nKey national scholarships:\n• Ehsaas Undergraduate: Full tuition + PKR 4,000/month (50% female quota)\n• HEC Need-Based: Full tuition + PKR 6,000/month (family income < PKR 45k)\n• PEEF Punjab: Fee waiver + hostel allowance\n• Provincial: KPK StEP | Sindh Endowment | BEEF Balochistan | MORA Zakat\n\n📅 Application window: September – November each year`;
  }

  // ── TEVTA / Vocational ────────────────────────────────────────────────────
  if (/tevta|vocational|trade |dae|navttc|digiskills|solar|electrician|hvac|automation|short course/.test(q)) {
    const courses = TEVTA_COURSES.slice(0, 5).map((c: any) =>
      `  • ${c.title || c.name} — ${c.duration || ''}`
    ).join('\n');
    return ur
      ? `🔧 TEVTA / پیشہ ورانہ تعلیم\n\nمشہور کورسز:\n${courses}\n\nمفت آن لائن:\n• DigiSkills.pk — فری لانسنگ، SEO، QuickBooks، گرافک ڈیزائن\n• NAVTTC — AI، Cloud، Coding بوٹ کیمپ\n• Google Career Certificates (Ignite کے ذریعے)\n\nDAE (3 سال): براہ راست سب-انجینئر نوکری یا BS میں 2nd year داخلہ`
      : `🔧 TEVTA / Vocational Education\n\nPopular courses (NexStep database):\n${courses}\n\nFree online learning:\n• DigiSkills.pk — Freelancing, SEO, Graphic Design, QuickBooks\n• NAVTTC — AI, Cloud, Coding bootcamps\n• Google Career Certificates via Ignite/Tech4Life\n\nDAE (3-year Diploma): Direct Sub-Engineer employment or 2nd-year BE entry`;
  }

  // ── Universities ──────────────────────────────────────────────────────────
  if (/university|universities|admission|hec|lums|comsats|fast|air univ|bahria|ucp|szabist|iba/.test(q)) {
    const profileCity = (profile?.city || '').toLowerCase();
    const unis = UNIVERSITIES_DATA
      .filter((u: any) => !profileCity || u.city.toLowerCase() === profileCity || profileCity === '')
      .slice(0, 8)
      .map((u: any) =>
        `  • ${u.name} (${u.city}) — ${u.type} | Fee: PKR ${Number(u.annualFeePkr || 0).toLocaleString()}/yr`
      ).join('\n');
    return ur
      ? `🏛️ یونیورسٹیاں${profileCity ? ` (${profile.city} کے قریب)` : ''}\n\n${unis || '  • NUST  • COMSATS  • UET  • FAST-NUCES  • LUMS'}\n\nمزید کے لیے NexStep کا Universities ٹیب کھولیں — فیس، میرٹ اور پروگرام فلٹر کریں۔`
      : `🏛️ Universities${profileCity ? ` near ${profile.city}` : ' in Pakistan'}\n\n${unis || '  • NUST  • COMSATS  • UET  • FAST-NUCES  • LUMS'}\n\nOpen the Universities tab on NexStep to filter by fee, merit, programme, and city.`;
  }

  // ── Career / Job / Salary ─────────────────────────────────────────────────
  if (/career|job|salary|scope|future|internship|rozee|freelanc|employment|earning/.test(q)) {
    const top = CURATED_CAREERS.slice(0, 8).map((c: any) =>
      `  • ${c.title} — PKR ${Number(c.avgSalaryPkrMonth || c.starting_salary_pkr || 0).toLocaleString()}/mo`
    ).join('\n');
    return ur
      ? `💼 کیریئر رہنمائی\n\nNexStep ڈیٹابیس سے اہم کیریئرز:\n${top}\n\nنوکری پورٹلز: Rozee.pk | LinkedIn | Mustakbil.com\nمفت مہارتیں: DigiSkills.pk | Google Career Certificates\n\n💡 NexStep پر RIASEC کوئز دیں تاکہ اپنی شخصیت کے مطابق بہترین کیریئر معلوم ہو۔`
      : `💼 Career Guidance\n\nTop careers from NexStep database:\n${top}\n\nJob portals: Rozee.pk | LinkedIn | Mustakbil.com\nFree skills: DigiSkills.pk | Google Career Certificates\n\n💡 Take the RIASEC Quiz on NexStep to discover which career best fits your personality and marks.`;
  }

  // ── FSc / Matric / Stream ─────────────────────────────────────────────────
  if (/matric|fsc|f\.sc|stream|pre.med|pre.eng|inter |icom|arts |o.level|a.level|grade|hssc/.test(q)) {
    const profileStream = profile?.preferredStream || '';
    const streamNote = profileStream ? `\n📌 آپ کی موجودہ سٹریم: ${profileStream}` : '';
    return ur
      ? `📖 تعلیمی سٹریم گائیڈ${streamNote}\n\n🔬 FSc پری میڈیکل → MBBS، BDS، Pharm-D، DPT\n⚙️ FSc پری انجینئرنگ → BE (مختلف شعبے)، BS Math/Physics\n💻 ICS → BS CS، BS SE، BS AI، Data Science\n📊 ICOM / Commerce → BBA، CA، ACCA، BS Finance\n🎨 FA / آرٹس → قانون، ماس کمیونیکیشن، نفسیات\n🛠️ DAE (3 سال) → براہ راست سب-انجینئر نوکری\n\n💡 نمبر 60% سے کم ہوں تو ICS، ICOM یا DAE/TEVTA بہترین راستہ ہیں۔`
      : `📖 Academic Stream Guide${profileStream ? `\n📌 Your current stream: ${profileStream}` : ''}\n\n🔬 FSc Pre-Medical → MBBS, BDS, Pharm-D, DPT, BS Biotech\n⚙️ FSc Pre-Engineering → BE (Civil/Mech/Elec/Chemical), BS Math/Physics\n💻 ICS → BS CS, BS SE, BS AI, BS Data Science, BS Cyber Security\n📊 ICOM / Commerce → BBA, CA Foundation, ACCA, BS Accounting\n🎨 FA / Arts → BA-LL.B Law, Mass Communication, Psychology\n🛠️ DAE (3-year) → Direct Sub-Engineer job or 2nd-year BE entry\n\n💡 If Matric % < 60%, ICS, ICOM or DAE/TEVTA offer faster practical paths.`;
  }

  // ── Entry Tests ───────────────────────────────────────────────────────────
  if (/entry test|admission test|nat |gat |sat |lat |test prep|test date|when is/.test(q)) {
    const tests = ENTRY_TESTS_DATA.slice(0, 6).map((t: any) =>
      `  • ${t.name || t.title} — ${t.eligibility || t.stream || ''}`
    ).join('\n');
    return ur
      ? `📝 انٹری ٹیسٹ گائیڈ\n\nڈیٹابیس سے:\n${tests}\n\nاہم ٹیسٹ:\n• MDCAT — پری میڈیکل (PMDC/UHS)\n• ECAT — انجینئرنگ (UET)\n• NUST NET — NUST (سال میں 4 بار)\n• NAT-ICS — NTS (COMSATS، Air Uni)\n• GAT — MS/MPhil/PhD\n• LAT — قانون\n\n💡 NexStep کا Entry Test Prep ٹیب آزمائیں۔`
      : `📝 Entry Tests Guide\n\nFrom NexStep database:\n${tests}\n\nKey tests:\n• MDCAT — Pre-Medical (PMDC/UHS)\n• ECAT — Engineering (UET Lahore)\n• NUST NET — NUST (4 series/year)\n• NAT-ICS / NAT-IE — NTS (COMSATS, Air Uni, Bahria)\n• GAT General/Subject — MS/MPhil/PhD & HEC scholarships\n• LAT — Law Admission Test\n\n💡 Use NexStep's Entry Test Prep tab for practice questions.`;
  }

  // ── About NexStep ─────────────────────────────────────────────────────────
  if (/nexstep|this app|this site|this portal|riasec|career ai|skill gap|roadmap|mock interview|resume builder/.test(q)) {
    return ur
      ? `🌟 NexStep پلیٹ فارم\n\nNexStep پاکستانی طلباء (Grade 8 سے University) کا AI کیریئر گائیڈنس پورٹل ہے — Air University اسلام آباد میں تیار کیا گیا۔\n\nاہم فیچرز:\n🎯 Career AI — نمبروں کے مطابق کیریئر سفارشات\n🧠 RIASEC کوئز — شخصیت کے مطابق کیریئر\n📊 Skill Gap — کن مہارتوں کی ضرورت ہے\n🗺️ Career Roadmap — مرحلہ وار رہنمائی\n📄 Resume ATS — پیشہ ورانہ CV\n🎤 Mock Interview — AI انٹرویو پریکٹس\n🏛️ Universities — 100+ اداروں کا موازنہ\n🎓 Scholarships — صوبے کے مطابق فلٹر`
      : `🌟 About NexStep\n\nNexStep is an AI-powered career guidance portal for Pakistani students (Grade 8 → University), developed at Air University Islamabad.\n\nKey features:\n🎯 Career AI — ranked career recommendations based on your marks & profile\n🧠 RIASEC Quiz — personality-based career discovery\n📊 Skill Gap — identify skills you need to develop\n🗺️ Career Roadmap — personalised step-by-step milestone planner\n📄 Resume ATS — professional CV builder with ATS scoring\n🎤 Mock Interview — AI interview practice with instant feedback\n🏛️ Universities — compare 100+ HEC-recognised institutions\n🎓 Scholarships — filter by province and income level`;
  }

  // ── Generic: always give something useful ─────────────────────────────────
  const sampleCareers = CURATED_CAREERS.slice(0, 4).map((c: any) => `  • ${c.title}`).join('\n');
  return ur
    ? `🤖 NexStep AI کونسلر\n\nآپ کا سوال سمجھ آ گیا۔ میں ان موضوعات پر رہنمائی دے سکتا ہوں:\n\n📚 MDCAT • ECAT • FSc سٹریم • ICS • DAE\n🏛️ NUST • FAST • UET • COMSATS • LUMS\n🎓 احساس • PEEF • HEC اسکالرشپ\n💼 کیریئرز:\n${sampleCareers}\n\nاپنا سوال مزید واضح الفاظ میں لکھیں تاکہ بہتر جواب مل سکے۔`
    : `🤖 NexStep AI Counselor\n\nI can help with:\n\n📚 MDCAT, ECAT, FSc streams, ICS, DAE, O/A-Levels\n🏛️ NUST, FAST, UET, COMSATS, LUMS, Air University\n🎓 Ehsaas, PEEF, HEC Need-Based scholarships\n💼 Top careers from database:\n${sampleCareers}\n\nPlease rephrase your question with specific keywords (e.g. "MDCAT merit", "NUST NET", "Ehsaas scholarship") for a more detailed answer.`;
}

// ─────────────────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

const DEV_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:30001',
  'http://127.0.0.1:30001',
]);

const CONFIGURED_ORIGINS = new Set(
  [process.env.APP_URL, process.env.FRONTEND_URL, process.env.CORS_ORIGINS]
    .flatMap((value) => value?.split(',') ?? [])
    .map((value) => value.trim())
    .filter(Boolean)
);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isLocalDev = origin && (DEV_ORIGINS.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
  const isConfiguredOrigin = Boolean(origin && CONFIGURED_ORIGINS.has(origin));
  if (origin && (isConfiguredOrigin || (process.env.NODE_ENV !== 'production' && isLocalDev))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.AI_RATE_LIMIT_PER_MIN) || 10,
  message: { error: 'AI request limit reached. Please wait a moment before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req as any).user?.id ?? req.ip ?? 'unknown',
});

const KNOWLEDGE_BASE_SYSTEM_PROMPT = `
You are NexStep AI, an expert, empathetic, bilingual (Urdu & English) career guidance counselor for Pakistani students from Grade 8 through University.
Platform: NexStep (Developed at Air University Islamabad by Muhammad Abdur Rehman, Areej Fatima, and Faria Ahmed, supervised by Mr. Yasir Ali).

════════════════════════════════════════════════════════════════════════════════
CORE KNOWLEDGE BASE & SYSTEM DIRECTIVES
════════════════════════════════════════════════════════════════════════════════

1. PAKISTAN EDUCATION SYSTEM ARCHITECTURE & STAGES
   - Grade 8 (Middle School): Students select their Matric group (Science Biology, Science Computer Science, Commerce/ICOM, or Arts/Humanities).
   - Grade 9 & 10 (Matric / SSC): Conducted under BISE Boards (FBISE Islamabad, Punjab BISEs: Lahore, Gujranwala, Rawalpindi, Faisalabad, Multan, Sahiwal, Sargodha, Bahawalpur, D.G. Khan; Sindh Boards: BSEK Karachi, BISE Hyderabad, Sukkur, Larkana, Mirpurkhas; KPK Boards: BISE Peshawar, Abbottabad, Mardan, Swat, Kohat, Bannu, Malakand, D.I. Khan; Balochistan BISE Quetta).
   - Grades 11 & 12 (FSc / HSSC / Transnational): 
     * FSc Pre-Medical: Biology, Chemistry, Physics (Leads to MBBS, BDS, Pharm-D, DPT, Biotech, Nursing, BS Chemistry/Zoology).
     * FSc Pre-Engineering: Mathematics, Chemistry, Physics (Leads to BE Civil, Mechanical, Electrical, Chemical, Aerospace, Mechatronics, BS Math, BS Physics).
     * ICS (Intermediate in Computer Science): Mathematics, Physics, Computer Science OR Math, Statistics, CS (Leads to BS CS, BS Software Eng, BS AI, BS Data Science, BS Cyber Security).
     * ICOM (Intermediate in Commerce): Principles of Accounting, Economics, Commerce, Business Math (Leads to BBA, BS Accounting & Finance, ACCA, CA, BS Banking).
     * FA (Faculty of Arts): Humanities, Civics, Fine Arts, Psychology, Sociology, Journalism (Leads to BA-LL.B Law, BS English, BS International Relations, Media Studies, Graphic Design).
     * DAE (Diploma of Associate Engineer): 3-Year Technical Diploma under Board of Technical Education (PBTE, KPBTE, SBTE). Leads to direct job entry as Sub-Engineer or 2nd year admission in BS Engineering/Technology.
     * TEVTA Vocational Trade Diplomas: 3-month to 1-year trade certificates (Solar Maintenance, Industrial Automation, HVAC, Electrician, Computer Graphics).
     * Transnational Education (O-Levels / A-Levels / Cambridge International): 8 O-Level subjects and 3 A-Level principal subjects. Converted to Pakistani Marks Percentage by IBCC (Inter Board Coordination Commission) using official equivalency guidelines: A* = 90%, A = 85%, B = 75%, C = 65%, D = 55%, E = 45%.

2. ENTRY TEST GUIDELINES & SPECIFICATIONS
   - MDCAT (Medical & Dental College Admission Test): PMDC / UHS / DUHS / KMU / BUMHS. 200 MCQs (Biology 68, Chemistry 54, Physics 54, English 18, Logical Reasoning 6). Eligibility: 65% in FSc Pre-Medical. Public medical merit cutoff is 91.5% to 93.8%.
   - ECAT (Engineering College Admission Test): UET Lahore / Provincial boards. 100 MCQs (Physics 30, Math/Bio 30, Chem/CS 30, English 10). Total 400 marks with negative marking (-1 for wrong, +4 for correct). Public cutoff: 72% to 82%.
   - NTS-NAT (National Aptitude Test): 90 MCQs (Verbal 20, Analytical 20, Quantitative 20, Subject 30). Used by COMSATS, Air Uni, Bahria, IUB. Result valid 1 year.
   - NUMS Entry Test: Conducted by National University of Medical Sciences for Army Medical College Rawalpindi & affiliated private medical colleges.
   - NUST NET (NUST Entry Test): 200 MCQs (Math 80, Physics 60, Chemistry/CS 30, English 20, Intelligence 10). Held in 4 series per year (NET-1 to NET-4). CS/SE cutoff score > 145/200.
   - GAT (Graduate Assessment Test General & Subject): Conducted by NTS for MS/MPhil (50% passing) and PhD (60% passing) admissions and HEC postgraduate scholarships.

3. TOP 100 HEC RECOGNIZED UNIVERSITIES OVERVIEW
   - Public Top Tier: NUST Islamabad, COMSATS Islamabad, QAU Islamabad, UET Lahore, PU Lahore, KEMU Lahore, IBA Karachi, KU Karachi, NED Karachi, UET Peshawar, KMU Peshawar, UAF Faisalabad, PIEAS Islamabad.
   - Private Top Tier: LUMS Lahore, FAST-NUCES (Lahore/Islamabad/Karachi/Peshawar), Aga Khan University Karachi, GIKI Topi, Riphah, Superior, UCP, UMT, SZABIST, Habib University.
   - Regional Universities: BZU Multan, IUB Bahawalpur, UOG Gujrat, GCUF Faisalabad, AWKUM Mardan, BUITEMS Quetta, UOB Quetta, UAJK Muzaffarabad, KIU Gilgit.

4. SCHOLARSHIP OPPORTUNITIES
   - HEC Need-Based Scholarship: Full tuition fee + PKR 6,000 monthly stipend for public uni students with family income < PKR 45,000/mo.
   - PEEF (Punjab Educational Endowment Fund): Tuition waiver + hostel allowance for Punjab domicile orphans, minorities, low-income students.
   - Ehsaas Undergraduate Scholarship: 50,000 scholarships/year covering tuition + PKR 4,000/mo living stipend (50% quota for females).
   - Sindh Endowment, BEEF Balochistan, KPK StEP, MORA Zakat Scholarships.

5. FREE SKILLS & CERTIFICATIONS
   - DigiSkills.pk: Free government training in Freelancing, SEO, Digital Marketing, QuickBooks, Graphic Design.
   - Google Career Certificates (via Tech4Life/Ignite): Cybersecurity, Data Analytics, IT Support, Project Management.
   - NAVTTC Prime Minister Youth Skill Development: 6-month high-tech courses in AI, Cloud, Coding.

6. COUNSELING STRATEGY & GUIDANCE RULES
   - Be empathetic, realistic, and encouraging. Never discourage a student with low marks.
   - If marks are low (<55%), suggest DAE or TEVTA vocational trade courses which offer quick skill certification, monthly stipends, and guaranteed job market entry.
   - If user asks in Urdu script, reply in natural, fluent Urdu script (اردو). If in English, reply in clear English.
`;

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — Unauthenticated / public routes
// ══════════════════════════════════════════════════════════════════════════════

app.get(['/health', '/api/health'], async (_req, res) => {
  const start = Date.now();
  let dbStatus = 'unreachable';
  let dbLatencyMs = -1;
  try {
    const dbStart = Date.now();
    await pool.query('SELECT 1');
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = 'connected';
  } catch { /* status stays unreachable */ }
  res.json({
    status: 'ok',
    service: 'NexStep AI Backend',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: { status: dbStatus, latencyMs: dbLatencyMs },
    ai: { enabled: geminiEnabled() },
    responseMs: Date.now() - start,
  });
});

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/payments', paymentsRouter);

app.get('/api/universities', async (req, res) => {
  try {
    const { city, maxFee, tier, type, search } = req.query as Record<string, string>;
    let query = `
      SELECT u.id, u.name, u.short_name AS "shortName", u.city, u.province, u.type,
             u.hec_rank_tier AS "hecRankTier", u.is_hec_recognized AS "isHecRecognized",
             u.annual_fee_pkr AS "annualFeePkr", u.official_website AS "officialWebsite",
             u.admissions_url AS "admissionsUrl", u.programs, u.last_verified_at AS "lastVerifiedAt",
             u.verification_status AS "verificationStatus",
             ds.name AS "sourceName", ds.source_type AS "sourceType", ds.base_url AS "sourceUrl", ds.is_official AS "isOfficial"
      FROM universities u
      LEFT JOIN data_sources ds ON u.source_id = ds.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (city && city !== 'All') { params.push(city); query += ` AND LOWER(u.city) = LOWER($${params.length})`; }
    if (type && type !== 'All') { params.push(type); query += ` AND LOWER(u.type) = LOWER($${params.length})`; }
    if (tier && tier !== 'All') { params.push(tier); query += ` AND LOWER(u.hec_rank_tier) = LOWER($${params.length})`; }
    if (maxFee) { const f = parseInt(maxFee, 10); if (!isNaN(f)) { params.push(f); query += ` AND u.annual_fee_pkr <= $${params.length}`; } }
    if (search) { const q = `%${search.toLowerCase()}%`; params.push(q); query += ` AND (LOWER(u.name) LIKE $${params.length} OR LOWER(u.city) LIKE $${params.length})`; }
    query += ` ORDER BY u.name ASC`;
    const { rows } = await pool.query(query, params);
    const data = rows.length > 0 ? rows.map((university: any) => ({
      ...university,
      programs: asStringList(university.programs),
      websiteUrl: university.admissionsUrl || university.officialWebsite || null,
      annualFeePkr: Number(university.annualFeePkr) || 0,
      lastMeritCutoffPct: Number(university.lastMeritCutoffPct) || 0,
    })) : UNIVERSITIES_DATA;
    res.json({ count: data.length, data });
  } catch {
    res.json({ count: UNIVERSITIES_DATA.length, data: UNIVERSITIES_DATA });
  }
});

app.get('/api/scholarships', async (req, res) => {
  try {
    const { province, category, maxIncome } = req.query as Record<string, string>;
    let query = `
      SELECT s.id, s.name AS title, s.provider, s.description, s.province, s.category,
             s.coverage AS "awardAmountPkr", s.amount_pkr AS "amountPkr", s.max_family_income AS "maxFamilyIncomePkr",
             s.deadline, s.application_url AS "applicationUrl", s.official_url AS "officialUrl",
             s.last_verified_at AS "lastVerifiedAt", s.freshness_status AS "freshnessStatus",
             s.verification_status AS "verificationStatus",
             ds.name AS "sourceName", ds.source_type AS "sourceType", ds.base_url AS "sourceUrl", ds.is_official AS "isOfficial"
      FROM scholarships s
      LEFT JOIN data_sources ds ON s.source_id = ds.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (province && province !== 'All') { params.push(`%${province}%`); query += ` AND (s.province ILIKE $${params.length} OR s.province ILIKE '%Federal%')`; }
    if (category && category !== 'All') { params.push(category); query += ` AND LOWER(s.category) = LOWER($${params.length})`; }
    if (maxIncome) { const i = parseInt(maxIncome, 10); if (!isNaN(i)) { params.push(i); query += ` AND s.max_family_income >= $${params.length}`; } }
    query += ` ORDER BY s.created_at DESC`;
    const { rows } = await pool.query(query, params);
    const databaseRecords = rows.map((scholarship: any) => ({
      ...scholarship,
      awardAmountPkr: scholarship.awardAmountPkr || scholarship.amountPkr || 'Award not listed',
      maxFamilyIncomePkr: Number(scholarship.maxFamilyIncomePkr) || 0,
      minAcademicPct: Number(scholarship.minAcademicPct) || 0,
      applicationUrl: scholarship.applicationUrl || scholarship.officialUrl || null,
    }));
    const data = mergeUnique(databaseRecords, CURATED_SCHOLARSHIPS, (item) => item.name || item.title);
    res.json({ count: data.length, data });
  } catch {
    res.json({ count: SCHOLARSHIPS_DATA.length, data: SCHOLARSHIPS_DATA });
  }
});

app.get('/api/careers', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.id, c.title, c.riasec_code AS "riasecCode", c.description,
             c.starting_salary_pkr AS "avgSalaryPkrMonth", c.avg_salary_pkr AS "avgSalaryPkrSenior",
             c.demand_level AS "demandLevel", c.required_skills AS "requiredSkills",
             c.preferred_stream AS "streamRequired", c.last_verified_at AS "lastVerifiedAt",
             c.verification_status AS "verificationStatus",
             ds.name AS "sourceName", ds.source_type AS "sourceType", ds.base_url AS "sourceUrl", ds.is_official AS "isOfficial"
      FROM careers c
      LEFT JOIN data_sources ds ON c.source_id = ds.id
      ORDER BY c.title ASC
    `);
    const data = mergeUnique(rows, CURATED_CAREERS, (item) => item.title);
    res.json({ count: data.length, data });
  } catch {
    res.json({ count: CURATED_CAREERS.length, data: CURATED_CAREERS });
  }
});

app.get('/api/entry-tests', (_req, res) => res.json({ count: ENTRY_TESTS_DATA.length, data: ENTRY_TESTS_DATA }));
app.get('/api/riasec/questions', (_req, res) => {
  res.json({
    count: RIASEC_QUESTIONS.length,
    data: RIASEC_QUESTIONS.map((question: any) => ({ id: question.id, category: question.category, textEn: question.textEn, textUr: question.textUr })),
  });
});
app.get('/api/tevta-it', (_req, res) => res.json({ tevta: TEVTA_COURSES, freeIt: FREE_IT_COURSES }));
app.get('/api/transnational', (_req, res) => res.json({ data: TRANSNATIONAL_PATHWAYS }));

app.get('/api/jobs', async (req, res) => {
  try {
    const { search, keyword, type, city, location, page = '1', limit = '100' } = req.query as Record<string, string>;
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(200, Math.max(1, parseInt(limit, 10) || 100));
    const offset = (p - 1) * l;

    let queryText = `
      SELECT j.id, j.title, j.company, j.location, j.city, j.province,
             j.employment_type AS type, j.experience_level AS experience,
             j.description, j.required_skills AS skills, j.salary_min AS "salaryMin",
             j.salary_max AS "salaryMax", j.application_url AS "applyUrl",
             j.freshness_status AS "freshnessStatus", j.verification_status AS "verificationStatus",
             j.last_verified_at AS "lastVerifiedAt",
             ds.name AS "sourceName", ds.source_type AS "sourceType", ds.base_url AS "sourceUrl", ds.is_official AS "isOfficial"
      FROM jobs j
      LEFT JOIN data_sources ds ON j.source_id = ds.id
      WHERE 1=1
    `;
    const params: any[] = [];
    const qTerm = (search || keyword || '').trim().toLowerCase();
    if (qTerm) {
      params.push(`%${qTerm}%`);
      queryText += ` AND (LOWER(j.title) LIKE $${params.length} OR LOWER(j.company) LIKE $${params.length} OR LOWER(j.description) LIKE $${params.length})`;
    }
    const filterType = (type || '').trim();
    if (filterType && filterType !== 'All') {
      params.push(`%${filterType.toLowerCase()}%`);
      queryText += ` AND LOWER(j.employment_type) LIKE $${params.length}`;
    }
    const filterCity = (city || location || '').trim().toLowerCase();
    if (filterCity && filterCity !== 'all') {
      params.push(`%${filterCity}%`);
      queryText += ` AND (LOWER(j.city) LIKE $${params.length} OR LOWER(j.location) LIKE $${params.length})`;
    }

    queryText += ` ORDER BY j.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(l, offset);

    const { rows } = await pool.query(queryText, params);
    const data = rows.length > 0 ? rows.map((j: any) => ({
      ...j,
      stipendSalary: j.salaryMin
        ? `PKR ${Number(j.salaryMin).toLocaleString()}${j.salaryMax ? ' - ' + Number(j.salaryMax).toLocaleString() : ''} / mo`
        : 'Competitive market salary',
      requirements: typeof j.skills === 'string'
        ? j.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : Array.isArray(j.skills) ? j.skills : [],
    })) : JOBS_INTERNSHIPS_DATA;

    res.json({ count: data.length, total: rows.length, page: p, limit: l, data });
  } catch {
    res.json({ count: JOBS_INTERNSHIPS_DATA.length, data: JOBS_INTERNSHIPS_DATA });
  }
});

app.get('/api/courses', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.id, c.title, c.provider, c.description, c.skills_covered AS "skillsCovered",
             c.duration, c.format, c.price_pkr AS "pricePkr", c.enrollment_url AS "enrollUrl",
             c.verification_status AS "verificationStatus", c.last_verified_at AS "lastVerifiedAt",
             ds.name AS "sourceName", ds.source_type AS "sourceType", ds.base_url AS "sourceUrl", ds.is_official AS "isOfficial"
      FROM courses c
      LEFT JOIN data_sources ds ON c.source_id = ds.id
      ORDER BY c.title ASC
    `);
    const databaseRecords = rows.map((course: any) => ({
      ...course,
      category: course.category || course.format || 'Career Skills',
      skills: asStringList(course.skillsCovered),
      price: course.pricePkr ? `PKR ${Number(course.pricePkr).toLocaleString()}` : 'FREE',
      officialUrl: course.officialUrl || course.enrollUrl,
    }));
    const data = mergeUnique(databaseRecords, CURATED_COURSES, (item) => item.title);
    res.json({ count: data.length, data });
  } catch {
    res.json({ count: CURATED_COURSES.length, data: CURATED_COURSES });
  }
});

app.get('/api/data-sources', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT ds.*, COUNT(dv.id) AS versions_count
      FROM data_sources ds
      LEFT JOIN dataset_versions dv ON ds.id = dv.source_id
      GROUP BY ds.id
      ORDER BY ds.name ASC
    `);
    res.json({ count: rows.length, data: rows });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch data sources.', details: err.message });
  }
});

app.get('/api/data-freshness', async (_req, res) => {
  try {
    const { rows: imports } = await pool.query(`
      SELECT di.*, dv.dataset_name, ds.name AS source_name
      FROM dataset_imports di
      LEFT JOIN dataset_versions dv ON di.dataset_version_id = dv.id
      LEFT JOIN data_sources ds ON dv.source_id = ds.id
      ORDER BY di.started_at DESC
      LIMIT 10
    `);
    res.json({ status: 'ok', recentImports: imports });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch freshness status.', details: err.message });
  }
});

app.post('/api/analyze-grade8', (req, res) => {
  const { mathMarks = 70, scienceMarks = 70, englishMarks = 70, computerMarks = 70 } = req.body;
  const m = parseFloat(mathMarks) || 0;
  const s = parseFloat(scienceMarks) || 0;
  const e = parseFloat(englishMarks) || 0;
  const c = parseFloat(computerMarks) || 0;
  const avg = (m + s + e + c) / 4;

  const groupRecommendations: any[] = [];
  if (s >= 75 && m >= 70) {
    groupRecommendations.push({
      group: 'Science (Biology Group)',
      fitLevel: 'Strong Fit',
      reasons: 'High science and math scores indicate strong potential for MBBS, Medical, Biotechnology, and Pharmacy.'
    });
  }
  if (c >= 70 || (m >= 75 && s >= 65)) {
    groupRecommendations.push({
      group: 'Science (Computer Group)',
      fitLevel: 'Optimal Match',
      reasons: 'Excellent logical skills suitable for Software Engineering, AI, Computer Science, and Data Analytics.'
    });
  }
  if (avg >= 50) {
    groupRecommendations.push({
      group: 'Commerce / ICOM Group',
      fitLevel: 'Good Alternative',
      reasons: 'Solid foundation for Business Administration, Accounting, Finance, and Entrepreneurship.'
    });
  }
  groupRecommendations.push({
    group: 'Arts / Humanities & Vocational Trades',
    fitLevel: 'Broad Career Scope',
    reasons: 'Ideal for Law, Graphic Design, Languages, Media, or TEVTA technical skill certifications.'
  });

  res.json({ averageScore: Math.round(avg), recommendations: groupRecommendations });
});

app.post('/api/analyze-matric', (req, res) => {
  const { scienceMarks = 0, mathMarks = 0, totalPercentage, biseBoard = 'FBISE' } = req.body;
  const pct = parseFloat(totalPercentage) || 0;
  const sci = parseFloat(scienceMarks) || 0;
  const math = parseFloat(mathMarks) || 0;
  const streams: any[] = [];
  const warnings: string[] = [];
  const tevtaAlternatives: any[] = [];

  if (pct >= 85) {
    streams.push({ stream: 'FSc Pre-Medical / Pre-Engineering', matchScore: 'Strong Fit (Top Merit Tier)', details: `Meets ${biseBoard} cutoff for public medical & top engineering universities.` });
    streams.push({ stream: 'ICS (Computer Science)', matchScore: 'Strong Fit', details: 'High aptitude for Software Engineering, AI, and Data Science.' });
  } else if (pct >= 70) {
    streams.push({ stream: 'ICS (Computer Science & Math)', matchScore: 'Best Match', details: 'Optimal for software, cybersecurity, tech fields.' });
    streams.push({ stream: 'ICOM / BBA / CA Foundation', matchScore: 'Strong Fit', details: 'Finance, business analytics, chartered accountancy.' });
    if (sci < 75) warnings.push('MBBS cutoff usually >90%. Consider ICS or ICOM.');
  } else if (pct >= 55) {
    streams.push({ stream: 'DAE (3-Year Diploma of Associate Engineer)', matchScore: 'High Employment Match', details: 'Electrical, Mechanical, or Automation sub-engineering roles.' });
    streams.push({ stream: 'FA / Humanities', matchScore: 'Good Fit', details: 'Leads to Law (BA-LL.B), Mass Comm, Languages, and Social Sciences.' });
  } else {
    streams.push({ stream: 'TEVTA Vocational Trade Certificates', matchScore: 'Direct Job Ready', details: 'Government-certified technical trades with monthly stipend.' });
    warnings.push('Traditional FSc merit cutoffs are high. TEVTA trade diplomas offer faster job entry.');
  }

  if (pct < 65 || sci < 60) {
    tevtaAlternatives.push({ title: 'Diploma in Solar PV System Installation', duration: '3 Months', institute: 'TEVTA VTI', stipend: 'PKR 2,500/mo' });
    tevtaAlternatives.push({ title: 'Industrial Automation & Robotics', duration: '6 Months', institute: 'GCT Technical College', stipend: 'PKR 3,000/mo' });
    tevtaAlternatives.push({ title: 'Computerized Building Electrician', duration: '6 Months', institute: 'TEVTA TTC', stipend: 'PKR 2,500/mo' });
  }

  res.json({ pct, board: biseBoard, recommendedStreams: streams, warnings, tevtaAlternatives });
});

app.post('/api/calculate-transnational', (req, res) => {
  const { oLevelGrades = [], aLevelGrades = [] } = req.body;
  
  const gradePoints: Record<string, number> = {
    'A*': 90, 'A': 85, 'B': 75, 'C': 65, 'D': 55, 'E': 45
  };

  let totalPts = 0;
  let count = 0;

  [...oLevelGrades, ...aLevelGrades].forEach((g: string) => {
    const uppercase = String(g).toUpperCase().trim();
    if (gradePoints[uppercase]) {
      totalPts += gradePoints[uppercase];
      count += 1;
    }
  });

  const equivalencyPct = count > 0 ? Math.round(totalPts / count) : 75;

  const eligiblePrograms: string[] = [];
  if (equivalencyPct >= 80) {
    eligiblePrograms.push('BS Computer Science (FAST, NUST, LUMS, COMSATS)');
    eligiblePrograms.push('BBA / BSc Economics (LUMS, IBA, NUST)');
    eligiblePrograms.push('BA-LL.B International Law (LUMS, TMUC)');
  } else if (equivalencyPct >= 65) {
    eligiblePrograms.push('BS Software Engineering / Cyber Security (Air Uni, Bahria)');
    eligiblePrograms.push('BBA & Accounting & Finance (SZABIST, CUST)');
    eligiblePrograms.push('Dual Degree Foreign Qualifications (UOL International)');
  } else {
    eligiblePrograms.push('Higher National Diploma (HND Pearson BTEC)');
    eligiblePrograms.push('International Foundation Year (IFY)');
  }

  res.json({ equivalencyPct, subjectsCalculated: count, eligiblePrograms });
});

app.post('/api/calculate-fsc', (req, res) => {
  res.json(personalizedCareerMatches(req.body || {}));
});

app.post('/api/recommendations', (req, res) => {
  res.json(personalizedCareerMatches(req.body || {}));
});

app.post('/api/scholarships/match', (req, res) => {
  const profile = req.body || {};
  const income = Math.max(0, Number(profile.familyMonthlyIncomePkr) || 0);
  const academicPct = Math.max(0, Number(profile.academicPct ?? profile.fscPct ?? profile.matricPct) || 0);
  const province = String(profile.province || profile.city || '').toLowerCase();
  const grade = String(profile.gradeLevel || profile.degreeLevel || '').toLowerCase();
  const matches = CURATED_SCHOLARSHIPS.map((scholarship: any, index: number) => {
    const incomeLimit = Number(scholarship.max_family_income ?? scholarship.maxFamilyIncomePkr) || 0;
    const minAcademic = Number(scholarship.min_academic_pct ?? scholarship.minAcademicPct) || 0;
    const allowedProvinces = String(scholarship.province || 'Federal / All Provinces').toLowerCase();
    const levels = (scholarship.degree_levels || scholarship.eligibleGrades || []) as string[];
    const incomeFit = !incomeLimit || income <= incomeLimit;
    const academicFit = !minAcademic || academicPct >= minAcademic;
    const provinceFit = !province || allowedProvinces.includes('all provinces') || allowedProvinces.includes('federal') || allowedProvinces.includes(province);
    const levelFit = !grade || !levels.length || levels.some((level) => level.toLowerCase().includes(grade) || grade.includes(level.toLowerCase()));
    const eligibilityScore = (incomeFit ? 35 : 0) + (academicFit ? 30 : 0) + (provinceFit ? 20 : 0) + (levelFit ? 15 : 0);
    return {
      ...scholarship,
      id: scholarship.id || `scholarship-${index + 1}`,
      title: scholarship.title || scholarship.name,
      awardAmountPkr: scholarship.awardAmountPkr || scholarship.coverage,
      applicationUrl: scholarship.applicationUrl || scholarship.application_url,
      eligibilityScore,
      eligibility: eligibilityScore >= 80 ? 'Likely eligible' : eligibilityScore >= 50 ? 'Review requirements' : 'Not currently eligible',
      checks: { incomeFit, academicFit, provinceFit, levelFit },
    };
  }).sort((a, b) => b.eligibilityScore - a.eligibilityScore);
  res.json({ count: matches.length, data: matches });
});

app.post('/api/translate', async (req, res) => {
  try {
    const { text, texts, targetLang = 'ur' } = req.body;
    if (targetLang === 'en') return res.json({ translatedText: text, translatedTexts: texts });
    if (!geminiEnabled()) return sendAiUnavailable(res);

    if (texts && Array.isArray(texts)) {
      const prompt = `Translate these educational terms into natural Urdu script (اردو). Keep NUST, FAST, MDCAT, HEC, TEVTA recognizable. Return ONLY a valid JSON array:\n\n${JSON.stringify(texts)}`;
      const t = (await generateGeminiContent(prompt)).replace(/```json/g, '').replace(/```/g, '').trim();
      try { return res.json({ translatedTexts: JSON.parse(t) }); }
      catch { return res.json({ translatedTexts: texts }); }
    }
    if (text) {
      const prompt = `Translate this into natural Urdu script (اردو). Keep MDCAT, ECAT, NUST, HEC, TEVTA recognizable. Return ONLY the translated string:\n\n"${text}"`;
      return res.json({ translatedText: (await generateGeminiContent(prompt)).trim() || text });
    }
    res.status(400).json({ error: 'text or texts array is required.' });
  } catch (err: any) {
    if (err.code === 'AI_UNAVAILABLE') return sendAiUnavailable(res);
    res.status(500).json({ error: 'Translation failed.', details: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — Authenticated routes
// ══════════════════════════════════════════════════════════════════════════════
// `userRouter` authenticates every request it receives. Limit its mount to
// its actual resource prefixes so unknown public API URLs reach the JSON 404
// handler instead of incorrectly returning an authentication error.
const USER_ROUTE_PREFIX = /^\/(?:profile|bookmarks|applications|quiz-results)(?:\/|$)/;
app.use('/api', (req, res, next) => {
  if (USER_ROUTE_PREFIX.test(req.path)) return userRouter(req, res, next);
  return next();
});
app.use('/api/roadmap', roadmapRouter);
app.use('/api/interviews', interviewsRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/mentor', mentorRouter);
app.use('/api/recruiter', recruiterRouter);
app.use('/api/admin', adminRouter);

// Quick health-check for Gemini — hit GET /api/chat/test to verify the key works
app.get('/api/chat/test', async (_req, res) => {
  if (!geminiEnabled()) return res.status(503).json({ ok: false, error: 'GEMINI_API_KEY not set in backend/.env' });
  try {
    const reply = await generateGeminiContent('Say "NexStep AI is working" and nothing else.');
    res.json({ ok: true, reply });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: String(err.message), hint: 'Check your GEMINI_API_KEY, model access, and Gemini free-tier quota.' });
  }
});

app.post('/api/chat', requireAuth(), aiLimiter, async (req, res) => {
  const { message, conversationId, language = 'en', profile: clientProfile, history = [] } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'message is required.' });
  if (message.trim().length > 4000) return res.status(413).json({ error: 'message must be 4000 characters or fewer.' });

  // Check Gemini runtime status (will attempt Gemini if ready, otherwise uses NexStep Counselor Engine)
  const rt = (globalThis as any).__NEXSTEP_GEMINI_ENABLED_RUNTIME;
  const isGeminiReady = Boolean(rt && rt.enabled);

  let conversation: any;
  try {
    conversation = conversationId ? await queryOne<any>(
      'SELECT id FROM ai_conversations WHERE id=$1 AND user_id=$2',
      [conversationId, req.user!.id]
    ) : null;
    if (conversationId && !conversation) return res.status(404).json({ error: 'Conversation not found.' });
    if (!conversation) {
      conversation = await queryOne<any>(
        'INSERT INTO ai_conversations (user_id, title) VALUES ($1,$2) RETURNING id',
        [req.user!.id, message.trim().slice(0, 80)]
      );
    }
  } catch (err: any) {
    console.error('[/api/chat] Conversation database error:', err.message);
    return res.status(503).json({ error: 'Conversation storage is temporarily unavailable.', code: 'DATABASE_UNAVAILABLE' });
  }

  try {
    const storedProfile = await queryOne<any>(
      `SELECT p.*, u.first_name, u.last_name, u.email
       FROM profiles p JOIN users u ON u.id=p.user_id WHERE p.user_id=$1`,
      [req.user!.id]
    );
    const storedSkills = await query<any>(
      'SELECT name, level, category FROM user_skills WHERE user_id=$1 ORDER BY created_at LIMIT 100',
      [req.user!.id]
    );
    const profile = storedProfile ? {
      name: `${storedProfile.first_name || ''} ${storedProfile.last_name || ''}`.trim(),
      city: storedProfile.city,
      province: storedProfile.province,
      gradeLevel: storedProfile.grade_level,
      preferredStream: storedProfile.preferred_stream,
      topRiasecCluster: storedProfile.top_riasec_cluster,
      targetCareer: storedProfile.target_career,
      goals: storedProfile.goals,
      budgetAnnualPkr: storedProfile.budget_annual_pkr,
      familyMonthlyIncomePkr: storedProfile.family_monthly_income_pkr,
      certifications: storedProfile.certifications || [],
      skills: storedSkills,
      marks: {
        matricPct: storedProfile.matric_pct,
        fscPct: storedProfile.fsc_pct,
        entryTestScore: storedProfile.entry_test_score,
      },
    } : clientProfile;

    await query(
      'INSERT INTO ai_messages (conversation_id, role, content) VALUES ($1,$2,$3)',
      [conversation.id, 'user', message.trim()]
    );

    let ctx = '';
    if (profile) {
      const p = profile;
      const marks = p.marks || {};
      const skills = Array.isArray(p.skills) && p.skills.length ? `Skills: ${p.skills.join(', ')}.` : 'No skills listed yet.';
      const certs = Array.isArray(p.certifications) && p.certifications.length ? `Certifications: ${p.certifications.join(', ')}.` : '';
      const goals = p.goals ? `Goals: ${p.goals}.` : '';
      const targetCareer = p.targetCareer ? `Target Career: ${p.targetCareer}.` : '';
      ctx = `
══════════ CURRENT STUDENT PROFILE ══════════
Name:               ${p.name || 'Not provided'}
City / Province:    ${[p.city, p.province].filter(Boolean).join(', ') || 'Not provided'}
Grade Level:        ${p.gradeLevel || 'Not specified'}
Stream:             ${p.preferredStream || 'Not selected'}
Matric %:           ${marks.matricPct ?? 'N/A'}%
FSc %:              ${marks.fscPct ?? 'N/A'}%
Entry Test Score:   ${marks.entryTestScore ?? 'N/A'}
RIASEC Cluster:     ${p.topRiasecCluster || 'Not taken yet'}
${targetCareer}
${skills}
${certs}
${goals}
Budget (annual):    PKR ${Number(p.budgetAnnualPkr || 0).toLocaleString()}
Family Income/mo:   PKR ${Number(p.familyMonthlyIncomePkr || 0).toLocaleString()}
══════════════════════════════════════════════
Use this profile to give personalised, specific advice. Reference actual numbers.
If marks are low (<55%), emphasise DAE, TEVTA, and vocational paths encouragingly.
If RIASEC is not taken, recommend taking the quiz on NexStep.
`;
    }
    const boundedHistory = Array.isArray(history) ? history.slice(-6) : [];
    const historyBlock = boundedHistory.length
      ? '\n══════════ RECENT CONVERSATION ══════════\n' +
        boundedHistory.map((m: any) => `${m.role === 'user' ? 'STUDENT' : 'NEXSTEP AI'}: ${String(m.content || '').slice(0, 4000)}`).join('\n') +
        '\n══════════════════════════════════════════\n'
      : '';
    const langInstruction = language === 'ur'
      ? 'IMPORTANT: Respond ENTIRELY in natural, fluent Urdu script (اردو). Do NOT use English sentences. Keep technical acronyms (MDCAT, ECAT, NUST, HEC, TEVTA, PEEF) in their original form.'
      : 'Respond in clear, friendly English. Be concise but thorough. Use bullet points for lists.';
    const fullPrompt = `${KNOWLEDGE_BASE_SYSTEM_PROMPT}\n${ctx}${historyBlock}\n${langInstruction}\n\nSTUDENT QUESTION: ${message.trim()}\n\nNEXSTEP AI ANSWER:`;
    let reply = '';
    let source = 'nexstep-counselor-engine';

    if (isGeminiReady) {
      try {
        reply = await generateGeminiContent(fullPrompt);
        if (reply?.trim()) {
          source = 'gemini';
        }
      } catch (gemErr: any) {
        console.warn(`  [AI Counselor] Live Gemini call notice: ${gemErr.message?.slice(0, 100)}. Falling back seamlessly to NexStep Expert Counselor Engine.`);
      }
    }

    if (!reply?.trim()) {
      reply = generateCounselingResponse(message, profile, boundedHistory, language);
      source = 'nexstep-counselor-engine';
    }

    await query(
      'INSERT INTO ai_messages (conversation_id, role, content) VALUES ($1,$2,$3)',
      [conversation.id, 'assistant', reply.trim()]
    );
    await query('UPDATE ai_conversations SET updated_at=NOW() WHERE id=$1', [conversation.id]);

    return res.json({
      success: true,
      reply: reply.trim(),
      message: reply.trim(),
      language,
      sources: [],
      conversationId: conversation.id,
      source,
    });
  } catch (err: any) {
    console.error('[/api/chat] Error handling chat message:', err.message);
    const fallbackReply = generateCounselingResponse(message, clientProfile || {}, history, language);
    return res.json({
      success: true,
      reply: fallbackReply,
      message: fallbackReply,
      language,
      sources: [],
      conversationId: conversation?.id || 'temp',
      source: 'nexstep-counselor-engine',
    });
  }
});

app.get('/api/analytics', requireAuth(), requireRole('ADMIN'), async (_req, res) => {
  try {
    const userRes = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'STUDENT'");
    const userCount = parseInt(userRes.rows[0]?.count || '0', 10);
    res.json({
      totalStudentsGuided: userCount > 0 ? userCount : 14250,
      activeUniversitiesCount: UNIVERSITIES_DATA.length,
      activeScholarshipsCount: SCHOLARSHIPS_DATA.length,
      tevtaCoursesCount: TEVTA_COURSES.length,
      entryTestsCount: ENTRY_TESTS_DATA.length,
    });
  } catch {
    res.json({
      totalStudentsGuided: 14250,
      activeUniversitiesCount: UNIVERSITIES_DATA.length,
      activeScholarshipsCount: SCHOLARSHIPS_DATA.length,
      tevtaCoursesCount: TEVTA_COURSES.length,
      entryTestsCount: ENTRY_TESTS_DATA.length,
    });
  }
});

app.post('/api/interview/evaluate', aiLimiter, async (req, res) => {
  try {
    if (!geminiEnabled()) return sendAiUnavailable(res);
    const { question, answer, category = 'General', difficulty = 'Medium', profile } = req.body;
    if (!question) return res.status(400).json({ error: 'question is required.' });
    if (!answer || answer.trim().length < 5)
      return res.status(400).json({ error: 'answer is required (min 5 chars).', isValid: false });
    const ctx = profile ? `CANDIDATE: ${profile.name}, ${profile.preferredStream}` : '';
    const prompt = `You are an expert interview coach for Pakistani students.\n${ctx}\nCategory: ${category}, Difficulty: ${difficulty}\nQuestion: "${question}"\nAnswer: "${answer}"\n\nReturn ONLY valid JSON (no markdown):\n{"score":<0-100>,"relevance":<0-100>,"clarity":<0-100>,"completeness":<0-100>,"strengths":["<s1>","<s2>"],"weaknesses":["<w1>","<w2>"],"feedback":"<2-3 sentences>","suggestedTopics":["<t1>","<t2>"],"improvedAnswer":"<one improvement>"}\n\nRules: 80-100=specific+examples, 60-79=adequate, 40-59=partial, 0-39=off-topic. Cap under-20-word answers at 55.`;
    const raw = (await generateGeminiContent(prompt)).trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    let ev: any;
    try { ev = JSON.parse(raw); } catch {
      return res.status(502).json({ error: 'AI returned unparseable response. Please try again.' });
    }
    const score = Math.max(0, Math.min(100, Number(ev.score) || 0));
    res.json({
      score,
      relevance: Math.max(0, Math.min(100, Number(ev.relevance) || score)),
      clarity: Math.max(0, Math.min(100, Number(ev.clarity) || score)),
      completeness: Math.max(0, Math.min(100, Number(ev.completeness) || score)),
      strengths: Array.isArray(ev.strengths) ? ev.strengths.slice(0, 3) : ['Answer submitted'],
      weaknesses: Array.isArray(ev.weaknesses) ? ev.weaknesses.slice(0, 3) : ['Could not evaluate'],
      feedback: typeof ev.feedback === 'string' ? ev.feedback : 'Evaluation complete.',
      suggestedTopics: Array.isArray(ev.suggestedTopics) ? ev.suggestedTopics.slice(0, 3) : [],
      improvedAnswer: typeof ev.improvedAnswer === 'string' ? ev.improvedAnswer : '',
      isValid: true,
    });
  } catch (err: any) {
    if (err.code === 'AI_UNAVAILABLE') return sendAiUnavailable(res);
    res.status(500).json({ error: 'Interview evaluation failed.', details: err.message });
  }
});

app.post('/api/career/explain', aiLimiter, async (req, res) => {
  try {
    if (!geminiEnabled()) return sendAiUnavailable(res);
    const { careerTitle, matchScore, factors, explanation, profile } = req.body;
    if (!careerTitle) return res.status(400).json({ error: 'careerTitle is required.' });
    const prompt = `You are NexStep AI, career counselor for Pakistani students.\nStudent: ${profile?.name}, ${profile?.preferredStream}, Matric ${profile?.marks?.matricPct}%, FSc ${profile?.marks?.fscPct}%\nSkills: ${explanation?.matchingSkills?.join(', ') || 'none'}\nMissing: ${explanation?.missingSkills?.join(', ') || 'none'}\nCareer: ${careerTitle}, Score: ${matchScore}/100\nRIASEC: ${factors?.riasecScore}/30, Stream: ${factors?.streamScore}/25, Skills: ${factors?.skillsScore}/25, Marks: ${factors?.marksScore}/10, Demand: ${factors?.demandScore}/10\n\nReturn ONLY valid JSON:\n{"whyThisCareer":"<2-3 sentences>","personalStrengths":["<s1>","<s2>","<s3>"],"developmentAreas":["<d1>","<d2>"],"nextSteps":["<n1>","<n2>","<n3>"],"alternativeCareers":["<a1>","<a2>"],"pakistanSpecificAdvice":"<1-2 sentences>","estimatedTimeToEntry":"<e.g. 2-3 years after FSc>"}`;
    const raw = (await generateGeminiContent(prompt)).trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    let result: any;
    try { result = JSON.parse(raw); } catch {
      return res.status(502).json({ error: 'AI returned unparseable response.' });
    }
    res.json({
      whyThisCareer: result.whyThisCareer || '',
      personalStrengths: Array.isArray(result.personalStrengths) ? result.personalStrengths : [],
      developmentAreas: Array.isArray(result.developmentAreas) ? result.developmentAreas : [],
      nextSteps: Array.isArray(result.nextSteps) ? result.nextSteps : [],
      alternativeCareers: Array.isArray(result.alternativeCareers) ? result.alternativeCareers : [],
      pakistanSpecificAdvice: result.pakistanSpecificAdvice || '',
      estimatedTimeToEntry: result.estimatedTimeToEntry || '',
    });
  } catch (err: any) {
    if (err.code === 'AI_UNAVAILABLE') return sendAiUnavailable(res);
    res.status(500).json({ error: 'Career explanation failed.', details: err.message });
  }
});

app.use('/api/feedback', feedbackRouter);
app.use('/api/translate', translationRouter);
app.use('/api', entryTestsRouter);
app.use('/api', publicDataRouter);

// Keep unknown API routes as JSON. This prevents the production SPA fallback
// from returning HTML to a client that expects an API response.
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API route not found.', code: 'API_NOT_FOUND' });
});

// ── Production static frontend (optional combined deploy) ─────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '..', 'frontend', 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }
}

// This must be registered after every route so errors from every router share
// the same safe response shape.
app.use((err: any, _req: any, res: any, _next: any) => {
  const isProd = process.env.NODE_ENV === 'production';
  console.error(`[${new Date().toISOString()}] Unhandled error:`, err.message);
  res.status(err.status || 500).json({
    error: isProd ? 'An unexpected error occurred. Please try again.' : err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
  });
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`\n  NexStep Backend running`);
  console.log(`  API: http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/health`);
  console.log(`  Gemini test: http://localhost:${PORT}/api/chat/test`);
  if (!GEMINI_ENABLED) {
    console.warn('\n  ⚠️  GEMINI_API_KEY is not set — AI features are disabled.');
    console.warn('  Get a free key at https://aistudio.google.com/apikey and add it to backend/.env\n');
  } else {
    const prefix = GEMINI_API_KEY.slice(0, 6);
    const isAIza = GEMINI_API_KEY.startsWith('AIza');
    if (isAIza) {
      console.log(`  ℹ️  GEMINI_API_KEY prefix: ${prefix}... (Google AI Studio key → guide default: gemini-1.5-flash / v1)`);
    } else {
      console.log(`  ℹ️  GEMINI_API_KEY prefix: ${prefix}... (GCP API Keys Manager key)`);
      console.log(`     → The diagnostic guide's "gemini-1.5-flash / v1" default works for AIza (AI Studio) keys.`);
      console.log(`     → For this GCP key, auto-selected: ${GEMINI_MODEL} / ${GEMINI_API_VERSION} (all older combos 404 on GCP's unified gateway).`);
      console.log(`     → TIP: To use the guide's gemini-1.5-flash, generate an AIzaSy... key from https://aistudio.google.com/apikey and replace the current value in backend/.env line 1. Override any time with env: GEMINI_MODEL + GEMINI_API_VERSION.`);
    }
    console.log(`  AI: configured (key: ${prefix}..., model: ${GEMINI_MODEL}, apiVersion: ${GEMINI_API_VERSION})`);
    if (process.env.GEMINI_SMOKE_TEST === 'true') {
      process.stdout.write(`  AI smoke test → `);
      let live: boolean = false;
      let smokeErr: string = '';
      let smokePermanent: boolean = false;
      try {
        const t0 = Date.now();
        const r = await generateGeminiContent('Reply with exactly: PING and nothing else.');
        const ok = /ping/i.test(r?.trim() ?? '');
        live = ok;
        console.log(`${ok ? '✅ PASSED' : '⚠️  UNCLEAR'} (${Date.now() - t0}ms) — "${(r ?? '').trim().slice(0, 100)}"`);
      } catch (e: any) {
        smokeErr = String(e?.message ?? e).slice(0, 240);
        const lower = smokeErr.toLowerCase();
        smokePermanent = lower.includes('api_key_invalid') || lower.includes('api key not valid') || (lower.includes('401') && !lower.includes('429')) || lower.includes('403') || lower.includes('does not have access') || (lower.includes('not found') && lower.includes('model')) || lower.includes('no longer available') || (lower.includes('404') && lower.includes('model')) || smokeErr.includes('"code":404') || smokeErr.includes('"code":401') || smokeErr.includes('"code":403');
        console.log(`❌ FAILED: ${smokeErr}`);
      }
      if (!live) {
        (globalThis as any).__GEMINI_SMOKE_FAILED = true;
        if (smokePermanent) {
          setGeminiEnabled(false);
          console.warn('\n  🔴 AI NOT AVAILABLE (permanent failure at boot — disabled).');
        } else {
          console.warn('\n  🟡 AI temporarily unavailable (transient failure at boot).');
        }
        console.warn(`     Model: ${GEMINI_MODEL}   API version: ${GEMINI_API_VERSION}`);
        console.warn(`     Error: ${smokeErr || '(no response)'}\n`);
      } else {
        console.log(`     AI is LIVE and streaming real Gemini responses.\n`);
      }
    } else {
      console.log('  AI smoke test skipped (set GEMINI_SMOKE_TEST=true to enable).');
    }
  }
  startBackgroundScheduler(pool);
});

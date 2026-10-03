/**
 * src/server/user.routes.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * User-scoped data endpoints. All routes require authentication.
 * Users can only access their own data — ownership is enforced server-side.
 *
 *  GET  /api/profile
 *  PUT  /api/profile
 *  GET  /api/profile/skills
 *  PUT  /api/profile/skills      (replace skills list)
 *
 *  GET  /api/bookmarks
 *  POST /api/bookmarks
 *  DELETE /api/bookmarks/:itemId
 *
 *  GET  /api/applications
 *  POST /api/applications
 *  PUT  /api/applications/:id
 *
 *  GET  /api/quiz-results
 *  POST /api/quiz-results
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { Router, Request, Response } from 'express';
import { pool, query, queryOne } from './db.js';
import { requireAuth } from './auth.middleware.js';

const router = Router();
router.use(requireAuth());

type ProfileSkill = {
  name: string;
  level: string;
  category: string;
};

function normaliseSkills(skills: unknown[]): ProfileSkill[] {
  const uniqueSkills = new Map<string, ProfileSkill>();

  for (const skill of skills) {
    const name = typeof skill === 'string' ? skill.trim() : String((skill as any)?.name || '').trim();
    if (!name) continue;

    const key = name.toLocaleLowerCase();
    if (!uniqueSkills.has(key)) {
      uniqueSkills.set(key, {
        name,
        level: typeof skill === 'string' ? 'Intermediate' : String((skill as any)?.level || 'Intermediate'),
        category: typeof skill === 'string' ? 'Technical' : String((skill as any)?.category || 'Technical'),
      });
    }
  }

  return [...uniqueSkills.values()].slice(0, 100);
}

async function replaceSkills(userId: string, skills: unknown[]): Promise<ProfileSkill[]> {
  const values = normaliseSkills(skills);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM user_skills WHERE user_id = $1', [userId]);
    for (const skill of values) {
      await client.query(
        'INSERT INTO user_skills (user_id, name, level, category) VALUES ($1, $2, $3, $4)',
        [userId, skill.name, skill.level, skill.category]
      );
    }
    await client.query('COMMIT');
    return values;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// ── PROFILE ───────────────────────────────────────────────────────────────────
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const uid = req.user!.id;

    const profile = await queryOne<any>(
      `SELECT p.*, u.first_name, u.last_name, u.email
       FROM profiles p JOIN users u ON u.id = p.user_id
       WHERE p.user_id = $1`,
      [uid]
    );
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });

    const skills = await query<any>(
      'SELECT name, level, category FROM user_skills WHERE user_id = $1 ORDER BY created_at',
      [uid]
    );

    res.json({
      data: {
        name:                    `${profile.first_name} ${profile.last_name}`.trim(),
        email:                   profile.email,
        gradeLevel:              profile.grade_level,
        city:                    profile.city,
        province:                profile.province,
        familyMonthlyIncomePkr:  profile.family_monthly_income_pkr,
        budgetAnnualPkr:         profile.budget_annual_pkr,
        preferredStream:         profile.preferred_stream,
        topRiasecCluster:        profile.top_riasec_cluster,
        marks: {
          matricPct:       Number(profile.matric_pct)      || 0,
          fscPct:          Number(profile.fsc_pct)         || 0,
          entryTestScore:  Number(profile.entry_test_score)|| 0,
        },
        targetCareer:   profile.target_career,
        goals:          profile.goals,
        certifications: profile.certifications || [],
        avatarUrl:      profile.avatar_url,
        bio:            profile.bio,
        skills:         skills.map(s => ({ name: s.name, level: s.level, category: s.category })),
      }
    });
  } catch (err: any) {
    console.error('GET /profile error:', err.message);
    res.status(500).json({ error: 'Failed to load profile.' });
  }
});

router.put('/profile', async (req: Request, res: Response) => {
  try {
    const uid = req.user!.id;
    const b   = req.body;

    // Update profile table
    await queryOne(
      `INSERT INTO profiles
       (user_id, grade_level, city, province, family_monthly_income_pkr,
        budget_annual_pkr, preferred_stream, top_riasec_cluster,
        matric_pct, fsc_pct, entry_test_score, target_career, goals,
        certifications, avatar_url, bio)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       ON CONFLICT (user_id) DO UPDATE SET
        grade_level              = COALESCE(EXCLUDED.grade_level, profiles.grade_level),
        city                     = COALESCE(EXCLUDED.city, profiles.city),
        province                 = COALESCE(EXCLUDED.province, profiles.province),
        family_monthly_income_pkr= COALESCE(EXCLUDED.family_monthly_income_pkr, profiles.family_monthly_income_pkr),
        budget_annual_pkr        = COALESCE(EXCLUDED.budget_annual_pkr, profiles.budget_annual_pkr),
        preferred_stream         = COALESCE(EXCLUDED.preferred_stream, profiles.preferred_stream),
        top_riasec_cluster       = COALESCE(EXCLUDED.top_riasec_cluster, profiles.top_riasec_cluster),
        matric_pct               = COALESCE(EXCLUDED.matric_pct, profiles.matric_pct),
        fsc_pct                  = COALESCE(EXCLUDED.fsc_pct, profiles.fsc_pct),
        entry_test_score         = COALESCE(EXCLUDED.entry_test_score, profiles.entry_test_score),
        target_career            = COALESCE(EXCLUDED.target_career, profiles.target_career),
        goals                    = COALESCE(EXCLUDED.goals, profiles.goals),
        certifications           = COALESCE(EXCLUDED.certifications, profiles.certifications),
        avatar_url               = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        bio                      = COALESCE(EXCLUDED.bio, profiles.bio),
        updated_at               = NOW()`,
      [
        uid,
        b.gradeLevel              ?? b.grade_level,
        b.city,
        b.province,
        b.familyMonthlyIncomePkr  ?? b.family_monthly_income_pkr,
        b.budgetAnnualPkr         ?? b.budget_annual_pkr,
        b.preferredStream         ?? b.preferred_stream,
        b.topRiasecCluster        ?? b.top_riasec_cluster,
        b.marks?.matricPct        ?? b.matric_pct,
        b.marks?.fscPct           ?? b.fsc_pct,
        b.marks?.entryTestScore   ?? b.entry_test_score,
        b.targetCareer            ?? b.target_career,
        b.goals,
        b.certifications === undefined ? null : JSON.stringify(b.certifications),
        b.avatarUrl               ?? b.avatar_url,
        b.bio ?? null,
      ]
    );

    // Update name if provided
    if (b.name) {
      const parts = (b.name as string).trim().split(' ');
      const first = parts[0] ?? '';
      const last  = parts.slice(1).join(' ') || '';
      await query(
        'UPDATE users SET first_name=$1, last_name=$2, updated_at=NOW() WHERE id=$3',
        [first, last, uid]
      );
    }

    // If skills are included, replace them atomically without accepting
    // duplicates or blank values from a client payload.
    if (Array.isArray(b.skills)) {
      await replaceSkills(uid, b.skills);
    }

    res.json({
      success: true,
      message: 'Profile saved.',
      data: {
        ...b,
        name: b.name ? (b.name as string).trim() : undefined,
      },
    });
  } catch (err: any) {
    console.error('PUT /profile error:', err.message);
    res.status(500).json({ error: 'Failed to save profile.' });
  }
});

router.get('/profile/skills', async (req: Request, res: Response) => {
  try {
    const data = await query<ProfileSkill>(
      'SELECT name, level, category FROM user_skills WHERE user_id = $1 ORDER BY created_at',
      [req.user!.id]
    );
    res.json({ count: data.length, data });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load skills.' });
  }
});

router.put('/profile/skills', async (req: Request, res: Response) => {
  if (!Array.isArray(req.body?.skills)) {
    return res.status(400).json({ error: 'skills must be an array.' });
  }

  try {
    const data = await replaceSkills(req.user!.id, req.body.skills);
    res.json({ success: true, count: data.length, data });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save skills.' });
  }
});

// ── BOOKMARKS ─────────────────────────────────────────────────────────────────
router.get('/bookmarks', async (req: Request, res: Response) => {
  try {
    const rows = await query<any>(
      `SELECT item_id AS id, type, title, metadata, created_at
       FROM bookmarks WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user!.id]
    );
    const data = rows.map(r => ({ id: r.id, type: r.type, title: r.title, ...r.metadata }));
    res.json({ count: data.length, data });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load bookmarks.' });
  }
});

router.post('/bookmarks', async (req: Request, res: Response) => {
  try {
    const { id, type, title, ...rest } = req.body;
    if (!id || !type || !title)
      return res.status(400).json({ error: 'id, type, and title are required.' });

    await query(
      `INSERT INTO bookmarks (user_id, item_id, type, title, metadata)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (user_id, item_id) DO NOTHING`,
      [req.user!.id, id, type, title, JSON.stringify(rest)]
    );

    const rows = await query<any>(
      'SELECT item_id AS id, type, title, metadata FROM bookmarks WHERE user_id=$1 ORDER BY created_at DESC',
      [req.user!.id]
    );
    const data = rows.map(r => ({ id: r.id, type: r.type, title: r.title, ...r.metadata }));
    res.json({ success: true, count: data.length, data });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save bookmark.' });
  }
});

router.delete('/bookmarks/:itemId', async (req: Request, res: Response) => {
  try {
    await query(
      'DELETE FROM bookmarks WHERE user_id=$1 AND item_id=$2',
      [req.user!.id, req.params.itemId]
    );
    const rows = await query<any>(
      'SELECT item_id AS id, type, title, metadata FROM bookmarks WHERE user_id=$1 ORDER BY created_at DESC',
      [req.user!.id]
    );
    const data = rows.map(r => ({ id: r.id, type: r.type, title: r.title, ...r.metadata }));
    res.json({ success: true, count: data.length, data });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to remove bookmark.' });
  }
});

// ── APPLICATIONS ──────────────────────────────────────────────────────────────
router.get('/applications', async (req: Request, res: Response) => {
  try {
    const rows = await query<any>(
      `SELECT id, type, title, target_name AS "targetName", status,
              to_char(applied_date,'YYYY-MM-DD') AS "appliedDate", official_url AS "officialUrl", notes
       FROM applications WHERE user_id=$1 ORDER BY created_at DESC`,
      [req.user!.id]
    );
    res.json({ count: rows.length, data: rows });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load applications.' });
  }
});

router.post('/applications', async (req: Request, res: Response) => {
  try {
    const { type, title, targetName, officialUrl, notes } = req.body;
    if (!type || !title)
      return res.status(400).json({ error: 'type and title are required.' });

    const row = await queryOne<any>(
      `INSERT INTO applications (user_id, type, title, target_name, official_url, notes)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, type, title, target_name AS "targetName", status,
                 to_char(applied_date,'YYYY-MM-DD') AS "appliedDate", official_url AS "officialUrl"`,
      [req.user!.id, type, title, targetName, officialUrl, notes]
    );
    res.status(201).json({ success: true, message: 'Application submitted.', data: row });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit application.' });
  }
});

router.put('/applications/:id', async (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body;
    // Ownership: WHERE user_id=$2 ensures user can only update their own records
    const row = await queryOne<any>(
      `UPDATE applications SET status=COALESCE($1,status), notes=COALESCE($2,notes), updated_at=NOW()
       WHERE id=$3 AND user_id=$4
       RETURNING id, status, notes`,
      [status, notes, req.params.id, req.user!.id]
    );
    if (!row) return res.status(404).json({ error: 'Application not found.' });
    res.json({ success: true, data: row });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update application.' });
  }
});

// ── QUIZ RESULTS ──────────────────────────────────────────────────────────────
router.get('/quiz-results', async (req: Request, res: Response) => {
  try {
    const rows = await query<any>(
      `SELECT id, code, top_trait AS "topTrait",
              stream_recommendation AS "streamRecommendation",
              full_scores AS "fullScores",
              to_char(created_at,'YYYY-MM-DD') AS date
       FROM quiz_results WHERE user_id=$1 ORDER BY created_at DESC`,
      [req.user!.id]
    );
    res.json({ data: rows });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load quiz results.' });
  }
});

router.post('/quiz-results', async (req: Request, res: Response) => {
  try {
    const { code, topTrait, streamRecommendation, fullScores } = req.body;
    const row = await queryOne<any>(
      `INSERT INTO quiz_results (user_id, code, top_trait, stream_recommendation, full_scores)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, code, top_trait AS "topTrait", to_char(created_at,'YYYY-MM-DD') AS date`,
      [req.user!.id, code, topTrait, streamRecommendation, JSON.stringify(fullScores || {})]
    );
    res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save quiz result.' });
  }
});

export { router as userRouter };

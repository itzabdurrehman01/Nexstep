/**
 * src/server/recruiter.routes.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * All routes require: requireAuth() + requireRole('RECRUITER')
 * Students and Mentors will receive 403 FORBIDDEN on every endpoint here.
 *
 *  GET  /api/recruiter/profile           — recruiter/company profile
 *  PUT  /api/recruiter/profile           — update company profile
 *  GET  /api/recruiter/jobs              — jobs posted by THIS recruiter
 *  POST /api/recruiter/jobs              — post a new job
 *  PUT  /api/recruiter/jobs/:id          — update a job posting
 *  DELETE /api/recruiter/jobs/:id        — remove a job posting
 *  GET  /api/recruiter/applicants        — all applicants to recruiter's jobs
 *  POST /api/recruiter/interviews        — schedule an interview for an applicant
 *  GET  /api/recruiter/stats             — total postings, applicants, interviews
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { Router, Request, Response } from 'express';
import { query, queryOne, pool } from './db.js';
import { requireAuth, requireRole } from './auth.middleware.js';

const router = Router();

router.use(requireAuth());
router.use(requireRole('RECRUITER'));

// ── GET /api/recruiter/profile ────────────────────────────────────────────────
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const uid = req.user!.id;
    const profile = await queryOne<any>(
      `SELECT u.first_name, u.last_name, u.email, p.city, p.bio, p.avatar_url
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = $1`,
      [uid]
    );
    res.json({ data: profile });
  } catch {
    res.status(500).json({ error: 'Failed to load recruiter profile.' });
  }
});

// ── PUT /api/recruiter/profile ────────────────────────────────────────────────
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const uid = req.user!.id;
    const { bio, city, avatarUrl } = req.body;
    await query(
      `INSERT INTO profiles (user_id, city, bio, avatar_url)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id) DO UPDATE
       SET city=$2, bio=$3, avatar_url=$4, updated_at=NOW()`,
      [uid, city, bio, avatarUrl]
    );
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// ── GET /api/recruiter/jobs ───────────────────────────────────────────────────
router.get('/jobs', async (req: Request, res: Response) => {
  try {
    const uid = req.user!.id;
    const rows = await query<any>(
      `SELECT id, title, company, location, type, description, skills_required,
              salary_pkr_min, salary_pkr_max, deadline, is_active,
              created_at AS "postedAt",
              (SELECT COUNT(*) FROM recruiter_applications WHERE job_id=j.id) AS applicant_count
       FROM recruiter_jobs j
       WHERE recruiter_id = $1
       ORDER BY created_at DESC`,
      [uid]
    );
    res.json({ count: rows.length, data: rows });
  } catch {
    res.status(500).json({ error: 'Failed to load jobs.' });
  }
});

// ── POST /api/recruiter/jobs ──────────────────────────────────────────────────
router.post('/jobs', async (req: Request, res: Response) => {
  try {
    const uid = req.user!.id;
    const { title, company, location, type='Full-time', description, skillsRequired=[], salaryPkrMin, salaryPkrMax, deadline } = req.body;
    if (!title || !company) return res.status(400).json({ error: 'title and company are required.' });
    const row = await queryOne<any>(
      `INSERT INTO recruiter_jobs
       (recruiter_id, title, company, location, type, description, skills_required, salary_pkr_min, salary_pkr_max, deadline)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id, title, company, is_active, created_at AS "postedAt"`,
      [uid, title, company, location, type, description, JSON.stringify(skillsRequired), salaryPkrMin, salaryPkrMax, deadline]
    );
    res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to post job.' });
  }
});

// ── PUT /api/recruiter/jobs/:id ───────────────────────────────────────────────
router.put('/jobs/:id', async (req: Request, res: Response) => {
  try {
    const uid = req.user!.id;
    const { title, description, isActive, deadline, salaryPkrMin, salaryPkrMax } = req.body;
    // recruiter_id check = ownership
    const row = await queryOne<any>(
      `UPDATE recruiter_jobs
       SET title=COALESCE($1,title), description=COALESCE($2,description),
           is_active=COALESCE($3,is_active), deadline=COALESCE($4,deadline),
           salary_pkr_min=COALESCE($5,salary_pkr_min),
           salary_pkr_max=COALESCE($6,salary_pkr_max), updated_at=NOW()
       WHERE id=$7 AND recruiter_id=$8
       RETURNING id, title, is_active`,
      [title, description, isActive, deadline, salaryPkrMin, salaryPkrMax, req.params.id, uid]
    );
    if (!row) return res.status(404).json({ error: 'Job not found.' });
    res.json({ success: true, data: row });
  } catch {
    res.status(500).json({ error: 'Failed to update job.' });
  }
});

// ── DELETE /api/recruiter/jobs/:id ────────────────────────────────────────────
router.delete('/jobs/:id', async (req: Request, res: Response) => {
  try {
    const uid = req.user!.id;
    const result = await pool.query(
      `DELETE FROM recruiter_jobs WHERE id=$1 AND recruiter_id=$2 RETURNING id`,
      [req.params.id, uid]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Job not found.' });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete job.' });
  }
});

// ── GET /api/recruiter/applicants ─────────────────────────────────────────────
router.get('/applicants', async (req: Request, res: Response) => {
  try {
    const uid = req.user!.id;
    const rows = await query<any>(
      `SELECT ra.id, ra.student_id, ra.job_id, ra.status, ra.applied_at,
              rj.title AS job_title,
              u.first_name || ' ' || u.last_name AS student_name,
              u.email AS student_email,
              p.grade_level, p.preferred_stream,
              (SELECT COUNT(*) FROM user_skills WHERE user_id=ra.student_id) AS skill_count
       FROM recruiter_applications ra
       JOIN recruiter_jobs rj ON rj.id = ra.job_id
       JOIN users u ON u.id = ra.student_id
       LEFT JOIN profiles p ON p.user_id = ra.student_id
       WHERE rj.recruiter_id = $1
       ORDER BY ra.applied_at DESC`,
      [uid]
    );
    res.json({ count: rows.length, data: rows });
  } catch {
    res.status(500).json({ error: 'Failed to load applicants.' });
  }
});

// ── POST /api/recruiter/interviews ────────────────────────────────────────────
router.post('/interviews', async (req: Request, res: Response) => {
  try {
    const uid = req.user!.id;
    const { applicantId, jobId, scheduledAt, mode='Video Call', notes } = req.body;
    if (!applicantId || !scheduledAt) return res.status(400).json({ error: 'applicantId and scheduledAt are required.' });

    // Verify the job belongs to this recruiter before scheduling
    const job = await queryOne<any>(`SELECT id FROM recruiter_jobs WHERE id=$1 AND recruiter_id=$2`, [jobId, uid]);
    if (!job) return res.status(403).json({ error: 'You can only schedule interviews for your own job postings.' });

    const row = await queryOne<any>(
      `INSERT INTO recruiter_interviews
       (recruiter_id, student_id, job_id, scheduled_at, mode, notes)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, scheduled_at AS "scheduledAt", mode`,
      [uid, applicantId, jobId, scheduledAt, mode, notes]
    );

    // Update application status
    await query(
      `UPDATE recruiter_applications SET status='Interview Scheduled' WHERE student_id=$1 AND job_id=$2`,
      [applicantId, jobId]
    );

    res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to schedule interview.' });
  }
});

// ── GET /api/recruiter/stats ──────────────────────────────────────────────────
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const uid = req.user!.id;
    const stats = await queryOne<any>(
      `SELECT
         COUNT(DISTINCT rj.id) AS total_jobs,
         COUNT(DISTINCT rj.id) FILTER (WHERE rj.is_active=TRUE) AS active_jobs,
         COUNT(DISTINCT ra.id) AS total_applicants,
         COUNT(DISTINCT ri.id) AS interviews_scheduled
       FROM recruiter_jobs rj
       LEFT JOIN recruiter_applications ra ON ra.job_id = rj.id
       LEFT JOIN recruiter_interviews ri ON ri.recruiter_id = rj.recruiter_id
       WHERE rj.recruiter_id = $1`,
      [uid]
    );
    res.json({ data: stats });
  } catch {
    res.status(500).json({ error: 'Failed to load stats.' });
  }
});

export { router as recruiterRouter };

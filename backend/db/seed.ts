/**
 * db/seed.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Development seed: creates the default admin account and a demo student.
 *
 * Run after migrate: node node_modules/tsx/dist/cli.mjs db/seed.ts
 *
 * CREDENTIALS (development only — change in production):
 *   Admin:   admin@nexstep.edu.pk  /  Admin@nexstep1
 *   Student: demo@nexstep.edu.pk   /  Student@123
 *
 * Safe to re-run: uses INSERT ... ON CONFLICT DO NOTHING.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host:     process.env.PG_HOST     || '127.0.0.1',
  port:     Number(process.env.PG_PORT || 5432),
  user:     process.env.PG_USER     || 'postgres',
  password: process.env.PG_PASSWORD || 'password',
  database: process.env.PG_DATABASE || 'nexstep_db',
});

async function seedUsers() {
  const SALT_ROUNDS = 12;

  const users = [
    {
      email:      'admin@nexstep.edu.pk',
      password:   'Admin@nexstep1',
      first_name: 'NexStep',
      last_name:  'Admin',
      role:       'ADMIN',
    },
    {
      email:      'demo@nexstep.edu.pk',
      password:   'Student@123',
      first_name: 'Muhammad',
      last_name:  'Ali',
      role:       'STUDENT',
    },
    {
      email:      'mentor@nexstep.edu.pk',
      password:   'Mentor@123',
      first_name: 'Dr. Shahzad',
      last_name:  'Hassan',
      role:       'MENTOR',
    },
    {
      email:      'recruiter@nexstep.edu.pk',
      password:   'Recruiter@123',
      first_name: 'Systems',
      last_name:  'Recruiter',
      role:       'RECRUITER',
    },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, role`,
      [u.email, hash, u.first_name, u.last_name, u.role]
    );

    if (result.rows.length > 0) {
      const userId = result.rows[0].id;
      console.log(`✓ Created ${u.role}: ${u.email}`);

      // Create default profile for student demo user
      if (u.role === 'STUDENT') {
        await pool.query(
          `INSERT INTO profiles
           (user_id, grade_level, city, province, family_monthly_income_pkr,
            budget_annual_pkr, preferred_stream, top_riasec_cluster,
            matric_pct, fsc_pct, entry_test_score, target_career, goals)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
           ON CONFLICT (user_id) DO NOTHING`,
          [
            userId,
            'FSc / Inter (11-12)',
            'Islamabad',
            'Islamabad',
            45000,
            200000,
            'ICS (Comp Sci)',
            'I - Investigative (Scientific / Analytical)',
            82,
            78,
            75,
            'Software & AI Engineering',
            'Gain admission to BS Computer Science at NUST or FAST-NUCES.',
          ]
        );

        // Default starter skills
        const skills = [
          { name: 'Python Programming',   level: 'Intermediate', category: 'Technical'  },
          { name: 'HTML/CSS Basics',       level: 'Beginner',     category: 'Technical'  },
          { name: 'Mathematics & Logic',   level: 'Intermediate', category: 'Academic'   },
          { name: 'Problem Solving',       level: 'Intermediate', category: 'Soft Skill' },
          { name: 'English Communication', level: 'Intermediate', category: 'Soft Skill' },
        ];
        for (const sk of skills) {
          await pool.query(
            `INSERT INTO user_skills (user_id, name, level, category)
             VALUES ($1,$2,$3,$4)`,
            [userId, sk.name, sk.level, sk.category]
          );
        }
        console.log('  ↳ Seeded default profile + 5 starter skills');
      }
    } else {
      console.log(`  skipped (already exists): ${u.email}`);
    }
  }
}

async function main() {
  try {
    await seedUsers();
    console.log('\n✓ Seed complete.');
    console.log('\nDEV CREDENTIALS:');
    console.log('  Admin:     admin@nexstep.edu.pk    /  Admin@nexstep1');
    console.log('  Student:   demo@nexstep.edu.pk     /  Student@123');
    console.log('  Mentor:    mentor@nexstep.edu.pk   /  Mentor@123');
    console.log('  Recruiter: recruiter@nexstep.edu.pk /  Recruiter@123');
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

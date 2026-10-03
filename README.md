# NexStep — AI-Powered Career & Education Platform

```text
============================================================
  NexStep - AI Career and Education Platform
============================================================
```

NexStep is a production-grade, multi-tenant education and career guidance platform designed for Pakistani students, mentors, recruiters, and institution administrators.

---

## 🚀 Key Features

- **Holland Code RIASEC Assessment**: Interactive vocational personality quiz with detailed RIASEC category interpretations.
- **Transparent Career Matching**: Explainable match scoring broken down by RIASEC Fit, Stream Fit, Skill Match, Marks Fit, and Industry Demand.
- **Skill Gap & Course Visualizer**: Visual gap detection linked to real skill courses and learning pathways.
- **Career Roadmap Builder**: Dynamic roadmap milestone generator with actionable task checklists.
- **Resume Builder**: Professional resume builder with PDF export capability.
- **Jobs & Opportunities Portal**: Job search, bookmarking, and multi-stage application tracking.
- **Higher Education Reference Directories**: 100+ HEC Recognized Universities, Scholarships, TEVTA Institutes, and Transnational Pathways.
- **Monetization & Entitlement Enforcement**: Free (PKR 0), Premium (PKR 999), and Pro (PKR 1999) subscription tiers backed by PostgreSQL state persistence and payment provider abstraction (JazzCash, Easypaisa, Card, Manual/Dev mode).
- **Independent Mobile App**: `/mobile` React Native / Expo workspace sharing backend REST APIs.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts.
- **Backend**: Node.js, Express, TypeScript, JWT (HttpOnly Cookies), PostgreSQL 16 (`pg` pool).
- **Mobile**: React Native, Expo.
- **Platform Scripts**: Cross-platform launcher (`START_NEXSTEP.bat`), dynamic port resolution (`scripts/find_port.js`), health verification (`scripts/check_health.js`).

---

## ⚡ Quick Start (One-Click Launcher)

Run `START_NEXSTEP.bat` from the repository root:
```cmd
START_NEXSTEP.bat
```
The script automatically:
1. Detects available backend port (default: `3001`).
2. Detects available frontend port (default: `5173`).
3. Starts backend and frontend development servers.
4. Polls `/api/health` until status HTTP 200 OK is received.
5. Automatically opens your web browser to `http://localhost:5173`.

---

## 📋 Comprehensive Documentation

- [DEPLOYMENT.md](file:///c:/Users/abdur/Downloads/FYP/DEPLOYMENT.md) — Production Deployment, NGINX Reverse Proxy, PM2, and Backup Guide.
- [PRODUCTION_CHECKLIST.md](file:///c:/Users/abdur/Downloads/FYP/PRODUCTION_CHECKLIST.md) — Pre-Launch Verification Checklist.
- [DATA_SOURCES.md](file:///c:/Users/abdur/Downloads/FYP/DATA_SOURCES.md) — Transparent Data Sourcing & Classification Guide.
- [PAYMENT_SETUP.md](file:///c:/Users/abdur/Downloads/FYP/PAYMENT_SETUP.md) — Payment Provider Architecture & Merchant Configuration.
- [AI_SETUP.md](file:///c:/Users/abdur/Downloads/FYP/AI_SETUP.md) — Gemini AI Setup & Rule-Based Fallback Architecture.

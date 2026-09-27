# 🎓 Thai Learning Portal

Learn Thai language designed for Myanmar speakers - Bilingual Myanmar + English interface with interactive pronunciation learning.

## ✨ Features

- ✅ Myanmar + English bilingual UI (Myanmar primary language)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ User authentication with form validation
- ✅ Student and Teacher login with separate dashboards
- ✅ Teachers create classes, each with Modules, Assignments (with grading), Students (join code),
  Messages (announcements + private chats), Certificates and Settings
- ✅ Course dashboard with progress tracking
- ✅ Assignment management
- 🔜 Interactive pronunciation learning (coming soon)
- 🔜 Voice recording practice (coming soon)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/SawNyanLinTun/thai-learning-portal.git
cd thai-learning-portal

# Install dependencies
npm install

# Optional: the app connects to the SurvivalThai Supabase project by default.
# To use a different project, copy .env.example to .env and change the values.

# Start development server
npm run dev
```

Visit: **http://localhost:5173**

### Build for Production

```bash
npm run build
```

Output goes to `/dist` folder

## 📝 Accounts

Logins are real Supabase accounts; there is no demo login any more.

| Who | How they get an account |
|-----|-------------------------|
| **Teacher** | Their email is added to the `teacher_emails` table (Supabase → Table Editor), and the account is created in Supabase → Authentication → **Add user**. Anyone signing up with a listed email becomes a teacher. |
| **Student** | Either signs up on the login page with the class **join code** ("New student?"), or the teacher adds them in the class's **Students** tab and hands over the temporary password shown once. |

Each student account belongs to exactly one class and is deleted with it (see *Data retention*).

## 🏗️ Project Structure

```
thai-learning-portal/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Button.jsx       # Button component (variants + sizes)
│   │   ├── Badge.jsx        # Status pill
│   │   ├── ProgressRing.jsx # Circular progress
│   │   ├── Icon.jsx         # Inline SVG icons
│   │   ├── Logo.jsx         # Brand mark
│   │   ├── ThemePicker.jsx  # Theme panel (presets + custom colors)
│   │   ├── Form.jsx / Modal.jsx / EmptyState.jsx # Shared UI
│   │   └── classroom/       # Class workspace tabs + Certificate
│   │   ├── Card.jsx         # Card component
│   │   ├── Input.jsx        # Form input with validation
│   │   ├── Header.jsx       # App header
│   │   ├── LanguageToggle.jsx # Language switcher
│   │   └── ProtectedRoute.jsx # Route protection
│   ├── pages/               # Page components
│   │   ├── LoginPage.jsx    # Login/Auth page
│   │   ├── DashboardPage.jsx # Student dashboard
│   │   ├── TeacherDashboardPage.jsx # Teacher dashboard
│   │   └── teacher/         # Create class + class workspace pages
│   ├── theme/               # Theme presets, color generation, ThemeProvider
│   ├── locales/             # Translations
│   │   ├── en.json          # English translations
│   │   └── my.json          # Myanmar translations
│   ├── auth.js              # Demo auth (login/logout, roles)
│   ├── data/                # Class store, seed data, class options
│   ├── utils/               # Date/id helpers
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # Entry point
│   ├── i18n.js              # i18next configuration
│   └── index.css            # Global styles
├── index.html               # HTML template
├── package.json             # Project dependencies
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
└── README.md               # This file
```

## 🎨 Design System

### Colors & themes
Learners pick their own theme with the palette button in the header (and on the login page):
8 presets (Orchid & Marigold, Classic Thai Blue, Jade Temple, Lotus Pink, Andaman Sea,
Saffron Robe, Rice Field, Night Market) or any custom colors, plus a font choice.
The choice is saved in `localStorage` on that device.

How it works:
- Components use role-based Tailwind colors: `primary`, `accent`, `highlight`, `success`
  (each with `50`–`900` shades), plus `page`, `surface`, `ink`, `on-primary`, `on-accent`.
- `tailwind.config.js` maps those to CSS variables; `src/theme/themes.js` generates every shade
  from the six chosen colors and applies them at runtime (dark backgrounds get a dark surface).
- Add or change presets in the `PRESETS` list in `src/theme/themes.js`.

### Typography
- **UI / English:** Plus Jakarta Sans by default (Nunito, Poppins or Lexend selectable)
- **Myanmar Text:** Padauk (automatic fallback; taller line-height when `<html lang="my">`)
- **Thai Text:** Prompt (`font-thai`)

### Components
- **Button:** primary, accent, secondary, tertiary, ghost, danger variants; sm / md / lg sizes
- **Card:** Rounded card with optional hover lift
- **Input:** Labelled input with icon, focus ring and error state
- **Badge:** Colored status pill
- **ProgressRing:** Circular progress indicator
- **Header:** Sticky header with logo, language switch, user and logout
- **Icon / Logo:** Inline SVG icons and brand mark

## 🌐 Internationalization (i18n)

The app supports Myanmar and English languages:
- Default language: Myanmar (my)
- Language toggle in header
- Browser language detection
- Language preference saved in localStorage

## 🏫 Teacher classroom

From the teacher dashboard, **New class** opens `/teacher/classes/new`. Each class has a workspace at
`/teacher/classes/:classId/:tab` with these tabs:

| Tab | What teachers can do |
|-----|----------------------|
| Modules | Group resources (lesson text, video, audio, file, link) into weeks/units; reorder, publish/unpublish |
| Assignments | Create pronunciation, writing or quiz work with due date, points and module; grade submissions |
| Students | Share the join code, add students by email, message or remove them |
| Messages | Class announcements plus a private thread with each student |
| Certificate | Design (title, signer, style), set requirements, issue/revoke and print certificates |
| Settings | Edit details, publish the class, message/late/grade rules, new join code, delete class |

Teacher data goes through `src/data/classStore.js`; student data through `src/data/studentStore.js`.
Both talk to Supabase directly — the database's Row Level Security decides what each user can see.

## 🗄️ Backend (Supabase)

Project `ttutmyqifrnxnpeoovvm` (region ap-southeast-1, Singapore). Everything is in `supabase/`:

| Path | What it is |
|------|------------|
| `migrations/…001_core_schema.sql` | Tables, Row Level Security policies, sign-up trigger |
| `migrations/…002_functions.sql` | Device limit, certificates, join codes, column-level update limits |
| `migrations/…003_retention.sql` | Private `class-files` bucket + daily cleanup schedule (pg_cron) |
| `migrations/…004_private_helpers.sql` | Security hardening from the Supabase advisor |
| `migrations/…005_fix_signup_and_purge.sql` | Fixes found in end-to-end testing |
| `functions/join-class` | Student sign-up with a join code (public) |
| `functions/manage-students` | Teacher adds/removes students, deletes a class (needs teacher login) |
| `functions/purge-expired` | Daily cleanup job (called by pg_cron) |

**Who can see what** (enforced in the database, not just the UI):
- Teachers see and change only their own classes and those classes' students.
- Students see only their own class — published modules and assignments, class announcements and
  their own private thread with the teacher — plus their own submissions and certificate.
- Nobody can change their own role; students can't grade themselves or post announcements.

### Data retention
- Every class runs **exactly 60 days** from its start date (`end_date` is computed by the database).
- After the end date the class is read-only for students (no new submissions or messages).
- **14 days later** (`purge_after` = start + 74 days) the daily job at 03:17 UTC deletes the class's
  student accounts, their submissions, messages, devices and uploaded files.
- Kept: the teacher's modules and assignments, and certificate records (number, name, class, date),
  which can still be verified with the public `verify_certificate` function.

### Device limit
Each student account works on at most **2 devices** (browsers). A third device is refused at login.
Teachers see the device count in the Students tab and can **Reset devices** when a student changes phone.

## 📱 Responsive Design

- **Mobile:** 360px - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px+

## 🛠️ Tech Stack

- **Frontend:** React 18
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Internationalization:** i18next
- **Backend:** Supabase (Postgres + Row Level Security, Auth, Storage, Edge Functions, pg_cron)
- **Build Tool:** Vite
- **Package Manager:** npm

## 🔄 Development Workflow

```bash
# Start dev server
npm run dev

# Build production version
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 📚 Next Steps

1. **Video lessons** — embedded player (YouTube/Bunny/Vimeo) with the student's name as a watermark,
   then signed, expiring video links through an Edge Function
2. **In-browser voice recording** for pronunciation assignments (currently a file upload / phone recorder)
3. **"Copy class for a new group"** — reuse modules and assignments for the next 60-day class
4. **Enable leaked-password protection** in Supabase → Authentication → Settings

## 💰 Hosting & Cost

- **Frontend:** Vercel (FREE tier)
- **Backend:** Railway (FREE tier - $10/month paid)
- **Database:** PostgreSQL on Railway (FREE tier - $15/month paid)
- **Domain:** $12/year
- **Total Year 1:** ~$300

See `Learning_Portal_Cost_Breakdown.md` for details.

## 📖 Documentation

- `Thai_LMS_Frontend_Design_Guide.md` - Complete design system
- `Thai_LMS_Frontend_Design_Myanmar.md` - Myanmar-specific design
- `Thai_LMS_React_Complete_Code.md` - Full code reference
- `Learning_Portal_Cost_Breakdown.md` - Cost analysis
- `GitHub_Quick_Start.md` - GitHub deployment guide

## 🤝 Contributing

This project is for learning Thai language. Contributions welcome!

## 📄 License

MIT License - See LICENSE file for details

## 🎯 Made with ❤️ for Myanmar Thai Learners

Questions or suggestions? Open an issue on GitHub!

---

**Status:** Early Access (Phase 1) 
**Last Updated:** September 27, 2026
**Author:** Saw Nyan Lin Tun

# 🎓 Thai Learning Portal

Learn Thai language designed for Myanmar speakers - Bilingual Myanmar + English interface with interactive pronunciation learning.

## ✨ Features

- ✅ Myanmar + English bilingual UI (Myanmar primary language)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ User authentication with form validation
- ✅ Course dashboard with progress tracking
- ✅ Assignment management
- 🔜 Interactive pronunciation learning (coming soon)
- 🔜 Voice recording practice (coming soon)
- 🔜 Teacher dashboard (coming soon)

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

# Start development server
npm run dev
```

Visit: **http://localhost:5173**

### Build for Production

```bash
npm run build
```

Output goes to `/dist` folder

## 📝 Test Login

- **Email:** test@example.com
- **Password:** anything (any password works in demo)

## 🏗️ Project Structure

```
thai-learning-portal/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Button.jsx       # Button component (primary/secondary/danger)
│   │   ├── Card.jsx         # Card component
│   │   ├── Input.jsx        # Form input with validation
│   │   ├── Header.jsx       # App header
│   │   ├── LanguageToggle.jsx # Language switcher
│   │   └── ProtectedRoute.jsx # Route protection
│   ├── pages/               # Page components
│   │   ├── LoginPage.jsx    # Login/Auth page
│   │   └── DashboardPage.jsx # Dashboard page
│   ├── locales/             # Translations
│   │   ├── en.json          # English translations
│   │   └── my.json          # Myanmar translations
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

### Colors
- **Thai Blue:** #1E6B9E (Primary)
- **Thai Gold:** #D4A574 (Accent)
- **Thai Green:** #2D7D5C (Success)
- **Thai Red:** #C94B4B (Error)

### Typography
- **Myanmar Text:** Padauk font, 17px size, 1.6 line-height
- **English Text:** Inter font, 16px size
- **Thai Text:** Prompt font

### Components
- **Button:** Primary, Secondary, Tertiary, Danger variants
- **Card:** Hoverable card with shadow effects
- **Input:** Form input with validation and focus states
- **Header:** App header with language toggle

## 🌐 Internationalization (i18n)

The app supports Myanmar and English languages:
- Default language: Myanmar (my)
- Language toggle in header
- Browser language detection
- Language preference saved in localStorage

## 🔒 Authentication

Currently uses localStorage-based demo authentication:
- Test email: test@example.com
- Any password works for demo
- Production: Replace with real backend API

## 📱 Responsive Design

- **Mobile:** 360px - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px+

## 🛠️ Tech Stack

- **Frontend:** React 18
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Internationalization:** i18next
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

## ☁️ Deploying to Google Cloud (Firebase Hosting)

This app is a static SPA with the backend on Supabase, so it deploys as a static site — no server or container needed. Firebase Hosting (a Google Cloud product) fits this well: free tier, global CDN, automatic SSL, and SPA-friendly rewrites are already configured in `firebase.json`.

1. Install the CLI and log in:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
2. Create (or pick) a Firebase project at https://console.firebase.google.com, then point this repo at it:
   ```bash
   firebase use --add
   ```
   (or edit `.firebaserc` directly with your project ID)
3. Set your Supabase credentials in `.env` (copy from `.env.example`) — `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project's API settings. These are baked into the build at build time.
4. Build and deploy:
   ```bash
   npm run deploy:firebase
   ```

Your site will be live at `https://<project-id>.web.app`. Firebase Hosting also supports attaching a custom domain from the console.

## 📚 Next Steps (Phase 2)

1. **Backend API Integration**
   - Wire up the Supabase client SDK
   - Replace localStorage with Supabase Auth + database
   - Row-level security policies for user data

2. **Pronunciation Learning**
   - Audio comparison: Thai vs Myanmar sounds
   - Tone mark explanations
   - Voice recording practice

3. **Advanced Features**
   - Video lesson playback
   - Downloadable course materials
   - Progress analytics
   - Teacher dashboard
   - Assignment grading

4. **Deployment**
   - Deploy frontend to Google Cloud (Firebase Hosting) ✅ see above
   - Connect custom domain
   - SSL certificate setup (automatic with Firebase Hosting)

## 💰 Hosting & Cost

- **Frontend:** Firebase Hosting on Google Cloud (FREE tier covers this project's traffic)
- **Backend:** Supabase (FREE tier; paid plans start at $25/month if usage grows)
- **Database:** Supabase Postgres (included in Supabase plan above)
- **Domain:** $12/year (optional, on top of the free `*.web.app` subdomain)

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

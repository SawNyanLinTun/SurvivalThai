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
│   │   ├── Button.jsx       # Button component (variants + sizes)
│   │   ├── Badge.jsx        # Status pill
│   │   ├── ProgressRing.jsx # Circular progress
│   │   ├── Icon.jsx         # Inline SVG icons
│   │   ├── Logo.jsx         # Brand mark
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

### Colors — "Orchid & Marigold"
- **Orchid:** #5B4BDB (Primary — Thailand's national flower)
- **Marigold:** #FBBF3C / #F5A524 (Accent, calls to action)
- **Coral:** #FF6B5B (Highlights, pending / error states)
- **Mint:** #16A34A (Success)
- **Cream:** #FFF9F2 (Background) · **Ink:** #1F1B2E (Text)

Each color has a tint scale in `tailwind.config.js` (e.g. `orchid-50` … `orchid-900`).

### Typography
- **UI / English:** Plus Jakarta Sans
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

## 📚 Next Steps (Phase 2)

1. **Backend API Integration**
   - Connect to Node.js/Express backend
   - Replace localStorage with real database
   - User authentication with JWT

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
   - Deploy frontend to Vercel
   - Deploy backend to Railway
   - Connect custom domain
   - SSL certificate setup

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

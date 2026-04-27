# 🎯 CareerForge AI

> **Your AI-powered career acceleration platform** — from application tracking to offer negotiation.

Practice voice-enabled mock interviews, optimize your resume with ATS analysis, track every application, and get real-time AI coaching — all in one place.

![CareerForge AI](./public/og-image.png)

---

## ✨ Features

### 🎤 AI Mock Interviews *(Voice-Enabled)*
- **Realistic Multi-Round Simulations** — Practice DSA, System Design, AI/ML, and Behavioral rounds tailored to your target company.
- **Voice-First Interaction** — Speak your answers (STT) and hear questions read aloud (TTS) for a natural, pressure-tested interview flow.
- **Company-Specific Pipelines** — Simulate full hiring loops for Meta, Google, Amazon, and more.
- **Blind Feedback Mode** — Receive unbiased follow-up questions in real time, with scoring withheld until the round ends.
- **Auto-Submit & Countdown Timer** — Practice under realistic time pressure with automatic submission on silence detection.

### 📄 AI Resume Analyzer
- **Instant ATS Scoring** — Upload your PDF resume alongside a job description and receive a 0–100 ATS compatibility score in seconds.
- **Targeted Gap Analysis** — Surface missing skills and keywords specific to the role and company.
- **Actionable Rewrite Suggestions** — AI-generated edits to maximize your resume's conversion rate for each application.
- **Privacy-First Processing** — Resume content is analyzed in-memory and never stored permanently.

### 📊 Application Tracker
- **Kanban-Style Pipeline** — Drag applications across stages: Applied → OA → Interview → Offer → Rejected.
- **AI-Powered Insights** — Context-aware tips generated from your application history and stage trends.
- **Priority Bookmarking** — Star high-value opportunities with ⭐ for quick access.
- **Duplicate Prevention** — Smart validation keeps your pipeline clean and accurate.

### 📈 Analytics Dashboard
- **Score Trend Charts** — Visualize mock interview performance improvements over time with Recharts.
- **Skill Radar** — Breakdown of strengths across Technical Accuracy, Communication, and Problem Solving.
- **Loop Completion Tracking** — Monitor your progress through multi-round company simulations.

### 🤖 AI Coaching Engine
- **Adaptive Question Generation** — AI adjusts difficulty and topic depth based on your selected level and company tag.
- **On-Demand Hints** — Receive conceptual nudges during practice without exposing the full solution.
- **Ultra-Low Latency** — Powered by Groq (Llama 3.3-70b) for near-instant AI responses.

### 🔐 Security & Privacy
- **JWT Authentication** — Secure, stateless session management with HTTP-only cookies.
- **Strict User Isolation** — Middleware enforces per-user data access at every endpoint.
- **Rate Limiting** — Protects AI endpoints from abuse and controls inference costs.
- **Input Sanitization** — Guards against prompt injection and XSS attacks throughout.

### 📱 Responsive & Accessible
- **Mobile-First Design** — Full voice and chat functionality works seamlessly on mobile.
- **Dark Mode** — Native support for system-wide dark/light themes.
- **Keyboard Shortcuts** — `Ctrl+K` to focus input · `Enter` to send · `Ctrl+M` to toggle mic.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 18, TypeScript, Tailwind CSS 4 |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Authentication** | JWT + bcryptjs |
| **AI Engine** | Groq API (Llama 3.3-70b) |
| **Voice** | Web Speech API (STT + TTS) |
| **State Management** | Zustand |
| **Charts** | Recharts |
| **PDF Processing** | pdf-parse, @react-pdf/renderer |
| **Deployment** | Vercel (Frontend) · Render / Railway (Backend) |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works)
- [Groq API key](https://console.groq.com) (free)
- Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/careerforge-ai.git
cd careerforge-ai
```

### 2. Set Up the Backend

```bash
cd apps/backend

npm install

cp .env.example .env
```

Edit `.env` with your credentials:

| Variable | Description |
|---|---|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Generate with `openssl rand -hex 32` |
| `GROQ_API_KEY` | Your Groq API key |
| `PORT` | `5000` (default) |

```bash
npm run dev
# Backend running at http://localhost:5000
```

### 3. Set Up the Frontend

```bash
cd apps/frontend

npm install

cp .env.example .env.local
```

Edit `.env.local`:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` |

```bash
npm run dev
# Frontend running at http://localhost:3000
```

---

## 📂 Project Structure

```
apps/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers — Auth, Interview, Resume
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic — AI Orchestrator, Parsers
│   │   └── config/           # DB connection, prompt templates
│   └── server.ts             # Entry point
│
└── frontend/
    ├── app/                  # Next.js App Router pages
    │   ├── interview/        # Mock interview flows
    │   ├── resume-analyzer/  # ATS analysis UI
    │   └── dashboard/        # Analytics & application tracking
    ├── components/           # Reusable UI components
    ├── features/             # Feature-specific logic & hooks
    ├── hooks/                # Custom hooks — STT, TTS, AutoSave
    └── store/                # Zustand state management
```

---

## 📝 License

This project is licensed under the **MIT License** — see [`LICENSE`](./LICENSE) for details.

---

## 🙏 Acknowledgments

- [Groq](https://groq.com) — Ultra-fast inference that makes real-time AI coaching possible.
- [Next.js](https://nextjs.org) — The App Router framework powering the frontend.
- [Recharts](https://recharts.org) — Beautiful, composable charts for the analytics dashboard.
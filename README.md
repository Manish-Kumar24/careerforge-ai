# 🎯 CareerForge AI

A comprehensive, AI-powered career acceleration platform. Track job applications, master technical interviews with voice-enabled mock sessions, optimize your resume with ATS analysis, and receive real-time AI coaching.

![CareerForge AI](./public/og-image.png)

---

## ✨ Features

### 🎤 AI Mock Interviews (Voice-Enabled)
- **Realistic Simulations**: Practice DSA, System Design, AI/ML, and Behavioral rounds.
- **Voice Interaction**: Speak your answers (STT) and listen to questions (TTS) for a natural interview flow.
- **Company-Specific Loops**: Simulate multi-round hiring pipelines for Meta, Google, Amazon, etc.
- **Blind Feedback**: Receive unbiased, real-time follow-up questions without premature scoring.
- **Auto-Submit & Timer**: Realistic pressure with strict time limits and auto-submission on voice stop.

### 📄 AI Resume Analyzer
- **ATS Scoring**: Upload your PDF resume and a Job Description to get an instant ATS compatibility score (0-100).
- **Gap Analysis**: Identify missing skills and keywords specific to the target role.
- **Actionable Feedback**: Get AI-generated suggestions to tailor your resume for higher conversion.
- **Privacy First**: Resume data is processed in-memory and never permanently stored.

### 📊 Application Tracking
- **Kanban-Style Tracking**: Manage applications from Applied → OA → Interview → Offer.
- **Smart Insights**: AI-generated tips based on your application history and status trends.
- **Priority Bookmarking**: Mark high-value opportunities with ⭐ for quick access.
- **Duplicate Prevention**: Smart validation ensures clean data entry.

### 📈 Analytics Dashboard
- **Performance Trends**: Visualize your mock interview score improvements over time using Recharts.
- **Skill Breakdown**: Radar charts showing strengths in Technical Accuracy, Communication, and Problem Solving.
- **Loop Progress**: Track completion rates for multi-round company simulations.

### 🤖 AI-Powered Assistance
- **Context-Aware Coaching**: AI adapts questions based on your selected difficulty and company tag.
- **On-Demand Hints**: Get conceptual nudges during practice without revealing full solutions.
- **Groq Integration**: Ultra-low latency responses using Llama 3.3-70b.

### 🔐 Security & Privacy
- **JWT Authentication**: Secure session management with HTTP-only cookies.
- **User Isolation**: Strict middleware ensures users only access their own data.
- **Rate Limiting**: Protects AI endpoints from abuse and controls costs.
- **Input Sanitization**: Prevents prompt injection and XSS attacks.

### 📱 Responsive & Accessible
- **Mobile-First Design**: Fully functional voice and chat interfaces on mobile devices.
- **Dark Mode**: Native support for system-wide dark/light themes.
- **Keyboard Shortcuts**: `Ctrl+K` to focus input, `Enter` to send, `Ctrl+M` for mic toggle.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (App Router), React 18, TypeScript, Tailwind CSS 4 |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Authentication** | JWT (bcryptjs for hashing) |
| **AI Engine** | Groq API (Llama 3.3-70b) |
| **Voice AI** | Web Speech API (STT/TTS) |
| **State Management** | Zustand |
| **Charts** | Recharts |
| **PDF Processing** | pdf-parse, @react-pdf/renderer |
| **Deployment** | Vercel (Frontend), Render/Railway (Backend) |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier)
- Groq API key (free at https://console.groq.com)
- Git installed

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/careerforge-ai.git
cd careerforge-ai
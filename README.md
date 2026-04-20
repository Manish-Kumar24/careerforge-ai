# 🎯 CareerForge AI

A comprehensive interview preparation and application tracking platform powered by AI. Track your job applications, practice DSA, get AI-powered interview answers, and never miss a deadline.

![CareerForge AI](./public/og-image.png)

---

## ✨ Features

### 📊 Application Tracking
- **Track Applications**: Add, edit, and manage all your job applications in one place
- **Status Management**: Applied → OA → Interview → Offer → Rejected
- **Priority Bookmarking**: Mark important applications with ⭐ for quick access
- **Timeline & Notes**: Auto-logged activities + manual notes for each application
- **Duplicate Prevention**: Smart validation prevents duplicate entries

### 📈 Analytics Dashboard
- **Visual Charts**: Pie charts showing application status distribution
- **Interactive Legends**: Click to focus on specific statuses
- **Real-time Stats**: Total, applied, interview, offer, rejected counts
- **Smart Insights**: AI-generated suggestions based on your data

### 🤖 AI-Powered Assistance
- **Interview Prep**: Get AI-powered answers to technical questions
- **Resume Tips**: Personalized suggestions to improve your applications
- **Groq Integration**: Fast, reliable AI responses using Llama 3.3

### 🔐 Security & Privacy
- **JWT Authentication**: Secure login/signup with encrypted passwords
- **User Isolation**: Each user sees only their own data
- **Rate Limiting**: Protection against API abuse
- **Environment Variables**: All secrets properly secured

### 📱 Responsive Design
- **Desktop + Mobile**: Works seamlessly on all devices
- **Collapsible Sidebar**: More screen space when needed
- **Dark Mode**: Easy on the eyes for late-night prep
- **Fixed Navigation**: Always-accessible sidebar

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 18, TypeScript, Tailwind CSS 4 |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Authentication** | JWT (bcryptjs for password hashing) |
| **AI** | Groq API (Llama 3.3-70b) |
| **State Management** | Zustand |
| **Charts** | Recharts |
| **HTTP Client** | Axios |
| **Deployment** | Vercel (Frontend), Railway (Backend) |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier)
- Groq API key (free at https://console.groq.com)
- Git installed

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-interview-tracker.git
cd ai-interview-tracker
```

### 2. Setup Backend
```bash
cd apps/backend
```

### 3. Install dependencies
```bash
npm install
```

# Copy environment template
cp .env.example .env

# Edit .env with your actual values
# - MONGO_URI: Your MongoDB Atlas connection string
# - JWT_SECRET: Generate with `openssl rand -hex 32`
# - GROQ_API_KEY: Your Groq API key

# Start development server
npm run dev

Backend runs on: http://localhost:5000

### 3. Setup Frontend
cd apps/frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local
# - NEXT_PUBLIC_API_URL: http://localhost:5000/api

# Start development server
npm run dev

Frontend runs on: http://localhost:3000


# 🚀 TalentScout AI: The Next-Gen Recruitment Agent

TalentScout AI is a premium, AI-driven recruitment platform designed to bridge the gap between job descriptions and top-tier talent. By leveraging intelligent PDF parsing, custom matching algorithms, and a simulated AI outreach agent, it provides a seamless end-to-end hiring experience.

![Premium UI Showcase](https://img.shields.io/badge/UI-Premium_Glassmorphism-blueviolet)
![Backend](https://img.shields.io/badge/Backend-Node.js_%26_MySQL-blue)
![AI](https://img.shields.io/badge/AI-Custom_Matching_Engine-green)

---

## ✨ Key Features

### 1. 📂 Intelligent JD Analysis
- **Smart Parsing**: Upload PDFs or paste raw text. Our engine extracts key skills, experience requirements, and core responsibilities.
- **AI Summary**: Automatically generates a concise summary of the job role for quick review.

### 2. 🎯 Advanced Matcher Engine
- **Multi-Factor Scoring**: Calculates a "Match Score" based on skills, project history, and experience.
- **Explainability**: Every match comes with an AI-generated reason, explaining *why* a candidate was selected.

### 3. 🤖 AI Outreach Agent (Engagement)
- **Simulated Chat**: An AI recruiter engages with candidates to gauge interest, salary expectations, and availability.
- **Interest Scoring**: Based on the conversation, the agent generates an "Interest Score" (0-100%).

### 4. 📊 Finalized Ranking
- **Dual-Dimension Rank**: Candidates are ranked using a weighted formula: `Final = (0.6 * Match) + (0.4 * Interest)`.
- **Dynamic Leaderboard**: Watch as rankings shift in real-time based on candidate feedback.

### 5. 💎 Premium Dashboard UI
- **Glassmorphism Design**: High-end, translucent interface with a "Midnight Aurora" animated background.
- **Interactive Views**: Switch between the Dashboard, Candidate Pool, History, and Automations.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React (Vite), Material UI (MUI), Framer Motion Effects |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL (User Auth, Candidate Storage) |
| **AI Processing** | `pdf-parse` (v2), Custom Sentiment & Matching Logic |
| **Styling** | Vanilla CSS (Enhanced Design System), Glassmorphism |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MySQL Server

### 1. Backend Setup
```bash
cd backend
npm install
# Configure your .env file with MySQL credentials:
# DB_HOST=localhost, DB_USER=root, DB_PASS=yourpass, DB_NAME=talent_db
node index.js
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Project Structure

```text
├── ai-engine/          # Custom Matching & Parsing Logic
│   ├── matcher.js      # Dynamic Similarity Engine
│   ├── parser.js       # PDF & Text Extraction
│   └── chat_agent.js   # AI Outreach Simulation
├── backend/            # Express Server & MySQL DB
│   ├── routes/api.js   # Main API Endpoints
│   └── db.js           # Database Initialization
└── frontend/           # React Application
    ├── src/App.jsx     # Premium Dashboard Logic
    └── src/index.css   # Custom Design System (Aurora theme)
```

---

## 🛡️ Security
- **JWT Authentication**: Secure login and signup for recruiters.
- **Data Privacy**: .env protected secrets and automated .gitignore for dependency management.

---


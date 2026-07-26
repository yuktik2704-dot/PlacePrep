# 🚀 PlacePrep AI

> **AI-Powered Resume Analyzer & Mock Interview Platform**

PlacePrep AI is a collaborative full-stack web application designed to help students become placement-ready using Artificial Intelligence.

The platform enables users to upload their resumes, receive an AI-powered ATS analysis, identify missing skills, get personalized project recommendations, and practice AI-generated mock interviews to improve their placement preparation.

---

## ✨ Key Features

- 📄 Resume Upload & PDF Parsing
- 🤖 AI-Powered Resume Analysis using Google Gemini
- 📊 ATS Score Generation
- 🛠 Skill Gap Detection
- 💡 Personalized Project Recommendations
- 🗺 AI Learning Roadmap
- 🎤 AI Mock Interview
- 📈 Interview Evaluation & Feedback
- 💾 MongoDB Database Integration
- 🌐 Fully Deployed Full Stack Application

---

## 🛠 Tech Stack

### 🎨 Frontend

- HTML5
- CSS3
- JavaScript

### ⚙️ Backend

- Node.js
- Express.js

### 🗄 Database

- MongoDB Atlas
- Mongoose

### 🤖 AI

- Google Gemini API

### 🚀 Deployment

- Vercel (Frontend)
- Render (Backend)

### 🧰 Tools & Utilities

- Git
- GitHub
- Postman
- Multer
- PDF-Parse

## 🏗 Project Architecture

```
                    User
                      │
                      ▼
          Frontend (HTML/CSS/JS)
                      │
               REST API Calls
                      │
                      ▼
           Express.js Backend
          ┌──────────┴──────────┐
          ▼                     ▼
   Google Gemini API      MongoDB Atlas
          │                     │
          ▼                     ▼
 Resume Analysis         User & Resume Data
```
## 📂 Folder Structure

```text
PlacePrep
│
├── Backend
│   ├── config
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── services
│   ├── uploads
│   ├── utils
│   ├── .env
│   ├── server.js
│   ├── testGemini.js
│   ├── package.json
│   └── package-lock.json
│
├── Frontend
│   ├── assets
│   ├── css
│   ├── js
│   ├── index.html
│   ├── signup.html
│   ├── dashboard.html
│   ├── resume-upload.html
│   ├── interview.html
│   ├── result.html
│   ├── profile.html
│   ├── loading.html
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

## 📸 Application Preview

### 🔐 Login Page

![Login](screenshots/login.png)

---

### 📝 Signup Page

![Signup](screenshots/signup.png)

---

### 📄 Resume Upload

![Upload](screenshots/upload.png)

---

### 🤖 AI Resume Analysis

![Analysis](screenshots/analysis.png)

---

### 🎤 AI Mock Interview

![Interview](screenshots/interview.png)

---

### 📊 Interview Feedback

![Result](screenshots/result.png)

## 🌐 Live Demo

### Frontend
https://place-prep-nu.vercel.app/

### Backend API
https://placeprep-sb9x.onrender.com

## 🚀 Future Scope

- AI Cover Letter Generator
- Job Recommendation System
- Resume Version History
- Company-wise Interview Questions
- AI Career Mentor Chatbot
- Resume Templates
- PDF Report Download
- Progress Tracking Dashboard

## ⚙️ Installation

### Clone Repository

```bash
git clone <repository-url>
```

### Backend

```bash
cd Backend
npm install
npm start
```

### Frontend

Open `index.html` in your browser or run using Live Server.

## ⚙️ Installation

### Clone Repository

```bash
git clone <repository-url>
```

### Backend

```bash
cd Backend
npm install
npm start
```

### Frontend

Open `index.html` in your browser or run using Live Server.
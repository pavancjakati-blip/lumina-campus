# Lumina Campus 🌟

> Smart Faculty Leave & Attendance Management System for SDMCET

A full-stack web app built for college faculty to manage:
- ✅ Leave applications & approvals
- ✅ Daily attendance tracking
- ✅ HOD dashboard with department stats
- ✅ Real-time notifications
- ✅ Faculty timetable & schedule

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express + TypeScript |
| Database | JSON File Store (persistent) |
| State | TanStack React Query |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### 1. Install Frontend Dependencies
```bash
cd lumina-connect-main
npm install
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
```

### 3. Setup Database
- Copy `database.template.json` to `d:/crome_downloader/database.json`
- Or update the path in `server/src/db.ts`

### 4. Run the entire project
```bash
npm start
```

This starts both frontend (port 8080) and backend (port 5000) simultaneously.

---

## Access

| URL | Description |
|---|---|
| `http://localhost:8080` | Frontend App |
| `http://localhost:5000` | Backend API |
| `http://<your-ip>:8080` | Access from phone (same Wi-Fi) |

---

## Default Login Credentials

| Role | Email | Password |
|---|---|---|
| HOD | `sr.biradar@sdmcet.edu` | `faculty123` |
| Faculty | `rn.yadwad@sdmcet.edu` | `faculty123` |
| Faculty | `daneshwari.kori@sdmcet.edu` | `faculty123` |

---

## Features

### Faculty Workflow
- 🏠 Home dashboard with today's schedule & stats
- 📝 Apply for leave with document upload
- 📋 Track leave history & status
- 📅 Attendance calendar with month navigation
- ✅ Mark daily attendance with 3D confirmation
- 👤 Profile page

### HOD Workflow
- 📊 Department dashboard (KPIs, present today, pending leaves)
- ✅ Approve/Reject leave requests with remarks
- 👥 Monitor all faculty attendance
- 📈 Reports & analytics
- 🔔 Notifications system

### Backend Features
- 🔐 Role-based authentication (HOD / Faculty)
- ⚡ Atomic JSON writes (no data corruption)
- 🤖 Auto-marks absent after 10 AM if not marked
- 🔔 Automatic notifications on leave decisions
- 💰 Auto leave balance deduction on approval
- 🌐 Vite proxy — works on any device on the network

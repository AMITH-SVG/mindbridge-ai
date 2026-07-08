# MindBridge AI — Student Mental Wellness & Anonymous Mentoring Platform

An enterprise-grade, multi-tenant SaaS application built for universities to support student mental wellness, detect risk trends, and enable secure, anonymous peer-to-peer mentoring.

## Features
- **Strict Data Isolation**: logical multi-tenancy separating different universities based on validated email domains.
- **AI Wellness Companion**: rule-based state-machine conversational assistant that detects mood trends, anxiety levels, and triages risk.
- **Double-Blind Mentoring**: secure peer-to-peer and counsellor chat using cycling temporary identifiers that completely hide student real identities.
- **Compliance Dashboards**: administrative interfaces presenting campus aggregates, security audit logs, and anonymized reports.

---

## Tech Stack
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT (with Refresh Token rotation), Express-Validator, Helmet.
- **Frontend**: React (Vite), TypeScript, Tailwind CSS v4, Recharts, Lucide Icons.

---

## Local Development Setup

### Prerequisite
Ensure you have **Node.js** (v18+) and a running **MongoDB** database instance.

### 1. Server Configuration
Create `server/.env` with your details (use the existing `server/.env` template):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mindbridge
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
CLIENT_URL=http://localhost:5173
```
Install dependencies and run the server:
```bash
cd server
npm install
# Seed the database with mock universities and accounts
npm run seed
# Start backend server
npm run dev
```

### 2. Client Configuration
Install dependencies and start the Vite dev server:
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Mock Accounts (From Seed Script)
Use these pre-configured credentials for quick feature testing:

- **Super Admin**: `superadmin@demo.edu` / `Password123`
- **University Admin**: `admin@demo.edu` / `Password123`
- **Faculty Mentor**: `mentor@demo.edu` / `Password123`
- **Student Profile**: `student@demo.edu` / `Password123`

---

## Docker Deployment (Production Stack)
Run the entire database, server, and client stack in a single command using Docker Compose:
```bash
docker-compose up --build
```
The Client will be served at `http://localhost`, and the API at `http://localhost:5000`.

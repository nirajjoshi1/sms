# 🏫 School Management System

A comprehensive, production-ready, full-stack school management system built with **React 19**, **Node.js**, **Express**, **Prisma ORM**, and **PostgreSQL**. Manage every aspect of a school — students, staff, academics, fees, HR, certificates, CMS, and analytics — in one unified multi-tenant platform. 

Designed as a hardened, enterprise-grade SaaS application, it features robust multi-tenancy, strict IDOR protection, and granular Role-Based Access Control (RBAC).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)

---

## ✨ Features

### 👨‍🎓 Student Management
- Complete student admission workflow with photo upload (Cloudinary)
- Student directory with search, filter, and pagination
- Student categories, houses, and custom classifications
- Bulk operations (disable/enable, promote to next class)
- Disabled students archive

### 💰 Fee Management
- Flexible fee structures (groups, types, masters, discounts)
- Fee collection with print-ready receipts
- Due fee tracking with **real email reminders** (Nodemailer)
- Fee carry-forward between sessions (writes real DB records)
- Offline bank payment recording
- CSV export for all fee reports

### 📚 Academics
- Class, Section, Subject and Subject Group management
- Class teacher assignment
- Timetable builder (class-wise and teacher-wise views)
- Bulk student promotion across sessions
- **Admin exam marks overview** — filter by class, subject, exam type with aggregate stats

### 👥 Human Resources
- Staff directory with complete profiles and document uploads
- Daily attendance tracking with half-day support
- Payroll calculation with payslip generation
- Leave management — apply, approve/reject, leave type configuration
- Department and designation hierarchy
- Teacher performance rating system

### 📜 Certificates & ID Cards
- Custom student certificates with browser-based print/PDF
- Transfer certificates with student details
- Student and Staff ID card generation with grid preview

### 📊 Reports & Analytics
- 8 comprehensive report types across all modules
- CSV export for Student, Attendance, Finance, HR, Alumni, Homework, Audit reports
- Real-time financial summary (income vs expenses vs net balance)

### 🌐 Content Management (CMS)
- School website content management
- Events, news articles, and gallery management
- Banner image management
- Media file manager with field validation

### 🔔 Notifications
- In-app notification system for all users
- **Admin broadcast** — send announcements to all users or specific roles (Admin, Teacher, Accountant, Receptionist)
- Mark as read, delete, clear all

### 📈 Role Dashboards
| Role | Dashboard |
|---|---|
| Super Admin | School list, system health (dynamic %), live notifications |
| Admin | Real-time stats — students, staff, revenue, expenses |
| Teacher | Live schedule, class stats, pending marks |
| Accountant | Income/expense summary, recent transactions |
| Receptionist | Admissions, visitors, quick-action shortcuts |

### ⚙️ Settings
- General, session, email (SMTP), SMS, payment gateway, print settings
- Automated database backups
- Online admission requests management
- Broadcast notification composer

---

## 🔒 Hardened Security & Architecture

This application is built for production environments with enterprise-grade security:

- **Multi-Tenant Architecture:** Complete data isolation between schools. All queries automatically scope to the authenticated user's `schoolId`.
- **Strict IDOR Protection:** Consistent ownership verification prevents users from accessing or modifying records belonging to other tenants.
- **Granular RBAC:** Permissions are decoupled from roles, offering a highly customizable matrix of over 30 distinct permissions (see [PERMISSIONS.md](./PERMISSIONS.md)).
- **Zod Validation:** All incoming data is rigorously validated and sanitized at the API boundary, preventing injection attacks and malformed data (see [SECURITY.md](./SECURITY.md)).
- **Defense in Depth:** Implements Helmet.js (security headers), rate limiting, bcrypt password hashing, and brute-force protection.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool and dev server |
| Tailwind CSS | v4 | Utility-first styling |
| shadcn/ui | latest | Component library |
| React Router | v7 | Client-side routing |
| Recharts | latest | Data visualization |
| Axios | latest | HTTP client |
| Sonner | latest | Toast notifications |
| Lucide React | latest | Icon library |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20+ | Runtime |
| Express.js | 4 | Web framework |
| Prisma ORM | 6 | Database ORM and migrations |
| PostgreSQL (Neon) | 16 | Database |
| JWT | latest | Authentication |
| bcryptjs | latest | Password hashing |
| Cloudinary | latest | Image/document storage |
| Nodemailer | latest | Email (SMTP) service |
| Helmet | latest | Security headers |
| express-rate-limit | latest | Rate limiting |
| Morgan | latest | HTTP request logging |
| Zod | latest | Schema validation |

---

## 📋 Prerequisites

- **Node.js 20+** and npm
- **PostgreSQL** database (or free [Neon](https://neon.tech) account)
- **Cloudinary** account (for image uploads)
- **SMTP** email account (Gmail works with App Passwords)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/school-management-system.git
cd school-management-system
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create `server/.env` (copy from `.env.example`):

```env
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require

# Auth
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRY=7d

# Cloudinary (image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM_NAME=School Management

# CORS
CLIENT_URL=http://localhost:5173
```

Push database schema and seed data:

```bash
npx prisma db push
npx prisma db seed
```

Start the server:

```bash
npm run dev
```

Server runs at: `http://localhost:5000`

### 3. Setup Frontend

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

Start the development server:

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔑 Default Login Credentials (Seeded)

| Role | Email | Password |
|---|---|---|
| Super Admin | `superadmin@sms.com` | `Admin@123` |
| Admin | `admin@demo.com` | `Admin@123` |
| Teacher | `teacher@demo.com` | `Teacher@123` |

> ⚠️ **Change these credentials immediately after first login in a production environment.**

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

**⭐ If you find this project helpful, please give it a star!**

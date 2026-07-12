# 🏫 School Management System

A comprehensive, production-ready, full-stack school management system built with **React 19**, **Node.js**, **Express**, **Prisma ORM**, and **PostgreSQL**. Manage every aspect of a school — students, staff, academics, fees, HR, certificates, CMS, and analytics — in one unified multi-tenant platform.

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

## 📁 Project Structure

```
school-management-system/
├── client/                        # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui base components
│   │   │   ├── layout/           # MainLayout, Sidebar, Navbar
│   │   │   └── auth/             # ProtectedRoute
│   │   ├── pages/
│   │   │   ├── academics/        # Classes, Sections, Subjects, Timetable, ExamMarks
│   │   │   ├── certificates/     # Student/Staff ID Cards, Certificates
│   │   │   ├── cms/              # Events, Gallery, News, Media
│   │   │   ├── dashboard/        # Role-specific dashboards
│   │   │   ├── expenses/         # Expense management
│   │   │   ├── fees/             # Fee collection, due fees, reminders
│   │   │   ├── hr/               # Staff HR, leave, payroll
│   │   │   ├── income/           # Income management
│   │   │   ├── public/           # Landing page
│   │   │   ├── reports/          # All report pages
│   │   │   ├── settings/         # System settings + broadcast
│   │   │   ├── staff/            # Staff CRUD
│   │   │   ├── students/         # Student CRUD
│   │   │   └── teacher/          # Teacher portal
│   │   ├── context/              # AuthContext
│   │   ├── hooks/                # Custom React hooks
│   │   ├── lib/                  # api.js, errorHandler.js
│   │   └── routes/               # AppRoutes.jsx
│   └── package.json
│
├── server/                        # Express backend
│   ├── prisma/
│   │   ├── schema.prisma         # Full database schema
│   │   └── seed.js               # Seeder script
│   ├── src/
│   │   ├── config/               # Prisma client, env config
│   │   ├── controllers/          # All route controllers (20+ files)
│   │   ├── middleware/           # auth, errorHandler, validation, rateLimiter
│   │   ├── routes/               # Express routers (20+ files)
│   │   ├── services/             # email.service, fees.service, report.service
│   │   ├── utils/                # ApiResponse, ApiError, asyncHandler
│   │   └── validations/          # Zod validation schemas
│   ├── app.js
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 🔐 Authentication & Authorization

JWT-based authentication with role-based access control (RBAC):

| Role | Access |
|---|---|
| `SUPER_ADMIN` | All schools — manage tenants, system-wide view |
| `ADMIN` | Full access within their school |
| `TEACHER` | Academics, attendance, homework, marks entry |
| `ACCOUNTANT` | Fees, income, expenses, financial reports |
| `RECEPTIONIST` | Student admissions, basic student/staff lookup |

---

## 🔒 Security Features

- ✅ **Helmet.js** — HTTP security headers
- ✅ **CORS** with origin whitelist
- ✅ **Rate limiting** — 100 req/15min general; 10 req/15min on auth
- ✅ **JWT** — access tokens with expiry and revocation
- ✅ **bcryptjs** — password hashing (salt rounds: 12)
- ✅ **Brute-force protection** — login attempt tracking with account lockout
- ✅ **Zod validation** — all request bodies validated before controller
- ✅ **Prisma ORM** — SQL injection prevention
- ✅ **School context isolation** — users can only access their own school's data

---

## 🗄️ Database Schema

Key models in the Prisma schema:

| Model | Description |
|---|---|
| `User` | Auth, roles (SUPER_ADMIN, ADMIN, TEACHER, ACCOUNTANT, RECEPTIONIST) |
| `School` | Multi-tenant school records |
| `Student` | Full student profiles with class/section |
| `Staff` | Staff records with department/designation |
| `Class`, `Section` | Academic structure |
| `Subject`, `SubjectGroup` | Curriculum management |
| `FeeGroup`, `FeeType`, `FeeMaster` | Fee structure |
| `FeePayment` | Payment transactions + carry-forward records |
| `FeeDiscount` | Student-level discounts |
| `FeeReminder` | Reminder configuration |
| `Income`, `Expense` | Financial ledger |
| `IncomeHead`, `ExpenseHead` | Category heads |
| `Attendance` | Student daily attendance |
| `StaffAttendance` | Staff daily attendance |
| `LeaveRequest`, `LeaveType` | HR leave management |
| `Payroll` | Staff payroll records |
| `Mark` | Exam marks by student/subject |
| `Homework` | Teacher-assigned homework |
| `Timetable` | Class and teacher timetables |
| `Notification` | In-app notifications |
| `Certificate`, `IDCard` | Generated documents |
| `Event`, `News`, `Gallery` | CMS content |
| `MediaFile` | Uploaded media |
| `AuditLog` | Activity audit trail |

---

## 📡 API Reference

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
```
POST   /auth/login
POST   /auth/logout
GET    /auth/me
POST   /auth/forgot-password
POST   /auth/reset-password/:token
```

### Core Modules
```
/students          — GET, POST, GET/:id, PUT/:id, DELETE/:id
/staff             — GET, POST, GET/:id, PUT/:id, DELETE/:id
/academics/class   — GET, POST, PUT/:id, DELETE/:id
/academics/marks   — GET (admin overview with filters + summary)
/fees/collect      — POST (collect fee payment)
/fees/payments     — GET (search payments)
/fees/due          — GET (students with outstanding dues)
/fees/reminders    — GET, POST, PUT/:id, DELETE/:id
/fees/carry-forward — POST (carry-forward dues to new session)
/finance/income    — GET, POST, PUT/:id, DELETE/:id
/finance/expense   — GET, POST, PUT/:id, DELETE/:id
/hr/leave-requests — GET, POST, PATCH/:id/status
/notifications     — GET, DELETE
/notifications/broadcast — POST (admin only — send to all/role)
/reports/:type     — GET (student, attendance, finance, hr, alumni, homework, userlog, audit)
/cms/events        — GET, POST, PUT/:id, DELETE/:id
/settings/general  — GET, PUT
/schools           — GET, POST (SUPER_ADMIN only)
```

All responses follow:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {}
}
```

---

## 📦 Production Build

```bash
# Root — builds frontend into client/dist/
npm run build

# Start backend
cd server && npm start
```

---

## 🌍 Environment Variables Reference

### Backend (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | ✅ | Server port (default: 5000) |
| `NODE_ENV` | ✅ | `development` or `production` |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Min 32-char random secret |
| `JWT_EXPIRY` | ✅ | Token TTL e.g. `7d` |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `EMAIL_HOST` | ⚠️ | SMTP host (for email features) |
| `EMAIL_PORT` | ⚠️ | SMTP port (587 for TLS) |
| `EMAIL_USER` | ⚠️ | SMTP username/email |
| `EMAIL_PASS` | ⚠️ | SMTP password or app password |
| `EMAIL_FROM_NAME` | ⚠️ | Sender display name |
| `CLIENT_URL` | ✅ | Frontend URL for CORS |

### Frontend (`client/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Backend API base URL |
| `VITE_CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Parent portal with student progress tracking
- [ ] Online exam and quiz module
- [ ] Library management
- [ ] Transport and route management
- [ ] Hostel management
- [ ] Biometric attendance integration
- [ ] Bulk SMS notifications
- [ ] Multi-language (i18n) support
- [ ] PWA (offline support)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

**⭐ If you find this project helpful, please give it a star!**

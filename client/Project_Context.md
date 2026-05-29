# 🏫 School Management System — Master AI Context File

> **Read this file before writing any code.**
> This is the single source of truth for the entire project.
> Every AI agent, every session, every module — refer back here.

---

## 📌 Project Overview

| Field | Details |
|---|---|
| **Project Name** | School Management System (SMS) |
| **Type** | Full-stack Web Application — Admin Panel |
| **Purpose** | Complete digital management of a school — students, fees, staff, academics, reports, certificates |
| **Users** | Admin, Teacher, Accountant (role-based) |
| **Reference** | Inspired by school.systm.online — replicate all features with better UI/UX |
| **Developer** | Solo developer, AI-assisted coding |
| **Target** | Production-ready, scalable, maintainable |

---

## 🛠️ Tech Stack (FINAL — DO NOT CHANGE)

### Frontend
| Tool | Version | Purpose |
|---|---|---|
| **Vite** | Latest | Build tool, dev server |
| **React** | 18+ | UI framework |
| **JavaScript** | ES2022+ | Language (no TypeScript) |
| **Tailwind CSS** | v4 | Styling |
| **shadcn/ui** | Latest | UI component library |
| **React Router** | v6 | Client-side routing |
| **TanStack Table** | v8 | Heavy data tables with sorting, filtering, pagination |
| **React Hook Form** | Latest | Form management |
| **Zod** | Latest | Form validation schemas |
| **Recharts** | Latest | Charts and graphs for reports |
| **React-PDF** | Latest | PDF generation (certificates, fee receipts) |
| **xlsx (SheetJS)** | Latest | Excel export for all reports |
| **html2canvas** | Latest | ID card image generation |
| **Sonner** | Latest | Toast notifications |
| **date-fns** | Latest | Date formatting and manipulation |
| **axios** | Latest | HTTP client for API calls |

### Backend
| Tool | Version | Purpose |
|---|---|---|
| **Node.js** | 20+ LTS | Runtime |
| **Express.js** | v4 | Web server framework |
| **JavaScript** | ES2022+ | Language |
| **Prisma ORM** | Latest | Database ORM, migrations, type-safe queries |
| **JWT (jsonwebtoken)** | Latest | Authentication tokens |
| **bcryptjs** | Latest | Password hashing |
| **Multer** | Latest | File upload handling |
| **Cloudinary SDK** | Latest | Cloud image storage |
| **Nodemailer** | Latest | Email sending (fee reminders) |
| **Sharp** | Latest | Image processing for ID cards |
| **cors** | Latest | Cross-origin requests |
| **dotenv** | Latest | Environment variables |
| **helmet** | Latest | Security headers |
| **express-rate-limit** | Latest | API rate limiting |
| **morgan** | Latest | HTTP request logging |

### Database
| Tool | Purpose |
|---|---|
| **Neon** | Serverless PostgreSQL hosting (free tier) |
| **Prisma** | Schema management, migrations, query builder |

---

## 📁 Folder Structure (STRICT — Follow Exactly)

```
school-management/
│
├── client/                          # Vite + React frontend
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/                  # Images, icons, fonts
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ui/                  # shadcn/ui components (auto-generated)
│   │   │   ├── layout/              # Sidebar, Navbar, PageWrapper
│   │   │   ├── tables/              # Reusable TanStack table wrappers
│   │   │   ├── forms/               # Reusable form components
│   │   │   └── shared/              # Badges, Avatars, Stats cards, etc.
│   │   ├── pages/                   # One folder per module
│   │   │   ├── auth/
│   │   │   │   └── Login.jsx
│   │   │   ├── dashboard/
│   │   │   │   └── Dashboard.jsx
│   │   │   ├── students/
│   │   │   │   ├── StudentList.jsx
│   │   │   │   ├── StudentAdmission.jsx
│   │   │   │   ├── StudentDetails.jsx
│   │   │   │   └── DisabledStudents.jsx
│   │   │   ├── fees/
│   │   │   │   ├── CollectFees.jsx
│   │   │   │   ├── SearchFees.jsx
│   │   │   │   ├── DueFees.jsx
│   │   │   │   ├── FeesGroup.jsx
│   │   │   │   ├── FeesType.jsx
│   │   │   │   ├── FeesMaster.jsx
│   │   │   │   ├── FeesDiscount.jsx
│   │   │   │   ├── FeesCarryForward.jsx
│   │   │   │   ├── FeesReminder.jsx
│   │   │   │   └── OfflineBankPayment.jsx
│   │   │   ├── income/
│   │   │   │   ├── AddIncome.jsx
│   │   │   │   ├── SearchIncome.jsx
│   │   │   │   └── IncomeHead.jsx
│   │   │   ├── expenses/
│   │   │   │   ├── AddExpense.jsx
│   │   │   │   ├── SearchExpense.jsx
│   │   │   │   └── ExpenseHead.jsx
│   │   │   ├── academics/
│   │   │   │   ├── ClassTimetable.jsx
│   │   │   │   ├── TeachersTimetable.jsx
│   │   │   │   ├── AssignClassTeacher.jsx
│   │   │   │   ├── PromoteStudents.jsx
│   │   │   │   ├── SubjectGroup.jsx
│   │   │   │   ├── Subjects.jsx
│   │   │   │   ├── Classes.jsx
│   │   │   │   └── Sections.jsx
│   │   │   ├── hr/
│   │   │   │   ├── StaffDirectory.jsx
│   │   │   │   ├── StaffAttendance.jsx
│   │   │   │   ├── Payroll.jsx
│   │   │   │   ├── ApproveLeave.jsx
│   │   │   │   ├── ApplyLeave.jsx
│   │   │   │   ├── LeaveType.jsx
│   │   │   │   ├── TeachersRating.jsx
│   │   │   │   ├── Department.jsx
│   │   │   │   ├── Designation.jsx
│   │   │   │   └── DisabledStaff.jsx
│   │   │   ├── certificates/
│   │   │   │   ├── TransferCertificate.jsx
│   │   │   │   ├── StudentCertificate.jsx
│   │   │   │   ├── GenerateCertificate.jsx
│   │   │   │   ├── StudentIDCard.jsx
│   │   │   │   ├── GenerateIDCard.jsx
│   │   │   │   ├── StaffIDCard.jsx
│   │   │   │   └── GenerateStaffIDCard.jsx
│   │   │   ├── cms/
│   │   │   │   ├── Events.jsx
│   │   │   │   ├── Gallery.jsx
│   │   │   │   ├── News.jsx
│   │   │   │   ├── MediaManager.jsx
│   │   │   │   ├── Pages.jsx
│   │   │   │   ├── Menus.jsx
│   │   │   │   └── BannerImages.jsx
│   │   │   ├── reports/
│   │   │   │   ├── StudentReport.jsx
│   │   │   │   ├── FinanceReport.jsx
│   │   │   │   ├── AttendanceReport.jsx
│   │   │   │   ├── HRReport.jsx
│   │   │   │   ├── HomeworkReport.jsx
│   │   │   │   ├── AlumniReport.jsx
│   │   │   │   ├── UserLog.jsx
│   │   │   │   └── AuditTrail.jsx
│   │   │   └── settings/
│   │   │       └── OnlineAdmission.jsx
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useTable.js
│   │   │   └── useDebounce.js
│   │   ├── lib/                     # Utilities
│   │   │   ├── api.js               # Axios instance with interceptors
│   │   │   ├── utils.js             # shadcn utility (cn function)
│   │   │   ├── exportExcel.js       # SheetJS export helper
│   │   │   └── exportPDF.js         # React-PDF helper
│   │   ├── context/                 # React context
│   │   │   └── AuthContext.jsx      # Global auth state
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx        # All routes defined here
│   │   ├── styles/
│   │   │   └── utility.css          # Custom utility classes (NOT global.css)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                          # Express backend
│   ├── prisma/
│   │   ├── schema.prisma            # Full DB schema
│   │   └── seed.js                  # Initial seed data
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # Prisma client instance
│   │   │   ├── cloudinary.js        # Cloudinary config
│   │   │   └── mailer.js            # Nodemailer config
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification middleware
│   │   │   ├── role.js              # Role-based access middleware
│   │   │   ├── upload.js            # Multer config
│   │   │   └── errorHandler.js      # Global error handler
│   │   ├── routes/                  # One file per module
│   │   │   ├── auth.routes.js
│   │   │   ├── student.routes.js
│   │   │   ├── fees.routes.js
│   │   │   ├── income.routes.js
│   │   │   ├── expense.routes.js
│   │   │   ├── academics.routes.js
│   │   │   ├── hr.routes.js
│   │   │   ├── certificate.routes.js
│   │   │   ├── cms.routes.js
│   │   │   ├── report.routes.js
│   │   │   └── settings.routes.js
│   │   ├── controllers/             # Business logic, one per module
│   │   │   ├── auth.controller.js
│   │   │   ├── student.controller.js
│   │   │   ├── fees.controller.js
│   │   │   ├── income.controller.js
│   │   │   ├── expense.controller.js
│   │   │   ├── academics.controller.js
│   │   │   ├── hr.controller.js
│   │   │   ├── certificate.controller.js
│   │   │   ├── cms.controller.js
│   │   │   ├── report.controller.js
│   │   │   └── settings.controller.js
│   │   ├── services/                # Complex logic separated from controllers
│   │   │   ├── fees.service.js      # Fee calculation logic
│   │   │   ├── pdf.service.js       # PDF generation on server
│   │   │   ├── email.service.js     # Email sending logic
│   │   │   └── report.service.js    # Report aggregation queries
│   │   └── utils/
│   │       ├── ApiResponse.js       # Standard API response format
│   │       ├── ApiError.js          # Custom error class
│   │       └── asyncHandler.js      # Async try/catch wrapper
│   ├── app.js                       # Express app setup
│   ├── server.js                    # Entry point, starts server
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🗄️ Database Schema Overview (Prisma)

### Core Models (build in this order)

```
User (auth + roles)
  └── Role: ADMIN | TEACHER | ACCOUNTANT

AcademicSession
  └── current session like "2025-26"

Student
  ├── belongs to Class, Section, Category, House
  ├── has many FeePayments
  ├── has many Attendance
  └── has one Admission

Class
  └── has many Sections
      └── has many Students

Subject
  └── belongs to SubjectGroup

Staff
  ├── belongs to Department, Designation
  ├── has many Attendance
  ├── has many LeaveRequests
  └── has one Payroll

FeesGroup
  └── has many FeesType
      └── has many FeesMaster (assigned to classes)

FeePayment
  ├── belongs to Student
  └── belongs to FeesType

Income / Expense
  └── belongs to IncomeHead / ExpenseHead

Certificate / IDCard
  └── belongs to Student or Staff

CMSContent
  └── Events, News, Gallery, Pages, Banners

Report (generated dynamically from queries, not stored)

AuditLog
  └── every important action logged here
```

---

## 🔐 Auth & Roles

| Role | Access |
|---|---|
| **ADMIN** | Full access to everything |
| **TEACHER** | Academics, Attendance, Homework, own Timetable |
| **ACCOUNTANT** | Fees, Income, Expenses, Finance Reports |

- Auth uses **JWT** (access token, 7d expiry)
- Passwords hashed with **bcryptjs** (salt rounds: 10)
- Protected routes use `auth.js` middleware
- Role check uses `role.js` middleware
- Store token in **httpOnly cookie** (not localStorage)

---

## 🌐 API Design Rules

- Base URL: `/api/v1/`
- Every response follows this format:

```json
{
  "success": true,
  "message": "Students fetched successfully",
  "data": { },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 245
  }
}
```

- Errors follow:

```json
{
  "success": false,
  "message": "Student not found",
  "error": "NOT_FOUND"
}
```

- All list endpoints support: `?page=1&limit=10&search=john&sortBy=name&order=asc`
- Use `asyncHandler` wrapper on every controller to avoid try/catch repetition

---

## 📦 Key Features by Module

### Student Information
- CRUD for students with photo upload (Cloudinary)
- Admission form with all details
- Bulk delete, disable/enable students
- Student categories (General, SC, ST, etc.)
- Student house (Red, Blue, Green, Yellow)
- Search by name, class, roll number

### Fees Collection
- Assign fees group to class
- Collect fees with receipt generation (PDF)
- Offline bank payment recording
- Search payments by student/date/class
- Due fees list with reminder email
- Fees discount per student
- Carry forward unpaid fees to next session
- Quick fees for one-off payments

### Academics
- Class and section management
- Subject and subject group management
- Assign class teacher
- Timetable builder (class-wise and teacher-wise)
- Promote students to next class (bulk)

### Human Resource
- Staff directory with photo
- Daily attendance marking
- Payroll calculation and slip generation (PDF)
- Leave management (apply, approve, reject)
- Teacher rating system
- Department and designation management

### Certificates & ID Cards
- Custom certificate templates
- Generate and download as PDF
- ID card with photo, name, class, roll number
- Staff ID card generation

### Reports
- All reports exportable to **Excel (.xlsx)** and **PDF**
- Student report: list, admission-wise, class-wise
- Finance report: income vs expense, fee collection summary
- Attendance report: daily, monthly, student-wise
- HR report: staff attendance, payroll summary
- Audit trail: all admin actions logged

### Front CMS
- Manage school website content
- Events, news, gallery, banner images
- Static pages and navigation menus
- Media manager for file uploads

---

## ⚙️ Environment Variables

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### Server (`server/.env`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@neon-host/dbname?sslmode=require
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
CLIENT_URL=http://localhost:5173
```

---

## 🚀 Scalability Rules (Always Follow)

1. **Pagination always** — never fetch all records at once, always paginate
2. **Server-side search** — never filter on frontend for large datasets
3. **Prisma select** — never use `findMany()` without selecting only needed fields
4. **Indexes** — add DB indexes on frequently searched fields (studentId, classId, date)
5. **Separate services** — complex logic goes in `/services/`, not controllers
6. **Error handling** — always use `asyncHandler` + `errorHandler` middleware
7. **Rate limiting** — apply to all auth routes
8. **Audit logging** — log every create, update, delete in AuditLog table
9. **Soft delete** — never hard delete students or staff, use `isDisabled` flag
10. **Academic session scoping** — every query must be scoped to current academic session

---

## 🎨 UI/UX Rules

- Use **shadcn/ui** components as base — do not write raw form/table/dialog HTML
- All data tables use **TanStack Table** with column sorting, search, pagination
- All forms use **React Hook Form** + **Zod** validation
- Loading states on every async action
- Empty states when no data
- Confirm dialogs before delete actions
- Mobile responsive (admin panels are often used on tablets)
- Sidebar collapses on mobile
- Active route highlighted in sidebar
- Use **Sonner** for all success/error toasts

---

## 🏗️ Build Order (Phase by Phase)

### Phase 1 — Foundation (Week 1-2)
- [ ] Project setup (Vite + Express + Prisma + Neon)
- [ ] Auth system (login, JWT, roles, protected routes)
- [ ] Layout (sidebar, navbar, routing)
- [ ] Dashboard with placeholder stats

### Phase 2 — Core Student (Week 3-4)
- [ ] Student admission form
- [ ] Student list with search/filter/pagination
- [ ] Student details page
- [ ] Class, Section, Category, House management

### Phase 3 — Fees (Week 5-6)
- [ ] Fees group, type, master setup
- [ ] Collect fees + PDF receipt
- [ ] Due fees list
- [ ] Offline bank payments
- [ ] Fees discount + carry forward
- [ ] Fee reminder email

### Phase 4 — Academics & HR (Week 7-8)
- [ ] Subjects, subject groups
- [ ] Timetable builder
- [ ] Assign class teacher
- [ ] Promote students
- [ ] Staff directory
- [ ] Staff attendance + payroll

### Phase 5 — Reports & Export (Week 9-10)
- [ ] All report pages
- [ ] Excel export (SheetJS)
- [ ] PDF export
- [ ] Audit trail

### Phase 6 — Certificates & CMS (Week 11-12)
- [ ] Certificate generator (PDF)
- [ ] ID card generator (html2canvas)
- [ ] Front CMS (events, news, gallery)
- [ ] Online admission settings

### Phase 7 — Polish & Deploy (Week 13)
- [ ] Error boundaries
- [ ] Loading skeletons
- [ ] Mobile responsiveness audit
- [ ] Deploy client (Vercel)
- [ ] Deploy server (Railway or Render)
- [ ] Connect Neon production DB

---

## 🚢 Deployment

| Service | Platform |
|---|---|
| **Frontend** | Vercel (connect GitHub, auto-deploy) |
| **Backend** | Railway or Render (free tier) |
| **Database** | Neon (PostgreSQL, free tier) |
| **Images** | Cloudinary (free tier) |

---

## ❌ Things to Never Do

- Never write raw SQL — always use Prisma
- Never store JWT in localStorage — use httpOnly cookies
- Never hard delete students or staff — use soft delete
- Never fetch all records without pagination
- Never put business logic in routes — use controllers + services
- Never commit `.env` files
- Never use `console.log` in production — use proper logging
- Never skip error handling on async functions

---

## 📝 Notes for AI Agent

- Always refer to this file before starting any module
- Follow the folder structure exactly as defined above
- Every new file goes in its correct folder
- Reuse existing components — don't create duplicates
- Follow the API response format strictly
- Ask for clarification if a feature is ambiguous before implementing
- Write clean, readable JS — no TypeScript
- Comment complex logic
- Keep components small and focused (single responsibility)
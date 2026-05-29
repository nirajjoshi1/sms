# 🏫 School Management System

A comprehensive, full-stack school management system built with React, Node.js, Express, Prisma, and PostgreSQL. Manage students, staff, fees, academics, certificates, and more in one unified platform.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.2.6-blue.svg)

---

## ✨ Features

### 👨‍🎓 Student Management
- Complete student admission workflow
- Student directory with search, filter, and pagination
- Photo uploads via Cloudinary
- Student categories, houses, and classifications
- Bulk operations (disable/enable, promote)

### 💰 Fee Management
- Flexible fee structure (groups, types, masters)
- Fee collection with PDF receipts
- Due fee tracking with email reminders
- Fee discounts and carry-forward
- Offline bank payment recording

### 📚 Academics
- Class and section management
- Subject and subject group configuration
- Class teacher assignment
- Timetable builder (class-wise and teacher-wise)
- Bulk student promotion

### 👥 Human Resources
- Staff directory with complete profiles
- Daily attendance tracking
- Payroll calculation and slip generation
- Leave management system
- Department and designation hierarchy

### 📜 Certificates & ID Cards
- Custom certificate templates
- PDF generation and download
- Student and staff ID card creation
- Bulk ID card generation

### 📊 Reports & Analytics
- Comprehensive reporting across all modules
- Excel (.xlsx) export for all reports
- PDF export capabilities
- Financial reports (income vs expense)
- Attendance analytics
- Audit trail logging

### 🌐 Content Management
- School website content management
- Events, news, and gallery
- Banner image management
- Media manager for file uploads

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Component library
- **React Router v7** - Client-side routing
- **TanStack Table** - Advanced data tables
- **React Hook Form + Zod** - Form management and validation
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend
- **Node.js 20+** - Runtime environment
- **Express.js** - Web framework
- **Prisma ORM** - Database ORM and migrations
- **PostgreSQL (Neon)** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image storage
- **Nodemailer** - Email service
- **Helmet** - Security headers
- **Morgan** - HTTP logging

---

## 📋 Prerequisites

- Node.js 20+ and npm
- PostgreSQL database (or Neon account)
- Cloudinary account (for image uploads)
- Gmail account (for email notifications)

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

Create `.env` file (copy from `.env.example`):

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
JWT_SECRET=your_super_secret_key
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

Push database schema and seed data:

```bash
npm run db:push
npm run db:seed
```

Start the server:

```bash
npm run dev
```

Backend runs at: `http://localhost:5000`

### 3. Setup Frontend

```bash
cd client
npm install
```

Create `.env` file (copy from `.env.example`):

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

## 📁 Project Structure

```
school-management-system/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── layout/      # Layout components
│   │   │   ├── forms/       # Form components
│   │   │   └── shared/      # Shared components
│   │   ├── pages/           # Page components by module
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   ├── context/         # React context providers
│   │   └── routes/          # Route definitions
│   └── package.json
│
├── server/                   # Express backend
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.js          # Seed data
│   └── package.json
│
└── README.md
```

---

## 🔐 Authentication & Authorization

The system uses JWT-based authentication with role-based access control:

- **Admin**: Full access to all modules
- **Teacher**: Access to academics, attendance, and assignments
- **Accountant**: Access to fees, income, expenses, and financial reports

---

## 🔒 Security Features

- ✅ Helmet.js for security headers
- ✅ CORS with whitelist configuration
- ✅ Rate limiting on auth and API routes
- ✅ JWT with httpOnly cookies
- ✅ Password hashing with bcryptjs
- ✅ Input validation and sanitization
- ✅ SQL injection protection via Prisma ORM
- ✅ XSS protection
- ✅ Error boundary for React errors

---

## 📊 Database Schema

The database includes the following main models:

- User (authentication and roles)
- Student (student records)
- Staff (staff records)
- Class, Section (academic structure)
- Subject, SubjectGroup
- FeeGroup, FeeType, FeeMaster
- FeePayment (fee transactions)
- Income, Expense
- Attendance (student and staff)
- Certificate, IDCard
- AuditLog (activity tracking)

---

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

---

## 📦 Building for Production

### Backend

```bash
cd server
npm start
```

### Frontend

```bash
cd client
npm run build
npm run preview
```

The build output will be in `client/dist/`

---

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:

- Neon (PostgreSQL database)
- Railway/Render (backend)
- Vercel (frontend)
- Cloudinary (image storage)

---

## 🌍 Environment Variables

### Backend (`server/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | Secret key for JWT | Random 32+ characters |
| `JWT_EXPIRY` | Token expiration | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Your cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Your API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Your API secret |
| `SMTP_HOST` | Email SMTP host | `smtp.gmail.com` |
| `SMTP_PORT` | Email SMTP port | `587` |
| `SMTP_USER` | Email address | Your email |
| `SMTP_PASS` | Email app password | Gmail app password |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Frontend (`client/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api/v1` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Your cloud name |

---

## 📝 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
```
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

### Students
```
GET    /api/v1/students
POST   /api/v1/students
GET    /api/v1/students/:id
PUT    /api/v1/students/:id
DELETE /api/v1/students/:id
```

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🐛 Bug Reports

If you find a bug, please open an issue with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node version)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the amazing component library
- [Neon](https://neon.tech/) for serverless PostgreSQL
- [Cloudinary](https://cloudinary.com/) for image management
- [Vercel](https://vercel.com/) for frontend hosting

---

## 📞 Support

For support, email your.email@example.com or join our Discord server.

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Parent portal
- [ ] Online exam module
- [ ] Library management
- [ ] Transport management
- [ ] Hostel management
- [ ] Biometric attendance integration
- [ ] SMS notifications
- [ ] Multi-language support
- [ ] Dark mode

---

**⭐ If you find this project helpful, please give it a star!**

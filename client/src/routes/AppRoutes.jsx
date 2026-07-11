import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Login from '../pages/auth/Login';
import LandingPage from '../pages/public/LandingPage';
import Schools from '../pages/dashboard/Schools';
import Dashboard from '../pages/dashboard/Dashboard';
import MainLayout from '../components/layout/MainLayout';
import StudentList from '../pages/students/StudentList';
import StudentProfile from '../pages/students/StudentProfile';
import StudentAdmission from '../pages/students/StudentAdmission';
import StudentEdit from '../pages/students/StudentEdit';
import DisabledStudents from '../pages/students/DisabledStudents';
import StaffList from '../pages/staff/StaffList';
import StaffAdd from '../pages/staff/StaffAdd';
import StaffEdit from '../pages/staff/StaffEdit';
import Category from '../pages/students/Category';
import House from '../pages/students/House';
import Classes from '../pages/academics/Classes';
import Sections from '../pages/academics/Sections';
import Subjects from '../pages/academics/Subjects';
import SubjectGroup from '../pages/academics/SubjectGroup';
import AssignClassTeacher from '../pages/academics/AssignClassTeacher';
import ClassTimetable from '../pages/academics/ClassTimetable';
import TeachersTimetable from '../pages/academics/TeachersTimetable';
import PromoteStudents from '../pages/academics/PromoteStudents';
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import MySchedule from '../pages/teacher/MySchedule';
import MyClasses from '../pages/teacher/MyClasses';
import TakeAttendance from '../pages/teacher/TakeAttendance';
import AttendanceReport from '../pages/teacher/AttendanceReport';
import Homework from '../pages/teacher/Homework';
import MarksEntry from '../pages/teacher/MarksEntry';
import ClassOverview from '../pages/teacher/ClassOverview';

// HR imports
import StaffDirectory from '../pages/hr/StaffDirectory';
import DisabledStaff from '../pages/hr/DisabledStaff';
import StaffAttendance from '../pages/hr/StaffAttendance';
import Payroll from '../pages/hr/Payroll';
import ApplyLeave from '../pages/hr/ApplyLeave';
import ApproveLeave from '../pages/hr/ApproveLeave';
import LeaveType from '../pages/hr/LeaveType';
import TeachersRating from '../pages/hr/TeachersRating';
import Department from '../pages/hr/Department';
import Designation from '../pages/hr/Designation';

// Fees imports
import CollectFees from '../pages/fees/CollectFees';
import SearchFees from '../pages/fees/SearchFees';
import DueFees from '../pages/fees/DueFees';
import FeesMaster from '../pages/fees/FeesMaster';
import FeesGroup from '../pages/fees/FeesGroup';
import FeesType from '../pages/fees/FeesType';
import FeesDiscount from '../pages/fees/FeesDiscount';
import FeesCarryForward from '../pages/fees/FeesCarryForward';
import FeesReminder from '../pages/fees/FeesReminder';
import OfflineBankPayment from '../pages/fees/OfflineBankPayment';

// Income imports
import IncomeHead from '../pages/income/IncomeHead';
import AddIncome from '../pages/income/AddIncome';
import SearchIncome from '../pages/income/SearchIncome';

// Expense imports
import ExpenseHead from '../pages/expenses/ExpenseHead';
import AddExpense from '../pages/expenses/AddExpense';
import SearchExpense from '../pages/expenses/SearchExpense';

// Certificate imports
import StudentCertificate from '../pages/certificates/StudentCertificate';
import GenerateCertificate from '../pages/certificates/GenerateCertificate';
import TransferCertificate from '../pages/certificates/TransferCertificate';
import StudentIDCard from '../pages/certificates/StudentIDCard';
import GenerateIDCard from '../pages/certificates/GenerateIDCard';
import StaffIDCard from '../pages/certificates/StaffIDCard';
import GenerateStaffIDCard from '../pages/certificates/GenerateStaffIDCard';

// CMS imports
import Events from '../pages/cms/Events';
import Gallery from '../pages/cms/Gallery';
import News from '../pages/cms/News';
import MediaManager from '../pages/cms/MediaManager';
import Pages from '../pages/cms/Pages';
import Menus from '../pages/cms/Menus';
import BannerImages from '../pages/cms/BannerImages';

// Settings imports
import GeneralSetting from '../pages/settings/GeneralSetting';
import SessionSetting from '../pages/settings/SessionSetting';
import NotificationSetting from '../pages/settings/NotificationSetting';
import SmsSetting from '../pages/settings/SmsSetting';
import EmailSetting from '../pages/settings/EmailSetting';
import PaymentSetting from '../pages/settings/PaymentSetting';
import PrintSetting from '../pages/settings/PrintSetting';
import BackupSetting from '../pages/settings/BackupSetting';

const Unauthorized = () => (
  <div className="flex items-center justify-center h-screen bg-gray-950">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-red-400">403</h1>
      <p className="text-gray-400 mt-2">You don't have permission to access this page.</p>
    </div>
  </div>
);

const AuthLoadingScreen = () => (
  <div className="flex items-center justify-center h-screen bg-background">
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <div className="w-9 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-medium">Verifying your session...</p>
    </div>
  </div>
);

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <AuthLoadingScreen />;

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Landing page - shown to unauthenticated visitors */}
      <Route
        path="/home"
        element={<LandingPage />}
      />

      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected routes - authenticated users go to dashboard at / */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          ) : (
            <LandingPage />
          )
        }
      >
        <Route index element={isAuthenticated ? <Dashboard /> : null} />

        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST']} />}>
          <Route path="students" element={<StudentList />} />
          <Route path="students/:id" element={<StudentProfile />} />
          <Route path="students/admission" element={<StudentAdmission />} />
          <Route path="students/edit/:id" element={<StudentEdit />} />
          <Route path="students/disabled" element={<DisabledStudents />} />
          <Route path="students/category" element={<Category />} />
          <Route path="students/house" element={<House />} />
        </Route>

        {/* Staff Routes */}
        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} />}>
          <Route path="staff" element={<StaffList />} />
          <Route path="staff/add" element={<StaffAdd />} />
          <Route path="staff/edit/:id" element={<StaffEdit />} />
        </Route>

        {/* Academics Routes */}
        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} />}>
          <Route path="academics/class" element={<Classes />} />
          <Route path="academics/sections" element={<Sections />} />
          <Route path="academics/subjects" element={<Subjects />} />
          <Route path="academics/subject-group" element={<SubjectGroup />} />
          <Route path="academics/assign-teacher" element={<AssignClassTeacher />} />
          <Route path="academics/timetable/class" element={<ClassTimetable />} />
          <Route path="academics/timetable/teacher" element={<TeachersTimetable />} />
          <Route path="academics/promote" element={<PromoteStudents />} />
        </Route>

        {/* HR Routes */}
        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']} />}>
          <Route path="hr/staff-directory" element={<StaffDirectory />} />
          <Route path="hr/disabled-staff" element={<DisabledStaff />} />
          <Route path="hr/attendance" element={<StaffAttendance />} />
          <Route path="hr/payroll" element={<Payroll />} />
          <Route path="hr/apply-leave" element={<ApplyLeave />} />
          <Route path="hr/approve-leave" element={<ApproveLeave />} />
          <Route path="hr/leave-type" element={<LeaveType />} />
          <Route path="hr/teachers-rating" element={<TeachersRating />} />
          <Route path="hr/department" element={<Department />} />
          <Route path="hr/designation" element={<Designation />} />
        </Route>

        {/* Fees Routes */}
        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'RECEPTIONIST']} />}>
          <Route path="fees/collect" element={<CollectFees />} />
          <Route path="fees/search" element={<SearchFees />} />
          <Route path="fees/due" element={<DueFees />} />
          <Route path="fees/master" element={<FeesMaster />} />
          <Route path="fees/group" element={<FeesGroup />} />
          <Route path="fees/type" element={<FeesType />} />
          <Route path="fees/discount" element={<FeesDiscount />} />
          <Route path="fees/carry-forward" element={<FeesCarryForward />} />
          <Route path="fees/reminder" element={<FeesReminder />} />
          <Route path="fees/offline-payment" element={<OfflineBankPayment />} />
        </Route>

        {/* Income Routes */}
        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']} />}>
          <Route path="income/head" element={<IncomeHead />} />
          <Route path="income/add" element={<AddIncome />} />
          <Route path="income/edit/:id" element={<AddIncome />} />
          <Route path="income/search" element={<SearchIncome />} />
        </Route>

        {/* Expense Routes */}
        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']} />}>
          <Route path="expenses/head" element={<ExpenseHead />} />
          <Route path="expenses/add" element={<AddExpense />} />
          <Route path="expenses/edit/:id" element={<AddExpense />} />
          <Route path="expenses/search" element={<SearchExpense />} />
        </Route>

        {/* Certificate Routes */}
        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} />}>
          <Route path="certificates/student-certificate" element={<StudentCertificate />} />
          <Route path="certificates/generate-certificate" element={<GenerateCertificate />} />
          <Route path="certificates/transfer-certificate" element={<TransferCertificate />} />
          <Route path="certificates/student-id-card" element={<StudentIDCard />} />
          <Route path="certificates/generate-id-card" element={<GenerateIDCard />} />
          <Route path="certificates/staff-id-card" element={<StaffIDCard />} />
          <Route path="certificates/generate-staff-id-card" element={<GenerateStaffIDCard />} />
        </Route>

        {/* CMS Routes */}
        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} />}>
          <Route path="cms/event" element={<Events />} />
          <Route path="cms/gallery" element={<Gallery />} />
          <Route path="cms/news" element={<News />} />
          <Route path="cms/media" element={<MediaManager />} />
          <Route path="cms/pages" element={<Pages />} />
          <Route path="cms/menus" element={<Menus />} />
          <Route path="cms/banners" element={<BannerImages />} />
        </Route>

        {/* Settings Routes */}
        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} />}>
          <Route path="settings/general" element={<GeneralSetting />} />
          <Route path="settings/session" element={<SessionSetting />} />
          <Route path="settings/notification" element={<NotificationSetting />} />
          <Route path="settings/sms" element={<SmsSetting />} />
          <Route path="settings/email" element={<EmailSetting />} />
          <Route path="settings/payment" element={<PaymentSetting />} />
          <Route path="settings/print" element={<PrintSetting />} />
          <Route path="settings/backup" element={<BackupSetting />} />
        </Route>

        {/* Teacher Portal Routes */}
        <Route path="teacher/dashboard" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="teacher/schedule" element={<ProtectedRoute allowedRoles={['TEACHER']}><MySchedule /></ProtectedRoute>} />
        <Route path="teacher/classes" element={<ProtectedRoute allowedRoles={['TEACHER']}><MyClasses /></ProtectedRoute>} />
        <Route path="teacher/attendance" element={<ProtectedRoute allowedRoles={['TEACHER']}><TakeAttendance /></ProtectedRoute>} />
        <Route path="teacher/attendance/report" element={<ProtectedRoute allowedRoles={['TEACHER']}><AttendanceReport /></ProtectedRoute>} />
        <Route path="teacher/homework" element={<ProtectedRoute allowedRoles={['TEACHER']}><Homework /></ProtectedRoute>} />
        <Route path="teacher/marks" element={<ProtectedRoute allowedRoles={['TEACHER']}><MarksEntry /></ProtectedRoute>} />
        <Route path="teacher/class-overview" element={<ProtectedRoute allowedRoles={['TEACHER']}><ClassOverview /></ProtectedRoute>} />

        {/* Super Admin Only Routes */}
        <Route 
          path="schools" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <Schools />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

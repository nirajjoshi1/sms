import React from 'react';
import { 
  Building2, 
  UserSquare2, 
  Wallet, 
  DollarSign, 
  Receipt, 
  GraduationCap, 
  Users2, 
  FileBadge, 
  Globe, 
  BarChart3, 
  Settings2,
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  PenLine,
  Calendar,
  Award
} from 'lucide-react';

export const NAVIGATION_ITEMS = [
  {
    label: "Schools",
    icon: <Building2 />,
    to: "/schools",
    roles: ["SUPER_ADMIN"]
  },
  // ─── Teacher Portal (TEACHER role only) ───
  {
    label: "My Dashboard",
    icon: <LayoutDashboard />,
    to: "/teacher/dashboard",
    roles: ["TEACHER"]
  },
  {
    label: "Teacher Portal",
    icon: <BookOpen />,
    roles: ["TEACHER"],
    items: [
      { label: 'My Schedule', to: '/teacher/schedule' },
      { label: 'My Classes', to: '/teacher/classes' },
      { label: 'Take Attendance', to: '/teacher/attendance' },
      { label: 'Attendance Report', to: '/teacher/attendance/report' },
      { label: 'Homework', to: '/teacher/homework' },
      { label: 'Marks Entry', to: '/teacher/marks' },
      { label: 'Class Overview', to: '/teacher/class-overview' },
    ]
  },
  {
    label: "Student Information",
    icon: <UserSquare2 />,
    roles: ["ADMIN"],
    items: [
      { label: 'Student Details', to: '/students' },
      { label: 'Student Admission', to: '/students/admission' },
      { label: 'Disabled Students', to: '/students/disabled' },
      { label: 'Bulk Delete', to: '/students/bulk-delete' },
      { label: 'Student Categories', to: '/students/category' },
      { label: 'Student House', to: '/students/house' },
      { label: 'Disable Reason', to: '/students/disable-reason' },
    ]
  },
  {
    label: "Fees Collection",
    icon: <Wallet />,
    roles: ["ADMIN"],
    items: [
      { label: 'Collect Fees', to: '/fees/collect' },
      { label: 'Search Fees Payment', to: '/fees/search' },
      { label: 'Search Due Fees', to: '/fees/due' },
      { label: 'Fees Master', to: '/fees/master' },
      { label: 'Fees Group', to: '/fees/group' },
      { label: 'Fees Type', to: '/fees/type' },
      { label: 'Fees Discount', to: '/fees/discount' },
      { label: 'Fees Carry Forward', to: '/fees/carry-forward' },
      { label: 'Fees Reminder', to: '/fees/reminder' },
    ]
  },
  {
    label: "Income",
    icon: <DollarSign />,
    roles: ["ADMIN"],
    items: [
      { label: 'Add Income', to: '/income/add' },
      { label: 'Search Income', to: '/income/search' },
      { label: 'Income Head', to: '/income/head' },
    ]
  },
  {
    label: "Expenses",
    icon: <Receipt />,
    roles: ["ADMIN"],
    items: [
      { label: 'Add Expense', to: '/expenses/add' },
      { label: 'Search Expense', to: '/expenses/search' },
      { label: 'Expense Head', to: '/expenses/head' },
    ]
  },
  {
    label: "Academics",
    icon: <GraduationCap />,
    roles: ["ADMIN"],
    items: [
      { label: 'Class Timetable', to: '/academics/timetable/class' },
      { label: 'Teachers Timetable', to: '/academics/timetable/teacher' },
      { label: 'Assign Class Teacher', to: '/academics/assign-teacher' },
      { label: 'Promote Students', to: '/academics/promote' },
      { label: 'Subject Group', to: '/academics/subject-group' },
      { label: 'Subjects', to: '/academics/subjects' },
      { label: 'Class', to: '/academics/class' },
      { label: 'Sections', to: '/academics/sections' },
    ]
  },
  {
    label: "Human Resource",
    icon: <Users2 />,
    roles: ["ADMIN"],
    items: [
      { label: 'Staff Directory', to: '/hr/staff-directory' },
      { label: 'Add Staff', to: '/staff/add' },
      { label: 'Disabled Staff', to: '/hr/disabled-staff' },
      { label: 'Staff Attendance', to: '/hr/attendance' },
      { label: 'Payroll', to: '/hr/payroll' },
      { label: 'Apply Leave', to: '/hr/apply-leave' },
      { label: 'Approve Leave', to: '/hr/approve-leave' },
      { label: 'Leave Type', to: '/hr/leave-type' },
      { label: 'Teachers Rating', to: '/hr/teachers-rating' },
      { label: 'Department', to: '/hr/department' },
      { label: 'Designation', to: '/hr/designation' },
    ]
  },
  {
    label: "Certificate",
    icon: <FileBadge />,
    roles: ["ADMIN"],
    items: [
      { label: 'Student Certificate', to: '/certificates/student-certificate' },
      { label: 'Generate Certificate', to: '/certificates/generate-certificate' },
      { label: 'Transfer Certificate', to: '/certificates/transfer-certificate' },
      { label: 'Student ID Card', to: '/certificates/student-id-card' },
      { label: 'Generate ID Card', to: '/certificates/generate-id-card' },
      { label: 'Staff ID Card', to: '/certificates/staff-id-card' },
      { label: 'Generate Staff ID', to: '/certificates/generate-staff-id-card' },
    ]
  },
  {
    label: "Front CMS",
    icon: <Globe />,
    roles: ["ADMIN"],
    items: [
      { label: 'Event', to: '/cms/event' },
      { label: 'Gallery', to: '/cms/gallery' },
      { label: 'News', to: '/cms/news' },
      { label: 'Media Manager', to: '/cms/media' },
      { label: 'Pages', to: '/cms/pages' },
      { label: 'Menus', to: '/cms/menus' },
      { label: 'Banner Images', to: '/cms/banners' },
    ]
  },
  {
    label: "Reports",
    icon: <BarChart3 />,
    roles: ["ADMIN"],
    items: [
      { label: 'Student Report', to: '/reports/student' },
      { label: 'Finance Report', to: '/reports/finance' },
      { label: 'Attendance Report', to: '/reports/attendance' },
      { label: 'Examination Report', to: '/reports/exam' },
      { label: 'Staff Report', to: '/reports/staff' },
    ]
  },
  {
    label: "System Setting",
    icon: <Settings2 />,
    roles: ["ADMIN"],
    items: [
      { label: 'General Setting', to: '/settings/general' },
      { label: 'Session Setting', to: '/settings/session' },
      { label: 'Notification Setting', to: '/settings/notification' },
      { label: 'SMS Setting', to: '/settings/sms' },
      { label: 'Email Setting', to: '/settings/email' },
      { label: 'Payment Methods', to: '/settings/payment' },
      { label: 'Print Header Footer', to: '/settings/print' },
      { label: 'Backup / Restore', to: '/settings/backup' },
    ]
  }
];

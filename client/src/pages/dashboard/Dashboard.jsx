import React from 'react';
import { useAuth } from '../../context/AuthContext';
import SuperAdminDashboard from './roles/SuperAdminDashboard';
import AdminDashboard from './roles/AdminDashboard';
import TeacherDashboard from './roles/TeacherDashboard';
import AccountantDashboard from './roles/AccountantDashboard';
import ReceptionistDashboard from './roles/ReceptionistDashboard';
import { ShieldAlert } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'SUPER_ADMIN':
      return <SuperAdminDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    case 'TEACHER':
      return <TeacherDashboard />;
    case 'ACCOUNTANT':
      return <AccountantDashboard />;
    case 'RECEPTIONIST':
      return <ReceptionistDashboard />;
    default:
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-5">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-lg font-black text-foreground">Welcome, {user?.name}</h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Your role (<span className="font-bold text-primary">{user?.role}</span>) dashboard is being configured. Please contact your administrator.
          </p>
        </div>
      );
  }
};

export default Dashboard;

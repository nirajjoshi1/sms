import React from 'react';
import { useAuth } from '../../context/AuthContext';
import SuperAdminDashboard from './roles/SuperAdminDashboard';
import AdminDashboard from './roles/AdminDashboard';
import TeacherDashboard from './roles/TeacherDashboard';
import { ShieldAlert } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  // Switch between different dashboard components based on user role
  switch (user?.role) {
    case 'SUPER_ADMIN':
      return <SuperAdminDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    case 'TEACHER':
      return <TeacherDashboard />;
    default:
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-6">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Module Under Construction</h1>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Your role (<span className="font-bold text-indigo-600">{user?.role}</span>) dashboard is currently being optimized. Please check back later.
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg text-left">
            <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
              <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Status</p>
              <p className="text-sm text-gray-600 italic">API connected, awaiting layout...</p>
            </div>
            <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
              <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Features</p>
              <p className="text-sm text-gray-600 italic">Role-specific analytics pending.</p>
            </div>
          </div>
        </div>
      );
  }
};

export default Dashboard;

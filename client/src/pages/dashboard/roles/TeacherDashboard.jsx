import React from 'react';
import { BookOpen, CheckSquare, Users, Clock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const TeacherDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {user?.school?.name || 'Teacher Dashboard'}
        </h1>
        <p className="text-gray-500 text-sm">Welcome back, {user?.name}. Here is your schedule for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'My Classes', value: '4', icon: <Users />, color: 'bg-indigo-600' },
          { label: 'Total Subjects', value: '2', icon: <BookOpen />, color: 'bg-violet-600' },
          { label: 'Pending Marks', value: '15', icon: <CheckSquare />, color: 'bg-amber-600' },
          { label: 'Periods Today', value: '5', icon: <Clock />, color: 'bg-teal-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg`}>
              {stat.icon}
            </div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Today's Timetable</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center font-bold text-gray-400">
                  {item+8}:00
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Mathematics - Class 10A</p>
                  <p className="text-xs text-gray-500">Room 102 • Topic: Algebra</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Current</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;

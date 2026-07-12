import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, UserPlus, Bell, Search, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/api';
import { toast } from 'sonner';

const ReceptionistDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/dashboard');
        const d = res.data.data;
        setStats(d?.stats || {});
        setRecentStudents((d?.recentStudents || []).slice(0, 6));
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      label: 'Active Students',
      value: stats?.activeStudents ?? '—',
      icon: <GraduationCap className="w-5 h-5" />,
      color: 'bg-indigo-500',
    },
    {
      label: 'Total Classes',
      value: stats?.totalClasses ?? '—',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-violet-500',
    },
    {
      label: 'New This Month',
      value: '—',
      icon: <UserPlus className="w-5 h-5" />,
      color: 'bg-emerald-500',
    },
    {
      label: 'Notifications',
      value: '—',
      icon: <Bell className="w-5 h-5" />,
      color: 'bg-amber-500',
    },
  ];

  const quickActions = [
    { label: 'New Admission', icon: <UserPlus className="w-4 h-4" />, path: '/students/admission', color: 'bg-indigo-500' },
    { label: 'Search Student', icon: <Search className="w-4 h-4" />, path: '/students', color: 'bg-violet-500' },
    { label: 'Collect Fees', icon: <AlertCircle className="w-4 h-4" />, path: '/fees/collect', color: 'bg-emerald-500' },
    { label: 'Fee Due List', icon: <ArrowRight className="w-4 h-4" />, path: '/fees/due', color: 'bg-amber-500' },
  ];

  return (
    <div className="p-4 space-y-5 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="border-b border-border pb-3">
        <h1 className="text-lg font-black text-foreground tracking-tight">
          Reception Dashboard
        </h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">
          Welcome, {user?.name} • {user?.school?.name} Front Desk Overview
        </p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
              <div className="h-8 w-8 bg-muted rounded-lg mb-3" />
              <div className="h-3 bg-muted rounded w-3/4 mb-2" />
              <div className="h-7 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all">
              <div className={`w-9 h-9 ${s.color} rounded-xl flex items-center justify-center text-white mb-3 shadow-sm`}>
                {s.icon}
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-foreground mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-xs font-bold text-foreground">Quick Actions</h3>
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">
            {quickActions.map((a, i) => (
              <button
                key={i}
                onClick={() => navigate(a.path)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-accent/20 transition-all group"
              >
                <div className={`w-8 h-8 ${a.color} rounded-lg flex items-center justify-center text-white`}>
                  {a.icon}
                </div>
                <span className="text-[10px] font-bold text-center text-foreground">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Admissions */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold text-foreground">Recent Admissions</h3>
            </div>
            <button onClick={() => navigate('/students')} className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-accent/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="p-3">Student</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Section</th>
                  <th className="p-3">Admitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {loading ? (
                  <tr><td colSpan="4" className="p-8 text-center">
                    <div className="animate-spin h-5 w-5 border-b-2 border-primary rounded-full mx-auto" />
                  </td></tr>
                ) : recentStudents.length === 0 ? (
                  <tr><td colSpan="4" className="p-6 text-center text-muted-foreground">No recent admissions</td></tr>
                ) : (
                  recentStudents.map((s, i) => (
                    <tr key={i} className="hover:bg-accent/20 transition-all">
                      <td className="p-3 font-semibold">{s.firstName} {s.lastName}</td>
                      <td className="p-3 text-muted-foreground">{s.Class?.name || '—'}</td>
                      <td className="p-3 text-muted-foreground">{s.Section?.name || '—'}</td>
                      <td className="p-3 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;

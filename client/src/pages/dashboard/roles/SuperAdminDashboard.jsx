import React, { useState, useEffect } from 'react';
import { Building2, Users, CheckCircle2, ShieldCheck, ArrowUpRight, MoreHorizontal, Activity, Bell } from 'lucide-react';
import api from '../../../lib/api';

const SuperAdminDashboard = () => {
  const [schools, setSchools] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schoolsRes, notifRes] = await Promise.allSettled([
          api.get('/schools'),
          api.get('/notifications')
        ]);
        if (schoolsRes.status === 'fulfilled') setSchools(schoolsRes.value.data.data || []);
        if (notifRes.status === 'fulfilled') setNotifications((notifRes.value.data.data || []).slice(0, 5));
      } catch (err) {
        console.error('SuperAdmin dashboard fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeCount = schools.filter(s => s.isActive).length;
  const healthPct = schools.length > 0 ? Math.round((activeCount / schools.length) * 100) : 100;

  const stats = [
    {
      label: 'Total Schools',
      value: loading ? '...' : schools.length.toLocaleString(),
      change: `${activeCount} Active`,
      icon: <Building2 />,
      color: 'text-primary'
    },
    {
      label: 'Active Tenants',
      value: loading ? '...' : activeCount.toLocaleString(),
      change: 'Active',
      icon: <CheckCircle2 />,
      color: 'text-primary'
    },
    {
      label: 'Total Admin Users',
      value: loading ? '...' : schools.reduce((acc, curr) => acc + (curr.User ? curr.User.length : 0), 0).toLocaleString(),
      change: 'Accounts',
      icon: <Users />,
      color: 'text-primary'
    },
    {
      label: 'System Health',
      value: loading ? '...' : `${healthPct}%`,
      change: healthPct === 100 ? 'All Active' : `${schools.length - activeCount} Inactive`,
      icon: <ShieldCheck />,
      color: 'text-primary'
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Studio Admin Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">System-wide performance and multi-tenant analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={stat.color}>{stat.icon}</div>
              <button className="text-muted-foreground hover:text-foreground transition">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-foreground">{stat.value}</h3>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 bg-primary text-primary-foreground`}>
                  <ArrowUpRight className="w-2.5 h-2.5" />
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              Recent School Registrations
            </h3>
            <button className="text-xs text-muted-foreground hover:text-foreground transition font-bold uppercase">View all</button>
          </div>
          <div className="space-y-4">
            {loading ? (
                <div className="text-center p-4 text-muted-foreground">Loading...</div>
            ) : schools.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground font-bold">No schools registered yet.</div>
            ) : (
                schools.slice(0, 5).map((school, i) => (
                <div key={school.id} className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-xl hover:border-primary/50 transition group cursor-pointer">
                    <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center font-black text-primary border border-primary/20 transition">
                        {school.name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-foreground text-sm">{school.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">Registered {new Date(school.createdAt).toLocaleDateString()} • {school.address || 'No Address'}</p>
                    </div>
                    </div>
                    <div className="text-right">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${
                        school.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                        {school.isActive ? 'Active' : 'Inactive'}
                    </span>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-bold text-foreground">System Notifications</h3>
          </div>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-6">
                <Bell className="w-6 h-6 mx-auto mb-2 text-muted-foreground opacity-30" />
                <p className="text-xs text-muted-foreground font-bold">No notifications</p>
              </div>
            ) : (
              notifications.map((n, i) => (
                <div key={n.id || i} className={`p-3 rounded-xl border ${
                  n.isRead ? 'bg-muted/20 border-border' : 'bg-primary/10 border-primary/20'
                }`}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1 ${
                    n.isRead ? 'text-muted-foreground' : 'text-primary'
                  }">{n.type || 'System'}</p>
                  <p className="text-xs text-foreground font-medium">{n.message || n.title}</p>
                  <p className="text-[9px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

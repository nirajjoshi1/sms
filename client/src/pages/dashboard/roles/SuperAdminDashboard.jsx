import React from 'react';
import { Building2, Users, GraduationCap, ShieldCheck, ArrowUpRight, MoreHorizontal, Activity } from 'lucide-react';
import { useDashboardStats } from '../../../hooks/useDashboardStats';

const SuperAdminDashboard = () => {
  const { statsData, loading } = useDashboardStats();

  const stats = [
    {
      label: 'Total Students',
      value: loading ? '...' : statsData?.totalStudents?.toLocaleString() || '0',
      change: loading ? '...' : statsData?.studentGrowth || '+0%',
      trend: 'up',
      icon: <GraduationCap />,
      color: 'text-primary'
    },
    {
      label: 'Total Users',
      value: loading ? '...' : statsData?.totalUsers?.toLocaleString() || '0',
      change: 'Active',
      trend: 'up',
      icon: <Users />,
      color: 'text-primary'
    },
    {
      label: 'Classes & Sections',
      value: loading ? '...' : `${statsData?.totalClasses || 0}/${statsData?.totalSections || 0}`,
      change: 'Academic',
      trend: 'neutral',
      icon: <Building2 />,
      color: 'text-primary'
    },
    {
      label: 'System Health',
      value: '100%',
      change: 'Stable',
      trend: 'neutral',
      icon: <ShieldCheck />,
      color: 'text-primary'
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Super Admin Overview</h1>
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
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-card-foreground">{stat.value}</h3>
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
            <h3 className="font-bold text-card-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              Recent School Registrations
            </h3>
            <button className="text-xs text-muted-foreground hover:text-foreground transition">View all</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 bg-muted border border-border rounded-xl hover:border-ring transition group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center font-bold text-foreground border border-border group-hover:border-primary transition">
                    S{item}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">Springfield High School</p>
                    <p className="text-xs text-muted-foreground">Registered 2 hours ago • New York, US</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Active</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-card-foreground mb-4">System Notifications</h3>
          <div className="space-y-4">
            <div className="p-4 bg-accent/50 border border-border rounded-xl">
              <p className="text-xs font-bold text-primary uppercase mb-1">Alert</p>
              <p className="text-sm text-muted-foreground">New school registration request pending approval.</p>
            </div>
            <div className="p-4 bg-accent/50 border border-border rounded-xl">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Update</p>
              <p className="text-sm text-muted-foreground">System backup completed successfully at 04:00 AM.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

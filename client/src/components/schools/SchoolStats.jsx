import React from 'react';
import { Building2, CheckCircle2, ShieldAlert } from 'lucide-react';

const SchoolStats = ({ schools }) => {
  const stats = [
    {
      label: 'Total Schools',
      value: schools.length,
      icon: <Building2 className="w-6 h-6" />,
      bg: 'bg-primary/10 border border-primary/20',
      text: 'text-primary'
    },
    {
      label: 'Active Schools',
      value: schools.filter(s => s.isActive).length,
      icon: <CheckCircle2 className="w-6 h-6" />,
      bg: 'bg-emerald-500/10 border border-emerald-500/20',
      text: 'text-emerald-500'
    },
    {
      label: 'Pending Actions',
      value: 0,
      icon: <ShieldAlert className="w-6 h-6" />,
      bg: 'bg-amber-500/10 border border-amber-500/20',
      text: 'text-amber-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center gap-4 transition-all hover:border-primary/20">
          <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center ${stat.text}`}>
            {stat.icon}
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-foreground mt-1">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SchoolStats;

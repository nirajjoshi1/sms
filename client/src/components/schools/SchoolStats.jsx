import React from 'react';
import { Building2, CheckCircle2, ShieldAlert } from 'lucide-react';

const SchoolStats = ({ schools }) => {
  const stats = [
    {
      label: 'Total Schools',
      value: schools.length,
      icon: <Building2 className="w-6 h-6" />,
      bg: 'bg-indigo-50',
      text: 'text-indigo-600'
    },
    {
      label: 'Active Schools',
      value: schools.filter(s => s.isActive).length,
      icon: <CheckCircle2 className="w-6 h-6" />,
      bg: 'bg-green-50',
      text: 'text-green-600'
    },
    {
      label: 'Pending Actions',
      value: 0,
      icon: <ShieldAlert className="w-6 h-6" />,
      bg: 'bg-amber-50',
      text: 'text-amber-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center ${stat.text}`}>
            {stat.icon}
          </div>
          <div>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SchoolStats;

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';
import { Users, UserCheck, UserX, BarChart2 } from 'lucide-react';

const StudentReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/student');
      setData(response.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch student report'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-black text-foreground tracking-tight">Student Academic Report</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Enrollment & Demographic Breakdowns</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Total Students</p>
            <h3 className="text-xl font-bold">{data.total}</h3>
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-500/10 text-green-500">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Active Students</p>
            <h3 className="text-xl font-bold text-green-500">{data.active}</h3>
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-red-500/10 text-red-500">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Disabled / Alumni</p>
            <h3 className="text-xl font-bold text-red-500">{data.disabled}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Class Distribution */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold">Class-Wise Active Students</h2>
          </div>
          <div className="space-y-3">
            {data.byClass.length === 0 ? (
              <p className="text-xs text-muted-foreground">No class data found.</p>
            ) : (
              data.byClass.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-muted-foreground">{c.count} students</span>
                  </div>
                  <div className="w-full bg-accent rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full"
                      style={{ width: `${data.active > 0 ? (c.count / data.active) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Demographic & Category Distributions */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Users className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold">Gender Wise Breakdown</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {data.byGender.map((g, i) => (
                <div key={i} className="p-3 bg-accent/40 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground capitalize font-bold">{g.gender}</p>
                  <p className="text-lg font-black mt-1">{g.count}</p>
                </div>
              ))}
              {data.byGender.length === 0 && (
                <p className="text-xs text-muted-foreground col-span-2 text-center">No gender data.</p>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold">Category Wise Breakdown</h2>
            </div>
            <div className="space-y-3">
              {data.byCategory.length === 0 ? (
                <p className="text-xs text-muted-foreground">No category data found.</p>
              ) : (
                data.byCategory.map((cat, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="font-semibold">{cat.name}</span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary font-bold rounded">{cat.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReport;

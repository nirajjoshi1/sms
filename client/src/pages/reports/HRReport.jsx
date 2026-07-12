import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';
import { Users, FileText, CheckSquare, Briefcase } from 'lucide-react';

const HRReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/hr');
      setData(response.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch HR report'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-black text-foreground tracking-tight">Staffing & Human Resources Report</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Staff Allocations and Leave Statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Department & Leave */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold">Department Wise Distribution</h2>
            </div>
            <div className="space-y-3">
              {data.byDepartment.length === 0 ? (
                <p className="text-xs text-muted-foreground">No department data found.</p>
              ) : (
                data.byDepartment.map((d, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">{d.name}</span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary font-bold rounded-lg">{d.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <FileText className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold">Leave Requests Summary</h2>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-yellow-500/10 p-3 rounded-lg text-yellow-500">
                <p className="text-[10px] uppercase font-bold">Pending</p>
                <p className="text-lg font-black mt-1">{data.leaveSummary.Pending}</p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg text-green-500">
                <p className="text-[10px] uppercase font-bold">Approved</p>
                <p className="text-lg font-black mt-1">{data.leaveSummary.Approved}</p>
              </div>
              <div className="bg-red-500/10 p-3 rounded-lg text-red-500">
                <p className="text-[10px] uppercase font-bold">Rejected</p>
                <p className="text-lg font-black mt-1">{data.leaveSummary.Rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Designation */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Users className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold">Designation Wise Distribution</h2>
          </div>
          <div className="space-y-3">
            {data.byDesignation.length === 0 ? (
              <p className="text-xs text-muted-foreground">No designation data found.</p>
            ) : (
              data.byDesignation.map((d, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">{d.name}</span>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary font-bold rounded-lg">{d.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRReport;

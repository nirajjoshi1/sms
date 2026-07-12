import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';
import { Calendar, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';

const AttendanceReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/attendance', { params: filters });
      setData(response.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch attendance report'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const calculateRate = (stats) => {
    if (!stats || stats.total === 0) return '0%';
    const rate = ((stats.Present + stats.Late + stats.HalfDay * 0.5) / stats.total) * 100;
    return `${rate.toFixed(1)}%`;
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-3">
        <div>
          <h1 className="text-xl font-black text-foreground tracking-tight">Attendance Report</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Student & Staff Attendance Analytics</p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            className="h-8 px-3 border border-border rounded-lg text-xs bg-card text-foreground"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            className="h-8 px-3 border border-border rounded-lg text-xs bg-card text-foreground"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-8 flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Section */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-primary">Student Attendance</h2>
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                Rate: {calculateRate(data.student)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-accent/40 p-4 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Present</p>
                  <p className="text-lg font-black">{data.student.Present}</p>
                </div>
              </div>

              <div className="bg-accent/40 p-4 rounded-xl flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Absent</p>
                  <p className="text-lg font-black">{data.student.Absent}</p>
                </div>
              </div>

              <div className="bg-accent/40 p-4 rounded-xl flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Late</p>
                  <p className="text-lg font-black">{data.student.Late}</p>
                </div>
              </div>

              <div className="bg-accent/40 p-4 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Half Day</p>
                  <p className="text-lg font-black">{data.student.HalfDay}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Section */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-indigo-600">Staff Attendance</h2>
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 text-xs font-bold rounded-full">
                Rate: {calculateRate(data.staff)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-accent/40 p-4 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Present</p>
                  <p className="text-lg font-black">{data.staff.Present}</p>
                </div>
              </div>

              <div className="bg-accent/40 p-4 rounded-xl flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Absent</p>
                  <p className="text-lg font-black">{data.staff.Absent}</p>
                </div>
              </div>

              <div className="bg-accent/40 p-4 rounded-xl flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Late</p>
                  <p className="text-lg font-black">{data.staff.Late}</p>
                </div>
              </div>

              <div className="bg-accent/40 p-4 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Half Day</p>
                  <p className="text-lg font-black">{data.staff.HalfDay}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-xs text-muted-foreground py-8">Failed to compile stats.</div>
      )}
    </div>
  );
};

export default AttendanceReport;

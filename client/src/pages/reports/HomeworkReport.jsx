import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';
import { BookOpen, CheckSquare, BarChart } from 'lucide-react';

const HomeworkReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/homework');
      setData(response.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch homework report'));
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
        <h1 className="text-xl font-black text-foreground tracking-tight">Homework Evaluation Report</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Assignments and Submissions Rate</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Homework Card */}
        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Total Homeworks Assigned</p>
            <h3 className="text-xl font-bold">{data.totalHomework}</h3>
          </div>
        </div>

        {/* Total Submissions Card */}
        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-500/10 text-green-500">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Total Submissions Received</p>
            <h3 className="text-xl font-bold text-green-500">{data.totalSubmissions}</h3>
          </div>
        </div>
      </div>

      {/* Class breakdown */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <BarChart className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold">Class Submissions Distribution</h2>
        </div>
        <div className="space-y-3">
          {data.byClass.length === 0 ? (
            <p className="text-xs text-muted-foreground">No class homework records.</p>
          ) : (
            data.byClass.map((c, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground">{c.name}</span>
                <span className="px-3 py-1 bg-accent font-bold rounded">{c.count} submissions</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeworkReport;

import React, { useState, useEffect } from 'react';
import { BookOpen, CheckSquare, Users, Clock, Calendar, TrendingUp, FileText, GraduationCap } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';
import { toast } from 'sonner';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, scheduleRes] = await Promise.allSettled([
          api.get('/teacher/dashboard'),
          api.get('/teacher/schedule')
        ]);

        if (dashRes.status === 'fulfilled') {
          setStats(dashRes.value.data.data);
        }
        if (scheduleRes.status === 'fulfilled') {
          const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          const todaySlots = (scheduleRes.value.data.data || []).filter(s =>
            s.day?.toLowerCase() === today.toLowerCase()
          );
          setSchedule(todaySlots.slice(0, 6));
        }
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      label: 'My Classes',
      value: stats?.totalClasses ?? stats?.classes ?? '—',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-indigo-500',
      sub: 'assigned sections'
    },
    {
      label: 'Total Students',
      value: stats?.totalStudents ?? '—',
      icon: <GraduationCap className="w-5 h-5" />,
      color: 'bg-violet-500',
      sub: 'under my classes'
    },
    {
      label: 'Homework Posted',
      value: stats?.totalHomework ?? stats?.homework ?? '—',
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-amber-500',
      sub: 'this session'
    },
    {
      label: "Today's Periods",
      value: (schedule.length || stats?.periodsToday) ?? '—',
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-teal-500',
      sub: new Date().toLocaleDateString('en-US', { weekday: 'long' })
    },
  ];

  return (
    <div className="p-4 space-y-5 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="border-b border-border pb-3">
        <h1 className="text-lg font-black text-foreground tracking-tight">
          {user?.school?.name || 'Teacher Dashboard'}
        </h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">
          Welcome back, {user?.name} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
              <div className="h-8 w-8 bg-muted rounded-lg mb-3" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-7 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 group hover:shadow-md transition-all">
              <div className={`w-9 h-9 ${s.color} rounded-xl flex items-center justify-center text-white mb-3 shadow-sm`}>
                {s.icon}
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-foreground mt-0.5">{s.value}</p>
              <p className="text-[9px] text-muted-foreground/60 mt-0.5 uppercase tracking-widest">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Timetable */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground">Today's Timetable</h3>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
              </div>
            ) : schedule.length === 0 ? (
              <div className="p-6 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-30" />
                <p className="text-xs font-bold text-muted-foreground">No periods scheduled today</p>
              </div>
            ) : (
              schedule.map((slot, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/20 transition-all">
                  <div className="w-14 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-black text-primary">{slot.startTime || `P${i+1}`}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      {slot.Subject?.name || slot.subject || 'Subject'} — {slot.Class?.name || slot.class || 'Class'} {slot.Section?.name || slot.section || ''}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{slot.startTime} – {slot.endTime}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Stats / Activity */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground">My Activity</h3>
          </div>
          <div className="p-4 space-y-3">
            {[
              { label: 'Attendance Marked (This Month)', value: stats?.attendanceMarked ?? '—', icon: <CheckSquare className="w-4 h-4 text-green-500" /> },
              { label: 'Homework Submissions Pending', value: stats?.pendingSubmissions ?? '—', icon: <FileText className="w-4 h-4 text-amber-500" /> },
              { label: 'Mark Entries Completed', value: stats?.marksEntered ?? '—', icon: <BookOpen className="w-4 h-4 text-indigo-500" /> },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-accent/20 rounded-xl border border-border/50">
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-xs font-semibold text-foreground">{item.label}</span>
                </div>
                <span className="text-sm font-black text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;

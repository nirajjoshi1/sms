import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Users, ClipboardList, TrendingUp, Star, ChevronRight, CheckCircle, Calendar, Award } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const TeacherDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/teacher/dashboard');
        setData(res.data.data);
      } catch (e) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingScreen />;

  const { staff, isClassTeacher, classTeacherOf, myStudentCount, todaySchedule, pendingHomework, todayAttendance } = data || {};

  const present = todayAttendance?.find(a => a.status === 'Present')?._count?.status || 0;
  const absent = todayAttendance?.find(a => a.status === 'Absent')?._count?.status || 0;
  const late = todayAttendance?.find(a => a.status === 'Late')?._count?.status || 0;
  const halfDay = todayAttendance?.find(a => a.status === 'HalfDay')?._count?.status || 0;
  const markedToday = present + absent + late + halfDay;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Good {getGreeting()}, {staff?.firstName || 'Teacher'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {isClassTeacher && (
          <div className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-xl">
            <Star className="w-4 h-4 fill-primary" />
            <span className="text-xs font-black">Class Teacher - {classTeacherOf?.Class?.name}-{classTeacherOf?.Section?.name}</span>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Clock />} label="Classes Today" value={todaySchedule?.length || 0} color="blue" />
        {isClassTeacher && <StatCard icon={<Users />} label="My Students" value={myStudentCount || 0} color="emerald" />}
        <StatCard icon={<ClipboardList />} label="Pending HW" value={pendingHomework?.length || 0} color="amber" />
        {isClassTeacher && markedToday > 0 && (
          <StatCard icon={<CheckCircle />} label="Marked Today" value={`${present}P / ${absent}A / ${halfDay}H`} color="purple" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-black text-foreground">Today's Schedule</h3>
            </div>
            <Link to="/teacher/schedule" className="text-[10px] font-bold text-primary hover:opacity-80 flex items-center gap-1">
              Full Schedule <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {todaySchedule?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <CheckCircle className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-xs font-bold">No classes today!</p>
              </div>
            ) : (
              todaySchedule?.map((slot, i) => (
                <ScheduleRow key={i} slot={slot} />
              ))
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Class Teacher Quick Actions */}
          {isClassTeacher && (
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Class Teacher Hub</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Take Attendance', to: '/teacher/attendance', icon: <ClipboardList className="w-4 h-4" /> },
                  { label: 'Class Overview', to: '/teacher/class-overview', icon: <TrendingUp className="w-4 h-4" /> },
                  { label: 'Marks Entry', to: '/teacher/marks', icon: <Award className="w-4 h-4" /> },
                  { label: 'Homework', to: '/teacher/homework', icon: <BookOpen className="w-4 h-4" /> },
                ].map(a => (
                  <Link key={a.to} to={a.to} className="flex flex-col items-center gap-1.5 p-3 bg-background border border-border rounded-xl hover:bg-accent hover:border-primary/30 transition group text-center">
                    <span className="text-primary group-hover:scale-110 transition-transform">{a.icon}</span>
                    <span className="text-[10px] font-bold text-foreground">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Today's Attendance Summary */}
          {isClassTeacher && todayAttendance && todayAttendance.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">Today's Attendance</h3>
              <div className="space-y-2">
                {[
                  { label: 'Present', count: present, color: 'bg-emerald-500' },
                  { label: 'Absent', count: absent, color: 'bg-red-500' },
                  { label: 'Late', count: late, color: 'bg-amber-500' },
                  { label: 'Half Day', count: halfDay, color: 'bg-blue-500' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-xs text-muted-foreground flex-1">{item.label}</span>
                    <span className="text-xs font-bold text-foreground">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Homework */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Upcoming Homework</h3>
              <Link to="/teacher/homework" className="text-[10px] font-bold text-primary hover:opacity-80">View all</Link>
            </div>
            <div className="divide-y divide-border">
              {pendingHomework?.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-4">No pending homework</p>
              ) : (
                pendingHomework?.slice(0, 4).map((hw, i) => (
                  <div key={i} className="px-4 py-2.5">
                    <p className="text-xs font-bold text-foreground truncate">{hw.title}</p>
                    <p className="text-[10px] text-muted-foreground">{hw.Class?.name} - {hw.Subject?.name} - Due {new Date(hw.dueDate).toLocaleDateString()}</p>
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

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
};

const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  };
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-xl border ${colors[color]}`}>
        {React.cloneElement(icon, { className: 'w-4 h-4' })}
      </div>
      <div>
        <p className="text-lg font-black text-foreground">{value}</p>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
};

const ScheduleRow = ({ slot }) => {
  const now = new Date();
  const [startH, startM] = slot.startTime.split(':').map(Number);
  const [endH, endM] = slot.endTime.split(':').map(Number);
  const isNow = now.getHours() * 60 + now.getMinutes() >= startH * 60 + startM &&
    now.getHours() * 60 + now.getMinutes() <= endH * 60 + endM;

  return (
    <div className={`flex items-center gap-4 px-5 py-3 ${isNow ? 'bg-primary/5 border-l-2 border-primary' : ''}`}>
      <div className="text-center w-16 flex-shrink-0">
        <p className={`text-xs font-black ${isNow ? 'text-primary' : 'text-foreground'}`}>{slot.startTime}</p>
        <p className="text-[10px] text-muted-foreground">{slot.endTime}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-foreground truncate">{slot.Subject?.name}</p>
        <p className="text-[10px] text-muted-foreground">{slot.Class?.name} - {slot.Section?.name}{slot.roomNo ? ` - Room ${slot.roomNo}` : ''}</p>
      </div>
      {isNow && <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Live</span>}
    </div>
  );
};

const LoadingScreen = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading...</p>
    </div>
  </div>
);

export default TeacherDashboard;


import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, MapPin } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const MySchedule = () => {
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await api.get('/teacher/schedule');
        if (response.data.data) {
          setSchedule(response.data.data.grouped || {});
          
          // Set current day as active day default
          const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          setActiveDay(days.includes(today) ? today : 'Monday');
        }
      } catch (error) {
        toast.error('Failed to load timetable schedule');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Loading timetable...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
      <div>
        <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" /> My Timetable
        </h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">
          Your weekly teaching schedule and class timings
        </p>
      </div>

      {/* Days Tabs selector */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {days.map((day) => {
          const count = schedule[day]?.length || 0;
          const isActive = activeDay === day;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {day}
              {count > 0 && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-primary-foreground text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Timetable schedule content */}
      <div className="grid grid-cols-1 gap-3">
        {!schedule[activeDay] || schedule[activeDay].length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-bold uppercase tracking-wider">No classes scheduled for {activeDay}</p>
          </div>
        ) : (
          schedule[activeDay].map((slot, index) => (
            <div 
              key={index} 
              className="bg-card border border-border hover:border-primary/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-xl flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{slot.Subject?.name || 'Subject'}</h3>
                  <p className="text-xs text-muted-foreground">
                    Class {slot.Class?.name} - {slot.Section?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                  <Clock className="w-4 h-4 text-primary" />
                  {slot.startTime} - {slot.endTime}
                </div>
                {slot.roomNo && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                    <MapPin className="w-4 h-4 text-primary" />
                    Room {slot.roomNo}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MySchedule;

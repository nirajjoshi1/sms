import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const TeachersTimetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState('');

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const fetchStaff = async () => {
    try {
      const response = await api.get('/staff');
      const teachers = (response.data.data || []).filter(s => s.role === 'TEACHER' && !s.isDisabled);
      setStaff(teachers);
    } catch (error) {
      toast.error('Failed to fetch teachers');
    }
  };

  const fetchTimetable = async () => {
    if (!selectedTeacher) return;

    try {
      setLoading(true);
      const response = await api.get('/academics/timetable', {
        params: { staffId: selectedTeacher }
      });
      setTimetables(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [selectedTeacher]);

  // Group timetables by day
  const getTimetableGrid = () => {
    const grid = {};
    daysOfWeek.forEach(day => {
      grid[day] = timetables
        .filter(t => t.dayOfWeek === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return grid;
  };

  const grid = getTimetableGrid();
  const selectedTeacherData = staff.find(s => s.id === selectedTeacher);

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Teacher's Timetable</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">View teacher's weekly schedule</p>
        </div>
      </div>

      {/* Teacher Selection */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="max-w-md">
          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1 block mb-1">Select Teacher *</label>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="w-full h-9 bg-muted/30 border border-border rounded-lg px-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20"
          >
            <option value="">Choose a teacher</option>
            {staff.map(teacher => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.firstName} {teacher.lastName} ({teacher.staffId})
              </option>
            ))}
          </select>
        </div>

        {selectedTeacherData && (
          <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[11px] font-bold text-foreground">
                  {selectedTeacherData.firstName} {selectedTeacherData.lastName}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  Staff ID: {selectedTeacherData.staffId} | {selectedTeacherData.Designation?.name || 'Teacher'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timetable Grid */}
      {selectedTeacher ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-6 bg-muted/5 border-b border-border">
                  {daysOfWeek.map(day => (
                    <div key={day} className="px-3 py-2 text-center border-r border-border last:border-r-0">
                      <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{day}</span>
                    </div>
                  ))}
                </div>

                {/* Body */}
                <div className="grid grid-cols-6">
                  {daysOfWeek.map(day => (
                    <div key={day} className="border-r border-border last:border-r-0 min-h-[200px]">
                      {grid[day].length > 0 ? (
                        <div className="p-2 space-y-2">
                          {grid[day].map(entry => (
                            <div
                              key={entry.id}
                              className="bg-accent/10 border border-accent/30 rounded-lg p-2"
                            >
                              <div className="space-y-1">
                                <p className="text-[10px] font-bold text-foreground">{entry.Subject?.name}</p>
                                <p className="text-[9px] text-muted-foreground">
                                  {entry.Class?.name} - {entry.Section?.name}
                                </p>
                                <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>{entry.startTime} - {entry.endTime}</span>
                                </div>
                                {entry.roomNo && (
                                  <p className="text-[8px] text-muted-foreground">Room: {entry.roomNo}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full p-4">
                          <p className="text-[9px] text-muted-foreground italic">Free</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && timetables.length === 0 && selectedTeacher && (
            <div className="p-12 text-center">
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                No classes assigned to this teacher
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Select a teacher to view their timetable
          </p>
        </div>
      )}

      {/* Summary */}
      {selectedTeacher && !loading && timetables.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-3">Weekly Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Total Classes</p>
              <p className="text-xl font-black text-primary">{timetables.length}</p>
            </div>
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Subjects</p>
              <p className="text-xl font-black text-foreground">
                {new Set(timetables.map(t => t.subjectId)).size}
              </p>
            </div>
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Classes</p>
              <p className="text-xl font-black text-foreground">
                {new Set(timetables.map(t => `${t.classId}-${t.sectionId}`)).size}
              </p>
            </div>
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Active Days</p>
              <p className="text-xl font-black text-foreground">
                {new Set(timetables.map(t => t.dayOfWeek)).size}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersTimetable;

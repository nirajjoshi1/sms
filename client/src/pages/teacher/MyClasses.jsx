import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, ClipboardList, Award, Star } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const MyClasses = () => {
  const [data, setData] = useState({ teachingClasses: [], classTeacherOf: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get('/teacher/classes');
        if (response.data.data) {
          setData(response.data.data);
        }
      } catch (error) {
        toast.error('Failed to load classes directory');
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Loading classes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
      <div>
        <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> My Classes
        </h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">
          Manage attendance, marks, and view classes where you teach
        </p>
      </div>

      {/* Class Teacher Duties */}
      {data.classTeacherOf?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <h2 className="text-xs font-black uppercase tracking-wider text-foreground">Class Teacher Responsibilities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.classTeacherOf.map((c, i) => (
              <div key={i} className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Class {c.Class?.name} - {c.Section?.name}</h3>
                    <p className="text-[10px] text-primary uppercase font-bold tracking-widest">Designated Class Teacher</p>
                  </div>
                  <Star className="w-5 h-5 text-primary fill-primary" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/teacher/attendance?classId=${c.classId}&sectionId=${c.sectionId}`}
                    className="flex items-center justify-center gap-2 h-9 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90"
                  >
                    <ClipboardList className="w-4 h-4" />
                    Attendance
                  </Link>
                  <Link
                    to={`/teacher/class-overview`}
                    className="flex items-center justify-center gap-2 h-9 bg-card border border-border text-foreground hover:bg-muted rounded-lg text-xs font-bold"
                  >
                    <Users className="w-4 h-4" />
                    Overview
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teaching Classes */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Taught Classes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(data.classes || data.teachingClasses || [])?.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground md:col-span-3">
              No teaching classes found in your timetable schedule.
            </div>
          ) : (
            (data.classes || data.teachingClasses || []).map((item, index) => (
              <div key={index} className="bg-card border border-border hover:border-primary/20 rounded-xl p-4 space-y-4 transition-all">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Class {item.Class?.name} - {item.Section?.name}</h3>
                  <p className="text-[10px] text-muted-foreground">
                    {item.isClassTeacher ? 'Class Teacher' : 'Subject Teaching Slot'}
                    {item.periodCount ? ` - ${item.periodCount} weekly periods` : ''}
                  </p>
                  {item.Subjects?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.Subjects.slice(0, 4).map(subject => (
                        <span key={subject.id} className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
                          {subject.name}
                        </span>
                      ))}
                      {item.Subjects.length > 4 && (
                        <span className="text-[9px] bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-full font-bold">
                          +{item.Subjects.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/teacher/attendance?classId=${item.classId}&sectionId=${item.sectionId}`}
                    className="flex items-center justify-center gap-1.5 h-8 bg-muted text-foreground hover:bg-accent rounded-lg text-[10px] font-bold"
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    Attendance
                  </Link>
                  <Link
                    to={`/teacher/marks?classId=${item.classId}&sectionId=${item.sectionId}`}
                    className="flex items-center justify-center gap-1.5 h-8 bg-muted text-foreground hover:bg-accent rounded-lg text-[10px] font-bold"
                  >
                    <Award className="w-3.5 h-3.5" />
                    Marks
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyClasses;

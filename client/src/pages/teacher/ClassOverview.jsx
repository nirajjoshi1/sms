import React, { useState, useEffect } from 'react';
import { Star, Users, ClipboardList, BookOpen, AlertCircle, Phone } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const ClassOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await api.get('/teacher/class-overview');
        if (response.data.data) {
          setData(response.data.data);
        }
      } catch (error) {
        toast.error('You must be assigned as a Class Teacher to view this dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Loading overview...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground max-w-[600px] mx-auto mt-10">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500 opacity-80" />
        <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Access Restrained</h2>
        <p className="text-xs text-muted-foreground mt-2">
          This dashboard is reserved for designated class teachers. If you teach subject slots but are not an active homeroom teacher, please manage attendance or marks from My Classes.
        </p>
      </div>
    );
  }

  const { classTeacher, students, totalStudents, maleCount, femaleCount, attendanceStats, pendingHomework } = data;

  // Calculate attendance averages
  const presentCount = attendanceStats.find(s => s.status === 'Present')?._count?.status || 0;
  const absentCount = attendanceStats.find(s => s.status === 'Absent')?._count?.status || 0;
  const lateCount = attendanceStats.find(s => s.status === 'Late')?._count?.status || 0;
  const halfCount = attendanceStats.find(s => s.status === 'HalfDay')?._count?.status || 0;
  const totalLogs = presentCount + absentCount + lateCount + halfCount;
  const attendanceRate = totalLogs > 0 
    ? ((presentCount + halfCount * 0.5) / totalLogs * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary fill-primary" />
            <h1 className="text-xl font-black text-foreground tracking-tight">
              Homeroom Dashboard: Class {classTeacher.Class?.name} - {classTeacher.Section?.name}
            </h1>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">
            Homeroom overview, class rosters, attendance reports, and quick summaries
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-black text-foreground">{totalStudents}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Enrolled Students</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-black text-foreground">{maleCount} M / {femaleCount} F</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Gender Breakdown</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-black text-foreground">{attendanceRate}%</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">30d Attendance Rate</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-black text-foreground">{pendingHomework?.length || 0}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Due Assignments</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Roster Directory (Left/Center Column) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-muted/10 border-b border-border">
              <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Homeroom Student Directory</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/5">
                    <th className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-16">Roll No</th>
                    <th className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Student Info</th>
                    <th className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Father / Guardian</th>
                    <th className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Emergency Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-3 text-xs font-black text-foreground">
                        {student.rollNumber || student.admissionNo.slice(-3)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-xs">
                            {student.photo ? (
                              <img src={student.photo} alt="" className="w-full h-full object-cover" />
                            ) : (
                              student.firstName.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-[9px] text-muted-foreground font-bold">Admin No: {student.admissionNo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-xs font-bold text-foreground">{student.fatherName || 'Not Stated'}</p>
                        <p className="text-[9px] text-muted-foreground">Mobile: {student.mobileNumber || 'N/A'}</p>
                      </td>
                      <td className="p-3">
                        <a
                          href={`tel:${student.guardianPhone}`}
                          className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {student.guardianPhone}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Info summaries (Right Column) */}
        <div className="space-y-4">
          {/* Active Homework */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-muted/10 border-b border-border">
              <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Class Tasks Due</h3>
            </div>
            <div className="divide-y divide-border p-2">
              {pendingHomework?.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">No homework tasks currently due.</div>
              ) : (
                pendingHomework?.map((hw, idx) => (
                  <div key={idx} className="p-3 hover:bg-muted/5 transition rounded-lg">
                    <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      {hw.Subject?.name}
                    </span>
                    <h4 className="text-xs font-bold text-foreground mt-1.5">{hw.title}</h4>
                    <p className="text-[10px] text-amber-500 font-bold mt-1.5">
                      Due: {new Date(hw.dueDate).toLocaleDateString()}
                    </p>
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

export default ClassOverview;

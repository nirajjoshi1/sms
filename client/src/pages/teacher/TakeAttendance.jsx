import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClipboardList, Calendar, Users, Save } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const TakeAttendance = () => {
  const [searchParams] = useSearchParams();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch teaching classes to populate selectors
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get('/teacher/classes');
        if (response.data.data) {
          const uniqueCombos = response.data.data.classes || [];
          setClasses(uniqueCombos);

          // Select defaults from URL or first option
          const urlClassId = searchParams.get('classId');
          const urlSectionId = searchParams.get('sectionId');

          if (urlClassId && urlSectionId) {
            setSelectedClass(urlClassId);
            setSelectedSection(urlSectionId);
          } else if (uniqueCombos.length > 0) {
            setSelectedClass(uniqueCombos[0].classId);
            setSelectedSection(uniqueCombos[0].sectionId);
          }
        }
      } catch (error) {
        toast.error('Failed to load classes');
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, [searchParams]);

  // Load students and active attendance on class/section/date selection
  useEffect(() => {
    if (!selectedClass || !selectedSection) return;

    const loadData = async () => {
      try {
        setLoadingStudents(true);
        // 1. Get students in class
        const studentsRes = await api.get(`/teacher/students?classId=${selectedClass}&sectionId=${selectedSection}`);
        const studentsList = studentsRes.data.data || [];
        setStudents(studentsList);

        // 2. Get existing attendance for this date
        const attendanceRes = await api.get(`/teacher/attendance?classId=${selectedClass}&sectionId=${selectedSection}&date=${date}`);
        const existingAttendance = attendanceRes.data.data || [];

        // Build status map
        const stateMap = {};
        studentsList.forEach(s => {
          const record = existingAttendance.find(a => a.studentId === s.id);
          stateMap[s.id] = {
            status: record ? record.status : 'Present', // Default to present
            note: record ? (record.note || '') : ''
          };
        });
        setAttendanceData(stateMap);
      } catch (error) {
        toast.error('Failed to load class roster or attendance logs');
      } finally {
        setLoadingStudents(false);
      }
    };
    loadData();
  }, [selectedClass, selectedSection, date]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleNoteChange = (studentId, note) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], note }
    }));
  };

  const handleClassSelection = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [cId, sId] = val.split(':');
    setSelectedClass(cId);
    setSelectedSection(sId);
  };

  const handleSetAll = (status) => {
    setAttendanceData(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(id => {
        updated[id] = { ...updated[id], status };
      });
      return updated;
    });
    toast.success(`Marked all students as ${status}`);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const payload = {
        date,
        classId: selectedClass,
        sectionId: selectedSection,
        attendances: Object.keys(attendanceData).map(studentId => ({
          studentId,
          status: attendanceData[studentId].status,
          note: attendanceData[studentId].note
        }))
      };

      await api.post('/teacher/attendance', payload);
      toast.success('Attendance saved successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingClasses) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Loading setup...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" /> Daily Attendance Desk
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">
            Log student daily attendance, lateness, and notes
          </p>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-wrap items-center gap-3 bg-card border border-border rounded-xl p-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Class & Section</label>
            <select
              value={`${selectedClass}:${selectedSection}`}
              onChange={handleClassSelection}
              className="bg-muted/30 border border-border rounded-lg h-9 px-2 text-xs font-bold focus:outline-none"
            >
              {classes.map((c, i) => (
                <option key={i} value={`${c.classId}:${c.sectionId}`}>
                  Class {c.Class?.name} - {c.Section?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Date</label>
            <div className="flex items-center gap-2 border border-border rounded-lg bg-muted/30 h-9 px-2.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="date"
                value={date}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent border-none text-xs font-bold focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Controls */}
      {students.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground">{students.length} Enrolled Students</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSetAll('Present')}
              className="px-3 h-8 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all"
            >
              All Present
            </button>
            <button
              onClick={() => handleSetAll('Absent')}
              className="px-3 h-8 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all"
            >
              All Absent
            </button>
          </div>
        </div>
      )}

      {/* Roster Listing */}
      {loadingStudents ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-xs font-bold uppercase tracking-wider">No active students found in this section</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/10">
                    <th className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-16">Roll No</th>
                    <th className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Student</th>
                    <th className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-72 text-center">Status</th>
                    <th className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Note / Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((student) => {
                    const current = attendanceData[student.id] || { status: 'Present', note: '' };
                    return (
                      <tr key={student.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-3 text-xs font-black text-foreground">
                          {student.rollNumber || student.admissionNo.slice(-3)}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex items-center justify-center font-bold text-xs">
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
                          <div className="flex justify-center items-center gap-1 bg-muted/20 border border-border p-1 rounded-xl w-fit mx-auto">
                            {['Present', 'Absent', 'Late', 'HalfDay'].map((st) => {
                              const active = current.status === st;
                              let themeClasses = 'text-muted-foreground hover:text-foreground';
                              if (active) {
                                if (st === 'Present') themeClasses = 'bg-emerald-500 text-white shadow-sm';
                                if (st === 'Absent') themeClasses = 'bg-red-500 text-white shadow-sm';
                                if (st === 'Late') themeClasses = 'bg-amber-500 text-white shadow-sm';
                                if (st === 'HalfDay') themeClasses = 'bg-blue-500 text-white shadow-sm';
                              }
                              return (
                                <button
                                  key={st}
                                  onClick={() => handleStatusChange(student.id, st)}
                                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${themeClasses}`}
                                >
                                  {st === 'HalfDay' ? 'Half Day' : st}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            placeholder="Add brief note..."
                            value={current.note}
                            onChange={(e) => handleNoteChange(student.id, e.target.value)}
                            className="w-full bg-muted/20 hover:bg-muted/45 focus:bg-background border border-border hover:border-primary/20 focus:border-primary/55 rounded-lg px-3 h-8 text-xs transition-all focus:outline-none"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 px-6 h-10 rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-50 shadow-md transition-all"
            >
              {submitting ? (
                <>Saving Attendance...</>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Attendance
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeAttendance;

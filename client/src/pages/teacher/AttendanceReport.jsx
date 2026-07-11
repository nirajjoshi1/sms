import React, { useState, useEffect } from 'react';
import { ClipboardList, Users, Search } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const AttendanceReport = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [fromDate, setFromDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default to 30 days ago
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get('/teacher/classes');
        if (response.data.data) {
          const uniqueCombos = response.data.data.classes || [];
          setClasses(uniqueCombos);

          if (uniqueCombos.length > 0) {
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
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!selectedClass || !selectedSection) return;

    try {
      setSearching(true);
      const response = await api.get(
        `/teacher/attendance/report?classId=${selectedClass}&sectionId=${selectedSection}&fromDate=${fromDate}&toDate=${toDate}`
      );
      if (response.data.data) {
        setReport(response.data.data.summary || []);
      }
    } catch (error) {
      toast.error('Failed to generate attendance report');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (selectedClass && selectedSection) {
      handleSearch();
    }
  }, [selectedClass, selectedSection]);

  const handleClassSelection = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [cId, sId] = val.split(':');
    setSelectedClass(cId);
    setSelectedSection(sId);
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
            <ClipboardList className="w-5 h-5 text-primary" /> Attendance Summary Report
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">
            Analyze historical student class attendance records and percentage metrics
          </p>
        </div>

        {/* Filter Selection Panel */}
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3 bg-card border border-border rounded-xl p-3 shadow-sm">
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
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-muted/30 border border-border rounded-lg h-9 px-2.5 text-xs font-bold focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-muted/30 border border-border rounded-lg h-9 px-2.5 text-xs font-bold focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={searching}
            className="flex items-center justify-center gap-1.5 bg-primary text-primary-foreground hover:opacity-90 rounded-lg h-9 px-4 text-xs font-bold disabled:opacity-50 transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            Analyze
          </button>
        </form>
      </div>

      {/* Roster Statistics Table */}
      {searching ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : report.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-xs font-bold uppercase tracking-wider">No attendance logs found in this date range</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/10">
                  <th className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-16">Roll No</th>
                  <th className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Student</th>
                  <th className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Present</th>
                  <th className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Late</th>
                  <th className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Half Day</th>
                  <th className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Absent</th>
                  <th className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Total Days</th>
                  <th className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {report.map((item, idx) => {
                  const rate = parseFloat(item.attendanceRate);
                  let rateBadge = 'bg-red-500/10 text-red-500 border-red-500/20';
                  if (rate >= 90) rateBadge = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
                  else if (rate >= 75) rateBadge = 'bg-amber-500/10 text-amber-500 border-amber-500/20';

                  return (
                    <tr key={idx} className="hover:bg-muted/5 transition-colors">
                      <td className="p-3 text-xs font-black text-foreground">
                        {item.student?.rollNumber || item.student?.admissionNo.slice(-3)}
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            {item.student?.firstName} {item.student?.lastName}
                          </p>
                          <p className="text-[9px] text-muted-foreground font-bold">Admin No: {item.student?.admissionNo}</p>
                        </div>
                      </td>
                      <td className="p-3 text-center text-xs font-bold text-emerald-500">{item.present}</td>
                      <td className="p-3 text-center text-xs font-bold text-amber-500">{item.late}</td>
                      <td className="p-3 text-center text-xs font-bold text-blue-500">{item.halfDay}</td>
                      <td className="p-3 text-center text-xs font-bold text-red-500">{item.absent}</td>
                      <td className="p-3 text-center text-xs font-bold text-muted-foreground">{item.total}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-lg border text-xs font-black ${rateBadge}`}>
                          {item.attendanceRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceReport;

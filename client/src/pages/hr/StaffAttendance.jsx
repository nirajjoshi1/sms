import React, { useState, useEffect } from 'react';
import { Calendar, Check, X, Clock, Users, Search } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';

const StaffAttendance = () => {
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const attendanceStatuses = [
    { value: 'Present', label: 'Present', color: 'bg-green-500', icon: Check },
    { value: 'Absent', label: 'Absent', color: 'bg-red-500', icon: X },
    { value: 'Late', label: 'Late', color: 'bg-orange-500', icon: Clock },
    { value: 'Half Day', label: 'Half Day', color: 'bg-blue-500', icon: Clock }
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffRes, attendanceRes] = await Promise.all([
        api.get('/hr/staff?isDisabled=false'),
        api.get(`/hr/attendance?date=${selectedDate}`)
      ]);

      setStaff(staffRes.data.data || []);

      // Map attendance by staffId
      const attendanceMap = {};
      (attendanceRes.data.data || []).forEach(att => {
        attendanceMap[att.staffId] = att.status;
      });
      setAttendance(attendanceMap);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const handleStatusChange = (staffId, status) => {
    setAttendance(prev => ({
      ...prev,
      [staffId]: prev[staffId] === status ? null : status
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const attendanceData = staff
        .filter(s => attendance[s.id])
        .map(s => ({
          staffId: s.id,
          date: selectedDate,
          status: attendance[s.id]
        }));

      if (attendanceData.length === 0) {
        toast.error('Please mark at least one staff member');
        return;
      }

      await Promise.all(
        attendanceData.map(data => api.post('/hr/attendance', data))
      );

      toast.success('Attendance marked successfully');
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to mark attendance'));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch =
      s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.staffId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = !filterRole || s.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const stats = {
    total: filteredStaff.length,
    present: filteredStaff.filter(s => attendance[s.id] === 'Present').length,
    absent: filteredStaff.filter(s => attendance[s.id] === 'Absent').length,
    late: filteredStaff.filter(s => attendance[s.id] === 'Late').length,
    halfDay: filteredStaff.filter(s => attendance[s.id] === 'Half Day').length
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Staff Attendance</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Mark daily attendance for staff</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Total Staff</p>
          <p className="text-2xl font-black text-foreground">{stats.total}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <p className="text-[9px] text-green-700 dark:text-green-400 uppercase tracking-widest mb-1">Present</p>
          <p className="text-2xl font-black text-green-600 dark:text-green-400">{stats.present}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-[9px] text-red-700 dark:text-red-400 uppercase tracking-widest mb-1">Absent</p>
          <p className="text-2xl font-black text-red-600 dark:text-red-400">{stats.absent}</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
          <p className="text-[9px] text-orange-700 dark:text-orange-400 uppercase tracking-widest mb-1">Late</p>
          <p className="text-2xl font-black text-orange-600 dark:text-orange-400">{stats.late}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-[9px] text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-1">Half Day</p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats.halfDay}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Date *</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Role Filter</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
            >
              <option value="">All Roles</option>
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
              <option value="ACCOUNTANT">Accountant</option>
              <option value="LIBRARIAN">Librarian</option>
              <option value="RECEPTIONIST">Receptionist</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 bg-muted/30 border border-border rounded-lg pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Loading...</span>
            </div>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No staff found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/5 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Staff</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Role</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Department</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{member.staffId}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] text-muted-foreground">
                          {member.Department?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {attendanceStatuses.map(({ value, label, color, icon: Icon }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => handleStatusChange(member.id, value)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                                attendance[member.id] === value
                                  ? `${color} text-white border-transparent shadow-sm`
                                  : 'bg-muted/10 border-border text-muted-foreground hover:bg-muted/20'
                              }`}
                            >
                              <Icon className="w-3 h-3" />
                              <span>{label}</span>
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-border bg-muted/5 flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">
                {Object.keys(attendance).length} of {filteredStaff.length} staff marked
              </p>
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(attendance).length === 0}
                className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StaffAttendance;

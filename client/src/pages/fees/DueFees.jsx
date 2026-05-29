import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, Download, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';

const DueFees = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [dueFees, setDueFees] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (classFilter) params.append('classId', classFilter);

      const [studentsRes, classesRes, dueFeesRes] = await Promise.all([
        api.get('/students?isDisabled=false'),
        api.get('/academics/classes'),
        api.get(`/fees/due?${params.toString()}`)
      ]);
      setStudents(studentsRes.data.data || []);
      setClasses(classesRes.data.data || []);
      setDueFees(dueFeesRes.data.data || []);

    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [classFilter]);

  const sendReminder = (studentId) => {
    toast.success('Reminder sent successfully');
    // TODO: Implement actual reminder API
  };

  const filteredDueFees = dueFees.filter(d => {
    const studentName = `${d.Student?.firstName} ${d.Student?.lastName}`.toLowerCase();
    const admissionNo = d.Student?.admissionNo?.toLowerCase() || '';
    const matchesSearch = studentName.includes(searchQuery.toLowerCase()) ||
                         admissionNo.includes(searchQuery.toLowerCase());
    const matchesClass = !classFilter || d.Student?.classId === classFilter;
    return matchesSearch && matchesClass;
  });

  const totalPages = Math.ceil(filteredDueFees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDueFees.slice(indexOfFirstItem, indexOfLastItem);

  const totalDueAmount = filteredDueFees.reduce((sum, d) => sum + (d.dueAmount || 0), 0);

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Due Fees</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">View students with due fees</p>
        </div>
        <button
          className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 transition-all flex items-center gap-2 w-fit"
        >
          <Download className="w-3 h-3" />
          Export Report
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Total Due Amount</p>
            <p className="text-2xl font-black text-foreground">₹{totalDueAmount.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{filteredDueFees.length} students with due fees</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Search Student</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or admission no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 bg-muted/30 border border-border rounded-lg pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Class</label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
            >
              <option value="">All Classes</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Due Fees Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Loading...</span>
            </div>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">No due fees records found</p>
            <p className="text-[9px] text-muted-foreground">
              Backend API endpoint not yet implemented. This page will show students with due fees once the API is ready.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/5 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Student</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Class</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fee Type</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Amount</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Paid Amount</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Due Amount</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Due Date</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentItems.map((due) => (
                    <tr key={due.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            {due.Student?.firstName} {due.Student?.lastName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{due.Student?.admissionNo}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground">{due.Student?.Class?.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground">{due.feeType}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs text-foreground">
                          ₹{due.totalAmount?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs text-green-600 dark:text-green-400">
                          ₹{due.paidAmount?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-bold text-red-600 dark:text-red-400">
                          ₹{due.dueAmount?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground">
                          {new Date(due.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => sendReminder(due.studentId)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="Send Reminder"
                        >
                          <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-border bg-muted/5 flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDueFees.length)} of {filteredDueFees.length} records
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-bold text-foreground">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DueFees;

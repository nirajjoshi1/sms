import React, { useState, useEffect } from 'react';
import {
  Search,
  UserCheck,
  Users,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { toast } from 'sonner';
import { useConfirm } from '../../context/ConfirmContext';

const DisabledStudents = () => {
  const confirm = useConfirm();

  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  const fetchDisabledStudents = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery
      };

      const response = await api.get('/students/disabled', { params });
      setStudents(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0
      }));
    } catch (error) {
      toast.error('Failed to fetch disabled students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDisabledStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, pagination.page]);

  const handleEnable = async (id) => {
    if (!await confirm('Are you sure you want to enable this student?')) return;

    try {
      await api.patch(`/students/${id}/status`, {
        isDisabled: false,
        disableReasonId: null
      });
      toast.success('Student enabled successfully');
      fetchDisabledStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enable student');
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Disabled Students</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">
            Manage students who have been disabled
          </p>
        </div>

        <button
          onClick={fetchDisabledStudents}
          className="flex items-center gap-2 px-3 py-2 bg-background text-foreground border border-border rounded-lg text-[11px] font-bold hover:bg-muted transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, admission no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-muted/30 border border-border rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest animate-pulse">Loading...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/5 border-b border-border">
                <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Student</th>
                <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Admission No</th>
                <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Class</th>
                <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Section</th>
                <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Disable Reason</th>
                <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {!loading && students.length > 0 ? students.map((student) => (
                <tr key={student.id} className="hover:bg-muted/5 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground overflow-hidden flex-shrink-0 opacity-60">
                        {student.photo ? (
                          <img src={student.photo} alt={student.firstName} className="w-full h-full object-cover grayscale" />
                        ) : (
                          <span>{student.firstName?.charAt(0)}{student.lastName?.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-foreground">
                          {student.firstName} {student.middleName} {student.lastName}
                        </p>
                        <p className="text-[9px] text-muted-foreground">{student.rollNumber || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold text-foreground">{student.admissionNo}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] text-foreground">{student.Class?.name || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] text-foreground">{student.Section?.name || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[9px] px-2 py-0.5 bg-destructive/10 text-destructive rounded border border-destructive/20">
                      {student.DisableReason?.reason || 'Not specified'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => navigate(`/students/${student.id}`)}
                        className="p-1.5 hover:bg-primary/10 hover:text-primary text-muted-foreground rounded-md transition-all"
                        title="View Details"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleEnable(student.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-primary/10 hover:text-primary text-muted-foreground rounded-md transition-all text-[10px] font-bold"
                        title="Enable Student"
                      >
                        <UserCheck className="w-3 h-3" />
                        Enable
                      </button>
                    </div>
                  </td>
                </tr>
              )) : !loading && (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <Users className="w-8 h-8 text-muted-foreground" />
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {searchQuery ? 'No disabled students found matching your search' : 'No disabled students'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && students.length > 0 && (
          <div className="px-4 py-3 bg-muted/5 border-t border-border flex items-center justify-between">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                  disabled={pagination.page === 1}
                  className="p-1 rounded bg-background border border-border disabled:opacity-30 hover:bg-muted transition-all"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>

                <div className="flex items-center gap-1 mx-1">
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={`w-6 h-6 flex items-center justify-center rounded text-[9px] font-bold transition-all ${
                          pagination.page === pageNum
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.page + 1, totalPages) }))}
                  disabled={pagination.page === totalPages}
                  className="p-1 rounded bg-background border border-border disabled:opacity-30 hover:bg-muted transition-all"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DisabledStudents;

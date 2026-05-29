import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, Users, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { toast } from 'sonner';

const StaffList = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    departmentId: '',
    designationId: '',
    gender: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch dropdown data
  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        const [deptRes, desigRes] = await Promise.all([
          api.get('/hr/departments'),
          api.get('/hr/designations')
        ]);
        setDepartments(deptRes.data.data || []);
        setDesignations(desigRes.data.data || []);
      } catch (error) {
        console.error('Failed to load setup data');
      }
    };
    fetchSetupData();
  }, []);

  // Fetch staff
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        ...filters
      };

      const response = await api.get('/staff', { params });
      setStaff(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0
      }));
    } catch (error) {
      toast.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStaff();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, filters, pagination.page, pagination.limit]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;

    try {
      await api.delete(`/staff/${id}`);
      toast.success('Staff deleted successfully');
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete staff');
    }
  };

  const clearFilters = () => {
    setFilters({
      role: '',
      departmentId: '',
      designationId: '',
      gender: ''
    });
    setSearchQuery('');
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const roleColors = {
    SUPER_ADMIN: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    ADMIN: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    TEACHER: 'bg-green-500/10 text-green-500 border-green-500/20',
    ACCOUNTANT: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    LIBRARIAN: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    RECEPTIONIST: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Staff List</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">
            Manage all staff members
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition-all border ${
              showFilters
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-border hover:bg-muted'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>
          <Link
            to="/staff/add"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[11px] font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Staff
          </Link>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="h-9 bg-background border border-border rounded-lg px-3 text-[11px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/50 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat pr-8"
              style={{ colorScheme: 'dark' }}
            >
              <option value="">All Roles</option>
              <option value="TEACHER">Teacher</option>
              <option value="ACCOUNTANT">Accountant</option>
              <option value="LIBRARIAN">Librarian</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="ADMIN">Admin</option>
            </select>

            <select
              value={filters.departmentId}
              onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
              className="h-9 bg-background border border-border rounded-lg px-3 text-[11px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/50 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat pr-8"
              style={{ colorScheme: 'dark' }}
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <select
              value={filters.designationId}
              onChange={(e) => setFilters({ ...filters, designationId: e.target.value })}
              className="h-9 bg-background border border-border rounded-lg px-3 text-[11px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/50 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat pr-8"
              style={{ colorScheme: 'dark' }}
            >
              <option value="">All Designations</option>
              {designations.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <select
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              className="h-9 bg-background border border-border rounded-lg px-3 text-[11px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/50 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat pr-8"
              style={{ colorScheme: 'dark' }}
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={clearFilters}
              className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tight"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, staff ID, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-muted/30 border border-border rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Table */}
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
                <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Staff</th>
                <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Staff ID</th>
                <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Role</th>
                <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Department</th>
                <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Contact</th>
                <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {!loading && staff.length > 0 ? staff.map((member) => (
                <tr key={member.id} className="hover:bg-muted/5 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground overflow-hidden flex-shrink-0">
                        {member.photo ? (
                          <img src={member.photo} alt={member.firstName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{member.firstName?.charAt(0)}{member.lastName?.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-foreground">
                          {member.firstName} {member.middleName} {member.lastName}
                        </p>
                        <p className="text-[9px] text-muted-foreground">{member.Designation?.name || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold text-foreground">{member.staffId}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[9px] px-2 py-0.5 rounded border ${roleColors[member.role] || 'bg-accent/30 text-foreground border-border/50'}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] text-foreground">{member.Department?.name || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[10px] text-muted-foreground">
                      <p>{member.phone || '-'}</p>
                      <p className="text-[9px]">{member.email || '-'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => navigate(`/staff/${member.id}`)}
                        className="p-1.5 hover:bg-primary/10 hover:text-primary text-muted-foreground rounded-md transition-all"
                        title="View Details"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => navigate(`/staff/edit/${member.id}`)}
                        className="p-1.5 hover:bg-primary/10 hover:text-primary text-muted-foreground rounded-md transition-all"
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-1.5 hover:bg-destructive/10 hover:text-destructive text-muted-foreground rounded-md transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : !loading && (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <Users className="w-8 h-8 text-muted-foreground" />
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No staff found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && staff.length > 0 && (
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

export default StaffList;

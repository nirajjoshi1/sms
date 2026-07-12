import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Users,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { toast } from 'sonner';
import RequirePermission from '../../components/shared/RequirePermission';
import { PERMISSIONS } from '../../constants/permissions';

const StudentList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    classId: '',
    sectionId: '',
    categoryId: '',
    houseId: '',
    gender: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [houses, setHouses] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch dropdown data
  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        const [classRes, sectionRes, categoryRes, houseRes] = await Promise.all([
          api.get('/academics/classes'),
          api.get('/academics/sections'),
          api.get('/student-setup/categories'),
          api.get('/student-setup/houses')
        ]);
        setClasses(classRes.data.data || []);
        setSections(sectionRes.data.data || []);
        setCategories(categoryRes.data.data || []);
        setHouses(houseRes.data.data || []);
      } catch (error) {
        console.error('Failed to load setup data');
      }
    };
    fetchSetupData();
  }, []);

  // Fetch students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        ...filters
      };

      const response = await api.get('/students', { params });
      setStudents(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0
      }));
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, filters, pagination.page, pagination.limit]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete student');
    }
  };

  const clearFilters = () => {
    setFilters({
      classId: '',
      sectionId: '',
      categoryId: '',
      houseId: '',
      gender: ''
    });
    setSearchQuery('');
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Student List</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">
            Manage all student records
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
          <RequirePermission permission={PERMISSIONS.STUDENTS_CREATE}>
            <Link
              to="/students/admission"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[11px] font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Student
            </Link>
          </RequirePermission>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <select
              value={filters.classId}
              onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
              className="h-9 bg-background border border-border rounded-lg px-3 text-[11px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/50 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat pr-8"
              style={{ colorScheme: 'dark' }}
            >
              <option value="">All Classes</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={filters.sectionId}
              onChange={(e) => setFilters({ ...filters, sectionId: e.target.value })}
              className="h-9 bg-background border border-border rounded-lg px-3 text-[11px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/50 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat pr-8"
              style={{ colorScheme: 'dark' }}
            >
              <option value="">All Sections</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              value={filters.categoryId}
              onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
              className="h-9 bg-background border border-border rounded-lg px-3 text-[11px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/50 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat pr-8"
              style={{ colorScheme: 'dark' }}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={filters.houseId}
              onChange={(e) => setFilters({ ...filters, houseId: e.target.value })}
              className="h-9 bg-background border border-border rounded-lg px-3 text-[11px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/50 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat pr-8"
              style={{ colorScheme: 'dark' }}
            >
              <option value="">All Houses</option>
              {houses.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
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
            placeholder="Search by name, admission no, roll number..."
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
                <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Student</th>
                <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Admission No</th>
                <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Class</th>
                <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Section</th>
                <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Category</th>
                <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Gender</th>
                <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {!loading && students.length > 0 ? students.map((student) => (
                <tr key={student.id} className="hover:bg-muted/5 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground overflow-hidden flex-shrink-0">
                        {student.photo ? (
                          <img src={student.photo} alt={student.firstName} className="w-full h-full object-cover" />
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
                    <span className="text-[9px] px-2 py-0.5 bg-accent/30 text-foreground rounded border border-border/50">
                      {student.Category?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] text-muted-foreground">{student.gender}</span>
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
                      <RequirePermission permission={PERMISSIONS.STUDENTS_UPDATE}>
                        <button
                          onClick={() => navigate(`/students/edit/${student.id}`)}
                          className="p-1.5 hover:bg-primary/10 hover:text-primary text-muted-foreground rounded-md transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </RequirePermission>
                      <RequirePermission permission={PERMISSIONS.STUDENTS_DISABLE}>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-1.5 hover:bg-destructive/10 hover:text-destructive text-muted-foreground rounded-md transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </RequirePermission>
                    </div>
                  </td>
                </tr>
              )) : !loading && (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <Users className="w-8 h-8 text-muted-foreground" />
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No students found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

export default StudentList;

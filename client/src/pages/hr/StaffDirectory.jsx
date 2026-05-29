import React, { useState, useEffect } from 'react';
import { Search, Users, Mail, Phone, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';

const StaffDirectory = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hr/staff?isDisabled=false');
      setStaff(response.data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch staff'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = staff.filter(s => {
    const matchesSearch =
      s.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.staffId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = !roleFilter || s.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);

  const getRoleColor = (role) => {
    const colors = {
      ADMIN: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      TEACHER: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      ACCOUNTANT: 'bg-green-500/10 text-green-600 dark:text-green-400',
      LIBRARIAN: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      RECEPTIONIST: 'bg-pink-500/10 text-pink-600 dark:text-pink-400'
    };
    return colors[role] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="border-b border-border pb-3">
        <h1 className="text-lg font-black text-foreground tracking-tight">Staff Directory</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">View all active staff members</p>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Total Staff Members</p>
            <p className="text-2xl font-black text-foreground">{staff.length}</p>
            <p className="text-[10px] text-muted-foreground">Active employees</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-9 bg-muted/30 border border-border rounded-lg pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="TEACHER">Teacher</option>
              <option value="ACCOUNTANT">Accountant</option>
              <option value="LIBRARIAN">Librarian</option>
              <option value="RECEPTIONIST">Receptionist</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Loading...</span>
          </div>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No staff members found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentItems.map((member) => (
              <div
                key={member.id}
                className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(`/staff/edit/${member.id}`)}
              >
                <div className="flex items-start gap-3 mb-3">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={`${member.firstName} ${member.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {member.firstName?.[0]}{member.lastName?.[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-foreground truncate">
                      {member.firstName} {member.lastName}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">{member.staffId}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                  </div>

                  {member.Department && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-[10px] text-muted-foreground truncate">
                        {member.Department.name}
                      </span>
                    </div>
                  )}

                  {member.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-[10px] text-muted-foreground truncate">
                        {member.email}
                      </span>
                    </div>
                  )}

                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-[10px] text-muted-foreground">
                        {member.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStaff.length)} of {filteredStaff.length} staff
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
  );
};

export default StaffDirectory;

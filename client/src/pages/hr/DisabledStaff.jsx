import React, { useState, useEffect } from 'react';
import { UserX, Search, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';

const DisabledStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchDisabledStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hr/staff?isDisabled=true');
      setStaff(response.data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch disabled staff'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisabledStaff();
  }, []);

  const handleEnable = async (id) => {
    if (!window.confirm('Are you sure you want to enable this staff member?')) return;

    try {
      await api.patch(`/hr/staff/${id}/toggle-status`, {
        isDisabled: false,
        disableReason: null
      });
      toast.success('Staff member enabled successfully');
      fetchDisabledStaff();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to enable staff member'));
    }
  };

  const filteredStaff = staff.filter(s => {
    const searchLower = searchQuery.toLowerCase();
    return (
      s.firstName?.toLowerCase().includes(searchLower) ||
      s.lastName?.toLowerCase().includes(searchLower) ||
      s.staffId?.toLowerCase().includes(searchLower) ||
      s.disableReason?.toLowerCase().includes(searchLower)
    );
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
        <h1 className="text-lg font-black text-foreground tracking-tight">Disabled Staff Members</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">View and manage disabled staff</p>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center">
            <UserX className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Total Disabled Staff</p>
            <p className="text-2xl font-black text-foreground">{staff.length}</p>
            <p className="text-[10px] text-muted-foreground">Inactive employees</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, ID, or disable reason..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 bg-muted/30 border border-border rounded-lg pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Staff Table */}
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
            <UserX className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No disabled staff members found</p>
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
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Disable Reason</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentItems.map((member) => (
                    <tr key={member.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {member.photo ? (
                            <img
                              src={member.photo}
                              alt={`${member.firstName} ${member.lastName}`}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-xs font-bold text-muted-foreground">
                                {member.firstName?.[0]}{member.lastName?.[0]}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-foreground">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{member.staffId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${getRoleColor(member.role)}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground">
                          {member.Department?.name || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">
                          {member.disableReason || 'No reason specified'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleEnable(member.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 rounded-lg transition-colors text-[10px] font-bold"
                          title="Enable Staff"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Enable
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
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStaff.length)} of {filteredStaff.length} records
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

export default DisabledStaff;

import React, { useState, useEffect } from 'react';
import { Check, X, Calendar, Clock, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';

const ApproveLeave = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/hr/leave-requests${statusFilter ? `?status=${statusFilter}` : ''}`);
      setLeaveRequests(response.data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch leave requests'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, status, note = '') => {
    const action = status === 'Approved' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${action} this leave request?`)) return;

    try {
      await api.patch(`/hr/leave-requests/${id}/status`, { status, note });
      toast.success(`Leave request ${status.toLowerCase()} successfully`);
      fetchLeaveRequests();
    } catch (error) {
      toast.error(getErrorMessage(error, `Failed to ${action} leave request`));
    }
  };

  const filteredRequests = leaveRequests;
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      Approved: 'bg-green-500/10 text-green-600 dark:text-green-400',
      Rejected: 'bg-red-500/10 text-red-600 dark:text-red-400'
    };
    return colors[status] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  };

  const calculateDays = (fromDate, toDate) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="border-b border-border pb-3">
        <h1 className="text-lg font-black text-foreground tracking-tight">Approve Leave Requests</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Review and approve staff leave requests</p>
      </div>

      {/* Filter */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Status Filter</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-64 h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
          >
            <option value="">All Requests</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Leave Requests Table */}
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
            <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No leave requests found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/5 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Staff</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Leave Type</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Period</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Days</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reason</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentItems.map((request) => (
                    <tr key={request.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            {request.Staff?.firstName} {request.Staff?.lastName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{request.Staff?.staffId}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground">{request.LeaveType?.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span>{new Date(request.fromDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-muted-foreground">to</span>
                            <span>{new Date(request.toDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs font-bold text-foreground">
                            {request.isHalfDay ? '0.5' : calculateDays(request.fromDate, request.toDate)} days
                          </span>
                        </div>
                        {request.isHalfDay && (
                          <span className="text-[10px] text-muted-foreground">({request.halfDayType})</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {request.reason || '-'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {request.status === 'Pending' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleUpdateStatus(request.id, 'Approved')}
                              className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(request.id, 'Rejected')}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">-</span>
                        )}
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
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRequests.length)} of {filteredRequests.length} requests
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

export default ApproveLeave;

import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';

const StatusBadge = ({ status }) => {
  const config = {
    Approved: {
      className: 'bg-green-500/10 text-green-500',
      icon: <CheckCircle className="w-3 h-3 mr-1" />,
    },
    Pending: {
      className: 'bg-yellow-500/10 text-yellow-500',
      icon: <Clock className="w-3 h-3 mr-1" />,
    },
    Rejected: {
      className: 'bg-red-500/10 text-red-500',
      icon: <XCircle className="w-3 h-3 mr-1" />,
    },
  };

  const { className, icon } = config[status] || config['Pending'];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${className}`}
    >
      {icon}
      {status}
    </span>
  );
};

const OnlineAdmission = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/school-requests');
      setRequests(response.data?.data || response.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    setActionLoading((prev) => ({ ...prev, [id]: status }));
    try {
      await api.patch(`/school-requests/${id}/status`, { status });
      toast.success(`Request ${status.toLowerCase()} successfully.`);
      await fetchRequests();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionLoading((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Online Admission Requests
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              School registration requests submitted through the public portal
            </p>
          </div>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin" />
            <p className="text-xs text-muted-foreground">
              Loading admission requests…
            </p>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Building2 className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              No admission requests found
            </p>
            <p className="text-xs text-muted-foreground/60">
              School registration requests will appear here once submitted.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="p-3 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      School Name
                    </span>
                  </th>
                  <th className="p-3 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      School Code
                    </span>
                  </th>
                  <th className="p-3 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      Contact Name
                    </span>
                  </th>
                  <th className="p-3 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      Email
                    </span>
                  </th>
                  <th className="p-3 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      Phone
                    </span>
                  </th>
                  <th className="p-3 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      Status
                    </span>
                  </th>
                  <th className="p-3 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      Submitted Date
                    </span>
                  </th>
                  <th className="p-3 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, index) => {
                  const isActing = !!actionLoading[req._id || req.id];
                  const isPending =
                    !req.status || req.status === 'Pending';

                  return (
                    <tr
                      key={req._id || req.id || index}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3 text-xs font-medium">
                        {req.schoolName || '—'}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground font-mono">
                        {req.schoolCode || '—'}
                      </td>
                      <td className="p-3 text-xs">
                        {req.contactName || req.adminName || '—'}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {req.email || '—'}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {req.phone || req.phoneNumber || '—'}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={req.status || 'Pending'} />
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {formatDate(req.createdAt || req.submittedAt)}
                      </td>
                      <td className="p-3">
                        {isPending ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  req._id || req.id,
                                  'Approved'
                                )
                              }
                              disabled={isActing}
                              className="inline-flex items-center gap-1 h-7 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle className="w-3 h-3" />
                              {actionLoading[req._id || req.id] === 'Approved'
                                ? 'Approving…'
                                : 'Approve'}
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  req._id || req.id,
                                  'Rejected'
                                )
                              }
                              disabled={isActing}
                              className="inline-flex items-center gap-1 h-7 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <XCircle className="w-3 h-3" />
                              {actionLoading[req._id || req.id] === 'Rejected'
                                ? 'Rejecting…'
                                : 'Reject'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 ml-1">
                            No actions
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineAdmission;

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare,
  RefreshCw,
  Inbox,
  ChevronDown,
  Code
} from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const STATUS_COLORS = {
  Pending:  { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20',  icon: <Clock  className="w-3 h-3" /> },
  Approved: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: <CheckCircle className="w-3 h-3" /> },
  Rejected: { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/20',    icon: <XCircle className="w-3 h-3" /> },
};

const SchoolRequestsPanel = ({ onApprove }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/school-requests');
      if (res.data?.success) setRequests(res.data.data);
    } catch {
      toast.error('Failed to fetch registration requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleStatusUpdate = async (id, status, request) => {
    setUpdating(id);
    try {
      await api.patch(`/school-requests/${id}/status`, { status });
      toast.success(`Request marked as ${status}`);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      // If approved, call parent to pre-fill the add school modal
      if (status === 'Approved' && onApprove) {
        onApprove({
          schoolName: request.schoolName,
          schoolEmail: request.contactEmail,
          schoolPhone: request.contactPhone,
          schoolAddress: request.address || '',
          adminName: request.contactName,
          adminEmail: '',
          adminPassword: ''
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update request status');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const counts = {
    all: requests.length,
    Pending: requests.filter(r => r.status === 'Pending').length,
    Approved: requests.filter(r => r.status === 'Approved').length,
    Rejected: requests.filter(r => r.status === 'Rejected').length,
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'Pending', 'Approved', 'Rejected'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition capitalize ${
                filter === s
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:border-ring hover:text-foreground'
              }`}
            >
              {s === 'all' ? 'All Requests' : s}
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-black/20 text-[10px]">
                {counts[s] ?? 0}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:border-ring transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <p className="text-xs font-semibold">Loading requests...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
            <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-border flex items-center justify-center">
              <Inbox className="w-7 h-7 opacity-40" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">No requests found</p>
              <p className="text-xs mt-1">
                {filter === 'all' ? 'No school registration requests have been submitted yet.' : `No ${filter.toLowerCase()} requests.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(req => {
              const s = STATUS_COLORS[req.status] || STATUS_COLORS.Pending;
              return (
                <div key={req.id} className="p-5 hover:bg-muted/10 transition group">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Left: Icon + School info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-foreground">{req.schoolName}</p>
                          <span className="px-2 py-0.5 rounded bg-muted/60 text-muted-foreground text-[10px] font-bold tracking-wider border border-border flex items-center gap-1">
                            <Code className="w-2.5 h-2.5" /> {req.schoolCode}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${s.bg} ${s.text} ${s.border}`}>
                            {s.icon} {req.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground font-medium">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {req.contactEmail}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {req.contactPhone}</span>
                          <span className="flex items-center gap-1 font-bold text-foreground">{req.contactName}</span>
                        </div>
                        {req.address && (
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {req.address}
                          </p>
                        )}
                        {req.message && (
                          <p className="text-[11px] text-muted-foreground flex items-start gap-1 mt-1 border-t border-border/50 pt-2">
                            <MessageSquare className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            <span className="italic">{req.message}</span>
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground/70 mt-1">
                          Submitted {new Date(req.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    {req.status === 'Pending' && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          disabled={!!updating}
                          onClick={() => handleStatusUpdate(req.id, 'Approved', req)}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-[11px] font-bold transition disabled:opacity-50"
                        >
                          {updating === req.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          Approve & Create School
                        </button>
                        <button
                          disabled={!!updating}
                          onClick={() => handleStatusUpdate(req.id, 'Rejected', req)}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive rounded-xl text-[11px] font-bold transition disabled:opacity-50"
                        >
                          {updating === req.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                          Reject
                        </button>
                      </div>
                    )}
                    {req.status === 'Approved' && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => onApprove && onApprove({
                            schoolName: req.schoolName,
                            schoolEmail: req.contactEmail,
                            schoolPhone: req.contactPhone,
                            schoolAddress: req.address || '',
                            adminName: req.contactName,
                            adminEmail: '',
                            adminPassword: ''
                          })}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded-xl text-[11px] font-bold transition"
                        >
                          Create School →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolRequestsPanel;

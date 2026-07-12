import React, { useState, useEffect } from 'react';
import { Calendar, Plus } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';
import CustomModal from '../../components/ui/CustomModal';

const ApplyLeave = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    leaveTypeId: '',
    fromDate: '',
    toDate: '',
    isHalfDay: false,
    halfDayType: '',
    reason: '',
    documentUrl: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [typesRes, leavesRes] = await Promise.all([
        api.get('/hr/leave-types'),
        api.get('/hr/leave-requests')
      ]);
      setLeaveTypes(typesRes.data.data || []);
      setMyLeaves(leavesRes.data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = () => {
    setFormData({ leaveTypeId: '', fromDate: '', toDate: '', isHalfDay: false, halfDayType: '', reason: '', documentUrl: '' });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.leaveTypeId) return toast.error('Please select leave type');
    if (!formData.fromDate) return toast.error('From date is required');
    if (!formData.toDate) return toast.error('To date is required');
    if (!formData.reason) return toast.error('Reason is required');

    // staffId is auto-resolved on the backend from the JWT token for non-admin roles
    const payload = { ...formData, applyDate: new Date().toISOString() };

    try {
      setSubmitting(true);
      await api.post('/hr/leave-requests', payload);
      toast.success('Leave request submitted successfully');
      closeModal();
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to submit leave request'));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Rejected': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    }
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Apply Leave</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Submit and track your leave requests</p>
        </div>
        <button
          onClick={openModal}
          className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 transition-all flex items-center gap-2 w-fit"
        >
          <Plus className="w-3 h-3" />
          Apply Leave
        </button>
      </div>

      {/* My Leave Requests */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/5">
          <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">My Leave Requests</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-6 h-6 border-b-2 border-primary rounded-full" />
          </div>
        ) : myLeaves.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No leave requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/5 border-b border-border">
                <tr>
                  {['Leave Type', 'Duration', 'Apply Date', 'Reason', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {myLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-4 py-3 text-xs font-bold">{leave.LeaveType?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(leave.fromDate).toLocaleDateString()} — {new Date(leave.toDate).toLocaleDateString()}
                      {leave.isHalfDay && <span className="ml-1 text-[10px] text-muted-foreground">({leave.halfDayType})</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(leave.applyDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">{leave.reason || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      <CustomModal isOpen={showModal} onClose={closeModal} title="Apply for Leave" maxWidth="max-w-md">
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Leave Type *</label>
            <select
              value={formData.leaveTypeId}
              onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
              className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
              required
            >
              <option value="">Select Leave Type</option>
              {leaveTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[['fromDate', 'From Date *'], ['toDate', 'To Date *']].map(([field, label]) => (
              <div key={field} className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">{label}</label>
                <input
                  type="date"
                  value={formData[field]}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isHalfDay"
              checked={formData.isHalfDay}
              onChange={(e) => setFormData({ ...formData, isHalfDay: e.target.checked })}
              className="w-4 h-4 rounded border-border"
            />
            <label htmlFor="isHalfDay" className="text-xs text-foreground">Half Day Leave</label>
          </div>

          {formData.isHalfDay && (
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Half Day Type *</label>
              <select
                value={formData.halfDayType}
                onChange={(e) => setFormData({ ...formData, halfDayType: e.target.value })}
                className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
              >
                <option value="">Select Half Day Type</option>
                <option value="First Half">First Half</option>
                <option value="Second Half">Second Half</option>
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Reason *</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Enter reason for leave..."
              rows="3"
              className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={closeModal} className="flex-1 h-9 bg-muted text-foreground rounded-lg text-[10px] font-bold hover:bg-muted/80">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 h-9 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </CustomModal>
    </div>
  );
};

export default ApplyLeave;

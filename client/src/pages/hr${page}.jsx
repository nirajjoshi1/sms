import React, { useState, useEffect } from 'react';
import { Star, Plus, User } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';
import CustomModal from '../../components/ui/CustomModal';

const TeachersRating = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [staff, setStaff] = useState([]);
  const [formData, setFormData] = useState({
    staffId: '',
    rating: '5',
    remarks: ''
  });

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hr/teacher-ratings');
      setRatings(res.data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch teacher ratings'));
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await api.get('/hr/staff');
      setStaff(res.data.data || []);
    } catch (error) {
      // silently fail
    }
  };

  useEffect(() => {
    fetchRatings();
    fetchStaff();
  }, []);

  const openModal = () => {
    setFormData({ staffId: '', rating: '5', remarks: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.staffId) return toast.error('Please select a teacher');
    if (!formData.rating) return toast.error('Please provide a rating');

    try {
      setSubmitting(true);
      await api.post('/hr/teacher-ratings', {
        staffId: formData.staffId,
        rating: parseInt(formData.rating),
        remarks: formData.remarks
      });
      toast.success('Teacher rating submitted successfully');
      closeModal();
      fetchRatings();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to submit rating'));
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
      />
    ));
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Teacher Ratings</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Track and manage teacher performance ratings</p>
        </div>
        <button
          onClick={openModal}
          className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 transition-all flex items-center gap-2 w-fit"
        >
          <Plus className="w-3 h-3" />
          Add Rating
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-accent/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="p-3">Teacher</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Remarks</th>
                <th className="p-3">Reviewed By</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : ratings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-muted-foreground">
                    <Star className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="font-bold">No ratings submitted yet</p>
                    <p className="text-[10px] mt-1">Click Add Rating to submit the first review</p>
                  </td>
                </tr>
              ) : (
                ratings.map((r) => (
                  <tr key={r.id} className="hover:bg-accent/20 transition-all">
                    <td className="p-3 font-semibold">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-3 h-3 text-primary" />
                        </div>
                        {r.Staff?.firstName} {r.Staff?.lastName}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {renderStars(r.rating)}
                        <span className="ml-1 text-[10px] font-bold text-muted-foreground">({r.rating}/5)</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground max-w-[200px] truncate">{r.remarks || '—'}</td>
                    <td className="p-3 text-muted-foreground">
                      {r.Student ? `${r.Student.firstName} ${r.Student.lastName}` : 'Admin'}
                    </td>
                    <td className="p-3 text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rating Modal */}
      <CustomModal
        isOpen={showModal}
        onClose={closeModal}
        title="Submit Teacher Rating"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Select Teacher *</label>
            <select
              value={formData.staffId}
              onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
              className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
              required
            >
              <option value="">Choose Teacher</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.staffId})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Rating (1–5) *</label>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: String(val) })}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 transition-all ${parseInt(formData.rating) >= val ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30 hover:text-amber-300'}`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-muted-foreground ml-1">{formData.rating}/5</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Feedback on teacher's performance..."
              rows="3"
              className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="h-8 px-4 border border-border rounded-lg text-[10px] font-bold hover:bg-accent transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              <Star className="w-3 h-3" />
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </CustomModal>
    </div>
  );
};

export default TeachersRating;

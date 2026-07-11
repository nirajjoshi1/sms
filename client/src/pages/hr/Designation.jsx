import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Briefcase } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';
import CustomModal from '../../components/ui/CustomModal';

const Designation = () => {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hr/designations');
      setDesignations(response.data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch designations'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name });
    } else {
      setEditingItem(null);
      setFormData({ name: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Designation name is required');

    try {
      setSubmitting(true);
      if (editingItem) {
        await api.put(`/hr/designations/${editingItem.id}`, formData);
        toast.success('Designation updated');
      } else {
        await api.post('/hr/designations', formData);
        toast.success('Designation created');
      }
      setShowModal(false);
      fetchDesignations();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this designation?')) return;
    try {
      await api.delete(`/hr/designations/${id}`);
      toast.success('Deleted');
      fetchDesignations();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete'));
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black">Designation</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Manage designations</p>
        </div>
        <button onClick={() => openModal()} className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold flex items-center gap-2">
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div></div>
        ) : designations.length === 0 ? (
          <div className="p-12 text-center"><Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" /><p className="text-xs text-muted-foreground">No designations</p></div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/5 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase">Name</th>
                <th className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {designations.map((item) => (
                <tr key={item.id} className="hover:bg-muted/5">
                  <td className="px-4 py-3"><span className="text-xs font-bold">{item.name}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openModal(item)} className="p-1.5 hover:bg-primary/10 rounded-lg"><Edit2 className="w-3.5 h-3.5 text-primary" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CustomModal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Designation' : 'Add Designation'} maxWidth="max-w-md">
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase ml-1">Name *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({name: e.target.value})} placeholder="e.g. Principal" className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs" required />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-9 bg-muted rounded-lg text-[10px] font-bold">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 h-9 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold disabled:opacity-50">
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </CustomModal>
    </div>
  );
};

export default Designation;

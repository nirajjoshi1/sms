import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Bell, BellOff } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';

const FeesReminder = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    reminderType: 'Before Due',
    days: '',
    isActive: true
  });

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/fees/reminders');
      setReminders(res.data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch reminders'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const openModal = (reminder = null) => {
    if (reminder) {
      setEditingId(reminder.id);
      setFormData({
        reminderType: reminder.reminderType || 'Before Due',
        days: reminder.days || '',
        isActive: reminder.isActive !== undefined ? reminder.isActive : true
      });
    } else {
      setEditingId(null);
      setFormData({
        reminderType: 'Before Due',
        days: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.days) return toast.error('Number of days is required');

    try {
      setSubmitting(true);
      if (editingId) {
        await api.put(`/fees/reminders/${editingId}`, formData);
        toast.success('Reminder updated successfully');
      } else {
        await api.post('/fees/reminders', formData);
        toast.success('Reminder created successfully');
      }
      closeModal();
      fetchReminders();
    } catch (error) {
      toast.error(getErrorMessage(error, `Failed to ${editingId ? 'update' : 'create'} reminder`));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      await api.delete(`/fees/reminders/${id}`);
      toast.success('Reminder deleted successfully');
      fetchReminders();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete reminder'));
    }
  };

  const toggleActive = async (reminder) => {
    try {
      await api.put(`/fees/reminders/${reminder.id}`, {
        ...reminder,
        isActive: !reminder.isActive
      });
      toast.success(`Reminder ${!reminder.isActive ? 'activated' : 'deactivated'}`);
      fetchReminders();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update reminder status'));
    }
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Fee Reminders</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Configure fee reminder settings</p>
        </div>
        <button
          onClick={() => openModal()}
          className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 transition-all flex items-center gap-2 w-fit"
        >
          <Plus className="w-3 h-3" />
          Add Reminder
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-foreground mb-1">About Fee Reminders</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Configure automatic reminders to notify students/parents about upcoming or overdue fee payments.
              You can set reminders to be sent before the due date or after it has passed.
            </p>
          </div>
        </div>
      </div>

      {/* Reminders Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Loading...</span>
            </div>
          </div>
        ) : reminders.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No reminders configured</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/5 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reminder Type</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Days</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Description</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reminders.map((reminder) => (
                  <tr key={reminder.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-foreground">{reminder.reminderType}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                        {reminder.days} {reminder.days === 1 ? 'Day' : 'Days'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">
                        {reminder.reminderType === 'Before Due'
                          ? `Send reminder ${reminder.days} day(s) before due date`
                          : `Send reminder ${reminder.days} day(s) after due date`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(reminder)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
                          reminder.isActive
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {reminder.isActive ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                        {reminder.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(reminder)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(reminder.id)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
                {editingId ? 'Edit Reminder' : 'Add Reminder'}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-muted rounded">
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Reminder Type</label>
                <select
                  value={formData.reminderType}
                  onChange={(e) => setFormData({...formData, reminderType: e.target.value})}
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                >
                  <option value="Before Due">Before Due Date</option>
                  <option value="After Due">After Due Date (Overdue)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Number of Days *</label>
                <input
                  type="number"
                  value={formData.days}
                  onChange={(e) => setFormData({...formData, days: e.target.value})}
                  placeholder="Enter number of days"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                  min="1"
                />
                <p className="text-[9px] text-muted-foreground ml-1 mt-1">
                  {formData.reminderType === 'Before Due'
                    ? 'Reminder will be sent this many days before the due date'
                    : 'Reminder will be sent this many days after the due date has passed'}
                </p>
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-1 focus:ring-primary/20"
                  />
                  <span className="text-xs text-foreground">Active</span>
                </label>
                <p className="text-[9px] text-muted-foreground ml-6">
                  Only active reminders will be sent to students/parents
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 h-9 bg-muted text-foreground rounded-lg text-[10px] font-bold hover:bg-muted/80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-9 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesReminder;

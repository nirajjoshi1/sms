import React, { useState } from 'react';
import { Bell, Send, Users } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';

const ROLES = [
  { value: '', label: 'All Users' },
  { value: 'ADMIN', label: 'Admins' },
  { value: 'TEACHER', label: 'Teachers' },
  { value: 'ACCOUNTANT', label: 'Accountants' },
  { value: 'RECEPTIONIST', label: 'Receptionists' },
];

const NOTIFICATION_TYPES = [
  { value: 'info', label: 'Info' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
];

const BroadcastNotification = () => {
  const [form, setForm] = useState({ title: '', message: '', type: 'info', targetRole: '' });
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.message.trim()) return toast.error('Message is required');

    try {
      setSending(true);
      const res = await api.post('/notifications/broadcast', form);
      const data = res.data.data;
      setLastResult(data);
      toast.success(`Notification sent to ${data.sent} user(s)`);
      setForm({ title: '', message: '', type: 'info', targetRole: '' });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to send notification'));
    } finally {
      setSending(false);
    }
  };

  const typeColors = {
    info: 'border-blue-500/30 bg-blue-500/5',
    success: 'border-green-500/30 bg-green-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    error: 'border-red-500/30 bg-red-500/5',
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[900px] mx-auto">
      <div className="border-b border-border pb-3">
        <h1 className="text-lg font-black text-foreground tracking-tight">Broadcast Notification</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Send announcements to all users or specific roles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Form */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Notification Title *</label>
              <input
                type="text"
                placeholder="e.g. School closed tomorrow"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Message *</label>
              <textarea
                placeholder="Write the notification message here..."
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                rows={5}
                className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                >
                  {NOTIFICATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Target Audience</label>
                <select
                  value={form.targetRole}
                  onChange={e => setForm({ ...form, targetRole: e.target.value })}
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                >
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>

            {/* Preview */}
            {(form.title || form.message) && (
              <div className={`border rounded-xl p-3 transition-all ${typeColors[form.type] || typeColors.info}`}>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Preview</p>
                <p className="text-xs font-bold text-foreground">{form.title || '—'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{form.message || '—'}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full h-10 bg-primary text-primary-foreground rounded-lg text-[11px] font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {sending ? (
                <><div className="animate-spin w-4 h-4 border-b-2 border-white rounded-full" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4" /> Send Notification</>
              )}
            </button>
          </form>
        </div>

        {/* Info panel */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold text-foreground">How it works</h3>
            </div>
            <div className="space-y-2 text-[11px] text-muted-foreground">
              <p>• Notifications appear in the notification bell for all targeted users.</p>
              <p>• Selecting a specific role targets only those users.</p>
              <p>• "All Users" sends to every active account in the system.</p>
              <p>• Users can mark notifications as read or delete them.</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold text-foreground">Target Roles</h3>
            </div>
            <div className="space-y-1.5">
              {ROLES.filter(r => r.value).map(r => (
                <div key={r.value} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-[11px] text-muted-foreground">{r.label}</span>
                </div>
              ))}
            </div>
          </div>

          {lastResult && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-green-600 mb-1">Last Sent</p>
              <p className="text-xl font-black text-green-600">{lastResult.sent}</p>
              <p className="text-[11px] text-muted-foreground">users notified • {lastResult.targetRole || 'all roles'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BroadcastNotification;

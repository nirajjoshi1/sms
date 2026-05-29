import React, { useState, useEffect } from 'react';
import { Save, Bell, Mail, MessageSquare } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { Switch } from '../../components/ui/switch';

const NotificationSetting = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    admissionNotification: true,
    feePaymentNotification: true,
    attendanceNotification: true,
    examResultNotification: true,
    homeworkNotification: true,
    leaveNotification: true,
    birthdayNotification: false,
    eventNotification: true,
    newsNotification: false
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings/notifications');
      if (response.data.data) {
        setFormData(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await api.put('/settings/notifications', formData);
      toast.success('Notification settings updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Notification Settings</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">
            Configure notification preferences
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Notification Channels */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Notification Channels</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs font-bold text-foreground">Email Notifications</p>
                  <p className="text-[10px] text-muted-foreground">Send notifications via email</p>
                </div>
              </div>
              <Switch
                checked={formData.emailNotifications}
                onCheckedChange={(checked) => setFormData({ ...formData, emailNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs font-bold text-foreground">SMS Notifications</p>
                  <p className="text-[10px] text-muted-foreground">Send notifications via SMS</p>
                </div>
              </div>
              <Switch
                checked={formData.smsNotifications}
                onCheckedChange={(checked) => setFormData({ ...formData, smsNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs font-bold text-foreground">Push Notifications</p>
                  <p className="text-[10px] text-muted-foreground">Send browser push notifications</p>
                </div>
              </div>
              <Switch
                checked={formData.pushNotifications}
                onCheckedChange={(checked) => setFormData({ ...formData, pushNotifications: checked })}
              />
            </div>
          </div>
        </div>

        {/* Event Types */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/10">
            <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Notification Events</h3>
          </div>
          <div className="p-4 space-y-2">
            {[
              { key: 'admissionNotification', label: 'Student Admission' },
              { key: 'feePaymentNotification', label: 'Fee Payments' },
              { key: 'attendanceNotification', label: 'Attendance Updates' },
              { key: 'examResultNotification', label: 'Exam Results' },
              { key: 'homeworkNotification', label: 'Homework Assignments' },
              { key: 'leaveNotification', label: 'Leave Applications' },
              { key: 'birthdayNotification', label: 'Birthday Reminders' },
              { key: 'eventNotification', label: 'School Events' },
              { key: 'newsNotification', label: 'News Updates' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-2 hover:bg-muted/10 rounded-lg">
                <p className="text-xs font-medium text-foreground">{item.label}</p>
                <Switch
                  checked={formData[item.key]}
                  onCheckedChange={(checked) => setFormData({ ...formData, [item.key]: checked })}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="h-9 px-6 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            {submitting ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationSetting;

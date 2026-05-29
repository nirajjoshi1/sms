import React, { useState, useEffect } from 'react';
import { Save, MessageSquare, TestTube } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { Switch } from '../../components/ui/switch';

const SmsSetting = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [formData, setFormData] = useState({
    provider: 'twilio',
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioPhoneNumber: '',
    nexmoApiKey: '',
    nexmoApiSecret: '',
    nexmoPhoneNumber: '',
    msg91AuthKey: '',
    msg91SenderId: '',
    isEnabled: false
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings/sms');
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
      await api.put('/settings/sms', formData);
      toast.success('SMS settings updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTestSMS = async () => {
    if (!testPhone.trim()) return toast.error('Please enter a phone number');

    try {
      setTesting(true);
      await api.post('/settings/sms/test', { phoneNumber: testPhone });
      toast.success('Test SMS sent successfully');
      setTestPhone('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send test SMS');
    } finally {
      setTesting(false);
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
          <h1 className="text-lg font-black text-foreground tracking-tight">SMS Settings</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">
            Configure SMS gateway and notifications
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Enable SMS */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground">Enable SMS Notifications</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Turn on/off SMS gateway integration
                </p>
              </div>
              <Switch
                checked={formData.isEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
              />
            </div>
          </div>
        </div>

        {/* Provider Selection */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">SMS Provider</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                Select Provider
              </label>
              <select
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
              >
                <option value="twilio">Twilio</option>
                <option value="nexmo">Nexmo (Vonage)</option>
                <option value="msg91">MSG91</option>
              </select>
            </div>
          </div>
        </div>

        {/* Twilio Settings */}
        {formData.provider === 'twilio' && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/10">
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Twilio Configuration</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Account SID
                </label>
                <input
                  type="text"
                  value={formData.twilioAccountSid}
                  onChange={(e) => setFormData({ ...formData, twilioAccountSid: e.target.value })}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Auth Token
                </label>
                <input
                  type="password"
                  value={formData.twilioAuthToken}
                  onChange={(e) => setFormData({ ...formData, twilioAuthToken: e.target.value })}
                  placeholder="••••••••••••••••••••••••••••••••"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Twilio Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.twilioPhoneNumber}
                  onChange={(e) => setFormData({ ...formData, twilioPhoneNumber: e.target.value })}
                  placeholder="+1234567890"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* Nexmo Settings */}
        {formData.provider === 'nexmo' && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/10">
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Nexmo Configuration</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  API Key
                </label>
                <input
                  type="text"
                  value={formData.nexmoApiKey}
                  onChange={(e) => setFormData({ ...formData, nexmoApiKey: e.target.value })}
                  placeholder="Your Nexmo API Key"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  API Secret
                </label>
                <input
                  type="password"
                  value={formData.nexmoApiSecret}
                  onChange={(e) => setFormData({ ...formData, nexmoApiSecret: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Sender Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.nexmoPhoneNumber}
                  onChange={(e) => setFormData({ ...formData, nexmoPhoneNumber: e.target.value })}
                  placeholder="+1234567890"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* MSG91 Settings */}
        {formData.provider === 'msg91' && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/10">
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">MSG91 Configuration</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Auth Key
                </label>
                <input
                  type="text"
                  value={formData.msg91AuthKey}
                  onChange={(e) => setFormData({ ...formData, msg91AuthKey: e.target.value })}
                  placeholder="Your MSG91 Auth Key"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Sender ID
                </label>
                <input
                  type="text"
                  value={formData.msg91SenderId}
                  onChange={(e) => setFormData({ ...formData, msg91SenderId: e.target.value })}
                  placeholder="SCHOOL"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* Test SMS */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center gap-2">
            <TestTube className="w-4 h-4 text-primary" />
            <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Test SMS</h3>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-[10px] text-muted-foreground">
              Send a test SMS to verify your configuration
            </p>
            <div className="flex gap-2">
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="Enter phone number with country code"
                className="flex-1 h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={handleTestSMS}
                disabled={testing}
                className="h-9 px-4 bg-secondary text-secondary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 disabled:opacity-50"
              >
                {testing ? 'Sending...' : 'Send Test SMS'}
              </button>
            </div>
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

export default SmsSetting;

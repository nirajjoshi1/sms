import React, { useState, useEffect } from 'react';
import { Save, Printer } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import ImageUpload from '../../components/common/ImageUpload';
import { Switch } from '../../components/ui/switch';

const PrintSetting = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    headerText: '',
    headerLeftLogo: '',
    headerRightLogo: '',
    footerText: '',
    showHeader: true,
    showFooter: true,
    showSchoolName: true,
    showSchoolAddress: true,
    showSchoolPhone: true,
    showSchoolEmail: true,
    showSchoolWebsite: true,
    showPageNumber: true,
    showDate: true
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings/print');
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
      await api.put('/settings/print', formData);
      toast.success('Print settings updated successfully');
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
          <h1 className="text-lg font-black text-foreground tracking-tight">Print Header / Footer</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">
            Configure print layout for documents
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Header Settings */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-primary" />
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Header Configuration</h3>
            </div>
            <Switch
              checked={formData.showHeader}
              onCheckedChange={(checked) => setFormData({ ...formData, showHeader: checked })}
            />
          </div>
          {formData.showHeader && (
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Header Text
                </label>
                <textarea
                  value={formData.headerText}
                  onChange={(e) => setFormData({ ...formData, headerText: e.target.value })}
                  placeholder="Header text to appear on all prints..."
                  rows="2"
                  className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUpload
                  value={formData.headerLeftLogo}
                  onChange={(url) => setFormData({ ...formData, headerLeftLogo: url })}
                  label="Left Logo"
                  helperText="Logo for left side of header"
                />

                <ImageUpload
                  value={formData.headerRightLogo}
                  onChange={(url) => setFormData({ ...formData, headerRightLogo: url })}
                  label="Right Logo"
                  helperText="Logo for right side of header"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Settings */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-primary" />
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Footer Configuration</h3>
            </div>
            <Switch
              checked={formData.showFooter}
              onCheckedChange={(checked) => setFormData({ ...formData, showFooter: checked })}
            />
          </div>
          {formData.showFooter && (
            <div className="p-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Footer Text
                </label>
                <textarea
                  value={formData.footerText}
                  onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                  placeholder="Footer text to appear on all prints..."
                  rows="2"
                  className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Display Options */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/10">
            <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Display Options</h3>
          </div>
          <div className="p-4 space-y-2">
            {[
              { key: 'showSchoolName', label: 'Show School Name' },
              { key: 'showSchoolAddress', label: 'Show School Address' },
              { key: 'showSchoolPhone', label: 'Show School Phone' },
              { key: 'showSchoolEmail', label: 'Show School Email' },
              { key: 'showSchoolWebsite', label: 'Show School Website' },
              { key: 'showPageNumber', label: 'Show Page Number' },
              { key: 'showDate', label: 'Show Print Date' }
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

export default PrintSetting;

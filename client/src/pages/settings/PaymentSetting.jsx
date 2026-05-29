import React, { useState, useEffect } from 'react';
import { Save, CreditCard, DollarSign } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { Switch } from '../../components/ui/switch';

const PaymentSetting = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Cash
    cashEnabled: true,

    // Stripe
    stripeEnabled: false,
    stripePublishableKey: '',
    stripeSecretKey: '',

    // PayPal
    paypalEnabled: false,
    paypalClientId: '',
    paypalSecret: '',
    paypalMode: 'sandbox',

    // Razorpay
    razorpayEnabled: false,
    razorpayKeyId: '',
    razorpayKeySecret: '',

    // Bank Transfer
    bankTransferEnabled: true,
    bankName: '',
    accountNumber: '',
    accountName: '',
    ifscCode: '',
    branchName: '',

    // Cheque
    chequeEnabled: true,
    chequePayableTo: ''
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings/payment');
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
      await api.put('/settings/payment', formData);
      toast.success('Payment settings updated successfully');
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
          <h1 className="text-lg font-black text-foreground tracking-tight">Payment Methods</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">
            Configure payment gateways and methods
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cash Payment */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Cash Payment</h3>
            </div>
            <Switch
              checked={formData.cashEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, cashEnabled: checked })}
            />
          </div>
        </div>

        {/* Stripe */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Stripe</h3>
            </div>
            <Switch
              checked={formData.stripeEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, stripeEnabled: checked })}
            />
          </div>
          {formData.stripeEnabled && (
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Publishable Key
                </label>
                <input
                  type="text"
                  value={formData.stripePublishableKey}
                  onChange={(e) => setFormData({ ...formData, stripePublishableKey: e.target.value })}
                  placeholder="pk_test_..."
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Secret Key
                </label>
                <input
                  type="password"
                  value={formData.stripeSecretKey}
                  onChange={(e) => setFormData({ ...formData, stripeSecretKey: e.target.value })}
                  placeholder="sk_test_..."
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
          )}
        </div>

        {/* PayPal */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">PayPal</h3>
            </div>
            <Switch
              checked={formData.paypalEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, paypalEnabled: checked })}
            />
          </div>
          {formData.paypalEnabled && (
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Client ID
                </label>
                <input
                  type="text"
                  value={formData.paypalClientId}
                  onChange={(e) => setFormData({ ...formData, paypalClientId: e.target.value })}
                  placeholder="Your PayPal Client ID"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Secret
                </label>
                <input
                  type="password"
                  value={formData.paypalSecret}
                  onChange={(e) => setFormData({ ...formData, paypalSecret: e.target.value })}
                  placeholder="Your PayPal Secret"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Mode
                </label>
                <select
                  value={formData.paypalMode}
                  onChange={(e) => setFormData({ ...formData, paypalMode: e.target.value })}
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                >
                  <option value="sandbox">Sandbox (Test)</option>
                  <option value="live">Live (Production)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Razorpay */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Razorpay</h3>
            </div>
            <Switch
              checked={formData.razorpayEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, razorpayEnabled: checked })}
            />
          </div>
          {formData.razorpayEnabled && (
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Key ID
                </label>
                <input
                  type="text"
                  value={formData.razorpayKeyId}
                  onChange={(e) => setFormData({ ...formData, razorpayKeyId: e.target.value })}
                  placeholder="rzp_test_..."
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Key Secret
                </label>
                <input
                  type="password"
                  value={formData.razorpayKeySecret}
                  onChange={(e) => setFormData({ ...formData, razorpayKeySecret: e.target.value })}
                  placeholder="Your Razorpay Secret"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bank Transfer */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Bank Transfer</h3>
            </div>
            <Switch
              checked={formData.bankTransferEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, bankTransferEnabled: checked })}
            />
          </div>
          {formData.bankTransferEnabled && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    Bank Name
                  </label>
                  <select
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  >
                    <option value="">Select Bank</option>
                    <option value="Nepal Bank Limited">Nepal Bank Limited</option>
                    <option value="Rastriya Banijya Bank">Rastriya Banijya Bank</option>
                    <option value="Agriculture Development Bank">Agriculture Development Bank</option>
                    <option value="Nabil Bank">Nabil Bank</option>
                    <option value="Nepal Investment Bank">Nepal Investment Bank</option>
                    <option value="Standard Chartered Bank Nepal">Standard Chartered Bank Nepal</option>
                    <option value="Himalayan Bank">Himalayan Bank</option>
                    <option value="Nepal SBI Bank">Nepal SBI Bank</option>
                    <option value="Nepal Bangladesh Bank">Nepal Bangladesh Bank</option>
                    <option value="Everest Bank">Everest Bank</option>
                    <option value="Kumari Bank">Kumari Bank</option>
                    <option value="Laxmi Bank">Laxmi Bank</option>
                    <option value="Citizens Bank International">Citizens Bank International</option>
                    <option value="Prime Commercial Bank">Prime Commercial Bank</option>
                    <option value="Sunrise Bank">Sunrise Bank</option>
                    <option value="NIC Asia Bank">NIC Asia Bank</option>
                    <option value="Global IME Bank">Global IME Bank</option>
                    <option value="NMB Bank">NMB Bank</option>
                    <option value="Prabhu Bank">Prabhu Bank</option>
                    <option value="Siddhartha Bank">Siddhartha Bank</option>
                    <option value="Sanima Bank">Sanima Bank</option>
                    <option value="Machhapuchchhre Bank">Machhapuchchhre Bank</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="Account Number"
                    className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    placeholder="Account Holder Name"
                    className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                    placeholder="IFSC Code"
                    className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={formData.branchName}
                  onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                  placeholder="Branch Name"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
          )}
        </div>

        {/* Cheque */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Cheque Payment</h3>
            </div>
            <Switch
              checked={formData.chequeEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, chequeEnabled: checked })}
            />
          </div>
          {formData.chequeEnabled && (
            <div className="p-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Cheque Payable To
                </label>
                <input
                  type="text"
                  value={formData.chequePayableTo}
                  onChange={(e) => setFormData({ ...formData, chequePayableTo: e.target.value })}
                  placeholder="e.g., School Name"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
          )}
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

export default PaymentSetting;

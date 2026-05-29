import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar, FileText } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';

const AddIncome = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [incomeHeads, setIncomeHeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    incomeHeadId: '',
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const headsRes = await api.get('/income/heads');
      setIncomeHeads(headsRes.data.data || []);

      if (isEditMode) {
        const incomeRes = await api.get(`/income/${id}`);
        const income = incomeRes.data.data;
        setFormData({
          name: income.name || '',
          incomeHeadId: income.incomeHeadId || '',
          invoiceNumber: income.invoiceNumber || '',
          date: income.date ? new Date(income.date).toISOString().split('T')[0] : '',
          amount: income.amount || '',
          description: income.description || ''
        });
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Income name is required');
    if (!formData.incomeHeadId) return toast.error('Income head is required');
    if (!formData.date) return toast.error('Date is required');
    if (!formData.amount) return toast.error('Amount is required');

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (isEditMode) {
        await api.put(`/income/${id}`, payload);
        toast.success('Income updated successfully');
      } else {
        await api.post('/income', payload);
        toast.success('Income created successfully');
      }
      navigate('/income/search');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save income'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <button
          onClick={() => navigate('/income/search')}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">
            {isEditMode ? 'Edit Income' : 'Add Income'}
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">
            {isEditMode ? 'Update income record' : 'Create new income record'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Income Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
            {/* Income Name */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                Income Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter income name"
                className="w-full h-10 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
                autoFocus
              />
            </div>

            {/* Income Head & Invoice Number */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Income Head *
                </label>
                <select
                  value={formData.incomeHeadId}
                  onChange={(e) => setFormData({ ...formData, incomeHeadId: e.target.value })}
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                >
                  <option value="">Select Income Head</option>
                  {incomeHeads.map(head => (
                    <option key={head.id} value={head.id}>{head.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="Enter invoice number"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Date & Amount */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full h-9 bg-muted/30 border border-border rounded-lg pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description (optional)"
                rows="4"
                className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/income/search')}
                className="flex-1 h-10 bg-muted text-foreground rounded-lg text-xs font-bold hover:bg-muted/80 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 h-10 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {submitting ? 'Saving...' : isEditMode ? 'Update Income' : 'Add Income'}
              </button>
            </div>
          </form>
        </div>

        {/* Summary Panel */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Income Summary</p>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-[9px] text-muted-foreground mb-1">Total Amount</p>
                <p className="text-2xl font-black text-green-600 dark:text-green-400">
                  ₹{(parseFloat(formData.amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              {formData.incomeHeadId && (
                <div>
                  <p className="text-[9px] text-muted-foreground mb-1">Income Category</p>
                  <p className="text-xs font-bold text-foreground">
                    {incomeHeads.find(h => h.id === formData.incomeHeadId)?.name || '-'}
                  </p>
                </div>
              )}

              {formData.date && (
                <div>
                  <p className="text-[9px] text-muted-foreground mb-1">Date</p>
                  <p className="text-xs text-foreground">
                    {new Date(formData.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {formData.invoiceNumber && (
                <div>
                  <p className="text-[9px] text-muted-foreground mb-1">Invoice Number</p>
                  <p className="text-xs text-foreground">{formData.invoiceNumber}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-blue-500 mt-0.5" />
              <div>
                <p className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
                  Quick Tips
                </p>
                <ul className="text-[10px] text-muted-foreground space-y-1">
                  <li>• All fields marked with * are required</li>
                  <li>• Income head must be created first</li>
                  <li>• Invoice number is optional</li>
                  <li>• Amount should be in INR (₹)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddIncome;

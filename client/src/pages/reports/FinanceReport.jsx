import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';
import { DollarSign, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const FinanceReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/finance');
      setData(response.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch finance report'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-black text-foreground tracking-tight">Financial Balance Sheet</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">General Ledger Summary</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Fees */}
        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-500/10 text-green-500">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Fee Collections</p>
            <h3 className="text-xl font-bold text-green-500">{formatCurrency(data.totalFees)}</h3>
          </div>
        </div>

        {/* Miscellaneous Income */}
        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Other Income</p>
            <h3 className="text-xl font-bold text-emerald-500">{formatCurrency(data.totalIncome)}</h3>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-red-500/10 text-red-500">
            <ArrowDownRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Expenses Paid</p>
            <h3 className="text-xl font-bold text-red-500">{formatCurrency(data.totalExpense)}</h3>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
          <div className={`p-3 rounded-lg ${data.netBalance >= 0 ? 'bg-primary/10 text-primary' : 'bg-rose-500/10 text-rose-500'}`}>
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Net Balance</p>
            <h3 className={`text-xl font-bold ${data.netBalance >= 0 ? 'text-primary' : 'text-rose-500'}`}>
              {formatCurrency(data.netBalance)}
            </h3>
          </div>
        </div>
      </div>

      {/* Financial Health Advice card */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-80 mb-2">Statement Analysis</h2>
        <p className="text-xs leading-relaxed text-foreground">
          The school's general ledger currently reflects a net balance of{' '}
          <strong className={data.netBalance >= 0 ? 'text-primary' : 'text-rose-500'}>
            {formatCurrency(data.netBalance)}
          </strong>
          . Total revenue streams (fees + other incomes) sum up to{' '}
          <strong>{formatCurrency(data.totalFees + data.totalIncome)}</strong> against overall expenditures of{' '}
          <strong className="text-rose-500">{formatCurrency(data.totalExpense)}</strong>.
        </p>
      </div>
    </div>
  );
};

export default FinanceReport;

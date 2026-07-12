import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, ReceiptText, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';
import { toast } from 'sonner';

const fmt = (val) => Number(val || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const AccountantDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [finRes, dashRes] = await Promise.allSettled([
          api.get('/reports/finance'),
          api.get('/dashboard')
        ]);
        if (finRes.status === 'fulfilled') setData(finRes.value.data.data);
        if (dashRes.status === 'fulfilled') {
          const d = dashRes.value.data.data;
          setPayments(d?.recentStudents || []);
        }
      } catch {
        toast.error('Failed to load financial data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalCollected = data?.feeCollection?.totalCollected || data?.totalFeeCollection || 0;
  const totalExpenses  = data?.totalExpenses || 0;
  const totalIncome    = data?.totalOtherIncome || 0;
  const netBalance     = (Number(totalCollected) + Number(totalIncome)) - Number(totalExpenses);

  const summaryCards = [
    {
      label: 'Total Fee Collection',
      value: fmt(totalCollected),
      icon: <CreditCard className="w-5 h-5" />,
      color: 'bg-emerald-500',
      trend: '+',
      trendColor: 'text-emerald-500'
    },
    {
      label: 'Other Income',
      value: fmt(totalIncome),
      icon: <Wallet className="w-5 h-5" />,
      color: 'bg-blue-500',
      trend: '+',
      trendColor: 'text-blue-500'
    },
    {
      label: 'Total Expenses',
      value: fmt(totalExpenses),
      icon: <TrendingDown className="w-5 h-5" />,
      color: 'bg-red-500',
      trend: '-',
      trendColor: 'text-red-500'
    },
    {
      label: 'Net Balance',
      value: fmt(netBalance),
      icon: <TrendingUp className="w-5 h-5" />,
      color: netBalance >= 0 ? 'bg-violet-500' : 'bg-orange-500',
      trend: netBalance >= 0 ? '+' : '-',
      trendColor: netBalance >= 0 ? 'text-violet-500' : 'text-orange-500'
    },
  ];

  return (
    <div className="p-4 space-y-5 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="border-b border-border pb-3">
        <h1 className="text-lg font-black text-foreground tracking-tight">
          Finance Dashboard
        </h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">
          Welcome, {user?.name} • {user?.school?.name || 'School'} Financial Overview
        </p>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
              <div className="h-8 w-8 bg-muted rounded-lg mb-3" />
              <div className="h-3 bg-muted rounded w-3/4 mb-2" />
              <div className="h-6 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {summaryCards.map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all group">
              <div className={`w-9 h-9 ${s.color} rounded-xl flex items-center justify-center text-white mb-3 shadow-sm`}>
                {s.icon}
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{s.label}</p>
              <p className={`text-lg font-black mt-0.5 ${s.trendColor}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fee Category Breakdown */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <ReceiptText className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold">Fee Collection by Category</h3>
          </div>
          <div className="p-4 space-y-2">
            {loading ? (
              <div className="h-24 flex items-center justify-center">
                <div className="animate-spin h-5 w-5 border-b-2 border-primary rounded-full" />
              </div>
            ) : (data?.feeCollection?.byType || data?.feesByType || []).length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No fee collection data available</p>
            ) : (
              (data?.feeCollection?.byType || data?.feesByType || []).slice(0, 6).map((item, i) => {
                const total = Number(totalCollected) || 1;
                const amt = Number(item.amount || item.total || 0);
                const pct = Math.round((amt / total) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-foreground">{item.type || item.name}</span>
                      <span className="text-muted-foreground">{fmt(amt)} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Income vs Expense Summary */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold">Income vs Expenses</h3>
          </div>
          <div className="p-4 space-y-3">
            {[
              {
                label: 'Total Inflow',
                value: fmt(Number(totalCollected) + Number(totalIncome)),
                icon: <ArrowUpRight className="w-4 h-4" />,
                bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              },
              {
                label: 'Total Outflow',
                value: fmt(totalExpenses),
                icon: <ArrowDownRight className="w-4 h-4" />,
                bg: 'bg-red-500/10 text-red-600 border-red-500/20'
              },
              {
                label: 'Net Balance',
                value: fmt(netBalance),
                icon: <Wallet className="w-4 h-4" />,
                bg: netBalance >= 0
                  ? 'bg-violet-500/10 text-violet-600 border-violet-500/20'
                  : 'bg-orange-500/10 text-orange-600 border-orange-500/20'
              }
            ].map((row, i) => (
              <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${row.bg}`}>
                <div className="flex items-center gap-2">
                  {row.icon}
                  <span className="text-xs font-bold">{row.label}</span>
                </div>
                <span className="text-sm font-black">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;

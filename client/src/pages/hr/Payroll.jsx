import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Download, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentDate = new Date();
  const [filterMonth, setFilterMonth] = useState((currentDate.getMonth() + 1).toString());
  const [filterYear, setFilterYear] = useState(currentDate.getFullYear().toString());

  const [formData, setFormData] = useState({
    staffId: '',
    month: (currentDate.getMonth() + 1).toString(),
    year: currentDate.getFullYear().toString(),
    baseSalary: '',
    allowances: '',
    deductions: '',
    netSalary: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payrollRes, staffRes] = await Promise.all([
        api.get(`/hr/payroll?month=${months[parseInt(filterMonth) - 1]}&year=${filterYear}`),
        api.get('/hr/staff?isDisabled=false')
      ]);
      setPayrolls(payrollRes.data.data || []);
      setStaff(staffRes.data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterMonth, filterYear]);

  useEffect(() => {
    // Calculate net salary
    const base = parseFloat(formData.baseSalary) || 0;
    const allowances = parseFloat(formData.allowances) || 0;
    const deductions = parseFloat(formData.deductions) || 0;
    const net = base + allowances - deductions;
    setFormData(prev => ({ ...prev, netSalary: net.toFixed(2) }));
  }, [formData.baseSalary, formData.allowances, formData.deductions]);

  const openModal = () => {
    setFormData({
      staffId: '',
      month: (currentDate.getMonth() + 1).toString(),
      year: currentDate.getFullYear().toString(),
      baseSalary: '',
      allowances: '',
      deductions: '',
      netSalary: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.staffId) return toast.error('Please select staff member');
    if (!formData.baseSalary) return toast.error('Base salary is required');

    try {
      setSubmitting(true);
      await api.post('/hr/payroll', {
        ...formData,
        month: months[parseInt(formData.month) - 1],
        year: parseInt(formData.year),
        netSalary: parseFloat(formData.netSalary)
      });
      toast.success('Payroll generated successfully');
      closeModal();
      fetchData();
      setCurrentPage(1);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to generate payroll'));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPayrolls = payrolls.filter(p => {
    const staffName = `${p.Staff?.firstName} ${p.Staff?.lastName}`.toLowerCase();
    const staffId = p.Staff?.staffId?.toLowerCase() || '';
    return staffName.includes(searchQuery.toLowerCase()) || staffId.includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(filteredPayrolls.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayrolls.slice(indexOfFirstItem, indexOfLastItem);

  const totalAmount = filteredPayrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Payroll Management</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Generate and manage staff payroll</p>
        </div>
        <button
          onClick={openModal}
          className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 transition-all flex items-center gap-2 w-fit"
        >
          <Plus className="w-3 h-3" />
          Generate Payroll
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Total Payroll Amount</p>
            <p className="text-2xl font-black text-foreground">₹{totalAmount.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{filteredPayrolls.length} staff members</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Month</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
            >
              {months.map((month, index) => (
                <option key={month} value={(index + 1).toString()}>{month}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
            >
              {years.map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 bg-muted/30 border border-border rounded-lg pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Loading...</span>
            </div>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No payroll records found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/5 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Staff</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Role</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Period</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Net Salary</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentItems.map((payroll) => (
                    <tr key={payroll.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            {payroll.Staff?.firstName} {payroll.Staff?.lastName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{payroll.Staff?.staffId}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                          {payroll.Staff?.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground">
                          {payroll.month} {payroll.year}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">
                          ₹{payroll.netSalary?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${
                          payroll.status === 'Paid'
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                        }`}>
                          {payroll.status || 'Generated'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="Download Payslip"
                        >
                          <Download className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-border bg-muted/5 flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPayrolls.length)} of {filteredPayrolls.length} records
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-bold text-foreground">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Generate Payroll Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between sticky top-0 bg-card">
              <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
                Generate Payroll
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-muted rounded">
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Staff Member *</label>
                <select
                  value={formData.staffId}
                  onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                >
                  <option value="">Select Staff</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.staffId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Month *</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: e.target.value})}
                    className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                    required
                  >
                    {months.map((month, index) => (
                      <option key={month} value={(index + 1).toString()}>{month}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Year *</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                    required
                  >
                    {years.map(year => (
                      <option key={year} value={year.toString()}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Base Salary *</label>
                <input
                  type="number"
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({...formData, baseSalary: e.target.value})}
                  placeholder="Enter base salary"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Allowances</label>
                <input
                  type="number"
                  value={formData.allowances}
                  onChange={(e) => setFormData({...formData, allowances: e.target.value})}
                  placeholder="Enter allowances (bonus, overtime, etc.)"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Deductions</label>
                <input
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => setFormData({...formData, deductions: e.target.value})}
                  placeholder="Enter deductions (tax, insurance, etc.)"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Net Salary</p>
                <p className="text-xl font-black text-primary">₹{formData.netSalary || '0.00'}</p>
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
                  {submitting ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;

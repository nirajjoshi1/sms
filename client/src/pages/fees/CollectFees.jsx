import React, { useState, useEffect } from 'react';
import { Search, DollarSign, Banknote } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';

const CollectFees = () => {
  const [students, setStudents] = useState([]);
  const [feeGroups, setFeeGroups] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const [formData, setFormData] = useState({
    feeGroupId: '',
    feeTypeId: '',
    amount: '',
    discount: '',
    fine: '',
    paymentMethod: 'Cash',
    transactionId: '',
    remarks: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, groupsRes, typesRes] = await Promise.all([
        api.get('/students?isDisabled=false'),
        api.get('/fees/groups'),
        api.get('/fees/types')
      ]);
      setStudents(studentsRes.data.data || []);
      setFeeGroups(groupsRes.data.data || []);
      setFeeTypes(typesRes.data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStudents = students.filter(s => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const admissionNo = s.admissionNo?.toLowerCase() || '';
    return fullName.includes(searchQuery.toLowerCase()) || admissionNo.includes(searchQuery.toLowerCase());
  }).slice(0, 5);

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setSearchQuery(`${student.firstName} ${student.lastName} (${student.admissionNo})`);
    setShowResults(false);
  };

  const calculateTotal = () => {
    const amount = parseFloat(formData.amount) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const fine = parseFloat(formData.fine) || 0;
    return (amount - discount + fine).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return toast.error('Please select a student');
    if (!formData.feeGroupId) return toast.error('Please select fee group');
    if (!formData.feeTypeId) return toast.error('Please select fee type');
    if (!formData.amount) return toast.error('Amount is required');

    try {
      setSubmitting(true);
      const response = await api.post('/fees/collect', {
        studentId: selectedStudent.id,
        feeGroupId: formData.feeGroupId,
        feeTypeId: formData.feeTypeId,
        amount: parseFloat(formData.amount),
        discountAmount: parseFloat(formData.discount) || 0,
        fineAmount: parseFloat(formData.fine) || 0,
        paymentMethod: formData.paymentMethod,
        remarks: formData.remarks
      });
      const receiptNumber = response.data.data?.receiptNumber;
      toast.success(`Fee collected successfully! Receipt: ${receiptNumber}`);
      // Reset form
      setSelectedStudent(null);
      setSearchQuery('');
      setFormData({
        feeGroupId: '',
        feeTypeId: '',
        amount: '',
        discount: '',
        fine: '',
        paymentMethod: 'Cash',
        transactionId: '',
        remarks: ''
      });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to collect fee'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="border-b border-border pb-3">
        <h1 className="text-lg font-black text-foreground tracking-tight">Collect Fees</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Collect fees from students</p>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Fee Collection Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
            {/* Student Search */}
            <div className="space-y-1 relative">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Search Student *</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                    if (!e.target.value) setSelectedStudent(null);
                  }}
                  onFocus={() => setShowResults(true)}
                  placeholder="Search by name or admission number..."
                  className="w-full h-10 bg-muted/30 border border-border rounded-lg pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              {/* Search Results Dropdown */}
              {showResults && searchQuery && filteredStudents.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredStudents.map(student => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => handleStudentSelect(student)}
                      className="w-full px-4 py-2 text-left hover:bg-muted/50 transition-colors"
                    >
                      <p className="text-xs font-bold text-foreground">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {student.admissionNo} • {student.Class?.name}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fee Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Fee Group *</label>
                <select
                  value={formData.feeGroupId}
                  onChange={(e) => setFormData({...formData, feeGroupId: e.target.value})}
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                >
                  <option value="">Select Fee Group</option>
                  {feeGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Fee Type *</label>
                <select
                  value={formData.feeTypeId}
                  onChange={(e) => setFormData({...formData, feeTypeId: e.target.value})}
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                >
                  <option value="">Select Fee Type</option>
                  {feeTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount Details */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Amount *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Discount</label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({...formData, discount: e.target.value})}
                  placeholder="0.00"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Fine</label>
                <input
                  type="number"
                  value={formData.fine}
                  onChange={(e) => setFormData({...formData, fine: e.target.value})}
                  placeholder="0.00"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'Cash', icon: Banknote },
                  { value: 'Bank Transfer', icon: DollarSign }
                ].map(method => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setFormData({...formData, paymentMethod: method.value})}
                    className={`h-20 flex flex-col items-center justify-center gap-2 rounded-lg border-2 transition-all ${
                      formData.paymentMethod === method.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <method.icon className="w-5 h-5" />
                    <span className="text-[10px] font-bold">{method.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {formData.paymentMethod === 'Bank Transfer' && (
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Transaction/Reference ID</label>
                <input
                  type="text"
                  value={formData.transactionId}
                  onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                  placeholder="Enter bank transaction or reference ID"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
            )}

            {/* Remarks */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                placeholder="Enter any remarks (optional)"
                rows="2"
                className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-10 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Processing...' : 'Collect Fee'}
            </button>
          </form>
        </div>

        {/* Summary Panel */}
        <div className="space-y-4">
          {/* Selected Student */}
          {selectedStudent && (
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Student Details</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{selectedStudent.admissionNo}</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground">Class</p>
                  <p className="text-xs text-foreground">{selectedStudent.Class?.name}</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground">Section</p>
                  <p className="text-xs text-foreground">{selectedStudent.Section?.name || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Amount Summary */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Amount Summary</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold">₹{(parseFloat(formData.amount) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-red-600 dark:text-red-400">- ₹{(parseFloat(formData.discount) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Fine</span>
                <span className="text-orange-600 dark:text-orange-400">+ ₹{(parseFloat(formData.fine) || 0).toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total</span>
                <span className="text-lg font-black text-primary">₹{calculateTotal()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectFees;

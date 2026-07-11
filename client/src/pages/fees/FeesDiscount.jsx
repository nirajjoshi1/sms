import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, Percent, Tag } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';
import CustomModal from '../../components/ui/CustomModal';


const FeesDiscount = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    discountType: 'Percentage',
    percentage: '',
    amount: '',
    usageLimit: '',
    expiryDate: '',
    description: ''
  });

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/fees/discounts');
      setDiscounts(res.data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch discounts'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const openModal = (discount = null) => {
    if (discount) {
      setEditingId(discount.id);
      setFormData({
        name: discount.name || '',
        code: discount.code || '',
        discountType: discount.discountType || 'Percentage',
        percentage: discount.percentage || '',
        amount: discount.amount || '',
        usageLimit: discount.usageLimit || '',
        expiryDate: discount.expiryDate ? new Date(discount.expiryDate).toISOString().split('T')[0] : '',
        description: discount.description || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        code: '',
        discountType: 'Percentage',
        percentage: '',
        amount: '',
        usageLimit: '',
        expiryDate: '',
        description: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Discount name is required');
    if (!formData.code.trim()) return toast.error('Discount code is required');

    if (formData.discountType === 'Percentage' && !formData.percentage) {
      return toast.error('Percentage is required');
    }
    if (formData.discountType === 'Fixed' && !formData.amount) {
      return toast.error('Amount is required');
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        percentage: formData.percentage ? parseFloat(formData.percentage) : null,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null
      };

      if (editingId) {
        await api.put(`/fees/discounts/${editingId}`, payload);
        toast.success('Discount updated successfully');
      } else {
        await api.post('/fees/discounts', payload);
        toast.success('Discount created successfully');
      }
      closeModal();
      fetchDiscounts();
      setCurrentPage(1);
    } catch (error) {
      toast.error(getErrorMessage(error, `Failed to ${editingId ? 'update' : 'create'} discount`));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this discount?')) return;

    try {
      await api.delete(`/fees/discounts/${id}`);
      toast.success('Discount deleted successfully');
      fetchDiscounts();
      setCurrentPage(1);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete discount'));
    }
  };

  const filteredDiscounts = discounts.filter(d =>
    d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDiscounts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDiscounts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Fee Discounts</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Manage fee discounts</p>
        </div>
        <button
          onClick={() => openModal()}
          className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 transition-all flex items-center gap-2 w-fit"
        >
          <Plus className="w-3 h-3" />
          Add Discount
        </button>
      </div>

      {/* Search */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, code or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 bg-muted/30 border border-border rounded-lg pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Discounts Table */}
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
            <Percent className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No discounts found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/5 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Name</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Code</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Type</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Value</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Usage Limit</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Expiry Date</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentItems.map((discount) => (
                    <tr key={discount.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-foreground">{discount.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                          {discount.code}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground">{discount.discountType}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">
                          {discount.discountType === 'Percentage'
                            ? `${discount.percentage}%`
                            : `₹${discount.amount?.toLocaleString()}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs text-muted-foreground">
                          {discount.usageLimit || 'Unlimited'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground">
                          {discount.expiryDate ? new Date(discount.expiryDate).toLocaleDateString() : 'No expiry'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openModal(discount)}
                            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(discount.id)}
                            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
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
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDiscounts.length)} of {filteredDiscounts.length} records
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

      {/* Add/Edit Modal */}
      {showModal && (
        <CustomModal isOpen={true} onClose={closeModal} title={editingId ? 'Edit Discount' : 'Add Discount'} maxWidth="max-w-md">
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Discount Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter discount name"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Discount Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="Enter code (e.g., MERIT10)"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Discount Type</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({...formData, discountType: e.target.value, percentage: '', amount: ''})}
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                >
                  <option value="Percentage">Percentage</option>
                  <option value="Fixed">Fixed Amount</option>
                </select>
              </div>

              {formData.discountType === 'Percentage' ? (
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Percentage *</label>
                  <input
                    type="number"
                    value={formData.percentage}
                    onChange={(e) => setFormData({...formData, percentage: e.target.value})}
                    placeholder="Enter percentage"
                    className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                    required
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Fixed Amount *</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="Enter fixed amount"
                    className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Usage Limit</label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                  placeholder="Leave empty for unlimited"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  min="1"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter description (optional)"
                  rows="3"
                  className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
                />
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
                  {submitting ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </CustomModal>
      )}
    </div>
  );
};

export default FeesDiscount;

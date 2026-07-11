import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image, Search, Link } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import ImageUpload from '../../components/common/ImageUpload';
import CustomModal from '../../components/ui/CustomModal';


const BannerImages = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    imageUrls: [],
    linkUrl: '',
    order: 0,
    isActive: true
  });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cms/banners', {
        params: { search: searchQuery || undefined }
      });
      setBanners(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [searchQuery]);

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        imageUrls: item.imageUrls || [],
        linkUrl: item.linkUrl || '',
        order: item.order || 0,
        isActive: item.isActive
      });
    } else {
      setEditingItem(null);
      setFormData({ title: '', imageUrls: [], linkUrl: '', order: 0, isActive: true });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ title: '', imageUrls: [], linkUrl: '', order: 0, isActive: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('Banner title is required');
    if (!formData.imageUrls || formData.imageUrls.length === 0) return toast.error('At least one image is required');

    try {
      setSubmitting(true);
      if (editingItem) {
        await api.put(`/cms/banners/${editingItem.id}`, formData);
        toast.success('Banner updated successfully');
      } else {
        await api.post('/cms/banners', formData);
        toast.success('Banner created successfully');
      }
      closeModal();
      fetchBanners();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;

    try {
      await api.delete(`/cms/banners/${id}`);
      toast.success('Banner deleted successfully');
      fetchBanners();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete banner');
    }
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Banner Images Management</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Manage homepage banners</p>
        </div>
        <button
          onClick={() => openModal()}
          className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 transition-all flex items-center gap-2 w-fit"
        >
          <Plus className="w-3 h-3" />
          Add Banner
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-3 py-2 border-b border-border bg-muted/10 flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Banner List</h3>
          <div className="relative w-40">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-7 pl-7 pr-2 bg-background border border-border rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Loading...</span>
            </div>
          </div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center">
            <Image className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {searchQuery ? 'No banners found' : 'No banners found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/5 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Image</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Title</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Link URL</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Order</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted/30 border border-border">
                        {banner.imageUrl ? (
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-5 h-5 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="w-5 h-5 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-foreground">{banner.title}</span>
                    </td>
                    <td className="px-4 py-3">
                      {banner.linkUrl ? (
                        <a
                          href={banner.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <Link className="w-3 h-3" />
                          <span className="max-w-[200px] truncate">{banner.linkUrl}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <span className="text-xs font-bold text-foreground">{banner.order}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                          banner.isActive ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-600'
                        }`}>
                          {banner.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(banner)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id)}
                          className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <CustomModal isOpen={true} onClose={closeModal} title={editingItem ? 'Edit Banner' : 'Add Banner'} maxWidth="max-w-2xl">
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Banner Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Welcome to Our School"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                  autoFocus
                />
              </div>

              <ImageUpload
                value={formData.imageUrls}
                onChange={(urls) => setFormData({ ...formData, imageUrls: urls })}
                label="Banner Images"
                helperText="Upload banner images (recommended: 1920x600, multiple allowed)"
                multiple={true}
                maxFiles={5}
              />

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Link URL
                </label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="https://example.com (optional)"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
                <p className="text-[9px] text-muted-foreground ml-1 mt-1">Where banner should redirect when clicked</p>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
                <p className="text-[9px] text-muted-foreground ml-1 mt-1">Lower numbers appear first</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-border"
                />
                <label htmlFor="isActive" className="text-[10px] font-bold text-foreground">
                  Active Banner
                </label>
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
                  {submitting ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </CustomModal>
      )}
    </div>
  );
};

export default BannerImages;

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FileText, Search, Filter } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import CustomModal from '../../components/ui/CustomModal';


const Pages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPageType, setFilterPageType] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    pageType: 'Standard',
    content: ''
  });

  const pageTypeOptions = ['Standard', 'About', 'Contact', 'Custom'];

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cms/pages', {
        params: {
          search: searchQuery || undefined,
          pageType: filterPageType || undefined
        }
      });
      setPages(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [searchQuery, filterPageType]);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        slug: item.slug,
        pageType: item.pageType || 'Standard',
        content: item.content || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ title: '', slug: '', pageType: 'Standard', content: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ title: '', slug: '', pageType: 'Standard', content: '' });
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setFormData({
      ...formData,
      title: newTitle,
      slug: editingItem ? formData.slug : generateSlug(newTitle)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('Page title is required');
    if (!formData.slug.trim()) return toast.error('Page slug is required');

    try {
      setSubmitting(true);
      if (editingItem) {
        await api.put(`/cms/pages/${editingItem.id}`, formData);
        toast.success('Page updated successfully');
      } else {
        await api.post('/cms/pages', formData);
        toast.success('Page created successfully');
      }
      closeModal();
      fetchPages();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save page');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;

    try {
      await api.delete(`/cms/pages/${id}`);
      toast.success('Page deleted successfully');
      fetchPages();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete page');
    }
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Pages Management</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Manage CMS pages</p>
        </div>
        <button
          onClick={() => openModal()}
          className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 transition-all flex items-center gap-2 w-fit"
        >
          <Plus className="w-3 h-3" />
          Add Page
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-3 py-2 border-b border-border bg-muted/10 flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Page List</h3>
          <div className="flex items-center gap-2">
            <div className="relative w-32">
              <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <select
                value={filterPageType}
                onChange={(e) => setFilterPageType(e.target.value)}
                className="w-full h-7 pl-7 pr-2 bg-background border border-border rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all appearance-none"
              >
                <option value="">All Types</option>
                {pageTypeOptions.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
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
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Loading...</span>
            </div>
          </div>
        ) : pages.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {searchQuery || filterPageType ? 'No pages found' : 'No pages found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/5 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Title</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Slug</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Page Type</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Created Date</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-foreground">{page.title}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground font-mono">{page.slug}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                        page.pageType === 'About' ? 'bg-blue-500/10 text-blue-600' :
                        page.pageType === 'Contact' ? 'bg-purple-500/10 text-purple-600' :
                        page.pageType === 'Custom' ? 'bg-orange-500/10 text-orange-600' :
                        'bg-gray-500/10 text-gray-600'
                      }`}>
                        {page.pageType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(page.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(page)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDelete(page.id)}
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
        <CustomModal isOpen={true} onClose={closeModal} title={editingItem ? 'Edit Page' : 'Add Page'} maxWidth="max-w-md">
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Page Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="e.g., About Us"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g., about-us"
                    className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    Page Type *
                  </label>
                  <select
                    value={formData.pageType}
                    onChange={(e) => setFormData({ ...formData, pageType: e.target.value })}
                    className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                    required
                  >
                    {pageTypeOptions.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter HTML content..."
                  rows="9"
                  className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none font-mono"
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
                  {submitting ? 'Saving...' : 'Save Page'}
                </button>
              </div>
            </form>
          </CustomModal>
      )}
    </div>
  );
};

export default Pages;

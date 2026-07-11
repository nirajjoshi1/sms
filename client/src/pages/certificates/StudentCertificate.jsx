import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Award, Search } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import CustomModal from '../../components/ui/CustomModal';


const StudentCertificate = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    bodyText: '',
    headerText: '',
    footerText: ''
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/certificates/templates');
      setTemplates(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch certificate templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        bodyText: item.bodyText || '',
        headerText: item.headerText || '',
        footerText: item.footerText || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', bodyText: '', headerText: '', footerText: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ name: '', bodyText: '', headerText: '', footerText: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Template name is required');
    if (!formData.bodyText.trim()) return toast.error('Certificate body text is required');

    try {
      setSubmitting(true);
      if (editingItem) {
        await api.put(`/certificates/templates/${editingItem.id}`, formData);
        toast.success('Certificate template updated successfully');
      } else {
        await api.post('/certificates/templates', formData);
        toast.success('Certificate template created successfully');
      }
      closeModal();
      fetchTemplates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save certificate template');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certificate template?')) return;

    try {
      await api.delete(`/certificates/templates/${id}`);
      toast.success('Certificate template deleted successfully');
      fetchTemplates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete certificate template');
    }
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Certificate Templates</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Manage student certificate templates</p>
        </div>
        <button
          onClick={() => openModal()}
          className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 transition-all flex items-center gap-2 w-fit"
        >
          <Plus className="w-3 h-3" />
          Add Template
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-3 py-2 border-b border-border bg-muted/10 flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Template List</h3>
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
        ) : filteredTemplates.length === 0 ? (
          <div className="p-12 text-center">
            <Award className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {searchQuery ? 'No templates found' : 'No certificate templates found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/5 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Template Name</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Body Text</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Created</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-foreground">{template.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {template.bodyText?.substring(0, 100) || '-'}...
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(template)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
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
        <CustomModal isOpen={true} onClose={closeModal} title={editingItem ? 'Edit Certificate Template' : 'Add Certificate Template'} maxWidth="max-w-2xl">
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Academic Excellence Certificate"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Header Text
                </label>
                <input
                  type="text"
                  value={formData.headerText}
                  onChange={(e) => setFormData({ ...formData, headerText: e.target.value })}
                  placeholder="e.g., Certificate of Achievement"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Body Text * (Use {'{studentName}'}, {'{class}'}, {'{section}'} as placeholders)
                </label>
                <textarea
                  value={formData.bodyText}
                  onChange={(e) => setFormData({ ...formData, bodyText: e.target.value })}
                  placeholder="This is to certify that {studentName} of class {class}-{section} has successfully..."
                  rows="6"
                  className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Footer Text
                </label>
                <textarea
                  value={formData.footerText}
                  onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                  placeholder="Principal Signature, School Seal, etc."
                  rows="2"
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
                  {submitting ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </CustomModal>
      )}
    </div>
  );
};

export default StudentCertificate;

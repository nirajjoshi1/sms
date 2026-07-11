import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, FileImage, FileVideo, FileText, File } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import CustomModal from '../../components/ui/CustomModal';


const MediaManager = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const [formData, setFormData] = useState({
    fileName: '',
    fileUrl: '',
    fileType: 'image'
  });

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cms/media', {
        params: {
          search: searchQuery || undefined,
          fileType: fileTypeFilter || undefined
        }
      });
      setMedia(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [searchQuery, fileTypeFilter]);

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        fileName: item.fileName,
        fileUrl: item.fileUrl || '',
        fileType: item.fileType
      });
    } else {
      setEditingItem(null);
      setFormData({ fileName: '', fileUrl: '', fileType: 'image' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ fileName: '', fileUrl: '', fileType: 'image' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fileName.trim()) return toast.error('File name is required');
    if (!formData.fileUrl.trim()) return toast.error('File URL is required');

    try {
      setSubmitting(true);
      if (editingItem) {
        await api.put(`/cms/media/${editingItem.id}`, formData);
        toast.success('Media updated successfully');
      } else {
        await api.post('/cms/media', formData);
        toast.success('Media created successfully');
      }
      closeModal();
      fetchMedia();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save media');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this media file?')) return;

    try {
      await api.delete(`/cms/media/${id}`);
      toast.success('Media deleted successfully');
      fetchMedia();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete media');
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image':
        return <FileImage className="w-4 h-4 text-blue-500" />;
      case 'video':
        return <FileVideo className="w-4 h-4 text-purple-500" />;
      case 'document':
        return <FileText className="w-4 h-4 text-green-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Media Manager</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Manage media files</p>
        </div>
        <button
          onClick={() => openModal()}
          className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 transition-all flex items-center gap-2 w-fit"
        >
          <Plus className="w-3 h-3" />
          Add Media
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-3 py-2 border-b border-border bg-muted/10 flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Media List</h3>
          <div className="flex items-center gap-2">
            <select
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value)}
              className="h-7 px-2 bg-background border border-border rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
            >
              <option value="">All Types</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="document">Document</option>
              <option value="other">Other</option>
            </select>
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
        ) : media.length === 0 ? (
          <div className="p-12 text-center">
            <File className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {searchQuery || fileTypeFilter ? 'No media found' : 'No media found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/5 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Preview</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">File Name</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">File Type</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Upload Date</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {media.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-start">
                        {getFileIcon(item.fileType)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-foreground">{item.fileName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground capitalize">{item.fileType}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(item)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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
        <CustomModal isOpen={true} onClose={closeModal} title={editingItem ? 'Edit Media' : 'Add Media'} maxWidth="max-w-2xl">
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  File Name *
                </label>
                <input
                  type="text"
                  value={formData.fileName}
                  onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                  placeholder="e.g., School Logo"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  File URL *
                </label>
                <input
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  placeholder="https://example.com/file.jpg"
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  File Type *
                </label>
                <select
                  value={formData.fileType}
                  onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="other">Other</option>
                </select>
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
                  {submitting ? 'Saving...' : 'Save Media'}
                </button>
              </div>
            </form>
          </CustomModal>
      )}
    </div>
  );
};

export default MediaManager;

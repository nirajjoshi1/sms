import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, LayoutGrid, List as ListIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const Sections = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sectionName, setSectionName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSection, setEditingSection] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/academics/sections');
      setSections(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch sections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleEdit = (section) => {
    setEditingSection(section);
    setSectionName(section.name);
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setSectionName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sectionName.trim()) return toast.error('Section name is required');

    try {
      setSubmitting(true);
      if (editingSection) {
        await api.put(`/academics/sections/${editingSection.id}`, { name: sectionName });
        toast.success('Section updated successfully');
      } else {
        await api.post('/academics/sections', { name: sectionName });
        toast.success('Section added successfully');
      }
      cancelEdit();
      setCurrentPage(1); // Reset to first page
      fetchSections();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save section');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    try {
      await api.delete(`/academics/sections/${id}`);
      toast.success('Section deleted');
      fetchSections();
    } catch (error) {
      toast.error('Failed to delete section');
    }
  };

  const filteredSections = sections.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredSections.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSections.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
      {/* Header - More Compact */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Sections Management</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Configure academic sections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Add Form - Smaller padding */}
        <div className="lg:col-span-4">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden sticky top-4">
            <div className="px-3 py-2 border-b border-border bg-muted/10">
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                {editingSection ? 'Update Section' : 'Add Section'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Section Name *</label>
                <input 
                  type="text" 
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  placeholder="e.g. A, B, C"
                  className="w-full h-8 bg-muted/30 border border-border rounded-lg px-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
              
              <div className="flex gap-2">
                {editingSection && (
                  <button 
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 h-8 bg-muted text-muted-foreground rounded-lg text-[10px] font-bold hover:bg-muted/80 transition-all"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  type="submit"
                  disabled={submitting}
                  className={`${editingSection ? 'flex-[2]' : 'w-full'} h-8 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold shadow-lg shadow-primary/10 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2`}
                >
                  {submitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {editingSection ? <Edit2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      {editingSection ? 'Update' : 'Save Section'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: List Table - Smaller padding */}
        <div className="lg:col-span-8">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden relative">
            {loading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest animate-pulse">Loading...</span>
                </div>
              </div>
            )}

            <div className="px-3 py-2 border-b border-border bg-muted/10 flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Section List</h3>
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
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/5 border-b border-border">
                    <th className="px-4 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Section Name</th>
                    <th className="px-4 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {!loading && currentItems.length > 0 ? currentItems.map((section) => (
                    <tr key={section.id} className="hover:bg-muted/5 transition-colors group">
                      <td className="px-4 py-2.5">
                        <span className="text-[11px] font-bold text-foreground">{section.name}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleEdit(section)}
                            className="p-1.5 hover:bg-primary/10 hover:text-primary text-muted-foreground rounded-md transition-all"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleDelete(section.id)}
                            className="p-1.5 hover:bg-destructive/10 hover:text-destructive text-muted-foreground rounded-md transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : !loading && (
                    <tr>
                      <td colSpan="2" className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <ListIcon className="w-6 h-6 text-muted-foreground" />
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No sections found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {/* Empty rows if loading to prevent jump */}
                  {loading && [1, 2, 3, 4, 5].map(i => (
                    <tr key={i} className="opacity-0 border-none">
                      <td colSpan="2" className="py-4">.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {!loading && filteredSections.length > 0 && (
              <div className="px-3 py-2 bg-muted/5 border-t border-border flex items-center justify-between">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSections.length)} of {filteredSections.length}
                </p>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1 rounded bg-background border border-border disabled:opacity-30 hover:bg-muted transition-all"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    
                    <div className="flex items-center gap-1 mx-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-5 h-5 flex items-center justify-center rounded text-[9px] font-bold transition-all ${
                            currentPage === i + 1 
                              ? 'bg-primary text-primary-foreground shadow-sm' 
                              : 'hover:bg-muted text-muted-foreground'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1 rounded bg-background border border-border disabled:opacity-30 hover:bg-muted transition-all"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sections;

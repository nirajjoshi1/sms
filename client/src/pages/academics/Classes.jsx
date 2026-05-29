import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, BookOpen, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    sectionIds: []
  });
  const [editingClass, setEditingClass] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classRes, sectionRes] = await Promise.all([
        api.get('/academics/classes'),
        api.get('/academics/sections')
      ]);
      setClasses(classRes.data.data || []);
      setSections(sectionRes.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch academic data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSectionToggle = (id) => {
    setFormData(prev => ({
      ...prev,
      sectionIds: prev.sectionIds.includes(id)
        ? prev.sectionIds.filter(sid => sid !== id)
        : [...prev.sectionIds, id]
    }));
  };

  const handleEdit = (cls) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      sectionIds: cls.sections.map(s => s.id)
    });
  };

  const cancelEdit = () => {
    setEditingClass(null);
    setFormData({ name: '', sectionIds: [] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Class name is required');
    if (formData.sectionIds.length === 0) return toast.error('At least one section must be selected');

    try {
      setSubmitting(true);
      if (editingClass) {
        await api.put(`/academics/classes/${editingClass.id}`, formData);
        toast.success('Class updated successfully');
      } else {
        await api.post('/academics/classes', formData);
        toast.success('Class created successfully');
      }
      cancelEdit();
      setCurrentPage(1); // Reset to first page
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class? This may affect student enrollments.')) return;
    try {
      await api.delete(`/academics/classes/${id}`);
      toast.success('Class deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete class');
    }
  };

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClasses.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
      {/* Header - More Compact */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Classes Management</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Structure academic levels</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Add Form - Smaller padding */}
        <div className="lg:col-span-4">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden sticky top-4">
            <div className="px-3 py-2 border-b border-border bg-muted/10 flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                {editingClass ? 'Update Class' : 'Add Class'}
              </h3>
              {editingClass && (
                <button 
                  onClick={cancelEdit}
                  className="text-[9px] font-bold text-primary hover:underline uppercase tracking-tight"
                >
                  Cancel
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Class Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Class 1, UKG"
                  className="w-full h-8 bg-muted/30 border border-border rounded-lg px-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1 block">Assign Sections *</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto hide-scrollbar p-1">
                  {sections.map(section => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => handleSectionToggle(section.id)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                        formData.sectionIds.includes(section.id)
                          ? 'bg-primary/10 border-primary/40 text-primary shadow-sm'
                          : 'bg-muted/10 border-border text-muted-foreground hover:bg-muted/20'
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded flex items-center justify-center border transition-all ${
                        formData.sectionIds.includes(section.id) ? 'bg-primary border-primary' : 'bg-background border-border'
                      }`}>
                        {formData.sectionIds.includes(section.id) && <Check className="w-1.5 h-1.5 text-white" />}
                      </div>
                      {section.name}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full h-8 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold shadow-lg shadow-primary/10 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                ) : (
                  <>
                    {editingClass ? <Edit2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    {editingClass ? 'Update' : 'Save Class'}
                  </>
                )}
              </button>
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
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Class List</h3>
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
                    <th className="px-4 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Class</th>
                    <th className="px-4 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Sections</th>
                    <th className="px-4 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {!loading && currentItems.length > 0 ? currentItems.map((cls) => (
                    <tr key={cls.id} className="hover:bg-muted/5 transition-colors group">
                      <td className="px-4 py-2.5">
                        <span className="text-[11px] font-bold text-foreground">{cls.name}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {cls.sections?.map(s => (
                            <span key={s.id} className="px-1.5 py-0.5 bg-accent/30 text-[9px] font-bold text-foreground rounded border border-border/50">
                              {s.name}
                            </span>
                          )) || <span className="text-[9px] text-muted-foreground italic">No sections</span>}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleEdit(cls)}
                            className="p-1.5 hover:bg-primary/10 hover:text-primary text-muted-foreground rounded-md transition-all"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleDelete(cls.id)}
                            className="p-1.5 hover:bg-destructive/10 hover:text-destructive text-muted-foreground rounded-md transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : !loading && (
                    <tr>
                      <td colSpan="3" className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <BookOpen className="w-6 h-6 text-muted-foreground" />
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No classes found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {!loading && filteredClasses.length > 0 && (
              <div className="px-3 py-2 bg-muted/5 border-t border-border flex items-center justify-between">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredClasses.length)} of {filteredClasses.length}
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

export default Classes;

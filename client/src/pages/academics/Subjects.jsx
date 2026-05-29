import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, BookOpen, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'Theory'
  });
  const [editingSubject, setEditingSubject] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const subjectTypes = ['Theory', 'Practical', 'Optional', 'Compulsory'];

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/academics/subjects');
      setSubjects(response.data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch subjects'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code || '',
      type: subject.type
    });
  };

  const cancelEdit = () => {
    setEditingSubject(null);
    setFormData({ name: '', code: '', type: 'Theory' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Subject name is required');
    if (!formData.type) return toast.error('Subject type is required');

    try {
      setSubmitting(true);
      if (editingSubject) {
        await api.put(`/academics/subjects/${editingSubject.id}`, formData);
        toast.success('Subject updated successfully');
      } else {
        await api.post('/academics/subjects', formData);
        toast.success('Subject created successfully');
      }
      cancelEdit();
      setCurrentPage(1);
      fetchSubjects();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save subject'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject? This may affect timetables.')) return;
    try {
      await api.delete(`/academics/subjects/${id}`);
      toast.success('Subject deleted');
      fetchSubjects();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete subject'));
    }
  };

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.code && s.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSubjects.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Subjects Management</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Manage academic subjects</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Add Form */}
        <div className="lg:col-span-4">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden sticky top-4">
            <div className="px-3 py-2 border-b border-border bg-muted/10 flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                {editingSubject ? 'Update Subject' : 'Add Subject'}
              </h3>
              {editingSubject && (
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
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Subject Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Mathematics, English"
                  className="w-full h-8 bg-muted/30 border border-border rounded-lg px-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Subject Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  placeholder="e.g. MATH101, ENG102"
                  className="w-full h-8 bg-muted/30 border border-border rounded-lg px-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Subject Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full h-8 bg-muted/30 border border-border rounded-lg px-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                  required
                >
                  {subjectTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
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
                    {editingSubject ? <Edit2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    {editingSubject ? 'Update' : 'Save Subject'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: List Table */}
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
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Subject List</h3>
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
                    <th className="px-4 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Subject</th>
                    <th className="px-4 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Code</th>
                    <th className="px-4 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Type</th>
                    <th className="px-4 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {!loading && currentItems.length > 0 ? currentItems.map((subject) => (
                    <tr key={subject.id} className="hover:bg-muted/5 transition-colors group">
                      <td className="px-4 py-2.5">
                        <span className="text-[11px] font-bold text-foreground">{subject.name}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-[10px] text-muted-foreground">{subject.code || '-'}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="px-1.5 py-0.5 bg-accent/30 text-[9px] font-bold text-foreground rounded border border-border/50">
                          {subject.type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(subject)}
                            className="p-1.5 hover:bg-primary/10 hover:text-primary text-muted-foreground rounded-md transition-all"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(subject.id)}
                            className="p-1.5 hover:bg-destructive/10 hover:text-destructive text-muted-foreground rounded-md transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : !loading && (
                    <tr>
                      <td colSpan="4" className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <BookOpen className="w-6 h-6 text-muted-foreground" />
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No subjects found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!loading && filteredSubjects.length > 0 && (
              <div className="px-3 py-2 bg-muted/5 border-t border-border flex items-center justify-between">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSubjects.length)} of {filteredSubjects.length}
                </p>

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

export default Subjects;

import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Users, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { useConfirm } from '../../context/ConfirmContext';

const AssignClassTeacher = () => {
  const confirm = useConfirm();

  const [classTeachers, setClassTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    classId: '',
    sectionId: '',
    staffIds: []
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ctRes, classRes, sectionRes, staffRes] = await Promise.all([
        api.get('/academics/class-teachers'),
        api.get('/academics/classes'),
        api.get('/academics/sections'),
        api.get('/staff')
      ]);
      const classTeachersData = ctRes.data.data || [];
      setClassTeachers(classTeachersData);

      // Get assigned class-section combinations
      const assignedCombinations = classTeachersData.map(ct => `${ct.classId}-${ct.sectionId}`);

      // Get all classes data with their sections
      const allClasses = classRes.data.data || [];
      const allSections = sectionRes.data.data || [];

      // Filter out classes that have all their sections assigned
      const availableClasses = allClasses.filter(cls => {
        // Get sections for this class
        const classSections = cls.Section || [];
        // Check if at least one section is not assigned for this class
        const hasUnassignedSection = classSections.some(section =>
          !assignedCombinations.includes(`${cls.id}-${section.id}`)
        );
        return hasUnassignedSection;
      });

      setClasses(availableClasses);

      // Filter out sections that are already assigned with the selected class
      setSections(allSections);

      // Get IDs of staff who are already assigned as class teachers
      const assignedStaffIds = classTeachersData.map(ct => ct.staffId);

      // Filter only teachers who are NOT already assigned as class teachers
      const teachers = (staffRes.data.data || []).filter(s =>
        s.role === 'TEACHER' &&
        !s.isDisabled &&
        !assignedStaffIds.includes(s.id)
      );
      setStaff(teachers);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStaffToggle = (id) => {
    setFormData(prev => ({
      ...prev,
      staffIds: prev.staffIds.includes(id)
        ? prev.staffIds.filter(sid => sid !== id)
        : [...prev.staffIds, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.classId) return toast.error('Class is required');
    if (!formData.sectionId) return toast.error('Section is required');
    if (formData.staffIds.length === 0) return toast.error('At least one teacher must be selected');

    try {
      setSubmitting(true);
      await api.post('/academics/class-teachers', formData);
      toast.success('Class teachers assigned successfully');
      setFormData({ classId: '', sectionId: '', staffIds: [] });
      setCurrentPage(1);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign class teachers');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id) => {
    if (!await confirm('Are you sure you want to remove this class teacher assignment?')) return;
    try {
      await api.delete(`/academics/class-teachers/${id}`);
      toast.success('Class teacher removed');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove class teacher');
    }
  };

  // Get available sections for selected class (exclude already assigned ones)
  const getAvailableSections = () => {
    if (!formData.classId) return sections;

    const assignedCombinations = classTeachers.map(ct => `${ct.classId}-${ct.sectionId}`);

    return sections.filter(section =>
      !assignedCombinations.includes(`${formData.classId}-${section.id}`)
    );
  };

  const availableSections = getAvailableSections();

  const filteredAssignments = classTeachers.filter(ct =>
    ct.Class?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ct.Section?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ct.Staff?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ct.Staff?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ct.Staff?.staffId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssignments.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Assign Class Teachers</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Assign teachers as class in-charge</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Assign Form */}
        <div className="lg:col-span-4">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden sticky top-4">
            <div className="px-3 py-2 border-b border-border bg-muted/10">
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                Assign Teachers
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Class *</label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({...formData, classId: e.target.value})}
                  className="w-full h-8 bg-muted/30 border border-border rounded-lg px-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Section *</label>
                <select
                  value={formData.sectionId}
                  onChange={(e) => setFormData({...formData, sectionId: e.target.value})}
                  className="w-full h-8 bg-muted/30 border border-border rounded-lg px-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                  required
                  disabled={!formData.classId}
                >
                  <option value="">Select Section</option>
                  {availableSections.map(section => (
                    <option key={section.id} value={section.id}>{section.name}</option>
                  ))}
                </select>
                {!formData.classId && (
                  <p className="text-[9px] text-muted-foreground ml-1">Select a class first</p>
                )}
                {formData.classId && availableSections.length === 0 && (
                  <p className="text-[9px] text-orange-500 ml-1">All sections assigned for this class</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1 block">Select Teachers *</label>
                <div className="space-y-1 max-h-64 overflow-y-auto hide-scrollbar p-1">
                  {staff.map(teacher => (
                    <button
                      key={teacher.id}
                      type="button"
                      onClick={() => handleStaffToggle(teacher.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                        formData.staffIds.includes(teacher.id)
                          ? 'bg-primary/10 border-primary/40 text-primary shadow-sm'
                          : 'bg-muted/10 border-border text-muted-foreground hover:bg-muted/20'
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded flex items-center justify-center border transition-all flex-shrink-0 ${
                        formData.staffIds.includes(teacher.id) ? 'bg-primary border-primary' : 'bg-background border-border'
                      }`}>
                        {formData.staffIds.includes(teacher.id) && <Check className="w-1.5 h-1.5 text-white" />}
                      </div>
                      <span className="flex-1 text-left truncate">
                        {teacher.firstName} {teacher.lastName} ({teacher.staffId})
                      </span>
                    </button>
                  ))}
                  {staff.length === 0 && (
                    <p className="text-[9px] text-muted-foreground text-center py-4">No teachers available</p>
                  )}
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
                    <Plus className="w-3 h-3" />
                    Assign Teachers
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Assignments Table */}
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
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Current Assignments</h3>
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
                    <th className="px-4 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Section</th>
                    <th className="px-4 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Teacher</th>
                    <th className="px-4 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Staff ID</th>
                    <th className="px-4 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {!loading && currentItems.length > 0 ? currentItems.map((ct) => (
                    <tr key={ct.id} className="hover:bg-muted/5 transition-colors group">
                      <td className="px-4 py-2.5">
                        <span className="text-[11px] font-bold text-foreground">{ct.Class?.name}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-[10px] text-foreground">{ct.Section?.name}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-[10px] text-foreground">
                          {ct.Staff?.firstName} {ct.Staff?.lastName}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="px-1.5 py-0.5 bg-accent/30 text-[9px] font-bold text-foreground rounded border border-border/50">
                          {ct.Staff?.staffId}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleRemove(ct.id)}
                            className="p-1.5 hover:bg-destructive/10 hover:text-destructive text-muted-foreground rounded-md transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : !loading && (
                    <tr>
                      <td colSpan="5" className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <Users className="w-6 h-6 text-muted-foreground" />
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No class teachers assigned</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!loading && filteredAssignments.length > 0 && (
              <div className="px-3 py-2 bg-muted/5 border-t border-border flex items-center justify-between">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAssignments.length)} of {filteredAssignments.length}
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

export default AssignClassTeacher;

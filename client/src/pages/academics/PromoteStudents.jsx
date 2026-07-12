import React, { useState, useEffect } from 'react';
import { ArrowRight, Search, Check, Users, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { useConfirm } from '../../context/ConfirmContext';

const PromoteStudents = () => {
  const confirm = useConfirm();

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [filters, setFilters] = useState({
    fromClassId: '',
    fromSectionId: '',
    toClassId: '',
    toSectionId: ''
  });

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const fetchData = async () => {
    try {
      const [classRes, sectionRes] = await Promise.all([
        api.get('/academics/classes'),
        api.get('/academics/sections')
      ]);
      setClasses(classRes.data.data || []);
      setSections(sectionRes.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    }
  };

  const fetchStudents = async () => {
    if (!filters.fromClassId || !filters.fromSectionId) {
      setStudents([]);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/students', {
        params: {
          classId: filters.fromClassId,
          sectionId: filters.fromSectionId,
          limit: 1000
        }
      });
      setStudents(response.data.data || []);
      setSelectedStudents([]);
      setSelectAll(false);
    } catch (error) {
      toast.error('Failed to fetch students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [filters.fromClassId, filters.fromSectionId]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
    setSelectAll(!selectAll);
  };

  const handleStudentToggle = (id) => {
    setSelectedStudents(prev =>
      prev.includes(id)
        ? prev.filter(sid => sid !== id)
        : [...prev, id]
    );
  };

  const handlePromote = async () => {
    if (!filters.toClassId || !filters.toSectionId) {
      return toast.error('Please select destination class and section');
    }

    if (filters.fromClassId === filters.toClassId && filters.fromSectionId === filters.toSectionId) {
      return toast.error('Cannot promote to the exact same class and section');
    }

    if (selectedStudents.length === 0) {
      return toast.error('Please select at least one student to promote');
    }

    // Attempt to prevent demotions based on class name heuristics
    const getClassLevel = (className) => {
      const name = className.toLowerCase();
      if (name.includes('nursery') || name.includes('play')) return 0;
      if (name.includes('lkg') || name.includes('lower')) return 1;
      if (name.includes('ukg') || name.includes('upper')) return 2;
      const match = name.match(/(grade|class|std)\s*(\d+)/);
      if (match) return parseInt(match[2], 10) + 2;
      return -1;
    };

    const fromClass = classes.find(c => c.id === filters.fromClassId);
    const toClass = classes.find(c => c.id === filters.toClassId);
    if (fromClass && toClass) {
      const fromLevel = getClassLevel(fromClass.name);
      const toLevel = getClassLevel(toClass.name);
      if (fromLevel !== -1 && toLevel !== -1 && toLevel < fromLevel) {
        return toast.error('Demoting students to a lower grade level is restricted');
      }
    }

    if (!await confirm(`Are you sure you want to transfer/promote ${selectedStudents.length} student(s)?`)) {
      return;
    }

    try {
      setPromoting(true);
      const response = await api.post('/academics/promote-students', {
        fromClassId: filters.fromClassId,
        fromSectionId: filters.fromSectionId,
        toClassId: filters.toClassId,
        toSectionId: filters.toSectionId,
        studentIds: selectedStudents
      });

      toast.success(response.data.message || 'Students promoted successfully');
      setSelectedStudents([]);
      setSelectAll(false);
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to promote students');
    } finally {
      setPromoting(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fromClass = classes.find(c => c.id === filters.fromClassId);
  const fromSection = sections.find(s => s.id === filters.fromSectionId);
  const toClass = classes.find(c => c.id === filters.toClassId);
  const toSection = sections.find(s => s.id === filters.toSectionId);

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Promote Students</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Bulk student promotion for year-end</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-[11px] font-black text-primary">FROM</span>
            </div>
            <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Current Class</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1 block mb-1">Class *</label>
              <select
                value={filters.fromClassId}
                onChange={(e) => setFilters({...filters, fromClassId: e.target.value})}
                className="w-full h-8 bg-muted/30 border border-border rounded-lg px-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20"
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1 block mb-1">Section *</label>
              <select
                value={filters.fromSectionId}
                onChange={(e) => setFilters({...filters, fromSectionId: e.target.value})}
                className="w-full h-8 bg-muted/30 border border-border rounded-lg px-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20"
              >
                <option value="">Select Section</option>
                {sections.map(section => (
                  <option key={section.id} value={section.id}>{section.name}</option>
                ))}
              </select>
            </div>

            {filters.fromClassId && filters.fromSectionId && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-2">
                <p className="text-[9px] text-muted-foreground mb-1">Students Found</p>
                <p className="text-2xl font-black text-primary">{students.length}</p>
              </div>
            )}
          </div>
        </div>

        {/* Destination */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent/30 flex items-center justify-center">
              <span className="text-[11px] font-black text-foreground">TO</span>
            </div>
            <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Promote To</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1 block mb-1">Class *</label>
              <select
                value={filters.toClassId}
                onChange={(e) => setFilters({...filters, toClassId: e.target.value})}
                className="w-full h-8 bg-muted/30 border border-border rounded-lg px-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20"
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1 block mb-1">Section *</label>
              <select
                value={filters.toSectionId}
                onChange={(e) => setFilters({...filters, toSectionId: e.target.value})}
                className="w-full h-8 bg-muted/30 border border-border rounded-lg px-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20"
              >
                <option value="">Select Section</option>
                {sections.map(section => (
                  <option key={section.id} value={section.id}>{section.name}</option>
                ))}
              </select>
            </div>

            {selectedStudents.length > 0 && filters.toClassId && filters.toSectionId && (
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-2">
                <p className="text-[9px] text-muted-foreground mb-1">Will Be Transferred/Promoted</p>
                <p className="text-2xl font-black text-foreground">{selectedStudents.length}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview */}
      {fromClass && fromSection && toClass && toSection && selectedStudents.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary" />
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Promotion Preview</p>
          </div>
          <p className="text-[11px] text-foreground mt-2">
            <span className="font-bold">{selectedStudents.length}</span> student(s) will be transferred/promoted from{' '}
            <span className="font-bold">{fromClass.name} - {fromSection.name}</span> to{' '}
            <span className="font-bold">{toClass.name} - {toSection.name}</span>
          </p>
        </div>
      )}

      {/* Student List */}
      {filters.fromClassId && filters.fromSectionId && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Select Students</h3>
            <div className="flex items-center gap-2">
              <div className="relative w-48">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-7 pl-7 pr-2 bg-background border border-border rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Loading students...</span>
              </div>
            </div>
          ) : filteredStudents.length > 0 ? (
            <>
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-muted/5 border-b border-border">
                    <tr>
                      <th className="px-4 py-2">
                        <button
                          onClick={handleSelectAll}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                            selectAll ? 'bg-primary border-primary' : 'bg-background border-border'
                          }`}
                        >
                          {selectAll && <Check className="w-3 h-3 text-white" />}
                        </button>
                      </th>
                      <th className="px-4 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Admission No</th>
                      <th className="px-4 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Student Name</th>
                      <th className="px-4 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Roll No</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-muted/5 transition-colors">
                        <td className="px-4 py-2.5">
                          <button
                            onClick={() => handleStudentToggle(student.id)}
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                              selectedStudents.includes(student.id) ? 'bg-primary border-primary' : 'bg-background border-border'
                            }`}
                          >
                            {selectedStudents.includes(student.id) && <Check className="w-3 h-3 text-white" />}
                          </button>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-[10px] font-bold text-foreground">{student.admissionNo}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-[10px] text-foreground">{student.firstName} {student.lastName}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-[9px] text-muted-foreground">{student.rollNumber || '-'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-4 py-3 bg-muted/5 border-t border-border flex items-center justify-between">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                  {selectedStudents.length} of {filteredStudents.length} selected
                </p>

                <button
                  onClick={handlePromote}
                  disabled={promoting || selectedStudents.length === 0 || !filters.toClassId || !filters.toSectionId}
                  className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {promoting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      Promoting...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-3 h-3" />
                      Promote Students
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                No students found
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromoteStudents;

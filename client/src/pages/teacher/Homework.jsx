import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Plus, Trash, Users, Save, CheckCircle, FileText, ExternalLink, X, ClipboardList, Pencil } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { DatePicker } from "@/components/ui/date-picker";

const Homework = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [homework, setHomework] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states for creating homework
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingHomework, setEditingHomework] = useState(null);
  const [newHomework, setNewHomework] = useState({
    title: '',
    description: '',
    dueDate: '',
    subjectId: '',
    attachmentUrl: ''
  });

  // Drawer states for grading submissions
  const [selectedHw, setSelectedHw] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingSubId, setGradingSubId] = useState(null);
  const [gradeForm, setGradeForm] = useState({ marks: '', remarks: '' });

  // Load classes and section combinations
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get('/teacher/classes');
        if (response.data.data) {
          const uniqueCombos = response.data.data.classes || [];
          setClasses(uniqueCombos);

          if (uniqueCombos.length > 0) {
            setSelectedClass(uniqueCombos[0].classId);
            setSelectedSection(uniqueCombos[0].sectionId);
          }
        }
      } catch (error) {
        toast.error('Failed to load setup parameters');
      } finally {
        setLoadingSetup(false);
      }
    };
    fetchClasses();
  }, []);

  // Fetch subjects in selected class
  useEffect(() => {
    if (!selectedClass || !selectedSection) return;

    const fetchSubjects = async () => {
      try {
        const selectedCombo = classes.find(c => c.classId === selectedClass && c.sectionId === selectedSection);
        if (selectedCombo?.Subjects?.length) {
          setSubjects(selectedCombo.Subjects);
          setNewHomework(prev => ({ ...prev, subjectId: selectedCombo.Subjects[0].id }));
          return;
        }

        // Fetch subject groups containing subjects
        const response = await api.get(`/academics/subject-group?classId=${selectedClass}&sectionId=${selectedSection}`);
        const list = response.data.data || [];
        // Flatten subjects list
        const allSubjects = [];
        list.forEach(sg => {
          if (sg.Subject) {
            sg.Subject.forEach(s => {
              if (!allSubjects.some(sub => sub.id === s.id)) {
                allSubjects.push(s);
              }
            });
          }
        });
        setSubjects(allSubjects);
        if (allSubjects.length > 0) {
          setNewHomework(prev => ({ ...prev, subjectId: allSubjects[0].id }));
        } else {
          setNewHomework(prev => ({ ...prev, subjectId: '' }));
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchSubjects();
  }, [selectedClass, selectedSection, classes]);

  // Load homework tasks for this class combo
  const fetchHomeworkList = async () => {
    if (!selectedClass || !selectedSection) return;

    try {
      setLoadingList(true);
      const response = await api.get(`/teacher/homework?classId=${selectedClass}&sectionId=${selectedSection}`);
      setHomework(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load homework assignments list');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchHomeworkList();
  }, [selectedClass, selectedSection]);

  const handleClassSelection = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [cId, sId] = val.split(':');
    setSelectedClass(cId);
    setSelectedSection(sId);
  };

  const handleCreateHomework = async (e) => {
    e.preventDefault();
    if (!newHomework.title || !newHomework.description || !newHomework.dueDate || !newHomework.subjectId) {
      return toast.error('Please fill in all required fields');
    }

    try {
      setSubmitting(true);
      const payload = {
        ...newHomework,
        classId: selectedClass,
        sectionId: selectedSection
      };

      if (editingHomework) {
        await api.put(`/teacher/homework/${editingHomework.id}`, payload);
        toast.success('Homework task updated successfully');
      } else {
        await api.post('/teacher/homework', payload);
        toast.success('Homework task distributed successfully');
      }
      setShowCreateModal(false);
      setEditingHomework(null);
      setNewHomework({ title: '', description: '', dueDate: '', subjectId: subjects[0]?.id || '', attachmentUrl: '' });
      fetchHomeworkList();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to distribute homework');
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setEditingHomework(null);
    setNewHomework({ title: '', description: '', dueDate: '', subjectId: subjects[0]?.id || '', attachmentUrl: '' });
    setShowCreateModal(true);
  };

  const openEditModal = (hw) => {
    setEditingHomework(hw);
    setNewHomework({
      title: hw.title || '',
      description: hw.description || '',
      dueDate: hw.dueDate ? new Date(hw.dueDate).toISOString().split('T')[0] : '',
      subjectId: hw.subjectId || subjects[0]?.id || '',
      attachmentUrl: hw.attachmentUrl || ''
    });
    setShowCreateModal(true);
  };

  const handleDeleteHomework = async (id) => {
    if (!window.confirm('Are you sure you want to delete this homework assignment?')) return;

    try {
      await api.delete(`/teacher/homework/${id}`);
      toast.success('Homework task deleted successfully');
      fetchHomeworkList();
      if (selectedHw?.id === id) setSelectedHw(null);
    } catch (error) {
      toast.error('Failed to delete homework');
    }
  };

  const handleViewSubmissions = async (hw) => {
    setSelectedHw(hw);
    setLoadingSubmissions(true);
    try {
      const response = await api.get(`/teacher/homework/${hw.id}/submissions`);
      setSubmissions(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch student submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleGradeClick = (sub) => {
    setGradingSubId(sub.id);
    setGradeForm({
      marks: sub.marks || '',
      remarks: sub.remarks || ''
    });
  };

  const handleGradeSubmit = async (e, subId) => {
    e.preventDefault();
    try {
      await api.put(`/teacher/homework/submissions/${subId}/grade`, {
        marks: gradeForm.marks,
        remarks: gradeForm.remarks
      });
      toast.success('Submission graded successfully');
      setGradingSubId(null);
      // Reload submissions
      if (selectedHw) {
        handleViewSubmissions(selectedHw);
      }
    } catch (error) {
      toast.error('Failed to grade submission');
    }
  };

  if (loadingSetup) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Loading setup...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Classroom Homework Hub
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">
            Create, distribute, and grade student home study tasks
          </p>
        </div>

        {/* Filters and Add Panel */}
        <div className="flex flex-wrap items-center gap-3 bg-card border border-border rounded-xl p-3 shadow-sm">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Class & Section</label>
            <select
              value={`${selectedClass}:${selectedSection}`}
              onChange={handleClassSelection}
              className="bg-muted/30 border border-border rounded-lg h-9 px-2 text-xs font-bold focus:outline-none"
            >
              {classes.map((c, i) => (
                <option key={i} value={`${c.classId}:${c.sectionId}`}>
                  Class {c.Class?.name} - {c.Section?.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-1.5 bg-primary text-primary-foreground hover:opacity-90 rounded-lg h-9 px-4 text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Distribute Homework
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Homework Listing (Left/Center) */}
        <div className="lg:col-span-2 space-y-4">
          {loadingList ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : homework.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-bold uppercase tracking-wider">No homework tasks distributed yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {homework.map((hw) => (
                <div key={hw.id} className="bg-card border border-border hover:border-primary/20 rounded-xl p-4 flex flex-col justify-between gap-4 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          {hw.Subject?.name}
                        </span>
                        <h3 className="text-xs font-bold text-foreground mt-1.5">{hw.title}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(hw)}
                          className="p-1 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-colors"
                          title="Edit homework"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteHomework(hw.id)}
                          className="p-1 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg transition-colors"
                          title="Delete homework"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-3">{hw.description}</p>
                  </div>

                  <div className="border-t border-border pt-3 flex items-center justify-between text-[10px] font-bold">
                    <span className="flex items-center gap-1 text-amber-500">
                      <Calendar className="w-3.5 h-3.5" />
                      Due {new Date(hw.dueDate).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleViewSubmissions(hw)}
                      className="flex items-center gap-1.5 text-primary hover:opacity-85"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Grading Drawer ({hw._count?.Submissions || 0})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submissions Grading Desk (Right Column Sidebar Drawer) */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col h-[600px]">
          <div className="px-4 py-3 bg-muted/10 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Grading Desk</h3>
            </div>
            {selectedHw && (
              <button 
                onClick={() => setSelectedHw(null)}
                className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!selectedHw ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Users className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-xs font-bold uppercase tracking-wider">Select a task grading drawer</p>
                <p className="text-[9px] mt-0.5">Click the "Grading Drawer" link of any task card to start</p>
              </div>
            ) : loadingSubmissions ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <CheckCircle className="w-8 h-8 mb-2 text-emerald-500 opacity-80" />
                <p className="text-xs font-bold uppercase tracking-wider text-foreground">Zero Submissions Yet</p>
                <p className="text-[9px] mt-0.5">Students have not uploaded responses for: <br /><strong>{selectedHw.title}</strong></p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="pb-3 border-b border-border">
                  <h4 className="text-xs font-bold text-foreground">{selectedHw.title}</h4>
                  <p className="text-[9px] text-muted-foreground mt-0.5">Class submissions log directory</p>
                </div>

                <div className="space-y-3">
                  {submissions.map((sub) => {
                    const isGrading = gradingSubId === sub.id;
                    return (
                      <div key={sub.id} className="border border-border rounded-xl p-3 bg-muted/5 hover:bg-muted/10 transition-all space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-muted rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-[10px]">
                              {sub.Student?.photo ? (
                                <img src={sub.Student.photo} alt="" className="w-full h-full object-cover" />
                              ) : (
                                sub.Student?.firstName.charAt(0)
                              )}
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-foreground">
                                {sub.Student?.firstName} {sub.Student?.lastName}
                              </p>
                              <p className="text-[9px] text-muted-foreground font-bold">Roll No: {sub.Student?.rollNumber || 'N/A'}</p>
                            </div>
                          </div>

                          <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            sub.status === 'Graded' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}>
                            {sub.status}
                          </span>
                        </div>

                        {sub.attachmentUrl && (
                          <a
                            href={sub.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[10px] text-primary font-bold hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            View Student Document
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {isGrading ? (
                          <form onSubmit={(e) => handleGradeSubmit(e, sub.id)} className="space-y-2 border-t border-border pt-2.5">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Score / Marks</label>
                                <input
                                  type="number"
                                  placeholder="Marks"
                                  value={gradeForm.marks}
                                  onChange={(e) => setGradeForm({ ...gradeForm, marks: e.target.value })}
                                  className="w-full h-8 bg-background border border-border rounded-lg px-2 text-xs focus:outline-none"
                                  required
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Feedback remarks</label>
                                <input
                                  type="text"
                                  placeholder="Good work, etc"
                                  value={gradeForm.remarks}
                                  onChange={(e) => setGradeForm({ ...gradeForm, remarks: e.target.value })}
                                  className="w-full h-8 bg-background border border-border rounded-lg px-2 text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                className="flex-1 h-8 bg-primary text-primary-foreground hover:opacity-90 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                              >
                                Save Score
                              </button>
                              <button
                                type="button"
                                onClick={() => setGradingSubId(null)}
                                className="h-8 px-3 bg-muted border border-border text-foreground rounded-lg text-[10px] font-bold"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[10px] font-bold">
                            {sub.status === 'Graded' ? (
                              <div className="text-foreground">
                                Score: <span className="text-primary font-black">{sub.marks}</span> · <span className="text-muted-foreground italic font-medium">"{sub.remarks || 'No remarks'}"</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground font-medium">Not scored yet</span>
                            )}
                            <button
                              onClick={() => handleGradeClick(sub)}
                              className="text-primary hover:opacity-85 text-[10px]"
                            >
                              {sub.status === 'Graded' ? 'Re-grade' : 'Grade Submission'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-4 py-3 bg-muted/10 border-b border-border flex items-center justify-between">
              <h3 className="text-xs font-black text-foreground uppercase tracking-widest">
                {editingHomework ? 'Edit Homework' : 'Distribute New Homework'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingHomework(null);
                }}
                className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHomework} className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Subject *</label>
                <select
                  value={newHomework.subjectId}
                  onChange={(e) => setNewHomework({ ...newHomework, subjectId: e.target.value })}
                  className="w-full bg-muted/30 border border-border rounded-lg h-9 px-2 text-xs focus:outline-none"
                  required
                >
                  <option value="" disabled>Select Subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Assignment Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Algebra Exercise 4"
                  value={newHomework.title}
                  onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
                  className="w-full bg-muted/30 border border-border rounded-lg h-9 px-3 text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Instructions / Description *</label>
                <textarea
                  placeholder="Provide details and questions for the students..."
                  value={newHomework.description}
                  onChange={(e) => setNewHomework({ ...newHomework, description: e.target.value })}
                  rows={4}
                  className="w-full bg-muted/30 border border-border rounded-lg p-3 text-xs focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Due Date *</label>
                  <DatePicker
                    value={newHomework.dueDate}
                    min={editingHomework ? undefined : new Date().toISOString().split('T')[0]}
                    onChange={(e) => setNewHomework({ ...newHomework, dueDate: e.target.value })}
                    className="w-full bg-muted/30 border border-border rounded-lg h-9 px-3 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Resource Attachment Link</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={newHomework.attachmentUrl}
                    onChange={(e) => setNewHomework({ ...newHomework, attachmentUrl: e.target.value })}
                    className="w-full bg-muted/30 border border-border rounded-lg h-9 px-3 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingHomework(null);
                  }}
                  className="h-9 px-4 bg-muted border border-border text-foreground hover:bg-accent rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-9 px-5 bg-primary text-primary-foreground hover:opacity-90 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  {submitting ? 'Saving...' : editingHomework ? 'Update' : 'Distribute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homework;

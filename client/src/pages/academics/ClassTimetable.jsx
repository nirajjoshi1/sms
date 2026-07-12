import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import CustomModal from '../../components/ui/CustomModal';
import { useConfirm } from '../../context/ConfirmContext';


const ClassTimetable = () => {
  const confirm = useConfirm();

  const [timetables, setTimetables] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [filters, setFilters] = useState({
    classId: '',
    sectionId: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    dayOfWeek: 'Monday',
    startTime: '',
    endTime: '',
    roomNo: '',
    subjectId: '',
    staffId: ''
  });

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const fetchData = async () => {
    try {
      const [classRes, sectionRes, subjectRes, staffRes] = await Promise.all([
        api.get('/academics/classes'),
        api.get('/academics/sections'),
        api.get('/academics/subjects'),
        api.get('/staff')
      ]);
      setClasses(classRes.data.data || []);
      setSections(sectionRes.data.data || []);
      setSubjects(subjectRes.data.data || []);
      const teachers = (staffRes.data.data || []).filter(s => s.role === 'TEACHER' && !s.isDisabled);
      setStaff(teachers);
    } catch (error) {
      toast.error('Failed to fetch data');
    }
  };

  const fetchTimetable = async () => {
    if (!filters.classId || !filters.sectionId) return;

    try {
      setLoading(true);
      const response = await api.get('/academics/timetable', {
        params: {
          classId: filters.classId,
          sectionId: filters.sectionId
        }
      });
      setTimetables(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [filters.classId, filters.sectionId]);

  // Fetch all timetables for the selected day to check teacher availability
  const [allDayTimetables, setAllDayTimetables] = useState([]);

  const fetchAllDayTimetables = async (day) => {
    if (!day) return;
    try {
      const response = await api.get('/academics/timetable');
      const allTimetables = response.data.data || [];
      // Filter by selected day
      const dayTimetables = allTimetables.filter(t => t.dayOfWeek === day);
      setAllDayTimetables(dayTimetables);
    } catch (error) {
      console.error('Failed to fetch day timetables');
    }
  };

  const openModal = (entry = null) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        roomNo: entry.roomNo || '',
        subjectId: entry.subjectId,
        staffId: entry.staffId
      });
      fetchAllDayTimetables(entry.dayOfWeek);
    } else {
      setEditingEntry(null);
      setFormData({
        dayOfWeek: 'Monday',
        startTime: '',
        endTime: '',
        roomNo: '',
        subjectId: '',
        staffId: ''
      });
      fetchAllDayTimetables('Monday');
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEntry(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!filters.classId || !filters.sectionId) {
      return toast.error('Please select class and section first');
    }

    const payload = {
      ...formData,
      classId: filters.classId,
      sectionId: filters.sectionId
    };

    try {
      setSubmitting(true);
      if (editingEntry) {
        await api.put(`/academics/timetable/${editingEntry.id}`, payload);
        toast.success('Timetable updated successfully');
      } else {
        await api.post('/academics/timetable', payload);
        toast.success('Timetable entry created successfully');
      }
      closeModal();
      fetchTimetable();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save timetable entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!await confirm('Are you sure you want to delete this timetable entry?')) return;
    try {
      await api.delete(`/academics/timetable/${id}`);
      toast.success('Timetable entry deleted');
      fetchTimetable();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete timetable entry');
    }
  };

  // Group timetables by day and time
  const getTimetableGrid = () => {
    const grid = {};
    daysOfWeek.forEach(day => {
      grid[day] = timetables.filter(t => t.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return grid;
  };

  const grid = getTimetableGrid();

  // Get available subjects for the selected class/section (exclude already assigned subjects for the selected day)
  const getAvailableSubjects = () => {
    if (!filters.classId || !filters.sectionId || !formData.dayOfWeek) return subjects;

    // Get subjects already assigned for this class/section on the selected day
    const assignedSubjectIds = timetables
      .filter(t =>
        t.dayOfWeek === formData.dayOfWeek &&
        (!editingEntry || t.id !== editingEntry.id) // Exclude current entry if editing
      )
      .map(t => t.subjectId);

    return subjects.filter(subject => !assignedSubjectIds.includes(subject.id));
  };

  // Get available teachers (exclude those who already have 7 or more assignments for the selected day)
  const getAvailableTeachers = () => {
    if (!formData.dayOfWeek) return staff;

    // Count assignments per teacher for the selected day across ALL classes
    const teacherAssignmentCounts = {};
    allDayTimetables.forEach(t => {
      if (!editingEntry || t.id !== editingEntry.id) { // Exclude current entry if editing
        teacherAssignmentCounts[t.staffId] = (teacherAssignmentCounts[t.staffId] || 0) + 1;
      }
    });

    // Filter teachers who have less than 7 assignments
    return staff.filter(teacher => {
      const count = teacherAssignmentCounts[teacher.id] || 0;
      return count < 7;
    });
  };

  const availableSubjects = getAvailableSubjects();
  const availableTeachers = getAvailableTeachers();

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Class Timetable</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Manage weekly class schedule</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1 block mb-1">Class *</label>
          <select
            value={filters.classId}
            onChange={(e) => setFilters({...filters, classId: e.target.value})}
            className="w-full h-8 bg-muted/30 border border-border rounded-lg px-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20"
          >
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1 block mb-1">Section *</label>
          <select
            value={filters.sectionId}
            onChange={(e) => setFilters({...filters, sectionId: e.target.value})}
            className="w-full h-8 bg-muted/30 border border-border rounded-lg px-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20"
          >
            <option value="">Select Section</option>
            {sections.map(section => (
              <option key={section.id} value={section.id}>{section.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => openModal()}
          disabled={!filters.classId || !filters.sectionId}
          className="h-8 px-3 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Plus className="w-3 h-3" />
          Add Slot
        </button>
      </div>

      {/* Timetable Grid */}
      {filters.classId && filters.sectionId ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-6 bg-muted/5 border-b border-border">
                  {daysOfWeek.map(day => (
                    <div key={day} className="px-3 py-2 text-center border-r border-border last:border-r-0">
                      <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{day}</span>
                    </div>
                  ))}
                </div>

                {/* Body */}
                <div className="grid grid-cols-6">
                  {daysOfWeek.map(day => (
                    <div key={day} className="border-r border-border last:border-r-0 min-h-[200px]">
                      {grid[day].length > 0 ? (
                        <div className="p-2 space-y-2">
                          {grid[day].map(entry => (
                            <div
                              key={entry.id}
                              className="bg-primary/5 border border-primary/20 rounded-lg p-2 hover:bg-primary/10 transition-all group relative"
                            >
                              <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => openModal(entry)}
                                  className="p-1 bg-primary/10 hover:bg-primary/20 rounded"
                                >
                                  <Edit2 className="w-2.5 h-2.5 text-primary" />
                                </button>
                                <button
                                  onClick={() => handleDelete(entry.id)}
                                  className="p-1 bg-destructive/10 hover:bg-destructive/20 rounded"
                                >
                                  <Trash2 className="w-2.5 h-2.5 text-destructive" />
                                </button>
                              </div>

                              <div className="space-y-1">
                                <p className="text-[10px] font-bold text-foreground">{entry.Subject?.name}</p>
                                <p className="text-[9px] text-muted-foreground">
                                  {entry.Staff?.firstName} {entry.Staff?.lastName}
                                </p>
                                <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>{entry.startTime} - {entry.endTime}</span>
                                </div>
                                {entry.roomNo && (
                                  <p className="text-[8px] text-muted-foreground">Room: {entry.roomNo}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full p-4">
                          <p className="text-[9px] text-muted-foreground italic">No classes</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Select class and section to view timetable
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CustomModal isOpen={true} onClose={closeModal} title={editingEntry ? 'Edit Timetable Entry' : 'Add Timetable Entry'} maxWidth="max-w-md">
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Day *</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => {
                    setFormData({...formData, dayOfWeek: e.target.value, subjectId: '', staffId: ''});
                    fetchAllDayTimetables(e.target.value);
                  }}
                  className="w-full h-8 bg-muted/30 border border-border rounded-lg px-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                >
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Start Time *</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full h-8 bg-muted/30 border border-border rounded-lg px-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">End Time *</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full h-8 bg-muted/30 border border-border rounded-lg px-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Subject *</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                  className="w-full h-8 bg-muted/30 border border-border rounded-lg px-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                >
                  <option value="">Select Subject</option>
                  {availableSubjects.length === 0 ? (
                    <option value="" disabled>All subjects assigned for this day</option>
                  ) : (
                    availableSubjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))
                  )}
                </select>
                {availableSubjects.length === 0 && (
                  <p className="text-[9px] text-orange-500 ml-1">All subjects already assigned for {formData.dayOfWeek}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Teacher *</label>
                <select
                  value={formData.staffId}
                  onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                  className="w-full h-8 bg-muted/30 border border-border rounded-lg px-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                >
                  <option value="">Select Teacher</option>
                  {availableTeachers.length === 0 ? (
                    <option value="" disabled>All teachers at max capacity (7 periods)</option>
                  ) : (
                    availableTeachers.map(teacher => {
                      const assignmentCount = allDayTimetables.filter(t =>
                        t.staffId === teacher.id && (!editingEntry || t.id !== editingEntry.id)
                      ).length;
                      return (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName} ({teacher.staffId}) - {assignmentCount}/7 periods
                        </option>
                      );
                    })
                  )}
                </select>
                {availableTeachers.length === 0 && (
                  <p className="text-[9px] text-orange-500 ml-1">All teachers have reached max 7 periods for {formData.dayOfWeek}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Room Number</label>
                <input
                  type="text"
                  value={formData.roomNo}
                  onChange={(e) => setFormData({...formData, roomNo: e.target.value})}
                  placeholder="e.g. Room 101"
                  className="w-full h-8 bg-muted/30 border border-border rounded-lg px-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 h-8 bg-muted text-foreground rounded-lg text-[10px] font-bold hover:bg-muted/80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-8 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingEntry ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </CustomModal>
      )}
    </div>
  );
};

export default ClassTimetable;

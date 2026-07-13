import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Settings, Filter, ArrowRight, ChevronDown, Check } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';
import CustomModal from '../../components/ui/CustomModal';
import { useConfirm } from '../../context/ConfirmContext';
import { format, addMonths } from 'date-fns';

const ALL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const FeeSetup = () => {
  const confirmDialog = useConfirm();

  const [groups, setGroups] = useState([]);
  const [types, setTypes] = useState([]);
  const [masters, setMasters] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // Modals
  const [groupModal, setGroupModal] = useState({ isOpen: false, editingId: null });
  const [itemModal, setItemModal] = useState({ isOpen: false, editingId: null });
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [groupForm, setGroupForm] = useState({ name: '', description: '' });
  
  const [itemForm, setItemForm] = useState({
    feeTypeId: '',
    newTypeName: '',
    amount: '',
    dueDate: '',
    classId: '',
    sectionId: '',
    studentId: '',
    fineType: 'None',
    percentage: '',
    fixAmount: '',
    isRecurring: false,
    selectedMonths: []
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupsRes, typesRes, mastersRes, classesRes] = await Promise.all([
        api.get('/fees/groups'),
        api.get('/fees/types'),
        api.get('/fees/masters'),
        api.get('/academics/classes')
      ]);
      setGroups(groupsRes.data.data || []);
      setTypes(typesRes.data.data || []);
      setMasters(mastersRes.data.data || []);
      setClasses(classesRes.data.data || []);

      if (groupsRes.data.data?.length > 0 && !selectedGroupId) {
        setSelectedGroupId(groupsRes.data.data[0].id);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch fee setup data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemForm.classId) {
      api.get(`/academics/sections?classId=${itemForm.classId}`)
        .then(res => setSections(res.data.data || []))
        .catch(console.error);
    } else {
      setSections([]);
      setItemForm(prev => ({ ...prev, sectionId: '', studentId: '' }));
    }
  }, [itemForm.classId]);

  useEffect(() => {
    if (itemForm.classId && itemForm.sectionId) {
      api.get(`/students?classId=${itemForm.classId}&sectionId=${itemForm.sectionId}`)
        .then(res => setStudents(res.data.data?.students || res.data.data || []))
        .catch(console.error);
    } else {
      setStudents([]);
      setItemForm(prev => ({ ...prev, studentId: '' }));
    }
  }, [itemForm.classId, itemForm.sectionId]);

  useEffect(() => {
    fetchData();
  }, []);

  // -- Group Actions --
  const openGroupModal = (group = null) => {
    if (group) {
      setGroupModal({ isOpen: true, editingId: group.id });
      setGroupForm({ name: group.name, description: group.description || '' });
    } else {
      setGroupModal({ isOpen: true, editingId: null });
      setGroupForm({ name: '', description: '' });
    }
  };

  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    if (!groupForm.name.trim()) return toast.error('Group name is required');
    try {
      setSubmitting(true);
      if (groupModal.editingId) {
        await api.put(`/fees/groups/${groupModal.editingId}`, groupForm);
        toast.success('Fee group updated successfully');
      } else {
        const res = await api.post('/fees/groups', groupForm);
        toast.success('Fee group created successfully');
        setSelectedGroupId(res.data.data.id);
      }
      setGroupModal({ isOpen: false, editingId: null });
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error, `Failed to ${groupModal.editingId ? 'update' : 'create'} fee group`));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGroupDelete = async (id) => {
    if (!await confirmDialog('Are you sure you want to delete this fee group? It will delete all associated fee items.')) return;
    try {
      await api.delete(`/fees/groups/${id}`);
      toast.success('Fee group deleted successfully');
      if (selectedGroupId === id) setSelectedGroupId(null);
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete fee group'));
    }
  };

  // -- Item Actions --
  const openItemModal = (master = null) => {
    if (master) {
      setItemModal({ isOpen: true, editingId: master.id });
      setItemForm({
        feeTypeId: master.feeTypeId,
        newTypeName: '',
        amount: master.amount,
        dueDate: master.dueDate ? format(new Date(master.dueDate), 'yyyy-MM-dd') : '',
        classId: master.classId || '',
        sectionId: master.sectionId || '',
        studentId: master.studentId || '',
        fineType: master.fineType || 'None',
        percentage: master.percentage || '',
        fixAmount: master.fixAmount || '',
        isRecurring: false,
        selectedMonths: []
      });
    } else {
      setItemModal({ isOpen: true, editingId: null });
      setItemForm({
        feeTypeId: '',
        newTypeName: '',
        amount: '',
        dueDate: '',
        classId: '',
        sectionId: '',
        studentId: '',
        fineType: 'None',
        percentage: '',
        fixAmount: '',
        isRecurring: false,
        selectedMonths: []
      });
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const baseName = itemForm.feeTypeId === 'NEW' 
        ? itemForm.newTypeName.trim() 
        : types.find(t => t.id === itemForm.feeTypeId)?.name;

      if (!baseName) return toast.error('Please select or enter a Fee Item name');
      if (!itemForm.amount) return toast.error('Amount is required');
      if (!itemForm.isRecurring && !itemForm.dueDate) return toast.error('Due Date is required');
      if (itemForm.isRecurring && itemForm.selectedMonths.length === 0) return toast.error('Please select at least one month');

      const basePayload = {
        feeGroupId: selectedGroupId,
        classId: itemForm.classId || null,
        sectionId: itemForm.sectionId || null,
        studentId: itemForm.studentId || null,
        amount: Number(itemForm.amount),
        fineType: itemForm.fineType,
        percentage: itemForm.fineType === 'Percentage' ? Number(itemForm.percentage) : null,
        fixAmount: itemForm.fineType === 'Fixed' ? Number(itemForm.fixAmount) : null
      };

      if (itemModal.editingId) {
        await api.put(`/fees/masters/${itemModal.editingId}`, { ...basePayload, feeTypeId: itemForm.feeTypeId, dueDate: itemForm.dueDate });
        toast.success('Fee item updated successfully');
      } else {
        if (itemForm.isRecurring && itemForm.selectedMonths.length > 0) {
            const promises = itemForm.selectedMonths.map(async m => {
                const monthAbbr = m.month.substring(0, 3);
                const monthFeeName = `${baseName} - ${monthAbbr}`;
                const monthFeeCode = monthFeeName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
                
                let monthTypeId = types.find(t => t.code === monthFeeCode || t.name === monthFeeName)?.id;
                
                if (!monthTypeId) {
                    const typeRes = await api.post('/fees/types', {
                      name: monthFeeName,
                      code: monthFeeCode,
                      description: `Auto-created recurring fee for ${monthFeeName}`
                    });
                    monthTypeId = typeRes.data.data.id;
                }

                return api.post('/fees/masters', {
                  ...basePayload,
                  feeTypeId: monthTypeId,
                  dueDate: m.dueDate
                });
            });
            await Promise.all(promises);
            toast.success(`${itemForm.selectedMonths.length} recurring fee items added successfully`);
        } else {
            let targetTypeId = itemForm.feeTypeId;
            if (targetTypeId === 'NEW') {
              const code = baseName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
              const typeRes = await api.post('/fees/types', {
                name: baseName,
                code: code,
                description: `Auto-created for ${baseName}`
              });
              targetTypeId = typeRes.data.data.id;
            }
            await api.post('/fees/masters', { ...basePayload, feeTypeId: targetTypeId, dueDate: itemForm.dueDate });
            toast.success('Fee item added successfully');
        }
      }

      setItemModal({ isOpen: false, editingId: null });
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error, `Failed to save fee item`));
    } finally {
      setSubmitting(false);
    }
  };

  const handleItemDelete = async (id) => {
    if (!await confirmDialog('Are you sure you want to remove this fee item from the group?')) return;
    try {
      await api.delete(`/fees/masters/${id}`);
      toast.success('Fee item removed');
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to remove fee item'));
    }
  };

  if (loading && groups.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const groupMasters = masters.filter(m => m.feeGroupId === selectedGroupId);

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3 shrink-0">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Fee Setup</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">
            Configure Fee Groups and their respective Items
          </p>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left Sidebar - Groups */}
        <div className="w-64 bg-card border border-border rounded-xl flex flex-col shrink-0">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Fee Groups</h2>
            <button 
              onClick={() => openGroupModal()}
              className="p-1.5 hover:bg-muted rounded-md text-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="p-2 overflow-y-auto flex-1 space-y-1">
            {groups.length === 0 ? (
              <div className="text-center p-4">
                <p className="text-[10px] text-muted-foreground italic">No fee groups created</p>
                <button 
                  onClick={() => openGroupModal()}
                  className="mt-2 text-xs text-primary font-bold hover:underline"
                >
                  Create one now
                </button>
              </div>
            ) : (
              groups.map(group => (
                <div 
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                    selectedGroupId === group.id 
                      ? 'bg-primary/10 border border-primary/20 text-primary' 
                      : 'hover:bg-muted/50 border border-transparent text-foreground'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className={`text-sm font-bold truncate ${selectedGroupId === group.id ? 'text-primary' : ''}`}>
                      {group.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 lg:opacity-100">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openGroupModal(group); }}
                      className="p-1 hover:bg-background rounded text-muted-foreground hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleGroupDelete(group.id); }}
                      className="p-1 hover:bg-background rounded text-muted-foreground hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Items in Group */}
        <div className="flex-1 bg-card border border-border rounded-xl flex flex-col min-w-0">
          {!selectedGroupId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <Settings className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-sm font-bold text-foreground">No Group Selected</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Select a Fee Group from the left to manage its specific fee items and rules.
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-border flex items-center justify-between bg-muted/5">
                <div>
                  <h2 className="text-lg font-black text-foreground">{selectedGroup?.name}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedGroup?.description || 'No description provided'}</p>
                </div>
                <button
                  onClick={() => openItemModal()}
                  className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Fee Item
                </button>
              </div>

              <div className="p-0 overflow-y-auto flex-1">
                {groupMasters.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                    <p className="text-sm font-bold text-foreground mb-1">No Fee Items Yet</p>
                    <p className="text-xs text-muted-foreground mb-4">This group doesn't have any specific fees attached to it.</p>
                    <button 
                      onClick={() => openItemModal()}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add the first item
                    </button>
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-muted/10 border-b border-border sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fee Name</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Amount</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Class</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Due Date</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fine Rule</th>
                        <th className="px-4 py-3 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {groupMasters.map(master => (
                        <tr key={master.id} className="hover:bg-muted/5 transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-xs font-bold text-foreground">{master.FeeType?.name}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-black text-emerald-600">${Number(master.amount).toFixed(2)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-bold px-2 py-1 bg-muted rounded-md text-muted-foreground">
                              {master.Class?.name || 'All Classes (Global)'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-foreground">
                              {master.dueDate ? format(new Date(master.dueDate), 'MMM dd, yyyy') : '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {master.fineType === 'None' ? (
                              <span className="text-[10px] text-muted-foreground">No fine</span>
                            ) : (
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">{master.fineType}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {master.fineType === 'Percentage' ? `${master.percentage}%` : `$${master.fixAmount}`}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openItemModal(master)}
                                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5 text-blue-600" />
                              </button>
                              <button
                                onClick={() => handleItemDelete(master.id)}
                                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Group Modal */}
      <CustomModal isOpen={groupModal.isOpen} onClose={() => setGroupModal({ isOpen: false })} title={groupModal.editingId ? "Edit Fee Group" : "Create Fee Group"} maxWidth="max-w-md">
        <form onSubmit={handleGroupSubmit} className="p-4 space-y-4">
          <p className="text-[10px] text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border leading-relaxed">
            <strong className="text-foreground">What is a Fee Group?</strong> It's a high-level bucket (like "Monthly Tuition" or "Term 1") that groups related fee items together.
          </p>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Group Name *</label>
            <input
              type="text"
              value={groupForm.name}
              onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
              placeholder="e.g. Term 1 Fees"
              className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Description</label>
            <textarea
              value={groupForm.description}
              onChange={(e) => setGroupForm({...groupForm, description: e.target.value})}
              placeholder="Optional description"
              rows="3"
              className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setGroupModal({ isOpen: false })} className="px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50">
              {submitting ? 'Saving...' : 'Save Group'}
            </button>
          </div>
        </form>
      </CustomModal>

      {/* Item Modal */}
      <CustomModal isOpen={itemModal.isOpen} onClose={() => setItemModal({ isOpen: false })} title={itemModal.editingId ? "Edit Fee Item" : "Add Fee Item"} maxWidth="max-w-md">
        <form onSubmit={handleItemSubmit} className="p-4 space-y-4">
          
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Fee Name *</label>
            <select
              value={itemForm.feeTypeId}
              onChange={(e) => setItemForm({...itemForm, feeTypeId: e.target.value})}
              className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
              required
            >
              <option value="">Select or Create New...</option>
              <option value="NEW" className="font-bold text-primary bg-primary/10">+ Create New Fee Name</option>
              {types.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {itemForm.feeTypeId === 'NEW' && (
            <div className="space-y-1 animate-in slide-in-from-top-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">New Fee Name *</label>
              <input
                type="text"
                value={itemForm.newTypeName}
                onChange={(e) => setItemForm({...itemForm, newTypeName: e.target.value})}
                placeholder="e.g. Lab Fee, Uniform Fee"
                className="w-full h-9 bg-primary/5 border border-primary/20 rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                required={itemForm.feeTypeId === 'NEW'}
                autoFocus
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={itemForm.amount}
                onChange={(e) => setItemForm({...itemForm, amount: e.target.value})}
                placeholder="0.00"
                className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                required
              />
            </div>
            {!itemForm.isRecurring && (
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Due Date *</label>
                <input
                  type="date"
                  value={itemForm.dueDate}
                  onChange={(e) => setItemForm({...itemForm, dueDate: e.target.value})}
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required={!itemForm.isRecurring}
                />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Applicable Class</label>
            <select
              value={itemForm.classId}
              onChange={(e) => setItemForm({...itemForm, classId: e.target.value})}
              className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
            >
              <option value="">All Classes (Global Fee)</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {itemForm.classId && (
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Applicable Section</label>
              <select
                value={itemForm.sectionId}
                onChange={(e) => setItemForm({...itemForm, sectionId: e.target.value})}
                className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
              >
                <option value="">All Sections</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {itemForm.sectionId && (
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Applicable Student</label>
              <select
                value={itemForm.studentId}
                onChange={(e) => setItemForm({...itemForm, studentId: e.target.value})}
                className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
              >
                <option value="">All Students</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNo})</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1 pt-2 border-t border-border">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Late Fine Rule</label>
            <select
              value={itemForm.fineType}
              onChange={(e) => setItemForm({...itemForm, fineType: e.target.value})}
              className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
            >
              <option value="None">No Fine</option>
              <option value="Percentage">Percentage (%)</option>
              <option value="Fixed">Fixed Amount ($)</option>
            </select>
          </div>

          {itemForm.fineType === 'Percentage' && (
            <div className="space-y-1 animate-in slide-in-from-top-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Fine Percentage (%) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={itemForm.percentage}
                onChange={(e) => setItemForm({...itemForm, percentage: e.target.value})}
                className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                required={itemForm.fineType === 'Percentage'}
              />
            </div>
          )}

          {itemForm.fineType === 'Fixed' && (
            <div className="space-y-1 animate-in slide-in-from-top-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Fixed Fine Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={itemForm.fixAmount}
                onChange={(e) => setItemForm({...itemForm, fixAmount: e.target.value})}
                className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                required={itemForm.fineType === 'Fixed'}
              />
            </div>
          )}

          {!itemModal.editingId && (
            <div className="pt-2 border-t border-border mt-2 space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold text-foreground uppercase tracking-widest ml-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={itemForm.isRecurring} 
                  onChange={(e) => setItemForm({...itemForm, isRecurring: e.target.checked})}
                  className="rounded border-border text-primary focus:ring-primary/20"
                />
                Is this a Recurring Fee? (e.g. Monthly)
              </label>

              {itemForm.isRecurring && (
                <div className="space-y-3 animate-in slide-in-from-top-1 bg-primary/5 p-3 rounded-lg border border-primary/20">
                  <p className="text-[10px] text-muted-foreground">Select the months this fee applies to and set the specific due date for each.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {ALL_MONTHS.map(month => {
                      const isSelected = itemForm.selectedMonths.find(m => m.month === month);
                      return (
                        <div key={month} className="flex items-center gap-2 p-2 bg-background border border-border rounded-lg hover:border-primary/30 transition-colors">
                          <input
                            type="checkbox"
                            checked={!!isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setItemForm({...itemForm, selectedMonths: [...itemForm.selectedMonths, { month, dueDate: '' }]});
                              } else {
                                setItemForm({...itemForm, selectedMonths: itemForm.selectedMonths.filter(m => m.month !== month)});
                              }
                            }}
                            className="rounded border-border text-primary focus:ring-primary/20"
                          />
                          <span className="text-xs font-bold text-foreground w-16">{month.substring(0,3)}</span>
                          {isSelected && (
                            <input
                              type="date"
                              value={isSelected.dueDate}
                              onChange={(e) => {
                                const newMonths = itemForm.selectedMonths.map(m => m.month === month ? { ...m, dueDate: e.target.value } : m);
                                setItemForm({...itemForm, selectedMonths: newMonths});
                              }}
                              className="flex-1 h-7 bg-muted/30 border border-border rounded px-2 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/20"
                              required
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setItemModal({ isOpen: false })} className="px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50">
              {submitting ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </CustomModal>
    </div>
  );
};

export default FeeSetup;

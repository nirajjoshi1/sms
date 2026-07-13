import React, { useState, useEffect } from 'react';
import CustomModal from '../../components/ui/CustomModal';
import api from '../../lib/api';
import { toast } from 'sonner';
import { Search, Loader2 } from 'lucide-react';

export default function AssignStudentsModal({ isOpen, onClose, onSuccess, targetId, targetName, targetType }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && targetId) {
      fetchStudents();
    } else {
      setSelectedIds(new Set());
      setSearchQuery('');
    }
  }, [isOpen, targetId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Fetch a large number of students for bulk assignment
      const response = await api.get('/students', { params: { limit: 1000, status: 'Active' } });
      const allStudents = response.data.data || [];
      
      // Filter students so we only show those available or already in this target
      const availableStudents = allStudents.filter(student => {
        if (targetType === 'house') {
          return student.houseId === null || student.houseId === targetId;
        }
        if (targetType === 'category') {
          return student.categoryId === null || student.categoryId === targetId;
        }
        return true;
      });

      setStudents(availableStudents);

      // Pre-select students already in this target
      const preSelected = new Set();
      availableStudents.forEach(student => {
        if (targetType === 'house' && student.houseId === targetId) preSelected.add(student.id);
        if (targetType === 'category' && student.categoryId === targetId) preSelected.add(student.id);
      });
      setSelectedIds(preSelected);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSelectAll = (filtered) => {
    const newSet = new Set(selectedIds);
    const allSelected = filtered.every(s => newSet.has(s.id));
    if (allSelected) {
      filtered.forEach(s => newSet.delete(s.id));
    } else {
      filtered.forEach(s => newSet.add(s.id));
    }
    setSelectedIds(newSet);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const endpoint = targetType === 'house' 
        ? `/student-setup/houses/${targetId}/students` 
        : `/student-setup/categories/${targetId}/students`;
      
      await api.put(endpoint, { studentIds: Array.from(selectedIds) });
      toast.success(`Students assigned successfully to ${targetName}`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to assign students');
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.lastName && s.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Students to ${targetName}`}
      maxWidth="max-w-2xl"
    >
      <div className="p-4 flex flex-col h-[60vh]">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search students by name or admission no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-muted/20 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto border border-border rounded-lg relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-muted z-10 shadow-sm border-b border-border">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={filteredStudents.length > 0 && filteredStudents.every(s => selectedIds.has(s.id))}
                      onChange={() => handleSelectAll(filteredStudents)}
                      className="rounded border-border text-primary focus:ring-primary/20"
                    />
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Student Name</th>
                  <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Admission No</th>
                  <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredStudents.length > 0 ? filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-muted/5 cursor-pointer" onClick={() => handleToggle(student.id)}>
                    <td className="px-4 py-2" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(student.id)}
                        onChange={() => handleToggle(student.id)}
                        className="rounded border-border text-primary focus:ring-primary/20"
                      />
                    </td>
                    <td className="px-4 py-2 text-sm font-medium">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {student.admissionNo}
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {student.Class?.name} {student.Section?.name}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No students found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{selectedIds.size}</span> students selected
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Assignments
            </button>
          </div>
        </div>
      </div>
    </CustomModal>
  );
}

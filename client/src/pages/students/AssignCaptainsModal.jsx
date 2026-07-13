import React, { useState, useEffect } from 'react';
import CustomModal from '../../components/ui/CustomModal';
import api from '../../lib/api';
import { toast } from 'sonner';
import { Search, Loader2 } from 'lucide-react';
import CustomSelect from '../../components/ui/CustomSelect';

export default function AssignCaptainsModal({ isOpen, onClose, onSuccess, house }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [captainId, setCaptainId] = useState('');
  const [viceCaptainId, setViceCaptainId] = useState('');

  useEffect(() => {
    if (isOpen && house) {
      setCaptainId(house.captainId || '');
      setViceCaptainId(house.viceCaptainId || '');
      fetchHouseStudents(house.id);
    }
  }, [isOpen, house]);

  const fetchHouseStudents = async (houseId) => {
    try {
      setLoading(true);
      // Fetch students belonging to this house
      const response = await api.get('/students', { params: { houseId, limit: 1000, status: 'Active' } });
      setStudents(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch house students');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (captainId && viceCaptainId && captainId === viceCaptainId) {
      return toast.error('Captain and Vice Captain cannot be the same student');
    }

    try {
      setSaving(true);
      await api.put(`/student-setup/houses/${house.id}/captains`, { 
        captainId: captainId || null, 
        viceCaptainId: viceCaptainId || null 
      });
      toast.success(`Captains assigned successfully to ${house.name}`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to assign captains');
    } finally {
      setSaving(false);
    }
  };

  const studentOptions = students.map(s => ({
    id: s.id,
    label: `${s.firstName} ${s.lastName || ''} (${s.admissionNo})`
  }));

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Leaders - ${house?.name}`}
      maxWidth="max-w-md"
      overflow="overflow-visible"
    >
      <div className="p-4 flex flex-col gap-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1 block">
                  House Captain
                </label>
                <CustomSelect
                  value={captainId}
                  onChange={setCaptainId}
                  options={[{ id: '', label: 'None' }, ...studentOptions]}
                  placeholder="Select Captain"
                  searchable={true}
                />
                <p className="text-[10px] text-muted-foreground mt-1 ml-1">
                  Must be a student assigned to {house?.name}
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1 block">
                  Vice Captain
                </label>
                <CustomSelect
                  value={viceCaptainId}
                  onChange={setViceCaptainId}
                  options={[{ id: '', label: 'None' }, ...studentOptions]}
                  placeholder="Select Vice Captain"
                  searchable={true}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
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
                Save Leaders
              </button>
            </div>
          </>
        )}
      </div>
    </CustomModal>
  );
}

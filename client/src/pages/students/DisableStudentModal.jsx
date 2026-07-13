import React, { useState, useEffect } from 'react';
import CustomModal from '../../components/ui/CustomModal';
import CustomSelect from '../../components/ui/CustomSelect';
import { Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

export default function DisableStudentModal({ isOpen, onClose, student, onSuccess }) {
  const [reasons, setReasons] = useState([]);
  const [loadingReasons, setLoadingReasons] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reasonId, setReasonId] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchReasons();
      setReasonId('');
    }
  }, [isOpen]);

  const fetchReasons = async () => {
    try {
      setLoadingReasons(true);
      const response = await api.get('/student-setup/disable-reasons');
      setReasons(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load disable reasons');
    } finally {
      setLoadingReasons(false);
    }
  };

  const handleSave = async () => {
    if (!reasonId) {
      return toast.error('Please select a reason for disabling the student');
    }

    try {
      setSaving(true);
      await api.patch(`/students/${student.id}/status`, {
        isDisabled: true,
        disableReasonId: reasonId
      });
      toast.success('Student disabled successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to disable student');
    } finally {
      setSaving(false);
    }
  };

  const reasonOptions = reasons.map(r => ({
    id: r.id,
    label: r.reason
  }));

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Disable Student - ${student?.firstName} ${student?.lastName || ''}`}
      maxWidth="max-w-md"
      overflow="overflow-visible"
    >
      <div className="p-4 flex flex-col gap-6">
        {loadingReasons ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1 block">
                Select Disable Reason *
              </label>
              <CustomSelect
                value={reasonId}
                onChange={setReasonId}
                options={reasonOptions}
                placeholder="Select a reason..."
                searchable={true}
              />
              <p className="text-[10px] text-muted-foreground mt-1 ml-1">
                Why is this student being disabled?
              </p>
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
                disabled={saving || !reasonId}
                className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-bold hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Disable
              </button>
            </div>
          </>
        )}
      </div>
    </CustomModal>
  );
}

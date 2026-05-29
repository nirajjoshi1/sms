import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const GenerateStaffIDCard = () => {
  const [templates, setTemplates] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedStaff, setSelectedStaff] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templatesRes, staffRes] = await Promise.all([
          api.get('/certificates/id-cards?templateFor=STAFF'),
          api.get('/hr/staff?isDisabled=false')
        ]);
        setTemplates(templatesRes.data.data || []);
        setStaff(staffRes.data.data || []);
      } catch (error) {
        toast.error('Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  const handleGenerate = () => {
    if (!selectedTemplate || selectedStaff.length === 0) {
      return toast.error('Please select template and staff members');
    }
    toast.info('Staff ID Card generation feature coming soon!');
  };

  return (
    <div className="p-4 space-y-4 max-w-[1400px] mx-auto">
      <div className="border-b border-border pb-3">
        <h1 className="text-lg font-black">Generate Staff ID Cards</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Create ID cards for staff</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Select Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs"
            >
              <option value="">Choose Template</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Select Staff ({selectedStaff.length} selected)</label>
            <div className="max-h-64 overflow-y-auto bg-muted/30 border border-border rounded-lg p-2 space-y-1">
              {staff.slice(0, 20).map(s => (
                <label key={s.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStaff.includes(s.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStaff([...selectedStaff, s.id]);
                      } else {
                        setSelectedStaff(selectedStaff.filter(id => id !== s.id));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-xs">{s.firstName} {s.lastName} - {s.role}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full h-9 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold flex items-center justify-center gap-2"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Generate ID Cards
          </button>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-[11px] font-bold mb-4">Preview</h3>
          <div className="bg-muted/30 rounded-lg p-8 text-center text-sm text-muted-foreground">
            Select template and staff to preview ID cards
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateStaffIDCard;

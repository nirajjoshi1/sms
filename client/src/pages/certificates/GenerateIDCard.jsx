import React, { useState, useEffect } from 'react';
import { CreditCard, Download } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const GenerateIDCard = () => {
  const [templates, setTemplates] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templatesRes, studentsRes] = await Promise.all([
          api.get('/certificates/id-cards?templateFor=STUDENT'),
          api.get('/students?isDisabled=false')
        ]);
        setTemplates(templatesRes.data.data || []);
        setStudents(studentsRes.data.data || []);
      } catch (error) {
        toast.error('Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  const handleGenerate = () => {
    if (!selectedTemplate || selectedStudents.length === 0) {
      return toast.error('Please select template and students');
    }
    toast.info('ID Card generation feature coming soon!');
  };

  return (
    <div className="p-4 space-y-4 max-w-[1400px] mx-auto">
      <div className="border-b border-border pb-3">
        <h1 className="text-lg font-black">Generate Student ID Cards</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Create ID cards for students</p>
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
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Select Students ({selectedStudents.length} selected)</label>
            <div className="max-h-64 overflow-y-auto bg-muted/30 border border-border rounded-lg p-2 space-y-1">
              {students.slice(0, 20).map(s => (
                <label key={s.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(s.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents([...selectedStudents, s.id]);
                      } else {
                        setSelectedStudents(selectedStudents.filter(id => id !== s.id));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-xs">{s.firstName} {s.lastName} - {s.Class?.name}</span>
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
            Select template and students to preview ID cards
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateIDCard;

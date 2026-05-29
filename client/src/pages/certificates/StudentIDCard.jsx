import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CreditCard } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const StudentIDCard = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await api.get('/certificates/id-cards?templateFor=STUDENT');
        setTemplates(response.data.data || []);
      } catch (error) {
        toast.error('Failed to fetch templates');
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  return (
    <div className="p-4 space-y-4 max-w-[1400px] mx-auto">
      <div className="border-b border-border pb-3">
        <h1 className="text-lg font-black">Student ID Card Templates</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Manage student ID card designs</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
        <p className="text-xs text-muted-foreground">ID Card template management - {templates.length} templates</p>
        <button className="mt-4 h-8 px-4 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold">
          <Plus className="w-3 h-3 inline mr-1" /> Add Template
        </button>
      </div>
    </div>
  );
};

export default StudentIDCard;

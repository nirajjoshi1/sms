import React, { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { DatePicker } from '../../components/ui/date-picker';

const TransferCertificate = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    leavingDate: '',
    reason: '',
    remarks: ''
  });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await api.get('/students?isDisabled=false');
        setStudents(response.data.data || []);
      } catch (error) {
        toast.error('Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.leavingDate) {
      return toast.error('Student and leaving date are required');
    }

    try {
      setGenerating(true);
      const response = await api.post('/certificates/transfer-certificate', formData);
      setPreview(response.data.data);
      toast.success('Transfer certificate generated successfully');
    } catch (error) {
      toast.error('Failed to generate transfer certificate');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    toast.info('PDF download feature coming soon!');
  };

  const selectedStudent = students.find(s => s.id === formData.studentId);

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="border-b border-border pb-3">
        <h1 className="text-lg font-black text-foreground tracking-tight">Transfer Certificate</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Generate student transfer certificates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest mb-4">TC Details</h3>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Select Student *</label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                required
              >
                <option value="">Choose Student</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} - {s.admissionNo} ({s.Class?.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Leaving Date *</label>
              <DatePicker
                value={formData.leavingDate}
                onChange={(e) => setFormData({...formData, leavingDate: e.target.value})}
                className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Reason for Leaving</label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder="e.g., Family relocation"
                className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                placeholder="Additional remarks..."
                rows="3"
                className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full h-9 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FileText className="w-3.5 h-3.5" />
              {generating ? 'Generating...' : 'Generate TC'}
            </button>
          </form>
        </div>

        {preview && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">Preview</h3>
              <button
                onClick={handleDownload}
                className="h-7 px-3 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 flex items-center gap-1.5"
              >
                <Download className="w-3 h-3" />
                Download PDF
              </button>
            </div>
            <div className="bg-white text-black p-8 border-2 border-gray-300 rounded-lg space-y-4">
              <h2 className="text-center text-xl font-bold mb-6">TRANSFER CERTIFICATE</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Student Name:</strong> {preview.student?.firstName} {preview.student?.lastName}</p>
                <p><strong>Admission No:</strong> {preview.student?.admissionNo}</p>
                <p><strong>Class:</strong> {preview.student?.Class?.name}</p>
                <p><strong>Date of Birth:</strong> {new Date(preview.student?.dob).toLocaleDateString()}</p>
                <p><strong>Leaving Date:</strong> {new Date(preview.leavingDate).toLocaleDateString()}</p>
                {preview.reason && <p><strong>Reason:</strong> {preview.reason}</p>}
                {preview.remarks && <p><strong>Remarks:</strong> {preview.remarks}</p>}
              </div>
              <div className="mt-8 pt-4 border-t border-gray-300">
                <p className="text-xs text-gray-600">Issue Date: {new Date(preview.issueDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferCertificate;

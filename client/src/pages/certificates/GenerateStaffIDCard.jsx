import React, { useState, useEffect } from 'react';
import { CreditCard, Printer } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';

const GenerateStaffIDCard = () => {
  const [templates, setTemplates] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [generating, setGenerating] = useState(false);

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
        toast.error('Failed to fetch templates and staff members');
      }
    };
    fetchData();
  }, []);

  const handleGenerate = async () => {
    if (!selectedTemplate || selectedStaff.length === 0) {
      return toast.error('Please select a template and at least one staff member');
    }
    
    try {
      setGenerating(true);
      const res = await api.post('/certificates/generate-staff-id', {
        templateId: selectedTemplate,
        staffIds: selectedStaff
      });
      setPreviewData(res.data.data);
      toast.success('ID Card preview generated successfully');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to generate staff ID cards'));
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!previewData) return;

    const cardsHtml = previewData.staffMembers.map(member => `
      <div class="id-card">
        <div class="card-header">
          <div class="school-name">${previewData.template.schoolName || 'SUMMIT ACADEMY'}</div>
          <div class="card-title">${previewData.template.title}</div>
        </div>
        <div class="card-body">
          <div class="photo-placeholder">PHOTO</div>
          <div class="details">
            <h3>${member.firstName} ${member.lastName || ''}</h3>
            <p><strong>Department:</strong> ${member.Department?.name || 'General'}</p>
            <p><strong>Designation:</strong> ${member.Designation?.name || 'Staff'}</p>
            <p><strong>Staff ID:</strong> ${member.staffId || 'N/A'}</p>
            <p><strong>Email:</strong> ${member.email || 'N/A'}</p>
          </div>
        </div>
        <div class="card-footer">
          ${previewData.template.footerText || 'STAFF ID CARD'}
        </div>
      </div>
    `).join('');

    const printContent = `
      <html>
        <head>
          <title>Print Staff ID Cards</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #fff;
            }
            .grid-container {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .id-card {
              border: 1px solid #ccc;
              border-radius: 8px;
              width: 320px;
              height: 200px;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding: 10px;
              background-color: #fff;
              page-break-inside: avoid;
            }
            .card-header {
              text-align: center;
              border-bottom: 2px solid #6366f1;
              padding-bottom: 5px;
            }
            .school-name {
              font-size: 11px;
              font-weight: 900;
              color: #312e81;
              text-transform: uppercase;
            }
            .card-title {
              font-size: 9px;
              font-weight: 700;
              color: #6b7280;
            }
            .card-body {
              display: flex;
              gap: 15px;
              align-items: center;
              margin: 8px 0;
            }
            .photo-placeholder {
              width: 60px;
              height: 75px;
              border: 1px dashed #9ca3af;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              color: #9ca3af;
              background-color: #f9fafb;
            }
            .details {
              font-size: 10px;
              color: #374151;
            }
            .details h3 {
              margin: 0 0 5px 0;
              font-size: 12px;
              font-weight: 800;
            }
            .details p {
              margin: 2px 0;
            }
            .card-footer {
              text-align: center;
              border-top: 1px solid #e5e7eb;
              padding-top: 4px;
              font-size: 8px;
              font-weight: bold;
              color: #6b7280;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="grid-container">
            ${cardsHtml}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="p-4 space-y-4 max-w-[1400px] mx-auto">
      <div className="border-b border-border pb-3">
        <h1 className="text-lg font-black">Generate Staff ID Cards</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Create and print ID cards for staff members</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Form */}
        <div className="lg:col-span-4 bg-card border border-border rounded-xl p-4 space-y-4">
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
              {staff.map(s => (
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
                    className="rounded text-primary"
                  />
                  <span className="text-xs">{s.firstName} {s.lastName || ''} - {s.role}</span>
                </label>
              ))}
              {staff.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No active staff found</p>
              )}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full h-9 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold flex items-center justify-center gap-2"
          >
            <CreditCard className="w-3.5 h-3.5" />
            {generating ? 'Generating...' : 'Generate ID Cards'}
          </button>
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-8 bg-card border border-border rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-2 mb-4">
              <h3 className="text-[11px] font-bold">Print Preview</h3>
              {previewData && (
                <button
                  onClick={handlePrint}
                  className="h-7 px-3 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-3 h-3" />
                  Print ID Cards
                </button>
              )}
            </div>

            {!previewData ? (
              <div className="bg-muted/30 rounded-lg p-16 text-center text-xs text-muted-foreground">
                Select template and staff to preview ID cards
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-2">
                {previewData.staffMembers.map(member => (
                  <div key={member.id} className="border border-border rounded-lg p-3 bg-accent/20 flex flex-col justify-between h-44 shadow-sm">
                    <div className="text-center border-b border-border pb-1">
                      <div className="text-[10px] font-black text-indigo-700 uppercase">{previewData.template.schoolName || 'SUMMIT ACADEMY'}</div>
                      <div className="text-[8px] text-muted-foreground font-bold">{previewData.template.title}</div>
                    </div>
                    <div className="flex gap-3 items-center my-2">
                      <div className="w-14 h-16 border border-dashed border-muted-foreground/30 bg-card flex items-center justify-center text-[7px] text-muted-foreground">
                        PHOTO
                      </div>
                      <div className="text-[10px] text-foreground space-y-0.5">
                        <h4 className="font-extrabold">{member.firstName} {member.lastName || ''}</h4>
                        <p className="text-muted-foreground">Dept: {member.Department?.name || 'General'}</p>
                        <p className="text-muted-foreground">Desig: {member.Designation?.name || 'Staff'}</p>
                        <p className="text-muted-foreground">Staff ID: {member.staffId || 'N/A'}</p>
                        <p className="text-muted-foreground">Email: {member.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-center border-t border-border pt-1 text-[8px] font-bold text-muted-foreground uppercase">
                      {previewData.template.footerText || 'STAFF ID CARD'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateStaffIDCard;

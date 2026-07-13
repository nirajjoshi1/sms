import React, { useState, useEffect } from 'react';
import { Award, Download, Eye, Check, X, Trash2, ShieldAlert, History, UserCheck, AlertCircle, Calendar, RefreshCw, Search, Printer, FileText } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import CustomModal from '../../components/ui/CustomModal';
import { DatePicker } from '../../components/ui/date-picker';

const GenerateCertificate = () => {
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' | 'ledger'
  const [loading, setLoading] = useState(false);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  
  // Transfer Certificate State
  const [tcStudents, setTcStudents] = useState([]);
  const [allSchoolSettings, setAllSchoolSettings] = useState(null);
  const [tcSearchOpen, setTcSearchOpen] = useState(false);
  const [tcStudentSearch, setTcStudentSearch] = useState('');
  const [tcFormData, setTcFormData] = useState({
    studentId: '',
    leavingDate: '',
    emailToStudent: false
  });
  
  const [tcPreview, setTcPreview] = useState(null);
  const [showTCPreviewModal, setShowTCPreviewModal] = useState(false);
  const [tcGenerating, setTcGenerating] = useState(false);

  // Past Generations Ledger State
  const [pastTCs, setPastTCs] = useState([]);
  const [ledgerSearch, setLedgerSearch] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'ledger') {
      fetchPastTCs();
    }
  }, [activeTab]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [tcStudentsRes, schoolSettingsRes, pastTCsRes] = await Promise.all([
        api.get('/students?isDisabled=false'),
        api.get('/settings/general'),
        api.get('/certificates/transfer-certificate')
      ]);
      setTcStudents(tcStudentsRes.data.data || []);
      setAllSchoolSettings(schoolSettingsRes.data.data || null);
      setPastTCs(pastTCsRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load initial configuration data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPastTCs = async () => {
    try {
      setLedgerLoading(true);
      const response = await api.get('/certificates/transfer-certificate');
      setPastTCs(response.data.data || []);
    } catch (error) {
      toast.error('Failed to update certificates ledger');
    } finally {
      setLedgerLoading(false);
    }
  };

  // Date Conversion helper (AD to BS)
  const convertADtoBS = (adDate) => {
    if (!adDate) return 'N/A';
    const date = new Date(adDate);
    if (isNaN(date.getTime())) return 'N/A';
    
    const adYear = date.getFullYear();
    const adMonth = date.getMonth() + 1;
    const adDay = date.getDate();
    
    let bsYear = adYear + 56;
    let bsMonth = adMonth + 8;
    let bsDay = adDay + 15;
    
    if (bsDay > 30) {
      bsDay -= 30;
      bsMonth += 1;
    }
    if (bsMonth > 12) {
      bsMonth -= 12;
      bsYear += 1;
    }
    
    return `${bsYear}-${String(bsMonth).padStart(2, '0')}-${String(bsDay).padStart(2, '0')}`;
  };

  const getGenderPronouns = (gender) => {
    const g = (gender || '').toLowerCase();
    if (g === 'female' || g === 'f') {
      return {
        mrMs: 'Ms.',
        sonDaughter: 'daughter',
        heShe: 'She',
        hisHer: 'Her',
        himHer: 'her'
      };
    } else if (g === 'male' || g === 'm') {
      return {
        mrMs: 'Mr.',
        sonDaughter: 'son',
        heShe: 'He',
        hisHer: 'His',
        himHer: 'him'
      };
    }
    return {
      mrMs: 'Mr./Ms.',
      sonDaughter: 'son/daughter',
      heShe: 'He/She',
      hisHer: 'His/Her',
      himHer: 'him/her'
    };
  };

  const handleTCSubmit = async (e) => {
    e.preventDefault();
    if (!tcFormData.studentId || !tcFormData.leavingDate) {
      return toast.error('Student and leaving date are required');
    }

    try {
      setTcGenerating(true);
      const response = await api.post('/certificates/transfer-certificate', tcFormData);
      setTcPreview(response.data.data);
      setShowTCPreviewModal(true);
      
      const { emailSent, emailError, recipient } = response.data.data;
      if (tcFormData.emailToStudent) {
        if (emailSent) {
          toast.success(`Transfer certificate generated and emailed to ${recipient}`);
        } else {
          toast.warning(`TC generated but email failed: ${emailError}`);
        }
      } else {
        toast.success('Transfer certificate generated and preview created');
      }

      // Reset Form State & Switch to Ledger List
      setTcFormData({
        studentId: '',
        leavingDate: '',
        emailToStudent: false
      });
      setActiveTab('ledger');
    } catch (error) {
      toast.error('Failed to generate transfer certificate');
    } finally {
      setTcGenerating(false);
    }
  };

  const handleTCPrint = () => {
    if (!tcPreview) return;
    
    const studentName = `${tcPreview.student?.firstName} ${tcPreview.student?.lastName || ''}`.trim();
    const fatherName = tcPreview.student?.fatherName || 'Siddi Bahadur Subedi';
    const className = tcPreview.student?.Class?.name || 'N/A';
    const leavingDate = tcPreview.leavingDate ? new Date(tcPreview.leavingDate).toLocaleDateString() : 'N/A';

    const pronouns = getGenderPronouns(tcPreview.student?.gender);
    const logoUrl = allSchoolSettings?.logo || '';
    const photoUrl = tcPreview.student?.photo || '';

    // Convert dates to BS format
    const admissionDateBS = convertADtoBS(tcPreview.student?.admissionDate || new Date(new Date(tcPreview.leavingDate).getFullYear() - 2, 4, 15));
    const leavingDateBS = convertADtoBS(tcPreview.leavingDate);
    const leavingYearBS = new Date(tcPreview.leavingDate).getFullYear() + 57;
    const dobBS = convertADtoBS(tcPreview.student?.dob);

    const printContent = `
      <html>
        <head>
          <title>Transfer Certificate - ${studentName}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 0;
            }
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 0;
              width: 297mm;
              height: 210mm;
              box-sizing: border-box;
              background-color: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .certificate-container {
              width: 277mm;
              height: 190mm;
              border: 5px solid #1e3a8a;
              box-sizing: border-box;
              position: relative;
              padding: 15px;
            }
            .inner-border {
              width: 100%;
              height: 100%;
              border: 2px solid #d97706;
              box-sizing: border-box;
              padding: 20px;
              position: relative;
            }
            .motto {
              text-align: center;
              font-size: 10px;
              font-weight: 800;
              color: #4b5563;
              letter-spacing: 1.5px;
              margin-bottom: 12px;
              text-transform: uppercase;
            }
            .header-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
            }
            .logo-cell {
              width: 80px;
              vertical-align: top;
            }
            .logo-img {
              width: 70px;
              height: 70px;
              border-radius: 50%;
              border: 1.5px solid #1e3a8a;
              object-fit: cover;
            }
            .logo-placeholder {
              width: 70px;
              height: 70px;
              border-radius: 50%;
              border: 1px dashed #1e3a8a;
            }
            .title-cell {
              text-align: center;
              vertical-align: top;
            }
            .school-name {
              font-size: 24px;
              font-weight: 900;
              color: #dc2626;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .affiliation {
              font-size: 11px;
              font-weight: 700;
              color: #1e3a8a;
              margin: 3px 0 0 0;
            }
            .address {
              font-size: 10px;
              color: #4b5563;
              margin: 3px 0 0 0;
            }
            .photo-cell {
              width: 90px;
              text-align: right;
              vertical-align: top;
            }
            .photo-box {
              width: 85px;
              height: 100px;
              border: 1px solid #94a3b8;
              display: inline-block;
              position: relative;
              background-color: #f8fafc;
            }
            .photo-img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .photo-placeholder {
              font-size: 9px;
              color: #94a3b8;
              text-align: center;
              line-height: 100px;
              font-style: italic;
            }
            .banner-container {
              text-align: center;
              margin: 10px 0 20px 0;
              position: relative;
            }
            .banner-ribbon {
              display: inline-block;
              background-color: #fef08a;
              border: 1.5px solid #b45309;
              padding: 6px 30px;
              font-size: 13px;
              font-weight: 900;
              color: #dc2626;
              letter-spacing: 1px;
              position: relative;
              text-transform: uppercase;
            }
            .date-row {
              text-align: right;
              font-size: 12px;
              font-weight: 700;
              color: #374151;
              margin-right: 15px;
              margin-bottom: 20px;
            }
            .citation-body {
              font-size: 14.5px;
              color: #334155;
              line-height: 2.1;
              padding: 0 15px;
              text-align: justify;
              margin-top: 15px;
            }
            .fill-value {
              font-family: inherit;
              font-size: inherit;
              font-weight: bold;
              color: inherit;
              padding: 0;
            }
            .citation-para {
              margin-bottom: 8px;
            }
            .footer-signatures {
              margin-top: 55px;
              width: 100%;
              border-collapse: collapse;
            }
            .signature-cell {
              width: 50%;
              text-align: center;
              vertical-align: top;
            }
            .sig-line {
              width: 180px;
              border-top: 1px solid #94a3b8;
              margin: 0 auto 5px auto;
            }
            .sig-title {
              font-size: 11px;
              font-weight: bold;
              color: #475569;
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <div class="inner-border">
              <div class="motto">"Education for Culture and Dignity"</div>
              
              <table class="header-table">
                <tr>
                  <td class="logo-cell">
                    ${logoUrl ? `<img class="logo-img" src="${logoUrl}" />` : `<div class="logo-placeholder"></div>`}
                  </td>
                  <td class="title-cell">
                    <h1 class="school-name">${allSchoolSettings?.schoolName || 'Manakamana Secondary School'}</h1>
                    <h2 class="affiliation">Affiliated to HSEB</h2>
                    <h3 class="address">${allSchoolSettings?.address || 'Birtamode, Jhapa (Nepal)'}</h3>
                  </td>
                  <td class="photo-cell">
                    <div class="photo-box">
                      ${photoUrl ? `<img class="photo-img" src="${photoUrl}" />` : `<div class="photo-placeholder">Photo</div>`}
                    </div>
                  </td>
                </tr>
              </table>

              <div class="banner-container">
                <div class="banner-ribbon">Transfer Certificate</div>
              </div>

              <div class="date-row">
                Date: <span class="fill-value" style="border: none;">${leavingDate}</span>
              </div>

              <div class="citation-body">
                <div class="citation-para">
                  This is to certify that ${pronouns.mrMs} <span class="fill-value">${studentName}</span> 
                  ${pronouns.sonDaughter} of Mr. <span class="fill-value">${fatherName}</span> 
                  was a student of <span class="fill-value">${className}</span> in this school. 
                  ${pronouns.hisHer} admission date is <span class="fill-value">${admissionDateBS} BS</span> and leaving date is <span class="fill-value">${leavingDateBS} BS</span>. 
                  ${pronouns.heShe} has passed the <span class="fill-value">${className}</span> examination in the year <span class="fill-value">${leavingYearBS} BS</span> and was placed in <span class="fill-value">First</span> Division.
                </div>
                <div class="citation-para">
                  ${pronouns.hisHer} conduct and character during this period was <span class="fill-value">good</span>. 
                  ${pronouns.hisHer} date of birth according to the school 
                  record is <span class="fill-value">${dobBS} BS</span>.
                </div>
                <div class="citation-para" style="margin-top: 10px;">
                  I wish ${pronouns.himHer} successful career and a bright future.
                </div>
              </div>

              <table class="footer-signatures">
                <tr>
                  <td class="signature-cell">
                    <div class="sig-line"></div>
                    <div class="sig-title">Class Teacher</div>
                  </td>
                  <td class="signature-cell">
                    <div class="sig-line"></div>
                    <div class="sig-title">Principal</div>
                  </td>
                </tr>
              </table>

            </div>
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

  const handlePreviewPastTC = (cert) => {
    setTcPreview({
      certificateNumber: cert.certificateNumber,
      leavingDate: cert.dynamicFields?.leavingDate ? new Date(cert.dynamicFields.leavingDate) : new Date(cert.issueDate),
      student: cert.Student,
      issueDate: cert.issueDate
    });
    setShowTCPreviewModal(true);
  };

  const filteredPastTCs = pastTCs.filter(c => {
    const name = `${c.Student?.firstName} ${c.Student?.lastName || ''}`.toLowerCase();
    const adm = (c.Student?.admissionNo || '').toLowerCase();
    const certNo = (c.certificateNumber || '').toLowerCase();
    const query = ledgerSearch.toLowerCase();
    return name.includes(query) || adm.includes(query) || certNo.includes(query);
  });

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="text-center md:text-left">
          <h1 className="text-lg font-black text-foreground tracking-tight">Transfer Certificate</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">
            Generate student transfer certificates
          </p>
        </div>

        <div className="flex bg-muted/30 p-1 rounded-lg border border-border w-fit mx-auto md:mx-0">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${activeTab === 'generate' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Generate Certificate
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${activeTab === 'ledger' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Past Generations Ledger
          </button>
        </div>
      </div>

      {activeTab === 'generate' ? (
        /* Tab 1: Form Configuration Card (Full Width) */
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="px-4 py-3 border-b border-border bg-muted/10">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Transfer Certificate Configuration</h3>
          </div>
          
          {loading ? (
            <div className="p-12 text-center text-xs text-muted-foreground italic">Loading configuration data...</div>
          ) : (
            <form onSubmit={handleTCSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Select Student *</label>
                
                {tcSearchOpen && (
                  <div className="fixed inset-0 z-40" onClick={() => setTcSearchOpen(false)} />
                )}

                <button
                  type="button"
                  onClick={() => setTcSearchOpen(!tcSearchOpen)}
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs flex items-center justify-between hover:bg-muted/40 transition-colors focus:outline-none focus:ring-1 focus:ring-primary/20 text-left cursor-pointer"
                >
                  <span className="truncate">
                    {tcFormData.studentId 
                      ? (() => {
                          const s = tcStudents.find(x => x.id === tcFormData.studentId);
                          return s ? `${s.firstName} ${s.lastName || ''} - ${s.admissionNo} (${s.Class?.name || 'N/A'})` : 'Choose Student';
                        })()
                      : 'Choose Student'
                    }
                  </span>
                  <span className="text-[9px] text-muted-foreground">▼</span>
                </button>

                {tcSearchOpen && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="p-2 border-b border-border bg-muted/10 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Type to search student..."
                        value={tcStudentSearch}
                        onChange={(e) => setTcStudentSearch(e.target.value)}
                        className="w-full h-8 pl-8 pr-7 bg-background border border-border rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                        autoFocus
                      />
                      {tcStudentSearch && (
                        <button
                          type="button"
                          onClick={() => setTcStudentSearch('')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="max-h-52 overflow-y-auto divide-y divide-border">
                      {tcStudents
                        .filter(s => {
                          const name = `${s.firstName} ${s.lastName || ''}`.toLowerCase();
                          const adm = (s.admissionNo || '').toLowerCase();
                          const query = tcStudentSearch.toLowerCase();
                          return name.includes(query) || adm.includes(query);
                        })
                        .map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setTcFormData({ ...tcFormData, studentId: s.id });
                              setTcSearchOpen(false);
                              setTcStudentSearch('');
                            }}
                            className={`w-full text-left px-3 py-2 text-xs transition-colors flex flex-col gap-0.5 hover:bg-primary/10 ${
                              tcFormData.studentId === s.id ? 'bg-primary/20 font-bold' : ''
                            }`}
                          >
                            <span className="text-foreground font-semibold">
                              {s.firstName} {s.lastName || ''}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              ADM: {s.admissionNo} | Class: {s.Class?.name || 'N/A'}
                            </span>
                          </button>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Leaving Date *</label>
                <DatePicker
                  value={tcFormData.leavingDate}
                  onChange={(e) => setTcFormData({ ...tcFormData, leavingDate: e.target.value })}
                  className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="flex items-center gap-2 px-1 py-1">
                <input
                  type="checkbox"
                  id="tcEmailToStudent"
                  checked={tcFormData.emailToStudent}
                  onChange={(e) => setTcFormData({ ...tcFormData, emailToStudent: e.target.checked })}
                  className="w-3.5 h-3.5 accent-primary cursor-pointer"
                />
                <label htmlFor="tcEmailToStudent" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider cursor-pointer select-none">
                  Email PDF directly to student
                </label>
              </div>

              <button
                type="submit"
                disabled={tcGenerating}
                className="w-full h-10 bg-primary text-primary-foreground font-bold rounded-lg text-xs hover:opacity-90 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {tcGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating Preview...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Generate & Preview Transfer Certificate
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      ) : (
        /* Tab 2: Past Generations Ledger Table (Full Width) */
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="px-4 py-3 border-b border-border bg-muted/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Past Generations Ledger</h3>
              <p className="text-[9px] text-muted-foreground">List of previously generated transfer certificates</p>
            </div>
            
            <div className="w-full sm:w-60 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search ledger..."
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-7 bg-muted/30 border border-border rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
              {ledgerSearch && (
                <button
                  onClick={() => setLedgerSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            {ledgerLoading ? (
              <div className="p-12 text-center text-xs text-muted-foreground italic">Updating ledger list...</div>
            ) : filteredPastTCs.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted-foreground italic">No generated transfer certificates found.</div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/5 border-b border-border">
                    <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[9px] text-muted-foreground">Certificate No</th>
                    <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[9px] text-muted-foreground">Student</th>
                    <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[9px] text-muted-foreground">Class</th>
                    <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[9px] text-muted-foreground">Leaving Date</th>
                    <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[9px] text-muted-foreground">Generated At</th>
                    <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[9px] text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredPastTCs.map(cert => (
                    <tr key={cert.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-4 py-2.5 font-bold text-primary">{cert.certificateNumber}</td>
                      <td className="px-4 py-2.5 font-medium">{cert.Student?.firstName} {cert.Student?.lastName || ''}</td>
                      <td className="px-4 py-2.5">{cert.Student?.Class?.name || 'N/A'}</td>
                      <td className="px-4 py-2.5 font-mono">{cert.dynamicFields?.leavingDate || new Date(cert.issueDate).toLocaleDateString()}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{new Date(cert.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => handlePreviewPastTC(cert)}
                          className="h-7 px-3 bg-muted/60 hover:bg-muted text-foreground border border-border rounded text-[10px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View & Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Transfer Certificate Preview Modal */}
      {showTCPreviewModal && tcPreview && (
        <CustomModal
          title="Transfer Certificate Preview"
          isOpen={showTCPreviewModal}
          onClose={() => setShowTCPreviewModal(false)}
          maxWidth="w-[850px]"
        >
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">Landscape Preview</h3>
                <p className="text-[9px] text-muted-foreground">This matches exactly how the certificate prints on A4 paper</p>
              </div>
              <button
                onClick={handleTCPrint}
                className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Download PDF
              </button>
            </div>

            {/* Landscape Design Sandbox */}
            <div className="w-full overflow-x-auto bg-muted/10 p-4 rounded-lg flex justify-center">
              <div className="w-[800px] h-[550px] bg-white text-slate-800 p-6 rounded-lg border-4 border-double border-slate-700 relative select-none shadow-lg flex flex-col justify-between">
                <div className="w-full h-full border border-amber-600 p-5 flex flex-col justify-between relative">
                  
                  {/* Motto */}
                  <div className="text-center text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    "Education for Culture and Dignity"
                  </div>

                  {/* Header: Logo, Name, Photo */}
                  <div className="flex justify-between items-start gap-4">
                    {allSchoolSettings?.logo ? (
                      <img src={allSchoolSettings.logo} alt="Logo" className="w-16 h-16 rounded-full border border-blue-900 object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full border border-dashed border-blue-900 flex items-center justify-center text-[9px] text-slate-400">Logo</div>
                    )}
                    
                    <div className="text-center flex-1">
                      <h2 className="text-xl font-black text-red-600 uppercase tracking-wide leading-none">{allSchoolSettings?.schoolName || 'Manakamana Secondary School'}</h2>
                      <p className="text-[10px] font-extrabold text-blue-900 uppercase mt-1">Affiliated to NEB / HSEB</p>
                      <p className="text-[9px] text-slate-500 font-medium mt-0.5">{allSchoolSettings?.address || 'Birtamode, Jhapa, Nepal'}</p>
                    </div>

                    <div className="w-16 h-20 border border-slate-400 bg-slate-50 overflow-hidden flex items-center justify-center">
                      {tcPreview.student?.photo ? (
                        <img src={tcPreview.student.photo} alt="Student" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[8px] text-slate-400 italic">Photo</span>
                      )}
                    </div>
                  </div>

                  {/* Title Ribbon */}
                  <div className="text-center my-2">
                    <div className="inline-block bg-yellow-100 border border-amber-700 px-8 py-1.5 text-xs font-black text-red-600 uppercase tracking-wider rounded">
                      Transfer Certificate
                    </div>
                  </div>

                  {/* Date */}
                  <div className="text-right text-xs font-bold text-slate-700 pr-4">
                    Date: <span className="font-sans font-bold text-slate-800 px-1">{new Date(tcPreview.leavingDate).toLocaleDateString()}</span>
                  </div>

                  {/* Main Citation Body */}
                  <div className="text-xs text-slate-700 leading-relaxed font-sans px-4 space-y-2 text-justify pt-3">
                    <p>
                      This is to certify that {(() => {
                        const pronouns = getGenderPronouns(tcPreview.student?.gender);
                        const studentName = `${tcPreview.student?.firstName} ${tcPreview.student?.lastName || ''}`.trim();
                        const fatherName = tcPreview.student?.fatherName || 'Siddi Bahadur Subedi';
                        const className = tcPreview.student?.Class?.name || 'N/A';
                        const admissionDateBS = convertADtoBS(tcPreview.student?.admissionDate || new Date(new Date(tcPreview.leavingDate).getFullYear() - 2, 4, 15));
                        const leavingDateBS = convertADtoBS(tcPreview.leavingDate);
                        const leavingYearBS = new Date(tcPreview.leavingDate).getFullYear() + 57;
                        
                        return (
                          <>
                            {pronouns.mrMs} <span className="font-sans font-bold text-slate-800 px-0.5">{studentName}</span> 
                            {pronouns.sonDaughter} of Mr. <span className="font-sans font-bold text-slate-800 px-0.5">{fatherName}</span> 
                            was a student of <span className="font-sans font-bold text-slate-800 px-0.5">{className}</span> in this school. 
                            {pronouns.hisHer} admission date is <span className="font-sans font-bold text-slate-800 px-0.5">{admissionDateBS} BS</span> and leaving date is <span className="font-sans font-bold text-slate-800 px-0.5">{leavingDateBS} BS</span>. 
                            {pronouns.heShe} has passed the <span className="font-sans font-bold text-slate-800 px-0.5">{className}</span> examination in the year <span className="font-sans font-bold text-slate-800 px-0.5">{leavingYearBS} BS</span> and was placed in <span className="font-sans font-bold text-slate-800 px-0.5">First</span> Division.
                          </>
                        );
                      })()}
                    </p>
                    <p>
                      {(() => {
                        const pronouns = getGenderPronouns(tcPreview.student?.gender);
                        const dobBS = convertADtoBS(tcPreview.student?.dob);
                        return (
                          <>
                            {pronouns.hisHer} conduct and character during this period was <span className="font-sans font-bold text-slate-800 px-0.5">good</span>. 
                            {pronouns.hisHer} date of birth according to the school record is <span className="font-sans font-bold text-slate-800 px-0.5">{dobBS} BS</span>.
                          </>
                        );
                      })()}
                    </p>
                    <p className="mt-2.5">
                      {(() => {
                        const pronouns = getGenderPronouns(tcPreview.student?.gender);
                        return `I wish ${pronouns.himHer} successful career and a bright future.`;
                      })()}
                    </p>
                  </div>

                  {/* Signature lines */}
                  <div className="flex justify-between items-end mt-8 px-8">
                    <div className="text-center w-36">
                      <div className="border-t border-slate-400 w-full mb-1"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Class Teacher</span>
                    </div>
                    <div className="text-center w-36">
                      <div className="border-t border-slate-400 w-full mb-1"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Principal</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setShowTCPreviewModal(false)}
                className="h-8 px-4 bg-muted text-foreground rounded-lg text-[10px] font-bold hover:bg-muted/80 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </CustomModal>
      )}
    </div>
  );
};

export default GenerateCertificate;

import React, { useEffect, useMemo, useState } from 'react';
import { CheckSquare, CreditCard, Printer, Square, Users } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';
import { buildQrImageMap } from '../../lib/qrCode';

const BUILT_IN_TEMPLATE = { id: 'modern-navy', title: 'Modern Navy Vertical (Built-in)' };

const dateText = (value) => value
  ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
  : 'N/A';

const validity = () => {
  const issued = new Date();
  const expires = new Date(issued);
  expires.setFullYear(expires.getFullYear() + 1);
  return { issued: dateText(issued), expires: dateText(expires) };
};

const initials = (student) => `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase();
const fullName = (student) => [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ');

const StudentPhoto = ({ student, print = false }) => student.photo ? (
  <img src={student.photo} alt={fullName(student)} className={print ? 'student-photo' : 'h-full w-full object-cover'} />
) : (
  <span className={print ? 'photo-initials' : 'text-xl font-black text-[#0b3558]'}>{initials(student)}</span>
);

const CardLogo = ({ template, print = false }) => template.logo ? (
  <img src={template.logo} alt="School logo" className={print ? 'school-logo' : 'h-full w-full object-contain'} />
) : (
  <span className={print ? 'logo-letter' : 'text-base font-black text-white'}>{template.schoolName?.[0] || 'S'}</span>
);

const FrontCard = ({ student, template }) => (
  <div className="relative aspect-[54/86] w-[270px] shrink-0 overflow-hidden rounded-[10px] border border-slate-300 bg-white font-sans text-[#10283e] shadow-xl">
    <div className="absolute inset-x-0 top-0 h-[43%] bg-[#082b4c]" />
    <div className="absolute left-[-12%] top-[31%] h-[15%] w-[124%] rotate-[5deg] rounded-[50%] border-b-[3px] border-red-500 bg-[#082b4c]" />
    <div className="absolute left-[-15%] top-[39%] h-[13%] w-[130%] rotate-[5deg] rounded-[50%] border-t-2 border-cyan-400 bg-white" />
    <div className="absolute bottom-0 left-[-10%] h-[12%] w-[120%] -rotate-[4deg] rounded-t-[55%] border-t-2 border-[#082b4c] bg-[#a9e9f8]" />
    <div className="relative z-10 flex h-full flex-col items-center px-4 pt-4">
      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white/80 bg-white/15"><CardLogo template={template} /></div>
      <p className="mt-1 max-w-[220px] text-center text-[10px] font-black leading-tight text-white">{template.schoolName}</p>
      <p className="mt-0.5 max-w-[220px] text-center text-[6px] text-cyan-100">{template.schoolAddress}</p>
      <div className="mt-2 flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-slate-100 shadow-lg ring-2 ring-cyan-300"><StudentPhoto student={student} /></div>
      <span className="mt-1 rounded-full bg-red-500 px-3 py-0.5 text-[6px] font-black uppercase tracking-wider text-white">Student ID Card</span>
      <h3 className="mt-2 max-w-full truncate text-[13px] font-black uppercase">{fullName(student)}</h3>
      <div className="mt-1.5 w-full space-y-1 px-2 text-[8px] leading-tight">
        <p><b>Father's Name</b><span>: {student.fatherName || 'N/A'}</span></p>
        <p><b>Class</b><span>: {student.Class?.name || 'N/A'} — {student.Section?.name || 'N/A'}</span></p>
        <p><b>Roll No.</b><span>: {student.rollNumber || 'N/A'}</span></p>
        <p><b>Admission No.</b><span>: {student.admissionNo}</span></p>
        <p><b>Session</b><span>: {new Date().getFullYear()}–{new Date().getFullYear() + 1}</span></p>
        <p><b>Blood Group</b><span>: N/A</span></p>
      </div>
      <p className="absolute bottom-2.5 right-4 text-[7px] font-bold italic">Principal</p>
    </div>
  </div>
);

const BackCard = ({ student, template, qrImage }) => {
  const dates = validity();
  return (
    <div className="relative aspect-[54/86] w-[270px] shrink-0 overflow-hidden rounded-[10px] border border-slate-300 bg-white font-sans text-[#10283e] shadow-xl">
      <div className="absolute inset-x-0 top-0 h-[43%] bg-[#082b4c]" />
      <div className="absolute left-[-12%] top-[31%] h-[15%] w-[124%] rotate-[5deg] rounded-[50%] border-b-[3px] border-red-500 bg-[#082b4c]" />
      <div className="absolute left-[-15%] top-[39%] h-[13%] w-[130%] rotate-[5deg] rounded-[50%] border-t-2 border-cyan-400 bg-white" />
      <div className="absolute bottom-0 left-[-10%] h-[12%] w-[120%] -rotate-[4deg] rounded-t-[55%] border-t-2 border-[#082b4c] bg-[#a9e9f8]" />
      <div className="relative z-10 flex h-full flex-col items-center px-5 pt-4 text-center">
        <p className="text-[7px] text-cyan-100">If found, please return this card to:</p>
        <div className="mt-1 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-white/80 bg-white/15"><CardLogo template={template} /></div>
        <p className="mt-1 max-w-[220px] text-[10px] font-black leading-tight text-white">{template.schoolName}</p>
        <p className="mt-0.5 max-w-[220px] text-[6px] text-cyan-100">{template.schoolAddress}</p>
        {template.email && <p className="text-[6px] text-cyan-100">{template.email}</p>}
        {template.phone && <p className="text-[6px] text-cyan-100">☎ {template.phone}</p>}
        <div className="mt-5 w-full text-left text-[8px] leading-relaxed">
          <p><b>Contact</b>: {student.guardianPhone || student.mobileNumber || 'N/A'}</p>
          <p><b>Date of Birth</b>: {dateText(student.dob)}</p>
        </div>
        <div className="mt-2 rounded bg-[#082b4c] px-3 py-1 text-left text-[7px] font-bold leading-relaxed text-white">
          <p>Issue Date: {dates.issued}</p><p>Expiry Date: {dates.expires}</p>
        </div>
        <div className="mt-2 flex h-[64px] w-[64px] items-center justify-center rounded border border-slate-400 bg-white p-1">
          {qrImage ? <img src={qrImage} alt="Verification QR" className="h-full w-full" /> : <span className="text-[7px]">QR</span>}
        </div>
        <p className="mt-1 text-[6px] font-black uppercase tracking-wider">Scan to verify record</p>
      </div>
    </div>
  );
};

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

const printCardHtml = (student, template, qrImage) => {
  const name = escapeHtml(fullName(student));
  const school = escapeHtml(template.schoolName || 'School Name');
  const address = escapeHtml(template.schoolAddress || '');
  const logo = template.logo ? `<img class="school-logo" src="${escapeHtml(template.logo)}"/>` : `<span class="logo-letter">${school[0] || 'S'}</span>`;
  const photo = student.photo ? `<img class="student-photo" src="${escapeHtml(student.photo)}"/>` : `<span class="photo-initials">${escapeHtml(initials(student))}</span>`;
  const dates = validity();
  return `<div class="card-pair">
    <div class="id-card front"><div class="navy"></div><div class="wave-one"></div><div class="wave-two"></div><div class="bottom-wave"></div><div class="content">
      <div class="logo">${logo}</div><div class="school">${school}</div><div class="address">${address}</div>
      <div class="photo">${photo}</div><div class="badge">STUDENT ID CARD</div><div class="student-name">${name}</div>
      <div class="info"><p><b>Father's Name</b>: ${escapeHtml(student.fatherName || 'N/A')}</p><p><b>Class</b>: ${escapeHtml(student.Class?.name || 'N/A')} — ${escapeHtml(student.Section?.name || 'N/A')}</p><p><b>Roll No.</b>: ${escapeHtml(student.rollNumber || 'N/A')}</p><p><b>Admission No.</b>: ${escapeHtml(student.admissionNo)}</p><p><b>Session</b>: ${new Date().getFullYear()}–${new Date().getFullYear() + 1}</p><p><b>Blood Group</b>: N/A</p></div><div class="principal">Principal</div>
    </div></div>
    <div class="id-card back"><div class="navy"></div><div class="wave-one"></div><div class="wave-two"></div><div class="bottom-wave"></div><div class="content">
      <div class="found">If found, please return this card to:</div><div class="logo">${logo}</div><div class="school">${school}</div><div class="address">${address}</div><div class="contact-small">${escapeHtml(template.email || '')}<br/>${escapeHtml(template.phone || '')}</div>
      <div class="back-info"><p><b>Contact</b>: ${escapeHtml(student.guardianPhone || student.mobileNumber || 'N/A')}</p><p><b>Date of Birth</b>: ${dateText(student.dob)}</p></div>
      <div class="validity"><b>Issue Date: ${dates.issued}</b><br/><b>Expiry Date: ${dates.expires}</b></div>
      ${qrImage ? `<img class="qr" src="${qrImage}"/>` : ''}<div class="scan">SCAN TO VERIFY RECORD</div>
    </div></div>
  </div>`;
};

const PRINT_STYLES = `
  *{box-sizing:border-box} body{margin:0;padding:12mm;background:#fff;font-family:Arial,sans-serif;color:#10283e}.sheet{display:flex;flex-wrap:wrap;gap:10mm;align-items:flex-start}.card-pair{display:flex;gap:5mm;break-inside:avoid;page-break-inside:avoid}.id-card{position:relative;width:54mm;height:86mm;overflow:hidden;border:.25mm solid #94a3b8;border-radius:2.5mm;background:white;box-shadow:0 1.5mm 4mm #0002}.navy{position:absolute;inset:0 0 auto;height:43%;background:#082b4c}.wave-one{position:absolute;left:-12%;top:31%;width:124%;height:15%;border-radius:50%;background:#082b4c;border-bottom:1mm solid #ef4444;transform:rotate(5deg)}.wave-two{position:absolute;left:-15%;top:39%;width:130%;height:13%;border-radius:50%;background:#fff;border-top:.6mm solid #22d3ee;transform:rotate(5deg)}.bottom-wave{position:absolute;left:-10%;bottom:0;width:120%;height:12%;border-radius:55% 55% 0 0;background:#a9e9f8;border-top:.6mm solid #082b4c;transform:rotate(-4deg)}.content{position:relative;z-index:2;height:100%;display:flex;flex-direction:column;align-items:center;padding:4mm}.logo{width:10mm;height:10mm;border:0.6mm solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#ffffff20}.school-logo,.student-photo{width:100%;height:100%;object-fit:cover}.logo-letter{color:#fff;font-weight:900;font-size:4mm}.school{width:100%;margin-top:1mm;text-align:center;color:white;font-size:2.5mm;font-weight:900;line-height:1.1}.address{width:100%;margin-top:.5mm;text-align:center;color:#cffafe;font-size:1.45mm;line-height:1.1}.photo{width:15mm;height:15mm;margin-top:2mm;border:1mm solid white;border-radius:50%;overflow:hidden;background:#f1f5f9;box-shadow:0 0 0 .5mm #67e8f9;display:flex;align-items:center;justify-content:center}.photo-initials{font-size:5mm;font-weight:900;color:#0b3558}.badge{margin-top:1mm;padding:.4mm 2.5mm;border-radius:3mm;background:#ef4444;color:white;font-size:1.35mm;font-weight:900}.student-name{max-width:46mm;margin-top:2mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:3mm;font-weight:900;text-transform:uppercase}.info{width:100%;margin-top:1.5mm;padding:0 2mm;font-size:2mm;line-height:1.25}.info p,.back-info p{margin:.7mm 0}.principal{position:absolute;right:4mm;bottom:3mm;font-size:1.8mm;font-weight:700;font-style:italic}.found{color:#cffafe;font-size:1.7mm;margin-bottom:1mm}.contact-small{color:#cffafe;text-align:center;font-size:1.4mm;line-height:1.25}.back-info{width:100%;margin-top:6mm;text-align:left;font-size:2.1mm}.validity{margin-top:2mm;padding:1mm 3mm;border-radius:.8mm;background:#082b4c;color:white;font-size:1.8mm;line-height:1.35}.qr{width:14mm;height:14mm;margin-top:2mm;padding:.7mm;border:.3mm solid #475569;background:#fff}.scan{margin-top:.7mm;font-size:1.3mm;font-weight:900;letter-spacing:.1mm}@media print{body{padding:5mm}.id-card{box-shadow:none}}`;

const GenerateIDCard = () => {
  const [templates, setTemplates] = useState([BUILT_IN_TEMPLATE]);
  const [students, setStudents] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(BUILT_IN_TEMPLATE.id);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [qrImages, setQrImages] = useState({});

  useEffect(() => {
    Promise.all([api.get('/certificates/id-cards?templateFor=STUDENT'), api.get('/students?isDisabled=false')])
      .then(([templateRes, studentRes]) => {
        setTemplates([BUILT_IN_TEMPLATE, ...(templateRes.data.data || []).filter(item => item.id !== BUILT_IN_TEMPLATE.id)]);
        setStudents(studentRes.data.data || []);
      })
      .catch(() => toast.error('Failed to fetch students'));
  }, []);

  useEffect(() => {
    buildQrImageMap(previewData?.students).then(setQrImages).catch(() => setQrImages({}));
  }, [previewData]);

  const allSelected = students.length > 0 && selectedStudents.length === students.length;
  const selectedCount = useMemo(() => selectedStudents.length, [selectedStudents]);

  const handleGenerate = async () => {
    if (!selectedStudents.length) return toast.error('Select at least one student');
    try {
      setGenerating(true);
      const response = await api.post('/certificates/generate-student-id', { templateId: selectedTemplate, studentIds: selectedStudents });
      setPreviewData(response.data.data);
      toast.success(`${response.data.data.students.length} ID card${response.data.data.students.length > 1 ? 's' : ''} generated`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to generate ID cards'));
    } finally { setGenerating(false); }
  };

  const handlePrint = async () => {
    if (!previewData) return;
    const images = Object.keys(qrImages).length ? qrImages : await buildQrImageMap(previewData.students);
    const popup = window.open('', '_blank');
    if (!popup) return toast.error('Allow pop-ups to print ID cards');
    popup.document.write(`<html><head><title>Student ID Cards</title><style>${PRINT_STYLES}</style></head><body><div class="sheet">${previewData.students.map(student => printCardHtml(student, previewData.template, images[student.id])).join('')}</div><script>window.onload=()=>{window.print()}<\/script></body></html>`);
    popup.document.close();
  };

  return (
    <div className="space-y-5 p-4">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-xl font-black">Generate Student ID Cards</h1><p className="mt-1 text-xs text-muted-foreground">Professional front-and-back cards with secure verification QR</p></div>
        {previewData && <button onClick={handlePrint} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground"><Printer className="h-4 w-4" /> Print 54 × 86 mm Cards</button>}
      </div>
      <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
        <aside className="h-fit space-y-4 rounded-2xl border border-border bg-card p-4">
          <div><label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Card design</label><select value={selectedTemplate} onChange={event => setSelectedTemplate(event.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs">{templates.map(template => <option key={template.id} value={template.id}>{template.title}</option>)}</select></div>
          <div>
            <div className="mb-1.5 flex items-center justify-between"><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Students ({selectedCount})</label><button onClick={() => setSelectedStudents(allSelected ? [] : students.map(student => student.id))} className="flex items-center gap-1 text-[10px] font-bold text-primary">{allSelected ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}{allSelected ? 'Clear all' : 'Select all'}</button></div>
            <div className="max-h-[420px] space-y-1 overflow-y-auto rounded-xl border border-border bg-muted/20 p-2">{students.map(student => <label key={student.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-muted"><input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={event => setSelectedStudents(current => event.target.checked ? [...current, student.id] : current.filter(id => id !== student.id))} /><div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-[10px] font-black text-primary">{student.photo ? <img src={student.photo} alt="" className="h-full w-full object-cover" /> : initials(student)}</div><div className="min-w-0"><p className="truncate text-xs font-bold">{fullName(student)}</p><p className="text-[10px] text-muted-foreground">{student.Class?.name} · Roll {student.rollNumber || '—'}</p></div></label>)}{!students.length && <div className="py-10 text-center"><Users className="mx-auto h-6 w-6 text-muted-foreground" /><p className="mt-2 text-xs text-muted-foreground">No active students found</p></div>}</div>
          </div>
          <button onClick={handleGenerate} disabled={generating || !selectedStudents.length} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-black text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"><CreditCard className="h-4 w-4" />{generating ? 'Generating cards…' : `Generate ${selectedCount || ''} Card${selectedCount === 1 ? '' : 's'}`}</button>
        </aside>
        <section className="min-h-[560px] rounded-2xl border border-border bg-card p-4 sm:p-6">
          {!previewData ? <div className="flex min-h-[500px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 text-center"><CreditCard className="h-10 w-10 text-muted-foreground/50" /><h2 className="mt-3 text-sm font-black">No cards generated yet</h2><p className="mt-1 max-w-sm text-xs text-muted-foreground">Choose students and click Generate. The built-in design works without creating a template first.</p></div> : <div className="space-y-8">{previewData.students.map(student => <div key={student.id} className="rounded-2xl border border-border bg-muted/20 p-4"><div className="mb-3 flex items-center justify-between"><div><p className="text-xs font-black">{fullName(student)}</p><p className="text-[10px] text-muted-foreground">Front and back preview</p></div><span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black text-emerald-600">QR ENABLED</span></div><div className="flex gap-5 overflow-x-auto pb-3"><FrontCard student={student} template={previewData.template} /><BackCard student={student} template={previewData.template} qrImage={qrImages[student.id]} /></div></div>)}</div>}
        </section>
      </div>
    </div>
  );
};

export default GenerateIDCard;

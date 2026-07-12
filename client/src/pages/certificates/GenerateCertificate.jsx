import React, { useState, useEffect } from 'react';
import { Award, Download, Eye } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const GenerateCertificate = () => {
  const [templates, setTemplates] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    templateId: '',
    studentId: '',
    classId: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [templatesRes, classesRes] = await Promise.all([
        api.get('/certificates/templates'),
        api.get('/academics/classes')
      ]);
      setTemplates(templatesRes.data.data || []);
      setClasses(classesRes.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsByClass = async (classId) => {
    if (!classId) {
      setStudents([]);
      return;
    }
    try {
      const response = await api.get(`/students?classId=${classId}`);
      setStudents(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch students');
      setStudents([]);
    }
  };

  const handleClassChange = (classId) => {
    setFormData({ ...formData, classId, studentId: '' });
    setPreview(null);
    fetchStudentsByClass(classId);
  };

  const handleGeneratePreview = async () => {
    if (!formData.templateId || !formData.studentId) {
      return toast.error('Please select both template and student');
    }

    try {
      setGenerating(true);
      const template = templates.find(t => t.id === parseInt(formData.templateId));
      const student = students.find(s => s.id === parseInt(formData.studentId));
      const studentClass = classes.find(c => c.id === student.classId);

      // Merge template with student data
      const mergedText = template.bodyText
        .replace(/{studentName}/g, student.name)
        .replace(/{class}/g, studentClass?.name || 'N/A')
        .replace(/{section}/g, student.section?.name || 'N/A')
        .replace(/{rollNumber}/g, student.rollNumber || 'N/A')
        .replace(/{admissionNumber}/g, student.admissionNumber || 'N/A');

      setPreview({
        headerText: template.headerText || 'Certificate',
        bodyText: mergedText,
        footerText: template.footerText || '',
        studentName: student.name,
        templateName: template.name
      });

      toast.success('Preview generated successfully');
    } catch (error) {
      toast.error('Failed to generate preview');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    const printContent = `
      <html>
        <head>
          <title>Certificate - ${preview.studentName || 'Student'}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background-color: #fff;
            }
            .certificate-container {
              border: 12px double #b45309;
              padding: 40px;
              text-align: center;
              max-width: 800px;
              width: 100%;
              box-sizing: border-box;
            }
            .header {
              font-size: 28px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #78350f;
              border-bottom: 2px solid #b45309;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .body {
              font-size: 16px;
              color: #4b5563;
              line-height: 1.8;
              margin-bottom: 30px;
              white-space: pre-line;
            }
            .footer {
              font-size: 14px;
              color: #6b7280;
              border-top: 2px solid #b45309;
              padding-top: 20px;
              margin-top: 30px;
              white-space: pre-line;
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <div class="header">${preview.headerText}</div>
            <div class="body">${preview.bodyText}</div>
            <div class="footer">${preview.footerText || ''}</div>
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
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Generate Certificate</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Create student certificates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Form */}
        <div className="lg:col-span-5">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden sticky top-4">
            <div className="px-3 py-2 border-b border-border bg-muted/10">
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Certificate Details</h3>
            </div>

            <div className="p-4 space-y-4">
              {loading ? (
                <div className="py-8 flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Loading...</span>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                      Select Template *
                    </label>
                    <select
                      value={formData.templateId}
                      onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                      className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                      required
                    >
                      <option value="">Choose a template...</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                      Select Class *
                    </label>
                    <select
                      value={formData.classId}
                      onChange={(e) => handleClassChange(e.target.value)}
                      className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                      required
                    >
                      <option value="">Choose a class...</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                      Select Student *
                    </label>
                    <select
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                      required
                      disabled={!formData.classId}
                    >
                      <option value="">
                        {formData.classId ? 'Choose a student...' : 'Select class first...'}
                      </option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} ({student.admissionNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleGeneratePreview}
                    disabled={generating || !formData.templateId || !formData.studentId}
                    className="w-full h-9 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        Generate Preview
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-7">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-3 py-2 border-b border-border bg-muted/10 flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Certificate Preview</h3>
              {preview && (
                <button
                  onClick={handleDownload}
                  className="h-7 px-3 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3 h-3" />
                  Download PDF
                </button>
              )}
            </div>

            <div className="p-6">
              {!preview ? (
                <div className="py-16 text-center">
                  <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    No preview generated yet
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-1">
                    Select template and student to generate preview
                  </p>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-4 border-amber-600 dark:border-amber-800 rounded-lg p-8 space-y-6 shadow-xl">
                  {/* Header */}
                  <div className="text-center border-b-2 border-amber-600 dark:border-amber-800 pb-4">
                    <h2 className="text-2xl font-black text-amber-900 dark:text-amber-100 uppercase tracking-wider">
                      {preview.headerText}
                    </h2>
                  </div>

                  {/* Body */}
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {preview.bodyText}
                    </p>
                  </div>

                  {/* Footer */}
                  {preview.footerText && (
                    <div className="text-center border-t-2 border-amber-600 dark:border-amber-800 pt-4">
                      <p className="text-xs text-muted-foreground whitespace-pre-line">
                        {preview.footerText}
                      </p>
                    </div>
                  )}

                  {/* Badge */}
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-600 dark:bg-amber-800 text-white rounded-full">
                      <Award className="w-4 h-4" />
                      <span className="text-xs font-bold">{preview.templateName}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateCertificate;

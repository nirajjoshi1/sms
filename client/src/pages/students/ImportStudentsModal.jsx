import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, FileSpreadsheet, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import CustomModal from '../../components/ui/CustomModal';
import CustomSelect from '../../components/ui/CustomSelect';
import api from '../../lib/api';
import { toast } from 'sonner';

const REQUIRED_FIELDS = [
  { key: 'firstName', label: 'First Name' },
  { key: 'gender', label: 'Gender' },
  { key: 'dob', label: 'Date of Birth (YYYY-MM-DD)' }
];

const OPTIONAL_FIELDS = [
  { key: 'lastName', label: 'Last Name' },
  { key: 'admissionNo', label: 'Admission Number' },
  { key: 'mobileNumber', label: 'Mobile Number' },
  { key: 'email', label: 'Email' },
  { key: 'fatherName', label: 'Father Name' },
  { key: 'fatherPhone', label: 'Father Phone' },
  { key: 'motherName', label: 'Mother Name' },
  { key: 'guardianName', label: 'Guardian Name' },
  { key: 'guardianPhone', label: 'Guardian Phone' },
  { key: 'guardianRelation', label: 'Guardian Relation' }
];

export default function ImportStudentsModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  
  const [targetClass, setTargetClass] = useState('');
  const [targetSection, setTargetSection] = useState('');
  
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [fileHeaders, setFileHeaders] = useState([]);
  
  // Mapping: systemFieldKey -> csvHeaderName
  const [fieldMapping, setFieldMapping] = useState({});
  const [importing, setImporting] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchClasses();
      resetState();
    }
  }, [isOpen]);

  useEffect(() => {
    if (targetClass) {
      fetchSections(targetClass);
    } else {
      setSections([]);
      setTargetSection('');
    }
  }, [targetClass]);

  const resetState = () => {
    setStep(1);
    setTargetClass('');
    setTargetSection('');
    setFile(null);
    setFileData([]);
    setFileHeaders([]);
    setFieldMapping({});
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get('/academics/classes');
      setClasses(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load classes');
    }
  };

  const fetchSections = async (classId) => {
    try {
      const res = await api.get(`/academics/sections?classId=${classId}`);
      setSections(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load sections');
    }
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" });
        if (data.length === 0) {
          toast.error("The uploaded file is empty.");
          setFile(null);
          return;
        }

        const headers = Object.keys(data[0]);
        setFileHeaders(headers);
        setFileData(data);
        
        // Auto-map columns if names loosely match
        const initialMapping = {};
        const allFields = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];
        allFields.forEach(field => {
          const match = headers.find(h => h.toLowerCase().replace(/[^a-z]/g, '') === field.key.toLowerCase());
          if (match) {
            initialMapping[field.key] = match;
          }
        });
        setFieldMapping(initialMapping);

      } catch (err) {
        toast.error("Failed to parse file. Please upload a valid CSV or Excel file.");
        setFile(null);
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleNextStep1 = () => {
    if (!targetClass || !targetSection) {
      return toast.error("Please select a target Class and Section");
    }
    if (!file || fileData.length === 0) {
      return toast.error("Please upload a valid file containing student data");
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    // Validate required fields are mapped
    const unmappedRequired = REQUIRED_FIELDS.filter(f => !fieldMapping[f.key]);
    if (unmappedRequired.length > 0) {
      return toast.error(`Please map required fields: ${unmappedRequired.map(f => f.label).join(', ')}`);
    }
    setStep(3);
  };

  const handleImport = async () => {
    try {
      setImporting(true);

      const studentsToImport = fileData.map(row => {
        const student = {};
        Object.keys(fieldMapping).forEach(sysKey => {
          const csvHeader = fieldMapping[sysKey];
          if (csvHeader && row[csvHeader]) {
            student[sysKey] = row[csvHeader].toString().trim();
          }
        });
        return student;
      });

      const payload = {
        classId: targetClass,
        sectionId: targetSection,
        students: studentsToImport
      };

      const res = await api.post('/students/bulk-admit', payload);
      toast.success(res.data.message || 'Students imported successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to import students');
    } finally {
      setImporting(false);
    }
  };

  const classOptions = classes.map(c => ({ id: c.id, label: c.name }));
  const sectionOptions = sections.map(s => ({ id: s.id, label: s.name }));

  const headerOptions = [
    { id: '', label: '--- Do not import ---' },
    ...fileHeaders.map(h => ({ id: h, label: h }))
  ];

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Students"
      maxWidth="max-w-2xl"
      overflow="overflow-visible"
    >
      <div className="flex flex-col min-h-[450px]">
        {/* Stepper */}
        <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {s}
              </div>
              <span className={`ml-2 text-xs font-bold ${step >= s ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s === 1 ? 'Upload' : s === 2 ? 'Mapping' : 'Preview'}
              </span>
              {s < 3 && <div className={`w-12 h-px mx-4 ${step > s ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <div className="p-6 flex-1 flex flex-col">
          {step === 1 && (
            <div className="space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1 block">
                    Target Class *
                  </label>
                  <CustomSelect
                    value={targetClass}
                    onChange={setTargetClass}
                    options={classOptions}
                    placeholder="Select Class"
                    searchable
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1 block">
                    Target Section *
                  </label>
                  <CustomSelect
                    value={targetSection}
                    onChange={setTargetSection}
                    options={sectionOptions}
                    placeholder={targetClass ? "Select Section" : "Select Class first"}
                    searchable
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-2 block">
                  Data File (CSV or Excel) *
                </label>
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                
                {!file ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all group"
                  >
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground mb-1">Click to upload file</h3>
                    <p className="text-xs text-muted-foreground">Supports .csv, .xls, .xlsx</p>
                  </div>
                ) : (
                  <div className="border border-primary/30 bg-primary/5 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="w-8 h-8 text-primary" />
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{file.name}</h4>
                        <p className="text-[10px] text-muted-foreground">{fileData.length} records found</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setFile(null);
                        setFileData([]);
                        setFileHeaders([]);
                        if(fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 flex flex-col min-h-0">
              <p className="text-xs text-muted-foreground mb-4 shrink-0">
                Match the required system fields with the columns found in your uploaded file.
              </p>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2 pb-2 border-b border-border">
                    Required Fields
                  </h4>
                  <div className="space-y-3">
                    {REQUIRED_FIELDS.map(field => (
                      <div key={field.key} className="grid grid-cols-[1fr_2fr] gap-4 items-center">
                        <span className="text-xs font-bold text-muted-foreground">{field.label} *</span>
                        <CustomSelect
                          value={fieldMapping[field.key] || ''}
                          onChange={(val) => setFieldMapping(prev => ({ ...prev, [field.key]: val }))}
                          options={headerOptions}
                          placeholder="Select column..."
                          searchable
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2 pb-2 border-b border-border">
                    Optional Fields
                  </h4>
                  <div className="space-y-3">
                    {OPTIONAL_FIELDS.map(field => (
                      <div key={field.key} className="grid grid-cols-[1fr_2fr] gap-4 items-center">
                        <span className="text-xs font-bold text-muted-foreground">{field.label}</span>
                        <CustomSelect
                          value={fieldMapping[field.key] || ''}
                          onChange={(val) => setFieldMapping(prev => ({ ...prev, [field.key]: val }))}
                          options={headerOptions}
                          placeholder="Select column..."
                          searchable
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex-1 flex flex-col space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-foreground">Ready to Import</h4>
                  <p className="text-xs text-muted-foreground">You are about to import {fileData.length} students into {classes.find(c => c.id === targetClass)?.name} - {sections.find(s => s.id === targetSection)?.name}.</p>
                </div>
              </div>

              <div className="border border-border rounded-xl overflow-hidden flex-1 flex flex-col">
                <div className="bg-muted px-4 py-2 border-b border-border shrink-0">
                  <span className="text-xs font-bold text-muted-foreground">Data Preview (First 3 rows)</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr>
                        {Object.keys(fieldMapping).filter(k => fieldMapping[k]).map(sysKey => (
                          <th key={sysKey} className="pb-2 font-bold text-muted-foreground pr-6">
                            {[...REQUIRED_FIELDS, ...OPTIONAL_FIELDS].find(f => f.key === sysKey)?.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {fileData.slice(0, 3).map((row, idx) => (
                        <tr key={idx} className="border-t border-border">
                          {Object.keys(fieldMapping).filter(k => fieldMapping[k]).map(sysKey => (
                            <td key={sysKey} className="py-2 pr-6 text-foreground truncate max-w-[150px]">
                              {row[fieldMapping[sysKey]] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-border flex items-center justify-between shrink-0 bg-muted/10 rounded-b-xl">
          <button
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
            disabled={importing}
            className="px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          {step === 1 && (
            <button
              onClick={handleNextStep1}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          )}
          
          {step === 2 && (
            <button
              onClick={handleNextStep2}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              Preview Import <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Confirm Import
            </button>
          )}
        </div>
      </div>
    </CustomModal>
  );
}

import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Upload,
  Save,
  ChevronDown,
  Check,
  Plus,
  ArrowLeft,
  Camera,
  X
} from 'lucide-react';
import { useAcademics } from '../../hooks/useAcademics';
import api from '../../lib/api';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import CustomSelect from '../../components/ui/CustomSelect';
import CustomDatePicker from '../../components/ui/CustomDatePicker';

const StudentAdmission = () => {
  const { classes, sections } = useAcademics();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [houses, setHouses] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [birthCertFile, setBirthCertFile] = useState(null);
  const [birthCertPreview, setBirthCertPreview] = useState(null);

  const [formData, setFormData] = useState({
    enrollNumber: '',
    classId: '',
    sectionId: '',
    categoryId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    dob: '',
    mobileNumber: '',
    email: '',
    admissionDate: new Date().toISOString().split('T')[0],
    fatherName: '',
    fatherPhone: '',
    motherName: '',
    motherPhone: '',
    guardianIs: 'Father',
    guardianName: '',
    guardianRelation: '',
    guardianPhone: '',
    guardianAddress: ''
  });
  
  const [isGuardianNameManual, setIsGuardianNameManual] = useState(false);
  const [isGuardianPhoneManual, setIsGuardianPhoneManual] = useState(false);

  // Fetch categories and houses
  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        const [catRes, houseRes] = await Promise.all([
          api.get('/student-setup/categories'),
          api.get('/student-setup/houses')
        ]);
        setCategories(catRes.data.data || []);
        setHouses(houseRes.data.data || []);
      } catch (error) {
        toast.error('Failed to load setup data');
      }
    };
    fetchSetupData();
  }, []);

  // Handle photo selection
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo size should be less than 5MB');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleBirthCertChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setBirthCertFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBirthCertPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBirthCert = () => {
    setBirthCertFile(null);
    setBirthCertPreview(null);
  };

  // Sync Guardian Info Smarter
  useEffect(() => {
    if (formData.guardianIs === 'Father') {
      setFormData(prev => ({
        ...prev,
        guardianName: isGuardianNameManual ? prev.guardianName : prev.fatherName,
        guardianPhone: isGuardianPhoneManual ? prev.guardianPhone : prev.fatherPhone,
        guardianRelation: 'Father'
      }));
    } else if (formData.guardianIs === 'Mother') {
      setFormData(prev => ({
        ...prev,
        guardianName: isGuardianNameManual ? prev.guardianName : prev.motherName,
        guardianPhone: isGuardianPhoneManual ? prev.guardianPhone : prev.motherPhone,
        guardianRelation: 'Mother'
      }));
    }
  }, [formData.guardianIs, formData.fatherName, formData.fatherPhone, formData.motherName, formData.motherPhone, isGuardianNameManual, isGuardianPhoneManual]);

  const handleGuardianRoleChange = (role) => {
    setIsGuardianNameManual(false);
    setIsGuardianPhoneManual(false);
    setFormData(prev => ({ ...prev, guardianIs: role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.gender || !formData.dob ||
        !formData.classId || !formData.sectionId || !formData.guardianName || !formData.guardianPhone) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!birthCertFile) {
      toast.error('Birth certificate is required for admission');
      return;
    }

    setLoading(true);
    try {
      // Create FormData for file upload
      const submitData = new FormData();

      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      // Append files if selected
      if (photoFile) {
        submitData.append('photo', photoFile);
      }
      if (birthCertFile) {
        submitData.append('birthCertificate', birthCertFile);
      }

      const response = await api.post('/students/admit', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/students');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to admit student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/students" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-foreground tracking-tight">Student Admission</h1>
            <p className="text-[11px] text-muted-foreground">Fill in the details to enroll a new student.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-accent text-foreground rounded-lg text-[11px] font-bold hover:bg-accent/80 transition-all">
          <Upload className="w-3.5 h-3.5" />
          Import Student
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-card border border-border rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-border bg-muted/10 rounded-t-xl">
            <h3 className="text-xs font-bold text-foreground">Student Admission Details</h3>
          </div>
          <div className="p-5">
            {/* Photo and Birth Certificate Upload */}
            <div className="mb-6 flex items-start gap-6">
              {/* Student Photo */}
              <div className="flex-shrink-0">
                <div className="relative w-32 h-32 border-2 border-dashed border-border rounded-xl overflow-hidden bg-muted/20 flex items-center justify-center group hover:border-primary transition-colors">
                  {photoPreview ? (
                    <>
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute top-2 right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-[10px] text-muted-foreground">Student Photo</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-[9px] text-muted-foreground mt-2 text-center">Optional</p>
              </div>

              {/* Birth Certificate */}
              <div className="flex-shrink-0">
                <div className="relative w-32 h-32 border-2 border-dashed border-border rounded-xl overflow-hidden bg-muted/20 flex items-center justify-center group hover:border-primary transition-colors">
                  {birthCertPreview ? (
                    <>
                      <img src={birthCertPreview} alt="Birth Certificate" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={removeBirthCert}
                        className="absolute top-2 right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-[10px] text-muted-foreground">Birth Certificate *</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleBirthCertChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-[9px] text-muted-foreground mt-2 text-center">Required</p>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="First Name *"
                  value={formData.firstName}
                  onChange={(v) => setFormData({...formData, firstName: v})}
                  required
                  mode="alpha"
                />
                <Input
                  label="Middle Name"
                  value={formData.middleName}
                  onChange={(v) => setFormData({...formData, middleName: v})}
                  mode="alpha"
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(v) => setFormData({...formData, lastName: v})}
                  mode="alpha"
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Class *</label>
                <CustomSelect
                  value={formData.classId}
                  onChange={(v) => setFormData({...formData, classId: v})}
                  options={classes.map(c => ({ id: c.id, label: c.name }))}
                  placeholder="Select Class"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Section *</label>
                <CustomSelect
                  value={formData.sectionId}
                  onChange={(v) => setFormData({...formData, sectionId: v})}
                  options={sections.map(s => ({ id: s.id, label: s.name }))}
                  placeholder="Select Section"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Category (Optional)</label>
                <CustomSelect
                  value={formData.categoryId}
                  onChange={(v) => setFormData({...formData, categoryId: v})}
                  options={categories.map(c => ({ id: c.id, label: c.name }))}
                  placeholder="Select Category"
                />
              </div>



              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Gender *</label>
                <CustomSelect
                  value={formData.gender}
                  onChange={(v) => setFormData({...formData, gender: v})}
                  options={[
                    { id: 'Male', label: 'Male' },
                    { id: 'Female', label: 'Female' },
                    { id: 'Other', label: 'Other' }
                  ]}
                  placeholder="Select Gender"
                />
              </div>

              <CustomDatePicker
                label="Date of Birth *"
                value={formData.dob}
                onChange={(v) => setFormData({...formData, dob: v})}
              />
              <Input
                label="Mobile Number"
                value={formData.mobileNumber}
                onChange={(v) => setFormData({...formData, mobileNumber: v})}
                mode="numeric"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(v) => setFormData({...formData, email: v})}
              />
              <CustomDatePicker
                label="Admission Date"
                value={formData.admissionDate}
                onChange={(v) => setFormData({...formData, admissionDate: v})}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Parent/Guardian Details */}
        <div className="bg-card border border-border rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-border bg-muted/10 rounded-t-xl">
            <h3 className="text-xs font-bold text-foreground">Parent Guardian Detail</h3>
          </div>
          <div className="p-5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <Input label="Father Name" value={formData.fatherName} onChange={(v) => setFormData({...formData, fatherName: v})} mode="alpha" />
              <Input label="Father Phone" value={formData.fatherPhone} onChange={(v) => setFormData({...formData, fatherPhone: v})} mode="numeric" />
              <Input label="Mother Name" value={formData.motherName} onChange={(v) => setFormData({...formData, motherName: v})} mode="alpha" />
              <Input label="Mother Phone" value={formData.motherPhone} onChange={(v) => setFormData({...formData, motherPhone: v})} mode="numeric" />
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-6">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">If Guardian Is *</label>
                <div className="flex items-center gap-4">
                  {['Father', 'Mother', 'Other'].map(role => (
                    <label key={role} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="guardianIs" 
                        checked={formData.guardianIs === role}
                        onChange={() => handleGuardianRoleChange(role)}
                        className="hidden"
                      />
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${formData.guardianIs === role ? 'border-primary bg-primary' : 'border-border group-hover:border-primary/50'}`}>
                        {formData.guardianIs === role && <div className="w-1 h-1 bg-white rounded-full"></div>}
                      </div>
                      <span className="text-[11px] font-medium text-foreground">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <Input 
                  label="Guardian Name *" 
                  value={formData.guardianName} 
                  onChange={(v) => {
                    setFormData({...formData, guardianName: v});
                    setIsGuardianNameManual(true);
                  }} 
                  required 
                  mode="alpha" 
                  disabled={formData.guardianIs === 'Father' || formData.guardianIs === 'Mother'}
                />
                
                {formData.guardianIs === 'Other' && (
                  <Input 
                    label="Guardian Relation" 
                    value={formData.guardianRelation} 
                    onChange={(v) => setFormData({...formData, guardianRelation: v})} 
                    mode="alpha" 
                  />
                )}

                <Input 
                  label="Guardian Phone *" 
                  value={formData.guardianPhone} 
                  onChange={(v) => {
                    setFormData({...formData, guardianPhone: v});
                    setIsGuardianPhoneManual(true);
                  }} 
                  required 
                  mode="numeric" 
                />
                <Input label="Guardian Address" value={formData.guardianAddress} onChange={(v) => setFormData({...formData, guardianAddress: v})} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button 
            type="button" 
            onClick={() => navigate('/students')}
            className="px-6 py-2 border border-border rounded-lg text-xs font-bold hover:bg-accent transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Save className="w-3.5 h-3.5" />}
            Save Student
          </button>
        </div>
      </form>
    </div>
  );
};

const Input = ({ label, type = 'text', value, onChange, required = false, mode = 'any', disabled = false }) => {
  const handleChange = (val) => {
    if (disabled) return;
    if (mode === 'numeric') {
      // Only allow digits
      const cleaned = val.replace(/[^0-9]/g, '');
      onChange(cleaned);
    } else if (mode === 'alpha') {
      // Only allow letters and spaces
      const cleaned = val.replace(/[^a-zA-Z\s]/g, '');
      onChange(cleaned);
    } else {
      onChange(val);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        required={required}
        disabled={disabled}
        className={`w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all ${disabled ? 'opacity-60 cursor-not-allowed bg-muted/50' : ''}`}
      />
    </div>
  );
};

export default StudentAdmission;

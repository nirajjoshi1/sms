import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, X, Camera } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import CustomSelect from '../../components/ui/CustomSelect';
import CustomDatePicker from '../../components/ui/CustomDatePicker';

const StudentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [houses, setHouses] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    admissionNo: '',
    enrollNumber: '',
    rollNumber: '',
    classId: '',
    sectionId: '',
    categoryId: '',
    houseId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    dob: '',
    mobileNumber: '',
    email: '',
    admissionDate: '',
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

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentRes, classRes, sectionRes, categoryRes, houseRes] = await Promise.all([
        api.get(`/students/${id}`),
        api.get('/academics/classes'),
        api.get('/academics/sections'),
        api.get('/student-setup/categories'),
        api.get('/student-setup/houses')
      ]);

      const student = studentRes.data.data;
      setFormData({
        admissionNo: student.admissionNo || '',
        enrollNumber: student.enrollNumber || '',
        rollNumber: student.rollNumber || '',
        classId: student.classId || '',
        sectionId: student.sectionId || '',
        categoryId: student.categoryId || '',
        houseId: student.houseId || '',
        firstName: student.firstName || '',
        middleName: student.middleName || '',
        lastName: student.lastName || '',
        gender: student.gender || '',
        dob: student.dob ? student.dob.split('T')[0] : '',
        mobileNumber: student.mobileNumber || '',
        email: student.email || '',
        admissionDate: student.admissionDate ? student.admissionDate.split('T')[0] : '',
        fatherName: student.fatherName || '',
        fatherPhone: student.fatherPhone || '',
        motherName: student.motherName || '',
        motherPhone: student.motherPhone || '',
        guardianIs: student.guardianIs || 'Father',
        guardianName: student.guardianName || '',
        guardianRelation: student.guardianRelation || '',
        guardianPhone: student.guardianPhone || '',
        guardianAddress: student.guardianAddress || ''
      });

      if (student.photo) {
        setPhotoPreview(student.photo);
      }

      setClasses(classRes.data.data || []);
      setSections(sectionRes.data.data || []);
      setCategories(categoryRes.data.data || []);
      setHouses(houseRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load student data');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.admissionNo || !formData.firstName || !formData.gender || !formData.dob ||
        !formData.classId || !formData.sectionId || !formData.guardianName || !formData.guardianPhone) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      if (photoFile) {
        submitData.append('photo', photoFile);
      }

      const response = await api.put(`/students/${id}`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success('Student updated successfully');
        navigate(`/students/${id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update student');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <span className="text-sm text-muted-foreground">Loading student data...</span>
        </div>
      </div>
    );
  }

  const Input = ({ label, type = 'text', value, onChange, required = false, placeholder = '' }) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
      />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/students/${id}`} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-foreground tracking-tight">Edit Student</h1>
            <p className="text-[11px] text-muted-foreground">Update student information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-border bg-muted/10 rounded-t-xl">
            <h3 className="text-xs font-bold text-foreground">Student Information</h3>
          </div>
          <div className="p-5">
            <div className="mb-6 flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="relative w-32 h-32 border-2 border-dashed border-border rounded-xl overflow-hidden bg-muted/20 flex items-center justify-center group hover:border-primary transition-colors">
                  {photoPreview ? (
                    <>
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={removePhoto} className="absolute top-2 right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-[10px] text-muted-foreground">Student Photo</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <p className="text-[9px] text-muted-foreground mt-2 text-center">Max 5MB</p>
              </div>

              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Admission No *" value={formData.admissionNo} onChange={(v) => setFormData({...formData, admissionNo: v})} required />
                  <CustomDatePicker label="Admission Date" value={formData.admissionDate} onChange={(v) => setFormData({...formData, admissionDate: v})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="First Name *" value={formData.firstName} onChange={(v) => setFormData({...formData, firstName: v})} required />
                  <Input label="Middle Name" value={formData.middleName} onChange={(v) => setFormData({...formData, middleName: v})} />
                  <Input label="Last Name" value={formData.lastName} onChange={(v) => setFormData({...formData, lastName: v})} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Class *</label>
                <CustomSelect value={formData.classId} onChange={(v) => setFormData({...formData, classId: v})} options={classes.map(c => ({ id: c.id, label: c.name }))} placeholder="Select Class" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Section *</label>
                <CustomSelect value={formData.sectionId} onChange={(v) => setFormData({...formData, sectionId: v})} options={sections.map(s => ({ id: s.id, label: s.name }))} placeholder="Select Section" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Category</label>
                <CustomSelect value={formData.categoryId} onChange={(v) => setFormData({...formData, categoryId: v})} options={categories.map(c => ({ id: c.id, label: c.name }))} placeholder="Select Category" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">House</label>
                <CustomSelect value={formData.houseId} onChange={(v) => setFormData({...formData, houseId: v})} options={houses.map(h => ({ id: h.id, label: h.name }))} placeholder="Select House" />
              </div>



              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Gender *</label>
                <CustomSelect value={formData.gender} onChange={(v) => setFormData({...formData, gender: v})} options={[{ id: 'Male', label: 'Male' }, { id: 'Female', label: 'Female' }, { id: 'Other', label: 'Other' }]} placeholder="Select Gender" />
              </div>

              <CustomDatePicker label="Date of Birth *" value={formData.dob} onChange={(v) => setFormData({...formData, dob: v})} />
              <Input label="Mobile Number" type="tel" value={formData.mobileNumber} onChange={(v) => setFormData({...formData, mobileNumber: v})} />
              <Input label="Email" type="email" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-border bg-muted/10">
            <h3 className="text-xs font-bold text-foreground">Parent Guardian Detail</h3>
          </div>
          <div className="p-5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <Input label="Father Name" value={formData.fatherName} onChange={(v) => setFormData({...formData, fatherName: v})} />
              <Input label="Father Phone" value={formData.fatherPhone} onChange={(v) => setFormData({...formData, fatherPhone: v})} />
              <Input label="Mother Name" value={formData.motherName} onChange={(v) => setFormData({...formData, motherName: v})} />
              <Input label="Mother Phone" value={formData.motherPhone} onChange={(v) => setFormData({...formData, motherPhone: v})} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-4 border-t border-border">
              <Input label="Guardian Name *" value={formData.guardianName} onChange={(v) => setFormData({...formData, guardianName: v})} required />
              <Input label="Guardian Relation" value={formData.guardianRelation} onChange={(v) => setFormData({...formData, guardianRelation: v})} />
              <Input label="Guardian Phone *" value={formData.guardianPhone} onChange={(v) => setFormData({...formData, guardianPhone: v})} required />
              <Input label="Guardian Address" value={formData.guardianAddress} onChange={(v) => setFormData({...formData, guardianAddress: v})} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate(`/students/${id}`)} className="px-6 py-2 border border-border rounded-lg text-xs font-bold hover:bg-accent transition-all">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="flex items-center gap-2 px-8 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50">
            {submitting ? <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Save className="w-3.5 h-3.5" />}
            Update Student
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentEdit;

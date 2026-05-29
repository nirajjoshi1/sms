import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, X, Camera } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import CustomSelect from '../../components/ui/CustomSelect';
import CustomDatePicker from '../../components/ui/CustomDatePicker';

// Move Input component outside to prevent re-creation on every render
const Input = ({ label, type = 'text', value, onChange, required = false, placeholder = '', disabled = false }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
    />
  </div>
);

const StaffEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    staffId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    dob: '',
    phone: '',
    email: '',
    dateOfJoining: '',
    qualification: '',
    experience: '',
    address: '',
    emergencyContact: '',
    bloodGroup: '',
    maritalStatus: '',
    role: '',
    departmentId: '',
    designationId: ''
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffRes, deptRes, desigRes] = await Promise.all([
        api.get(`/staff/${id}`),
        api.get('/hr/departments'),
        api.get('/hr/designations')
      ]);

      const staff = staffRes.data.data;
      setFormData({
        staffId: staff.staffId || '',
        firstName: staff.firstName || '',
        middleName: staff.middleName || '',
        lastName: staff.lastName || '',
        gender: staff.gender || '',
        dob: staff.dob ? staff.dob.split('T')[0] : '',
        phone: staff.phone || '',
        email: staff.email || '',
        dateOfJoining: staff.dateOfJoining ? staff.dateOfJoining.split('T')[0] : '',
        qualification: staff.qualification || '',
        experience: staff.experience || '',
        address: staff.address || '',
        emergencyContact: staff.emergencyContact || '',
        bloodGroup: staff.bloodGroup || '',
        maritalStatus: staff.maritalStatus || '',
        role: staff.role || '',
        departmentId: staff.departmentId || '',
        designationId: staff.designationId || ''
      });

      if (staff.photo) {
        setPhotoPreview(staff.photo);
      }

      setDepartments(deptRes.data.data || []);
      setDesignations(desigRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load staff data');
      navigate('/staff');
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

    if (!formData.firstName || !formData.gender || !formData.dob || !formData.role) {
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

      const response = await api.put(`/staff/${id}`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success('Staff updated successfully');
        navigate(`/staff/${id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update staff');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <span className="text-sm text-muted-foreground">Loading staff data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/staff/${id}`} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-foreground tracking-tight">Edit Staff</h1>
            <p className="text-[11px] text-muted-foreground">Update staff information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-border bg-muted/10 rounded-t-xl">
            <h3 className="text-xs font-bold text-foreground">Personal Information</h3>
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
                      <p className="text-[10px] text-muted-foreground">Staff Photo</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <p className="text-[9px] text-muted-foreground mt-2 text-center">Max 5MB</p>
              </div>

              <div className="flex-1 grid grid-cols-1 gap-4">
                <Input label="Staff ID" value={formData.staffId} onChange={(v) => setFormData({...formData, staffId: v})} placeholder="Auto-generated" disabled />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <Input label="First Name *" value={formData.firstName} onChange={(v) => setFormData({...formData, firstName: v})} required />
              <Input label="Middle Name" value={formData.middleName} onChange={(v) => setFormData({...formData, middleName: v})} />
              <Input label="Last Name" value={formData.lastName} onChange={(v) => setFormData({...formData, lastName: v})} />

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

              <CustomDatePicker label="Date of Birth *" value={formData.dob} onChange={(v) => setFormData({...formData, dob: v})} />
              <Input label="Phone" type="tel" value={formData.phone} onChange={(v) => setFormData({...formData, phone: v})} />
              <Input label="Email" type="email" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} />
              <CustomDatePicker label="Date of Joining" value={formData.dateOfJoining} onChange={(v) => setFormData({...formData, dateOfJoining: v})} />

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Blood Group</label>
                <CustomSelect
                  value={formData.bloodGroup}
                  onChange={(v) => setFormData({...formData, bloodGroup: v})}
                  options={[
                    { id: 'A+', label: 'A+' },
                    { id: 'A-', label: 'A-' },
                    { id: 'B+', label: 'B+' },
                    { id: 'B-', label: 'B-' },
                    { id: 'O+', label: 'O+' },
                    { id: 'O-', label: 'O-' },
                    { id: 'AB+', label: 'AB+' },
                    { id: 'AB-', label: 'AB-' }
                  ]}
                  placeholder="Select Blood Group"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Marital Status</label>
                <CustomSelect
                  value={formData.maritalStatus}
                  onChange={(v) => setFormData({...formData, maritalStatus: v})}
                  options={[
                    { id: 'Single', label: 'Single' },
                    { id: 'Married', label: 'Married' },
                    { id: 'Divorced', label: 'Divorced' },
                    { id: 'Widowed', label: 'Widowed' }
                  ]}
                  placeholder="Select Status"
                />
              </div>

              <Input label="Qualification" value={formData.qualification} onChange={(v) => setFormData({...formData, qualification: v})} />
              <Input label="Experience" value={formData.experience} onChange={(v) => setFormData({...formData, experience: v})} />
              <Input label="Emergency Contact" type="tel" value={formData.emergencyContact} onChange={(v) => setFormData({...formData, emergencyContact: v})} />
            </div>

            <div className="mt-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows="2"
                  className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-border bg-muted/10">
            <h3 className="text-xs font-bold text-foreground">Professional Details</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Role *</label>
                <CustomSelect
                  value={formData.role}
                  onChange={(v) => setFormData({...formData, role: v})}
                  options={[
                    { id: 'TEACHER', label: 'Teacher' },
                    { id: 'ACCOUNTANT', label: 'Accountant' },
                    { id: 'LIBRARIAN', label: 'Librarian' },
                    { id: 'RECEPTIONIST', label: 'Receptionist' },
                    { id: 'ADMIN', label: 'Admin' }
                  ]}
                  placeholder="Select Role"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Department</label>
                <CustomSelect
                  value={formData.departmentId}
                  onChange={(v) => setFormData({...formData, departmentId: v})}
                  options={departments.map(d => ({ id: d.id, label: d.name }))}
                  placeholder="Select Department"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Designation</label>
                <CustomSelect
                  value={formData.designationId}
                  onChange={(v) => setFormData({...formData, designationId: v})}
                  options={designations.map(d => ({ id: d.id, label: d.name }))}
                  placeholder="Select Designation"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate(`/staff/${id}`)} className="px-6 py-2 border border-border rounded-lg text-xs font-bold hover:bg-accent transition-all">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="flex items-center gap-2 px-8 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50">
            {submitting ? <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Save className="w-3.5 h-3.5" />}
            Update Staff
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffEdit;

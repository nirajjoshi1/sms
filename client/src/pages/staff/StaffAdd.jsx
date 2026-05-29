import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Camera, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { toast } from 'sonner';
import CustomSelect from '../../components/ui/CustomSelect';
import CustomDatePicker from '../../components/ui/CustomDatePicker';

// Move Input component outside to prevent re-creation on every render
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

const StaffAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    dob: '',
    phone: '',
    email: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
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
    const fetchSetupData = async () => {
      try {
        const [deptRes, desigRes] = await Promise.all([
          api.get('/hr/departments'),
          api.get('/hr/designations')
        ]);
        setDepartments(deptRes.data.data || []);
        setDesignations(desigRes.data.data || []);
      } catch (error) {
        toast.error('Failed to load setup data');
      }
    };
    fetchSetupData();
  }, []);

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

    setLoading(true);
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

      const response = await api.post('/staff/add', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/staff');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add staff');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/staff" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-foreground tracking-tight">Add Staff</h1>
            <p className="text-[11px] text-muted-foreground">Fill in the details to add a new staff member</p>
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
                <p className="text-[9px] text-muted-foreground mt-2 text-center">Optional</p>
              </div>

              <div className="flex-1 grid grid-cols-1 gap-4">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-[11px] font-bold text-primary mb-1">Auto-Generated Staff ID</p>
                  <p className="text-[10px] text-muted-foreground">The staff ID will be automatically assigned (e.g., STF0001, STF0002, etc.)</p>
                </div>
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

              <Input label="Qualification" value={formData.qualification} onChange={(v) => setFormData({...formData, qualification: v})} placeholder="e.g., M.Ed, B.Sc" />
              <Input label="Experience" value={formData.experience} onChange={(v) => setFormData({...formData, experience: v})} placeholder="e.g., 5 years" />
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
                  placeholder="Full address"
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
          <button type="button" onClick={() => navigate('/staff')} className="px-6 py-2 border border-border rounded-lg text-xs font-bold hover:bg-accent transition-all">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50">
            {loading ? <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Save className="w-3.5 h-3.5" />}
            Save Staff
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffAdd;

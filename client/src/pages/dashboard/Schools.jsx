import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

// Sub-components
import SchoolStats from '../../components/schools/SchoolStats';
import SchoolTable from '../../components/schools/SchoolTable';
import AddSchoolModal from '../../components/schools/AddSchoolModal';

const Schools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    schoolName: '',
    schoolEmail: '',
    schoolAddress: '',
    schoolPhone: '',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });

  const fetchSchools = async () => {
    try {
      const res = await api.get('/schools');
      setSchools(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch schools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateCredentials = () => {
    if (!formData.schoolName) {
      toast.error('Please enter school name first');
      return;
    }
    const slug = formData.schoolName.toLowerCase().replace(/\s+/g, '.');
    const randomPass = Math.random().toString(36).slice(-8);
    setFormData({
      ...formData,
      adminEmail: `admin@${slug}.edu`,
      adminPassword: randomPass
    });
    toast.success('Generated credentials');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/schools', formData);
      toast.success('School and Admin created successfully');
      setIsModalOpen(false);
      setFormData({
        schoolName: '',
        schoolEmail: '',
        schoolAddress: '',
        schoolPhone: '',
        adminName: '',
        adminEmail: '',
        adminPassword: ''
      });
      fetchSchools();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create school');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/schools/${id}/toggle-status`);
      toast.success('Status updated');
      fetchSchools();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">School Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage tenant schools and their administrative accounts</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold transition shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add New School
        </button>
      </div>

      <SchoolStats schools={schools} />
      
      <SchoolTable 
        schools={schools} 
        loading={loading} 
        onToggleStatus={toggleStatus} 
      />

      <AddSchoolModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        onInputChange={handleInputChange}
        onGenerateCredentials={generateCredentials}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
};

export default Schools;

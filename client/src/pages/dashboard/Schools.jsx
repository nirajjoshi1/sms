import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Plus, Building2, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import RequirePermission from '../../components/shared/RequirePermission';
import { PERMISSIONS } from '../../constants/permissions';

// Sub-components
import SchoolStats from '../../components/schools/SchoolStats';
import SchoolTable from '../../components/schools/SchoolTable';
import AddSchoolModal from '../../components/schools/AddSchoolModal';
import SchoolRequestsPanel from '../../components/schools/SchoolRequestsPanel';

const Schools = () => {
  const [activeTab, setActiveTab] = useState('schools');
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

  // Called from SchoolRequestsPanel when an approved request is ready to create a school
  const handleApproveRequest = (prefill) => {
    setFormData({ ...formData, ...prefill });
    setActiveTab('schools');
    setIsModalOpen(true);
    toast.info('School details pre-filled from registration request. Complete and submit to create the school.');
  };

  const tabs = [
    { id: 'schools', label: 'Active Schools', icon: <Building2 className="w-4 h-4" /> },
    { id: 'requests', label: 'Registration Requests', icon: <Inbox className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">School Management</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">
            Manage tenant schools, admins, and registration requests
          </p>
        </div>
        {activeTab === 'schools' && (
          <RequirePermission permission={PERMISSIONS.PLATFORM_SCHOOLS_MANAGE}>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:opacity-90 px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition shadow-lg shadow-primary/20 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Add New School
            </button>
          </RequirePermission>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted/40 border border-border rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-card text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'schools' ? (
        <>
          <SchoolStats schools={schools} />
          <SchoolTable
            schools={schools}
            loading={loading}
            onToggleStatus={toggleStatus}
          />
        </>
      ) : (
        <SchoolRequestsPanel onApprove={handleApproveRequest} />
      )}

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

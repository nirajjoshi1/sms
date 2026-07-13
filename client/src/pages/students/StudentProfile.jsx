import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Calendar,
  MapPin,
  User,
  Users,
  Home,
  BookOpen,
  Camera,
  UserX,
  UserCheck,
  Download
} from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { useConfirm } from '../../context/ConfirmContext';
import DisableStudentModal from './DisableStudentModal';

const StudentProfile = () => {
  const confirm = useConfirm();

  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/students/${id}`);
      setStudent(response.data.data);
    } catch (error) {
      toast.error('Failed to load student details');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (student.isDisabled) {
      if (!await confirm(`Are you sure you want to enable this student?`)) return;

      try {
        setActionLoading(true);
        await api.patch(`/students/${id}/status`, {
          isDisabled: false,
          disableReasonId: null
        });
        toast.success(`Student enabled successfully`);
        fetchStudent();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update status');
      } finally {
        setActionLoading(false);
      }
    } else {
      setIsDisableModalOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!await confirm('Are you sure you want to delete this student? This action cannot be undone.')) return;

    try {
      setActionLoading(true);
      await api.delete(`/students/${id}`);
      toast.success('Student deleted successfully');
      navigate('/students');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete student');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <span className="text-sm text-muted-foreground">Loading student details...</span>
        </div>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/students"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-foreground tracking-tight">Student Profile</h1>
            <p className="text-[11px] text-muted-foreground">
              View complete information about this student
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleStatus}
            disabled={actionLoading}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
              student.isDisabled
                ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                : 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20'
            }`}
          >
            {student.isDisabled ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
            {student.isDisabled ? 'Enable' : 'Disable'}
          </button>
          <Link
            to={`/students/edit/${id}`}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-[11px] font-bold hover:opacity-90 transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="flex items-center gap-2 px-3 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-[11px] font-bold hover:bg-destructive/20 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row gap-6 -mt-16">
            {/* Photo */}
            <div className="relative">
              <div className="w-32 h-32 rounded-xl border-4 border-card bg-muted overflow-hidden shadow-lg">
                {student.photo ? (
                  <img src={student.photo} alt={student.firstName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
                    {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                  </div>
                )}
              </div>
              {student.isDisabled && (
                <div className="absolute -top-2 -right-2 bg-destructive text-white px-2 py-1 rounded-full text-[9px] font-bold">
                  DISABLED
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 pt-6">
              <h2 className="text-2xl font-bold text-foreground">
                {student.firstName} {student.middleName} {student.lastName}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {student.Class?.name} - {student.Section?.name}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Admission No</p>
                  <p className="text-sm font-bold text-foreground mt-1">{student.admissionNo}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Roll Number</p>
                  <p className="text-sm font-bold text-foreground mt-1">{student.rollNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Gender</p>
                  <p className="text-sm font-bold text-foreground mt-1">{student.gender}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Date of Birth</p>
                  <p className="text-sm font-bold text-foreground mt-1">
                    {new Date(student.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-card border border-border rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-border bg-muted/10">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Personal Information</h3>
          </div>
          <div className="p-6 space-y-4">
            <InfoRow icon={<Calendar />} label="Admission Date" value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '-'} />
            <InfoRow icon={<Phone />} label="Mobile Number" value={student.mobileNumber || '-'} />
            <InfoRow icon={<Mail />} label="Email" value={student.email || '-'} />
            <InfoRow icon={<BookOpen />} label="Category" value={student.Category?.name || '-'} />
            <InfoRow icon={<Home />} label="House" value={student.House?.name || '-'} />
            {student.enrollNumber && <InfoRow icon={<User />} label="Enroll Number" value={student.enrollNumber} />}
            {student.birthCertificate && (
              <div className="pt-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-2">Birth Certificate</p>
                <a href={student.birthCertificate} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[11px] font-bold hover:bg-primary/20 transition-all">
                  <Download className="w-3.5 h-3.5" />
                  View Document
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Guardian Information */}
        <div className="bg-card border border-border rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-border bg-muted/10">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Guardian Information</h3>
          </div>
          <div className="p-6 space-y-4">
            <InfoRow icon={<Users />} label="Guardian" value={student.guardianName} />
            <InfoRow icon={<User />} label="Relation" value={student.guardianRelation || student.guardianIs || '-'} />
            <InfoRow icon={<Phone />} label="Guardian Phone" value={student.guardianPhone} />
            <InfoRow icon={<MapPin />} label="Address" value={student.guardianAddress || '-'} />

            {student.fatherName && (
              <>
                <div className="border-t border-border pt-4 mt-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-3">Father Details</p>
                </div>
                <InfoRow icon={<User />} label="Father Name" value={student.fatherName} />
                {student.fatherPhone && <InfoRow icon={<Phone />} label="Father Phone" value={student.fatherPhone} />}
              </>
            )}

            {student.motherName && (
              <>
                <div className="border-t border-border pt-4 mt-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-3">Mother Details</p>
                </div>
                <InfoRow icon={<User />} label="Mother Name" value={student.motherName} />
                {student.motherPhone && <InfoRow icon={<Phone />} label="Mother Phone" value={student.motherPhone} />}
              </>
            )}
          </div>
        </div>
      </div>

      {student && (
        <DisableStudentModal
          isOpen={isDisableModalOpen}
          onClose={() => setIsDisableModalOpen(false)}
          student={student}
          onSuccess={fetchStudent}
        />
      )}
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
      {React.cloneElement(icon, { className: 'w-4 h-4' })}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{label}</p>
      <p className="text-sm text-foreground mt-0.5 break-words">{value}</p>
    </div>
  </div>
);

export default StudentProfile;

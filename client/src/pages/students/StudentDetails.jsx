import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  List, 
  LayoutGrid, 
  MoreVertical, 
  UserPlus, 
  FileEdit, 
  Trash2, 
  Eye,
  ArrowRight,
  FolderOpen,
  Check,
  ChevronDown,
  X,
  Phone,
  Mail,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useStudents } from '../../hooks/useStudents';
import { useAcademics } from '../../hooks/useAcademics';
import { Link } from 'react-router-dom';
import CustomSelect from '../../components/ui/CustomSelect';
import { useConfirm } from '../../context/ConfirmContext';

const StudentDetails = () => {
  const confirm = useConfirm();

  const { students, loading, fetchStudents } = useStudents();
  const { classes, sections } = useAcademics();
  
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'details'
  const [filters, setFilters] = useState({
    classId: '',
    sectionId: '',
    search: ''
  });

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSearch = () => {
    setCurrentPage(1);
    fetchStudents(filters);
  };

  const handleDelete = async (id) => {
    if (!await confirm('Are you sure you want to delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted successfully');
      fetchStudents(filters);
    } catch (err) {
      toast.error('Failed to delete student');
    }
  };

  const handleView = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  // Initial fetch
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Student Details</h1>
          <p className="text-[11px] text-muted-foreground">Manage and view detailed information about your students.</p>
        </div>
        <Link 
          to="/students/admission"
          className="flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold shadow-lg shadow-primary/10 hover:opacity-90 transition-all active:scale-95"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Admit Student
        </Link>
      </div>

      {/* Filter Section */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Class *</label>
            <CustomSelect 
              value={filters.classId}
              onChange={(val) => setFilters({...filters, classId: val})}
              options={classes.map(c => ({ id: c.id, label: c.name }))}
              placeholder="Select Class"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Section</label>
            <CustomSelect 
              value={filters.sectionId}
              onChange={(val) => setFilters({...filters, sectionId: val})}
              options={sections.map(s => ({ id: s.id, label: s.name }))}
              placeholder="Select Section"
            />
          </div>

          <div className="space-y-1.5 lg:col-span-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Search By Keyword</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Name, Roll No..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full h-9 bg-muted/30 border border-border rounded-lg pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <button 
            onClick={handleSearch}
            className="h-9 bg-foreground text-background rounded-lg px-5 font-bold text-xs hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Filter className="w-3.5 h-3.5" />
            Search
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        {/* Tabs */}
        <div className="flex border-b border-border bg-muted/10 px-2 rounded-t-xl overflow-hidden">
          <button 
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-3 text-[11px] font-bold transition-all relative ${activeTab === 'list' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <List className="w-3.5 h-3.5" />
            List View
            {activeTab === 'list' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full mx-2"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 px-4 py-3 text-[11px] font-bold transition-all relative ${activeTab === 'details' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Details View
            {activeTab === 'details' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full mx-2"></div>}
          </button>
        </div>

        {/* View Switcher */}
        <div className="p-0 text-xs">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-primary/10 border-t-primary rounded-full animate-spin"></div>
              <p className="text-[11px] font-bold text-muted-foreground">Syncing data...</p>
            </div>
          ) : students.length > 0 ? (
            activeTab === 'list' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/20 border-b border-border">
                      <th className="px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Admission</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Student</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">Roll</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Academic</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Parent</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">DOB</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Contact</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-muted/5 transition-colors group">
                        <td className="px-5 py-3 text-[11px] font-bold text-primary">{student.admissionNo}</td>
                        <td className="px-5 py-3">
                          <span className="text-[12px] font-bold text-foreground">{student.firstName} {student.lastName}</span>
                        </td>
                        <td className="px-5 py-3 text-[11px] text-center font-medium text-muted-foreground">{student.rollNumber || '--'}</td>
                        <td className="px-5 py-3 text-[11px] text-muted-foreground">
                          {student.Class?.name} • {student.Section?.name}
                        </td>
                        <td className="px-5 py-3 text-[11px] text-muted-foreground">{student.fatherName || '--'}</td>
                        <td className="px-5 py-3 text-[11px] text-muted-foreground italic">
                          {student.dob ? new Date(student.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '--'}
                        </td>
                        <td className="px-5 py-3 text-[11px] text-muted-foreground">{student.mobileNumber || '--'}</td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleView(student)} title="View" className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-primary transition-all"><Eye className="w-3.5 h-3.5" /></button>
                            <Link to={`/students/edit/${student.id}`} title="Edit" className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-all"><FileEdit className="w-3.5 h-3.5" /></Link>
                            <button onClick={() => handleDelete(student.id)} title="Delete" className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-destructive transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 bg-muted/5">
                {students.map((student) => (
                  <div key={student.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all hover:-translate-y-0.5 group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-foreground font-black text-sm border border-border overflow-hidden">
                        {student.photo ? <img src={student.photo} alt="" className="w-full h-full object-cover" /> : student.firstName.charAt(0)}
                      </div>
                      <div className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[9px] font-black uppercase tracking-tighter border border-primary/10">
                        {student.admissionNo}
                      </div>
                    </div>
                    <h4 className="text-[13px] font-bold text-foreground mb-0.5 truncate">{student.firstName} {student.lastName}</h4>
                    <p className="text-[10px] text-muted-foreground font-bold mb-3">{student.Class?.name} • {student.Section?.name}</p>
                    
                    <div className="space-y-1.5 border-t border-border pt-3 mb-3">
                      <div className="flex justify-between text-[9px]">
                        <span className="text-muted-foreground/50 font-bold uppercase tracking-tight">Parent</span>
                        <span className="text-foreground font-bold truncate ml-2">{student.fatherName || '--'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button className="flex-1 py-1.5 bg-accent hover:bg-accent/80 text-foreground text-[10px] font-bold rounded-lg transition-all">Profile</button>
                      <button className="w-7 h-7 flex items-center justify-center bg-muted hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg transition-all">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="p-16 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center">
                  <FolderOpen className="w-7 h-7 text-muted-foreground/20" />
                </div>
                <div className="max-w-[200px] space-y-1">
                  <h3 className="text-sm font-bold text-foreground">No records found</h3>
                  <p className="text-[11px] text-muted-foreground">Adjust filters or search parameters.</p>
                </div>
                <Link 
                  to="/students/admission"
                  className="flex items-center gap-1.5 text-primary text-[11px] font-bold hover:gap-2 transition-all"
                >
                  New record <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {!loading && students.length > 0 && (
            <div className="px-5 py-3 bg-muted/5 border-t border-border flex items-center justify-between">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                Showing {students.length} Students
              </p>
            </div>
          )}
        </div>

        {/* View Modal */}
        {showViewModal && selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setShowViewModal(false)}></div>
            <div className="relative bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border bg-muted/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground tracking-tight">Student Profile</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Admission No: {selectedStudent.admissionNo}</p>
                  </div>
                </div>
                <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-accent rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto hide-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left: Personal */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-1">Personal Details</h4>
                    <div className="space-y-3">
                      <DetailItem label="Full Name" value={`${selectedStudent.firstName} ${selectedStudent.lastName}`} icon={<List className="w-3 h-3" />} />
                      <DetailItem label="Gender" value={selectedStudent.gender} icon={<UserPlus className="w-3 h-3" />} />
                      <DetailItem label="Date of Birth" value={selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString() : '--'} icon={<Calendar className="w-3 h-3" />} />
                      <DetailItem label="Email" value={selectedStudent.email || 'N/A'} icon={<Mail className="w-3 h-3" />} />
                      <DetailItem label="Mobile" value={selectedStudent.mobileNumber || 'N/A'} icon={<Phone className="w-3 h-3" />} />
                    </div>
                  </div>

                  {/* Right: Academic & Guardian */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-1">Academic & Guardian</h4>
                    <div className="space-y-3">
                      <DetailItem label="Class & Section" value={`${selectedStudent.class?.name} - ${selectedStudent.section?.name}`} icon={<LayoutGrid className="w-3 h-3" />} />
                      <DetailItem label="Roll Number" value={selectedStudent.rollNumber || '--'} icon={<Check className="w-3 h-3" />} />
                      <DetailItem label="Father's Name" value={selectedStudent.fatherName || '--'} icon={<UserPlus className="w-3 h-3" />} />
                      <DetailItem label="Guardian Name" value={selectedStudent.guardianName || '--'} icon={<UserPlus className="w-3 h-3" />} />
                      <DetailItem label="Guardian Phone" value={selectedStudent.guardianPhone || '--'} icon={<Phone className="w-3 h-3" />} />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="pt-4 border-t border-border">
                  <DetailItem label="Guardian Address" value={selectedStudent.guardianAddress || 'No address provided'} icon={<MapPin className="w-3 h-3" />} fullWidth />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-muted/10 border-t border-border flex justify-end gap-3">
                <button onClick={() => setShowViewModal(false)} className="px-4 py-2 bg-accent text-foreground text-xs font-bold rounded-lg hover:bg-accent/80 transition-all">Close</button>
                <Link to={`/students/edit/${selectedStudent.id}`} className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-lg shadow-primary/10 hover:opacity-90 transition-all flex items-center gap-2">
                  <FileEdit className="w-3.5 h-3.5" /> Edit Profile
                </Link>
              </div>
            </div>
          </div>
      )}
    </div>
  );
};
const DetailItem = ({ label, value, icon, fullWidth = false }) => (
  <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''}`}>
    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
      {icon} {label}
    </span>
    <span className="text-[11px] font-bold text-foreground bg-muted/20 px-2 py-1 rounded border border-border/50">{value}</span>
  </div>
);

export default StudentDetails;

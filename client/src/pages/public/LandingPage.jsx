import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  School, 
  CheckCircle, 
  ArrowRight, 
  Layers, 
  Shield, 
  Users, 
  CreditCard, 
  Smartphone, 
  Settings, 
  BarChart, 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare,
  Code,
  Sparkles,
  Calculator,
  HelpCircle,
  ChevronDown,
  Check,
  Building,
  DollarSign,
  Calendar,
  Award,
  Zap
} from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const LandingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolCode: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    message: ''
  });

  // State for interactive dashboard preview
  const [activePreviewTab, setActivePreviewTab] = useState('overview');
  const [dashboardTheme, setDashboardTheme] = useState('indigo'); // indigo, emerald, rose

  // State for pricing calculator
  const [studentCount, setStudentCount] = useState(500);
  const [billingCycle, setBillingCycle] = useState('annual'); // monthly, annual

  // State for FAQ accordion
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/school-requests', formData);
      if (response.data?.success) {
        toast.success(response.data.message || 'Registration request submitted successfully!');
        setFormData({
          schoolName: '',
          schoolCode: '',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          address: '',
          message: ''
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit registration request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Pricing math
  const getPricingInfo = () => {
    const basePerStudent = billingCycle === 'annual' ? 0.8 : 1.0;
    const price = Math.round(studentCount * basePerStudent);
    let planName = 'Growth';
    let features = [
      'Multi-Tenant Isolation',
      'Class & Section Scheduling',
      'Student & Staff Directories',
      'Basic Fees Collection',
      'Standard PDF Reports'
    ];

    if (studentCount > 1500) {
      planName = 'Enterprise';
      features = [
        'Dedicated Scoped Database',
        'Custom Web-CMS & School Portal',
        'Advanced Payroll & HR Systems',
        'Auto-Receipts & Payment Reminders',
        'Full Audit Trail & Log Tracking',
        'Direct Cloudinary Backup Integration',
        '24/7 Priority Support'
      ];
    } else if (studentCount > 500) {
      planName = 'Professional';
      features = [
        'Everything in Growth',
        'Interactive Timetable Builder',
        'Leave Management & Payroll',
        'Offline Bank Receipt Audits',
        'Full Excel & PDF Export Tools',
        'Email Alerts & Reminders'
      ];
    }

    return { price, planName, features };
  };

  const pricing = getPricingInfo();

  // Helper mapping for theme colors in dashboard preview
  const themeColors = {
    indigo: {
      primaryBg: 'bg-indigo-600',
      primaryText: 'text-indigo-400',
      border: 'border-indigo-500/20',
      glow: 'shadow-indigo-500/20',
      hoverText: 'hover:text-indigo-400',
      btnBg: 'bg-indigo-600 hover:bg-indigo-500',
      tintBg: 'bg-indigo-950/40 text-indigo-400 border-indigo-500/20'
    },
    emerald: {
      primaryBg: 'bg-emerald-600',
      primaryText: 'text-emerald-400',
      border: 'border-emerald-500/20',
      glow: 'shadow-emerald-500/20',
      hoverText: 'hover:text-emerald-400',
      btnBg: 'bg-emerald-600 hover:bg-emerald-500',
      tintBg: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
    },
    rose: {
      primaryBg: 'bg-rose-600',
      primaryText: 'text-rose-400',
      border: 'border-rose-500/20',
      glow: 'shadow-rose-500/20',
      hoverText: 'hover:text-rose-400',
      btnBg: 'bg-rose-600 hover:bg-rose-500',
      tintBg: 'bg-rose-950/40 text-rose-400 border-rose-500/20'
    }
  }[dashboardTheme];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 selection:bg-indigo-600 selection:text-white font-sans scroll-smooth relative overflow-x-hidden">
      
      {/* SaaS Background Ambient auroras and grid */}
      <div className="absolute inset-0 bg-grid-overlay pointer-events-none opacity-50 z-0" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[150px] pointer-events-none animate-aurora-slow z-0" />
      <div className="absolute top-[30%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[150px] pointer-events-none animate-aurora-slow z-0" />
      <div className="absolute bottom-[10%] left-[20%] w-[60%] h-[40%] rounded-full bg-blue-900/10 blur-[160px] pointer-events-none z-0" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-gray-950/70 backdrop-blur-xl border-b border-gray-900/80 z-50 transition-all">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-300">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-white tracking-tight leading-none">GRADEX</span>
              <span className="text-[9px] text-gray-500 tracking-widest font-bold mt-1">SAAS PLATFORM</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-gray-400">
            <button onClick={() => scrollToSection('preview')} className="hover:text-white transition duration-200">Interactive Demo</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition duration-200">ERP Modules</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition duration-200">Calculator</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-white transition duration-200">FAQ</button>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')} 
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition duration-200 active:scale-95 shadow-md shadow-indigo-600/20"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 z-10">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/60 border border-indigo-500/25 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" /> Multi-Tenant School Infrastructure
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-[1.05]">
            Modernize your <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Academic Ecosystem</span>
          </h1>

          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Gradex is a high-performance, secure, multi-tenant ERP platform for modern institutions. Reconcile fees, orchestrate class schedules, process payroll, and generate beautiful dynamic PDF reports with complete data isolation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => scrollToSection('register')} 
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-2xl text-xs uppercase tracking-wider transition duration-200 active:scale-95 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              Request Demo Account <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => scrollToSection('preview')} 
              className="w-full sm:w-auto bg-gray-900/60 hover:bg-gray-800 border border-gray-800 text-gray-300 font-bold px-8 py-4 rounded-2xl text-xs uppercase tracking-wider transition duration-200 active:scale-95"
            >
              Interactive Demo
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Mockup Dashboard Preview */}
      <section id="preview" className="pb-24 px-6 z-10 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-10">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">white-label preview</span>
            <h2 className="text-3xl font-extrabold text-white">Experience Gradex Admin Portal</h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">Toggle branding styles below to preview white-label theme settings applied across the platform.</p>
            
            {/* Theme switcher */}
            <div className="inline-flex items-center gap-2 p-1.5 bg-gray-900 border border-gray-800 rounded-2xl mt-4">
              <button 
                onClick={() => setDashboardTheme('indigo')}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-xl transition ${dashboardTheme === 'indigo' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Indigo theme
              </button>
              <button 
                onClick={() => setDashboardTheme('emerald')}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-xl transition ${dashboardTheme === 'emerald' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Emerald theme
              </button>
              <button 
                onClick={() => setDashboardTheme('rose')}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-xl transition ${dashboardTheme === 'rose' ? 'bg-rose-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Rose theme
              </button>
            </div>
          </div>

          {/* Simulated App Shell */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl animate-float relative">
            
            {/* Window bar */}
            <div className="h-12 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-[10px] text-gray-500 font-mono ml-4 select-none">https://portal.gradexsms.edu/dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${themeColors.primaryBg} animate-pulse`} />
                <span className="text-[10px] text-gray-400 font-bold uppercase">Mock Session: 2026-27</span>
              </div>
            </div>

            {/* Main App Layout */}
            <div className="flex flex-col lg:flex-row min-h-[480px]">
              
              {/* Mock Sidebar */}
              <div className="w-full lg:w-56 bg-gray-950 border-b lg:border-b-0 lg:border-r border-gray-800 p-4 space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 mb-4 bg-gray-900/50 rounded-xl border border-gray-800">
                  <div className={`w-6 h-6 rounded-lg ${themeColors.primaryBg} flex items-center justify-center`}>
                    <School className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-white truncate">Horizon Academy</span>
                    <span className="text-[9px] text-gray-500 leading-none">Class A Tenant</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <button 
                    onClick={() => setActivePreviewTab('overview')} 
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition ${activePreviewTab === 'overview' ? `${themeColors.tintBg}` : 'text-gray-400 hover:text-white hover:bg-gray-900/40'}`}
                  >
                    <BarChart className="w-4 h-4" /> Dashboard Summary
                  </button>
                  <button 
                    onClick={() => setActivePreviewTab('fees')} 
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition ${activePreviewTab === 'fees' ? `${themeColors.tintBg}` : 'text-gray-400 hover:text-white hover:bg-gray-900/40'}`}
                  >
                    <DollarSign className="w-4 h-4" /> Fees & Receipts
                  </button>
                  <button 
                    onClick={() => setActivePreviewTab('academics')} 
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition ${activePreviewTab === 'academics' ? `${themeColors.tintBg}` : 'text-gray-400 hover:text-white hover:bg-gray-900/40'}`}
                  >
                    <Calendar className="w-4 h-4" /> Timetables
                  </button>
                  <button 
                    onClick={() => setActivePreviewTab('payroll')} 
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition ${activePreviewTab === 'payroll' ? `${themeColors.tintBg}` : 'text-gray-400 hover:text-white hover:bg-gray-900/40'}`}
                  >
                    <Users className="w-4 h-4" /> Staff & Payroll
                  </button>
                </div>
              </div>

              {/* Mock Content Area */}
              <div className="flex-1 p-6 bg-gray-900/50">
                {activePreviewTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-bold text-white">Dashboard Overview</h3>
                        <p className="text-[10px] text-gray-500">Live operational data for current session.</p>
                      </div>
                      <span className={`text-[10px] font-bold ${themeColors.primaryText} uppercase tracking-wider bg-gray-950 border ${themeColors.border} px-2.5 py-1 rounded-full`}>
                        Admin Portal
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-950 border border-gray-800 p-4 rounded-2xl">
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Students</span>
                        <div className="text-lg font-black text-white mt-1">1,248</div>
                        <span className="text-[8px] text-green-400 font-bold mt-1 inline-block">↑ 12% vs last term</span>
                      </div>
                      <div className="bg-gray-950 border border-gray-800 p-4 rounded-2xl">
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Staff</span>
                        <div className="text-lg font-black text-white mt-1">84</div>
                        <span className="text-[8px] text-gray-500 mt-1 inline-block">Full-time faculty</span>
                      </div>
                      <div className="bg-gray-950 border border-gray-800 p-4 rounded-2xl">
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Term Collection</span>
                        <div className="text-lg font-black text-white mt-1">$48,250</div>
                        <span className="text-[8px] text-green-400 font-bold mt-1 inline-block">92% paid rate</span>
                      </div>
                      <div className="bg-gray-950 border border-gray-800 p-4 rounded-2xl">
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Average Grade</span>
                        <div className="text-lg font-black text-white mt-1">B+</div>
                        <span className="text-[8px] text-indigo-400 font-bold mt-1 inline-block">Based on 12 exams</span>
                      </div>
                    </div>

                    {/* Quick Activity Table */}
                    <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4">
                      <div className="text-[11px] font-bold text-white mb-3">Recent System Events</div>
                      <div className="space-y-3.5 text-[10px]">
                        <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                          <span className="text-gray-400">Class 10-A Timetable Modified</span>
                          <span className="text-gray-600">2 mins ago</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                          <span className="text-gray-400">Offline Bank Payment Confirmed ($320)</span>
                          <span className="text-green-400 font-bold">Success</span>
                        </div>
                        <div className="flex justify-between items-center pb-1">
                          <span className="text-gray-400">Leave request submitted by Teacher Jane Smith</span>
                          <span className="text-yellow-500">Pending Review</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'fees' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-white">Fees Collection Roster</h3>
                      <p className="text-[10px] text-gray-500">Easily search fees groups, manage discounts, and issue invoices.</p>
                    </div>

                    {/* Fee list */}
                    <div className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden text-[10px]">
                      <table className="w-full text-left">
                        <thead className="bg-gray-900/60 text-gray-500 uppercase font-bold text-[9px] border-b border-gray-800">
                          <tr>
                            <th className="p-3">Student Name</th>
                            <th className="p-3">Class</th>
                            <th className="p-3">Fee Type</th>
                            <th className="p-3">Due Date</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-900 text-gray-300 font-semibold">
                          <tr>
                            <td className="p-3 text-white">Alexander Carter</td>
                            <td className="p-3">Class 8-A</td>
                            <td className="p-3">Admission Fee</td>
                            <td className="p-3">15 Jul 2026</td>
                            <td className="p-3">$250.00</td>
                            <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[8px]">Paid</span></td>
                          </tr>
                          <tr>
                            <td className="p-3 text-white">Olivia Bennett</td>
                            <td className="p-3">Class 10-B</td>
                            <td className="p-3">Monthly Tuition</td>
                            <td className="p-3">05 Jul 2026</td>
                            <td className="p-3">$120.00</td>
                            <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[8px]">Overdue</span></td>
                          </tr>
                          <tr>
                            <td className="p-3 text-white">Ethan Davis</td>
                            <td className="p-3">Class 12-C</td>
                            <td className="p-3">Exam Fee</td>
                            <td className="p-3">20 Jul 2026</td>
                            <td className="p-3">$80.00</td>
                            <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[8px]">Partial</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1 bg-gray-950 border border-gray-800 p-4 rounded-2xl flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-gray-500">Auto Reminders</div>
                          <div className="text-xs font-bold text-white mt-1">Remind parents via email automatically</div>
                        </div>
                        <span className={`w-8 h-8 rounded-lg ${themeColors.primaryBg}/20 flex items-center justify-center ${themeColors.primaryText}`}><Mail className="w-4 h-4" /></span>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'academics' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-white">Interactive Timetable Builder</h3>
                      <p className="text-[10px] text-gray-500">Schedule subjects, rooms, and assignments cleanly.</p>
                    </div>

                    <div className="grid grid-cols-5 gap-2.5">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, dIdx) => (
                        <div key={day} className="bg-gray-950 border border-gray-800 rounded-2xl p-2.5 text-center space-y-2">
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{day}</span>
                          <div className={`p-1.5 rounded-lg text-[9px] font-bold truncate ${dIdx === 1 ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'bg-gray-900 text-gray-400'}`}>
                            {dIdx % 2 === 0 ? 'Math (Sci)' : 'English (Lit)'}
                          </div>
                          <div className="p-1.5 rounded-lg bg-gray-900 text-[9px] font-bold text-gray-400 truncate">
                            {dIdx % 3 === 0 ? 'Physics' : 'Chemistry'}
                          </div>
                          <div className="p-1.5 rounded-lg bg-gray-900 text-[9px] font-bold text-gray-400 truncate">
                            History
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activePreviewTab === 'payroll' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-white">Staff Salaries & Payroll</h3>
                      <p className="text-[10px] text-gray-500">Calculate net pay, track attendance, and generate salary slips instantly.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-gray-950 border border-gray-800 p-4 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/15 flex items-center justify-center text-xs font-bold text-indigo-400">JS</div>
                          <div>
                            <div className="text-xs font-bold text-white">Jane Smith (Head of Mathematics)</div>
                            <div className="text-[9px] text-gray-500">Basic: $3,200.00 | Attendance: 98%</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-green-400">$3,200.00 Net</div>
                          <span className="text-[8px] text-gray-600 font-bold uppercase">Disbursed</span>
                        </div>
                      </div>

                      <div className="bg-gray-950 border border-gray-800 p-4 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-xs font-bold text-emerald-400">MD</div>
                          <div>
                            <div className="text-xs font-bold text-white">Marcus Davis (History Dept)</div>
                            <div className="text-[9px] text-gray-500">Basic: $2,800.00 | Attendance: 95%</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-green-400">$2,750.00 Net</div>
                          <span className="text-[8px] text-gray-600 font-bold uppercase">Disbursed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main SaaS Value Propositions */}
      <section id="value" className="py-16 border-y border-gray-900 bg-gray-900/20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex gap-4">
            <span className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0"><Shield className="w-5 h-5" /></span>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white">Advanced Tenant Isolation</h3>
              <p className="text-xs text-gray-400 leading-relaxed">No data leaks. Custom schemas, row-level middleware, and separate storage credentials protect your school's private record directories.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0"><Zap className="w-5 h-5" /></span>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white">Sub-Second Operations</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Built on Node.js 20 Express and Prisma. Complex financial aggregation, due calculations, and audit log lookups execute instantly.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0"><Award className="w-5 h-5" /></span>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white">Premium UI/UX System</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Aesthetic interface built on Tailwind. Compact data views, beautiful analytics layouts, and high accessibility standards on mobile devices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features ERP Modules Section */}
      <section id="features" className="py-24 z-10 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">full erp suite</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Robust School Administration Suite</h2>
            <p className="text-xs text-gray-500 max-w-xl mx-auto">No generic cards. We provide the complete set of modules required to run your institution digitially and efficiently.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-900/40 border border-gray-800/80 p-8 rounded-3xl hover:border-indigo-500/30 transition duration-300 group hover:shadow-[0_0_20px_rgba(99,102,241,0.08)]">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-105 transition duration-300">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Student & Admissions</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Collect extensive records: student photos, dynamic categories, parent files, house rosters, and disable/enable controls with audit tags.</p>
            </div>

            <div className="bg-gray-900/40 border border-gray-800/80 p-8 rounded-3xl hover:border-indigo-500/30 transition duration-300 group hover:shadow-[0_0_20px_rgba(99,102,241,0.08)]">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-105 transition duration-300">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Flexible Fees Master</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Map custom fees groups to classes. Manage offline bank validations, calculate term discounts, and emit automated due notifications.</p>
            </div>

            <div className="bg-gray-900/40 border border-gray-800/80 p-8 rounded-3xl hover:border-indigo-500/30 transition duration-300 group hover:shadow-[0_0_20px_rgba(99,102,241,0.08)]">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-105 transition duration-300">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Academics & Timetables</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Drag-and-drop schedule builders, assigning class teachers, setting core subject groups, and bulk promoting cohorts to next sessions.</p>
            </div>

            <div className="bg-gray-900/40 border border-gray-800/80 p-8 rounded-3xl hover:border-indigo-500/30 transition duration-300 group hover:shadow-[0_0_20px_rgba(99,102,241,0.08)]">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-105 transition duration-300">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">HR, Attendance & Leave</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Track daily staff punches, designate departments, evaluate teachers via rating portals, and approve multi-level leave queries.</p>
            </div>

            <div className="bg-gray-900/40 border border-gray-800/80 p-8 rounded-3xl hover:border-indigo-500/30 transition duration-300 group hover:shadow-[0_0_20px_rgba(99,102,241,0.08)]">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-105 transition duration-300">
                <BarChart className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Audit Trails & Analytics</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Every administrative insert, update, or delete is tracked in the Audit Log. Export tabular report data directly to Excel and PDF formats.</p>
            </div>

            <div className="bg-gray-900/40 border border-gray-800/80 p-8 rounded-3xl hover:border-indigo-500/30 transition duration-300 group hover:shadow-[0_0_20px_rgba(99,102,241,0.08)]">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-105 transition duration-300">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Certificates & ID Cards</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Construct custom student or staff ID templates. Generate printable sheets using canvas snapshots and HTML-to-PDF drivers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Calculator Section */}
      <section id="pricing" className="py-24 border-t border-gray-900 bg-gray-900/10 relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">flexible billing calculator</span>
            <h2 className="text-3xl font-extrabold text-white">Clear, Transparent Pricing</h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">Select your billing cycle and adjust the slider to see how your subscription scales with your student capacity.</p>
            
            {/* Toggle Billing */}
            <div className="inline-flex items-center gap-2 bg-gray-950 border border-gray-800 p-1.5 rounded-2xl mt-4">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-xl transition ${billingCycle === 'monthly' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Monthly billing
              </button>
              <button 
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-xl transition flex items-center gap-1.5 ${billingCycle === 'annual' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Annual billing <span className="bg-green-500/20 text-green-400 text-[8px] px-1.5 py-0.5 rounded-full">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center bg-gray-900/40 border border-gray-800/80 p-8 md:p-12 rounded-3xl">
            {/* Slider Column */}
            <div className="lg:col-span-3 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-400" /> Estimate Your Setup
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
                  <span>Student Capacity</span>
                  <span className="text-white text-sm font-black">{studentCount} Students</span>
                </div>
                
                <input 
                  type="range" 
                  min="100" 
                  max="5000" 
                  step="50"
                  value={studentCount} 
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                
                <div className="flex justify-between text-[10px] text-gray-600 font-bold">
                  <span>100 Students</span>
                  <span>2,500 Students</span>
                  <span>5,000 Students</span>
                </div>
              </div>

              <div className="border-t border-gray-850 pt-6 space-y-3">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Included in Plan:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {pricing.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-400">
                      <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Card Column */}
            <div className="lg:col-span-2 bg-gray-950 border border-gray-800 p-8 rounded-2xl text-center space-y-6">
              <div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-950/40 border border-indigo-500/25 px-3 py-1 rounded-full">
                  {pricing.planName} Plan
                </span>
                <div className="text-4xl font-black text-white mt-6">${pricing.price}</div>
                <span className="text-[10px] text-gray-500 block mt-1">per month, billed {billingCycle === 'annual' ? 'annually' : 'monthly'}</span>
              </div>

              <button 
                onClick={() => scrollToSection('register')} 
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition active:scale-95 shadow-md shadow-indigo-600/20"
              >
                Deploy This Setup
              </button>

              <span className="text-[10px] text-gray-500 block leading-tight">No setup costs. Sandbox setup takes less than 24 hours. Cancel or upgrade anytime.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 z-10 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">customer success</span>
            <h2 className="text-3xl font-extrabold text-white">Partnering with Leading Academies</h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">See how academic administrators streamline operations using Gradex multi-tenant dashboards.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-900/40 border border-gray-850 p-8 rounded-3xl space-y-6 relative hover:border-indigo-500/20 transition duration-300">
              <span className="text-5xl text-indigo-500/10 font-serif absolute top-4 left-4 select-none">“</span>
              <p className="text-gray-300 text-xs leading-relaxed italic relative z-10">
                Gradex transformed our operations. Having isolated sessions and separate fees calculators for our primary and secondary branches on one system has saved our accountants over 20 hours of manual reconciliation every single week.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600/10 flex items-center justify-center text-xs font-bold text-indigo-400">AA</div>
                <div>
                  <h4 className="text-xs font-bold text-white">Dr. Arthur Pendelton</h4>
                  <p className="text-[9px] text-gray-500">Director, Apex Science Academy</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/40 border border-gray-850 p-8 rounded-3xl space-y-6 relative hover:border-indigo-500/20 transition duration-300">
              <span className="text-5xl text-indigo-500/10 font-serif absolute top-4 left-4 select-none">“</span>
              <p className="text-gray-300 text-xs leading-relaxed italic relative z-10">
                The billing transparency and audit log tracking gives us high confidence. In past ERPs, logs were messy, but Gradex scopes every query by our current session name, making audits simple. Very fast client UI.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600/10 flex items-center justify-center text-xs font-bold text-indigo-400">ER</div>
                <div>
                  <h4 className="text-xs font-bold text-white">Elena Rostova</h4>
                  <p className="text-[9px] text-gray-500">Chief Accountant, Saint Jude High School</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-t border-gray-900 bg-gray-900/10 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">frequently asked queries</span>
            <h2 className="text-3xl font-extrabold text-white">Got Questions?</h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">Here are quick responses to common queries about tenant provisioning, setup, and billing cycles.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What is Multi-Tenant isolation and how does it protect my data?",
                a: "Gradex implements database scoping utilizing a PostgreSQL pool adapter combined with Prisma middleware. Every query executed on the backend is automatically bound to your unique school ID. This guarantees that no other school can inspect, mutate, or access your staff or student database records."
              },
              {
                q: "How long does it take to provision a new school tenant?",
                a: "Once you submit a registration request, our Super Administrator reviews your details. Standard setups are provisioned with an initial admin user in less than 24 hours, and credentials are emailed directly to you."
              },
              {
                q: "Can we migrate our current student directory from spreadsheets?",
                a: "Yes! Gradex supports full student directory Excel uploads. During your boarding phase, our support team will help you format and upload your CSV/XLSX assets directly into your tenant database."
              },
              {
                q: "Is there an offline bank receipt verification path for fees?",
                a: "Absolutely. Accountants can upload offline bank transaction receipts, mark them as pending verification, and reconcile them later once standard bank statements are audited."
              }
            ].map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-gray-900/40 border border-gray-850 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${openFaqIndex === idx ? 'transform rotate-180 text-white' : ''}`} />
                </button>
                
                {/* FAQ Answer with smooth transition */}
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaqIndex === idx ? 'max-h-40 border-t border-gray-850/60' : 'max-h-0'}`}
                >
                  <p className="p-6 text-xs text-gray-400 leading-relaxed font-medium">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upgraded Request Form Section */}
      <section id="register" className="py-24 border-t border-gray-900 relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Info Side */}
            <div className="lg:col-span-2 space-y-6">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">provision setup</span>
              <h2 className="text-3xl font-extrabold text-white">Deploy a Dedicated School Tenant</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Submit this secure form to request registration for your school in the Gradex system. Our Super Administrator will evaluate your credentials and email you your unique sandbox credentials within 24 hours.
              </p>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4 text-gray-400 text-xs font-semibold">
                  <div className="w-8 h-8 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-indigo-400"><Mail className="w-4 h-4" /></div>
                  support@gradexsms.edu
                </div>
                <div className="flex items-center gap-4 text-gray-400 text-xs font-semibold">
                  <div className="w-8 h-8 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-indigo-400"><Phone className="w-4 h-4" /></div>
                  +1 (555) 019-2834
                </div>
                <div className="flex items-center gap-4 text-gray-400 text-xs font-semibold">
                  <div className="w-8 h-8 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-indigo-400"><MapPin className="w-4 h-4" /></div>
                  Gradex Global Campus, Suite 404
                </div>
              </div>
            </div>

            {/* Form Side */}
            <div className="lg:col-span-3">
              <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-8 shadow-2xl relative">
                <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-850 pb-4">
                  <School className="w-4 h-4 text-indigo-400" /> Request Tenant Credentials
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* School Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">School Name *</label>
                      <input 
                        type="text" 
                        name="schoolName"
                        required
                        value={formData.schoolName}
                        onChange={handleInputChange}
                        placeholder="e.g. Horizon International"
                        className="w-full bg-gray-950 border border-gray-800 text-white placeholder-gray-700 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* School Code */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        Proposed Code * 
                        <span className="text-[9px] text-gray-600 lowercase font-medium">(e.g., HORIZON)</span>
                      </label>
                      <input 
                        type="text" 
                        name="schoolCode"
                        required
                        value={formData.schoolCode}
                        onChange={handleInputChange}
                        placeholder="e.g. HORIZON"
                        className="w-full bg-gray-950 border border-gray-800 text-white placeholder-gray-700 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Contact Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Contact Name *</label>
                      <input 
                        type="text" 
                        name="contactName"
                        required
                        value={formData.contactName}
                        onChange={handleInputChange}
                        placeholder="e.g. Jane Doe"
                        className="w-full bg-gray-950 border border-gray-800 text-white placeholder-gray-700 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* Contact Email */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Contact Email *</label>
                      <input 
                        type="email" 
                        name="contactEmail"
                        required
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        placeholder="e.g. jane@school.edu"
                        className="w-full bg-gray-950 border border-gray-800 text-white placeholder-gray-700 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* Contact Phone */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Contact Phone *</label>
                      <input 
                        type="tel" 
                        name="contactPhone"
                        required
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        placeholder="e.g. +1 555-0100"
                        className="w-full bg-gray-950 border border-gray-800 text-white placeholder-gray-700 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  {/* School Address */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">School Address</label>
                    <input 
                      type="text" 
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="e.g. 123 Main St, New York, NY"
                      className="w-full bg-gray-950 border border-gray-800 text-white placeholder-gray-700 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Additional Notes</label>
                    <textarea 
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Specify requested modules or features..."
                      className="w-full bg-gray-950 border border-gray-800 text-white placeholder-gray-700 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                    />
                  </div>

                  {/* Submit button */}
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs transition active:scale-95 shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      'Submitting Request...'
                    ) : (
                      <>
                        Submit Request <CheckCircle className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-12 border-t border-gray-900 text-center text-xs text-gray-600 space-y-4 relative z-10">
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-black text-white tracking-tight">GRADEX SMS</span>
        </div>
        <p>© {new Date().getFullYear()} Gradex School Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

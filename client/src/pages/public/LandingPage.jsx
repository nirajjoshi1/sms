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
  Code
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

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 selection:bg-indigo-600 selection:text-white font-sans scroll-smooth">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/60 z-50 transition-all">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">Gradex SMS</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-400">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition">Features</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-white transition">About</button>
            <button onClick={() => scrollToSection('register')} className="hover:text-white transition">Register School</button>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')} 
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition active:scale-95 shadow-lg shadow-indigo-600/20"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        {/* Glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider animate-pulse">
            <School className="w-3.5 h-3.5" /> Multi-Tenant School Infrastructure
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight md:leading-none">
            Modernize your <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Academic Ecosystem</span>
          </h1>

          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Gradex is the ultimate all-in-one software platform for schools. Complete multi-tenant isolation, beautiful data-dense white-labeled branding, class timetables, fee collection, payroll systems, and advanced analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => scrollToSection('register')} 
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-2xl text-sm uppercase tracking-wider transition active:scale-95 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => scrollToSection('features')} 
              className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 font-bold px-8 py-4 rounded-2xl text-sm uppercase tracking-wider transition active:scale-95"
            >
              Explore Features
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 border-t border-gray-900 bg-gray-950/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Powerful Features For Modern Education</h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">Gradex covers every administrative aspect of modern schools with stunning UI design and isolated secure tenancies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-900/60 border border-gray-800/80 p-8 rounded-3xl hover:border-indigo-500/50 transition duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition duration-300">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Isolated Multi-Tenancy</h3>
              <p className="text-gray-400 text-xs leading-relaxed">Each school enjoys full database scoping, dedicated academic sessions, custom class setups, and independent staff rosters.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-900/60 border border-gray-800/80 p-8 rounded-3xl hover:border-indigo-500/50 transition duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition duration-300">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Academics & Timetables</h3>
              <p className="text-gray-400 text-xs leading-relaxed">Fully interactive class scheduler, subject allocation, smart class teacher assignments, and responsive exam marks management.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-900/60 border border-gray-800/80 p-8 rounded-3xl hover:border-indigo-500/50 transition duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition duration-300">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Finances & Fees</h3>
              <p className="text-gray-400 text-xs leading-relaxed">Configurable fee masters, fee groups, types, smart custom discount structures, offline bank payments, and complete income/expense audits.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-900/60 border border-gray-800/80 p-8 rounded-3xl hover:border-indigo-500/50 transition duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition duration-300">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">HR & Smart Payroll</h3>
              <p className="text-gray-400 text-xs leading-relaxed">Manage detailed employee directory records, designation scales, leave requests, leave balances, and one-click dynamic payroll generation.</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-900/60 border border-gray-800/80 p-8 rounded-3xl hover:border-indigo-500/50 transition duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition duration-300">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Dedicated Portals</h3>
              <p className="text-gray-400 text-xs leading-relaxed">Tailored, sleek layouts for Super Admins, School Administrators, and Teachers to ensure a highly responsive task-focused workflow.</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-900/60 border border-gray-800/80 p-8 rounded-3xl hover:border-indigo-500/50 transition duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition duration-300">
                <BarChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Data-Dense Analytics</h3>
              <p className="text-gray-400 text-xs leading-relaxed">Robust charting for admissions, student distributions, detailed attendance graphs, and granular white-labeling preferences.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Request Form Section */}
      <section id="register" className="py-24 border-t border-gray-900 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Info Side */}
            <div className="lg:col-span-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                Registration Form
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Register Your School Today</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Submit this secure form to request registration for your school in the Gradex system. Our Super Administrator will evaluate your request and set up your portal within 24 hours.
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
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl relative">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <School className="w-5 h-5 text-indigo-400" /> Institution Details
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* School Name */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">School Name *</label>
                      <input 
                        type="text" 
                        name="schoolName"
                        required
                        value={formData.schoolName}
                        onChange={handleInputChange}
                        placeholder="e.g. Horizon International"
                        className="w-full bg-gray-950 border border-gray-800 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* School Code */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        Proposed Code * 
                        <span className="text-[10px] text-gray-600 lowercase font-medium">(e.g., HORIZON)</span>
                      </label>
                      <input 
                        type="text" 
                        name="schoolCode"
                        required
                        value={formData.schoolCode}
                        onChange={handleInputChange}
                        placeholder="e.g. HORIZON"
                        className="w-full bg-gray-950 border border-gray-800 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Contact Name */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Contact Name *</label>
                      <input 
                        type="text" 
                        name="contactName"
                        required
                        value={formData.contactName}
                        onChange={handleInputChange}
                        placeholder="e.g. Jane Doe"
                        className="w-full bg-gray-950 border border-gray-800 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* Contact Email */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Contact Email *</label>
                      <input 
                        type="email" 
                        name="contactEmail"
                        required
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        placeholder="e.g. jane@school.edu"
                        className="w-full bg-gray-950 border border-gray-800 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* Contact Phone */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Contact Phone *</label>
                      <input 
                        type="tel" 
                        name="contactPhone"
                        required
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        placeholder="e.g. +1 555-0100"
                        className="w-full bg-gray-950 border border-gray-800 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  {/* School Address */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">School Address</label>
                    <input 
                      type="text" 
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="e.g. 123 Main St, New York, NY"
                      className="w-full bg-gray-950 border border-gray-800 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Additional Message</label>
                    <textarea 
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Specify requested modules or features..."
                      className="w-full bg-gray-950 border border-gray-800 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                    />
                  </div>

                  {/* Submit button */}
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs transition active:scale-95 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 mt-2"
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
      <footer className="bg-gray-950 py-12 border-t border-gray-900 text-center text-xs text-gray-600 space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-black text-white tracking-tight">Gradex SMS</span>
        </div>
        <p>© {new Date().getFullYear()} Gradex School Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

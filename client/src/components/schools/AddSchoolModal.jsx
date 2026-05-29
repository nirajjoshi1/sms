import React from 'react';
import { Building2, ShieldCheck, ShieldAlert, Loader2, XCircle } from 'lucide-react';

const AddSchoolModal = ({ 
  isOpen, 
  onClose, 
  formData, 
  onInputChange, 
  onGenerateCredentials, 
  onSubmit, 
  submitting 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-600 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Register New School
          </h2>
          <button onClick={onClose} className="hover:bg-white/10 p-1.5 rounded-lg transition">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* School Info Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              School Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">School Name</label>
                <input 
                  required
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" 
                  placeholder="e.g. Green Valley Academy"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">School Email</label>
                <input 
                  type="email"
                  name="schoolEmail"
                  value={formData.schoolEmail}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" 
                  placeholder="info@school.edu"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <input 
                  name="schoolPhone"
                  value={formData.schoolPhone}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" 
                  placeholder="+91..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Address</label>
                <input 
                  name="schoolAddress"
                  value={formData.schoolAddress}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" 
                  placeholder="City, State"
                />
              </div>
            </div>
          </div>

          {/* Admin Info Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Admin Account (Generated)
              </h3>
              <button 
                type="button"
                onClick={onGenerateCredentials}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
              >
                Auto-Generate
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Admin Name</label>
                <input 
                  required
                  name="adminName"
                  value={formData.adminName}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" 
                  placeholder="Full Name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Admin Login Email</label>
                <input 
                  required
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none transition" 
                  placeholder="admin@slug.edu"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Login Password</label>
                <input 
                  required
                  type="text"
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" 
                  placeholder="••••••••"
                />
              </div>
            </div>
            <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg flex items-start gap-2 italic">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Note: The generated email and password will be used by the school to access their portal.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register School'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSchoolModal;

import React from 'react';
import { 
  Search, 
  MapPin, 
  Mail, 
  Phone, 
  User, 
  XCircle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

const SchoolTable = ({ schools, loading, onToggleStatus }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-50 flex items-center gap-4 bg-gray-50/50">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search schools..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">School Details</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Admin Account</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                  <p className="text-gray-500 mt-2">Loading schools...</p>
                </td>
              </tr>
            ) : schools.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No schools registered yet.
                </td>
              </tr>
            ) : (
              schools.map((school) => (
                <tr key={school.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
                        {school.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{school.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {school.address || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 truncate max-w-[200px]">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {school.email || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {school.phone || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {school.admins[0] ? (
                      <div>
                        <div className="flex items-center gap-2 font-medium text-gray-900">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {school.admins[0].name}
                        </div>
                        <div className="text-xs text-indigo-600 mt-0.5">{school.admins[0].email}</div>
                      </div>
                    ) : (
                      <span className="text-amber-500 text-xs italic">No admin assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      school.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {school.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onToggleStatus(school.id)}
                      className={`p-2 rounded-lg transition ${
                        school.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {school.isActive ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SchoolTable;

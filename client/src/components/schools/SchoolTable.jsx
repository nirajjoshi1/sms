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
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-4 bg-muted/20">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search schools..."
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:border-primary/55 outline-none transition text-foreground placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-muted/10 text-muted-foreground text-[10px] uppercase font-bold tracking-widest border-b border-border">
            <tr>
              <th className="px-6 py-4">School Details</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Admin Account</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  <p className="text-muted-foreground text-xs mt-2 font-bold uppercase tracking-widest">Loading schools...</p>
                </td>
              </tr>
            ) : schools.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground font-bold">
                  No schools registered yet.
                </td>
              </tr>
            ) : (
              schools.map((school) => (
                <tr key={school.id} className="hover:bg-muted/5 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center text-primary font-black">
                        {school.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{school.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {school.address || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <div className="space-y-1 text-xs font-medium">
                      <div className="flex items-center gap-2 truncate max-w-[200px]">
                        <Mail className="w-3.5 h-3.5" />
                        {school.email || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5" />
                        {school.phone || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {school.User && school.User.length > 0 ? (
                      <div>
                        <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          {school.User[0].name}
                        </div>
                        <div className="text-[10px] text-primary font-bold uppercase tracking-wider mt-0.5">{school.User[0].email}</div>
                      </div>
                    ) : (
                      <span className="text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">No admin assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      school.isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {school.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onToggleStatus(school.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        school.isActive ? 'text-red-500 hover:bg-red-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'
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

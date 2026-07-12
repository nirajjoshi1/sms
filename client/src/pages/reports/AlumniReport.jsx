import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';
import { Users } from 'lucide-react';

const AlumniReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/alumni');
      setData(response.data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch alumni report'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-black text-foreground tracking-tight">Alumni & Graduated Students Registry</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Historical Students Archive</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-accent/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="p-3">Admission No</th>
                <th className="p-3">Name</th>
                <th className="p-3">Last Class</th>
                <th className="p-3">Gender</th>
                <th className="p-3">Mobile</th>
                <th className="p-3">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-muted-foreground">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-muted-foreground">
                    No alumni records found.
                  </td>
                </tr>
              ) : (
                data.map((student) => (
                  <tr key={student.id} className="hover:bg-accent/20 transition-all">
                    <td className="p-3 font-semibold text-primary">{student.admissionNo}</td>
                    <td className="p-3 font-medium">{student.firstName} {student.lastName || ''}</td>
                    <td className="p-3">{student.Class?.name} - {student.Section?.name}</td>
                    <td className="p-3 capitalize">{student.gender}</td>
                    <td className="p-3">{student.mobileNumber || 'N/A'}</td>
                    <td className="p-3">{student.email || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AlumniReport;

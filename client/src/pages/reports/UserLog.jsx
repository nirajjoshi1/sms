import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';
import { Key, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const UserLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/user-logs', {
        params: { page, limit: 20, search }
      });
      setLogs(response.data.data || []);
      const total = response.data.pagination?.total || 1;
      setTotalPages(Math.ceil(total / 20));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch user logs'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-3">
        <div>
          <h1 className="text-xl font-black text-foreground tracking-tight">User Login Session Log</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Login Audits & Session Activity logs</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search user email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 pr-3 border border-border rounded-lg text-xs bg-card text-foreground w-64"
            />
          </div>
          <button type="submit" className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold">
            Search
          </button>
        </form>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-accent/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="p-3">Session Date</th>
                <th className="p-3">User Account</th>
                <th className="p-3">Session Action</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-muted-foreground">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-muted-foreground">
                    No login log records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-accent/20 transition-all">
                    <td className="p-3 text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-3 font-semibold">{log.userEmail}</td>
                    <td className="p-3 font-bold text-foreground capitalize">{log.action.replace('_', ' ').toLowerCase()}</td>
                    <td className="p-3">{log.ipAddress || 'N/A'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 font-bold rounded text-[9px] uppercase tracking-wider ${log.status === 'SUCCESS' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border p-3">
            <span className="text-[10px] text-muted-foreground">Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1 border border-border rounded hover:bg-accent disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1 border border-border rounded hover:bg-accent disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLog;

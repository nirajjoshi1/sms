import React, { useState, useEffect } from 'react';
import { Download, Database, Trash2, Calendar, FileArchive } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { useConfirm } from '../../context/ConfirmContext';

const BackupSetting = () => {
  const confirm = useConfirm();

  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings/backups');
      setBackups(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch backups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    if (!await confirm('Are you sure you want to create a database backup?')) return;

    try {
      setCreating(true);
      const response = await api.post('/settings/backups/create');
      toast.success('Backup created successfully');
      fetchBackups();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create backup');
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadBackup = async (id, filename) => {
    try {
      const response = await api.get(`/settings/backups/${id}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Backup downloaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download backup');
    }
  };

  const handleDeleteBackup = async (id) => {
    if (!await confirm('Are you sure you want to delete this backup?')) return;

    try {
      await api.delete(`/settings/backups/${id}`);
      toast.success('Backup deleted successfully');
      fetchBackups();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete backup');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Backup & Restore</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">
            Manage database backups
          </p>
        </div>
        <button
          onClick={handleCreateBackup}
          disabled={creating}
          className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 transition-all flex items-center gap-2 w-fit disabled:opacity-50"
        >
          <Database className="w-3 h-3" />
          {creating ? 'Creating...' : 'Create Backup'}
        </button>
      </div>

      {/* Warning Notice */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FileArchive className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold text-yellow-600 mb-1">Important Information</h3>
            <ul className="text-[10px] text-yellow-600/90 space-y-1">
              <li>Backups include database records exported as JSON</li>
              <li>Download and store backups externally</li>
              <li>Automatic restore is disabled to protect production data</li>
              <li>Use a verified manual restore process for production incidents</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Backups List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-3 py-2 border-b border-border bg-muted/10 flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Available Backups</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Loading...</span>
            </div>
          </div>
        ) : backups.length === 0 ? (
          <div className="p-12 text-center">
            <Database className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No backups found</p>
            <p className="text-[10px] text-muted-foreground mt-1">Create your first backup to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/5 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Filename
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Created Date
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    File Size
                  </th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileArchive className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">{backup.filename}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(backup.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(backup.fileSize || 0)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDownloadBackup(backup.id, backup.filename)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(backup.id)}
                          className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Backup Schedule Info */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/10">
          <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Automatic Backup Schedule</h3>
        </div>
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-3">
            Configure automatic backup schedule to ensure data safety.
          </p>
          <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
            <input
              type="checkbox"
              id="autoBackup"
              className="w-4 h-4 rounded border-border"
              disabled
            />
            <label htmlFor="autoBackup" className="text-xs font-medium text-foreground flex-1">
              Enable Daily Automatic Backups (coming soon)
            </label>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 ml-6">
            Automatic scheduling needs a background worker or database provider backup schedule.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackupSetting;

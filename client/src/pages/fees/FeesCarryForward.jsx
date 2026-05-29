import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';

const FeesCarryForward = () => {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [formData, setFormData] = useState({
    fromSessionId: '',
    toSessionId: '',
    classId: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const classesRes = await api.get('/academics/classes');
      setClasses(classesRes.data.data || []);

      // For sessions, we'll use hardcoded academic years for now
      // In a real app, you'd have an academic sessions API
      const currentYear = new Date().getFullYear();
      setSessions([
        { id: `${currentYear-2}-${currentYear-1}`, name: `${currentYear-2}-${currentYear-1}` },
        { id: `${currentYear-1}-${currentYear}`, name: `${currentYear-1}-${currentYear}` },
        { id: `${currentYear}-${currentYear+1}`, name: `${currentYear}-${currentYear+1}` },
        { id: `${currentYear+1}-${currentYear+2}`, name: `${currentYear+1}-${currentYear+2}` }
      ]);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCarryForward = async (e) => {
    e.preventDefault();
    if (!formData.fromSessionId) return toast.error('Please select from session');
    if (!formData.toSessionId) return toast.error('Please select to session');
    if (formData.fromSessionId === formData.toSessionId) {
      return toast.error('From and To sessions must be different');
    }

    if (!confirm('Are you sure you want to carry forward unpaid fees? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessing(true);
      const response = await api.post('/fees/carry-forward', {
        fromSession: formData.fromSessionId,
        toSession: formData.toSessionId,
        classId: formData.classId || undefined
      });
      const count = response.data.data?.feesCarriedForward || 0;
      toast.success(`Fees carried forward successfully for ${count} students`);
      setFormData({
        fromSessionId: '',
        toSessionId: '',
        classId: ''
      });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to carry forward fees'));
    } finally {
      setProcessing(false);
    }
  };

  const fromSession = sessions.find(s => s.id === formData.fromSessionId);
  const toSession = sessions.find(s => s.id === formData.toSessionId);
  const selectedClass = classes.find(c => c.id === formData.classId);

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="border-b border-border pb-3">
        <h1 className="text-lg font-black text-foreground tracking-tight">Fees Carry Forward</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Carry forward unpaid fees to next session</p>
      </div>

      {/* Warning Card */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-foreground mb-1">Important Information</p>
            <ul className="text-[10px] text-muted-foreground space-y-1 list-disc list-inside">
              <li>This action will carry forward all unpaid fees from the selected session to the next session</li>
              <li>Only students with due fees will be affected</li>
              <li>This action cannot be undone once executed</li>
              <li>Backend API endpoint not yet implemented - functionality will be available once the backend is ready</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Carry Forward Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleCarryForward} className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">From Session *</label>
                <select
                  value={formData.fromSessionId}
                  onChange={(e) => setFormData({...formData, fromSessionId: e.target.value})}
                  className="w-full h-10 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value="">Select Session</option>
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.startDate ? new Date(s.startDate).getFullYear() : ''} - {s.endDate ? new Date(s.endDate).getFullYear() : ''})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">To Session *</label>
                <select
                  value={formData.toSessionId}
                  onChange={(e) => setFormData({...formData, toSessionId: e.target.value})}
                  className="w-full h-10 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value="">Select Session</option>
                  {sessions.filter(s => s.id !== formData.fromSessionId).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.startDate ? new Date(s.startDate).getFullYear() : ''} - {s.endDate ? new Date(s.endDate).getFullYear() : ''})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Class (Optional)</label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({...formData, classId: e.target.value})}
                  className="w-full h-10 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All Classes</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <p className="text-[9px] text-muted-foreground ml-1 mt-1">
                  Leave empty to carry forward fees for all classes
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing || loading}
              className="w-full h-11 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Carry Forward Fees
                </>
              )}
            </button>
          </form>
        </div>

        {/* Summary Panel */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Carry Forward Summary</p>

            <div className="space-y-3">
              <div>
                <p className="text-[9px] text-muted-foreground mb-1">From Session</p>
                <div className="bg-muted/30 rounded-lg p-2">
                  <p className="text-xs font-bold text-foreground">
                    {fromSession?.name || 'Not selected'}
                  </p>
                  {fromSession && (
                    <p className="text-[10px] text-muted-foreground">
                      {fromSession.startDate ? new Date(fromSession.startDate).getFullYear() : ''} - {fromSession.endDate ? new Date(fromSession.endDate).getFullYear() : ''}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>

              <div>
                <p className="text-[9px] text-muted-foreground mb-1">To Session</p>
                <div className="bg-muted/30 rounded-lg p-2">
                  <p className="text-xs font-bold text-foreground">
                    {toSession?.name || 'Not selected'}
                  </p>
                  {toSession && (
                    <p className="text-[10px] text-muted-foreground">
                      {toSession.startDate ? new Date(toSession.startDate).getFullYear() : ''} - {toSession.endDate ? new Date(toSession.endDate).getFullYear() : ''}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[9px] text-muted-foreground mb-1">Class Filter</p>
                <div className="bg-muted/30 rounded-lg p-2">
                  <p className="text-xs font-bold text-foreground">
                    {selectedClass?.name || 'All Classes'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Process Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">What Happens?</p>
            <ul className="text-[10px] text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span>All unpaid fees from the selected session will be identified</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span>New fee records will be created in the target session</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span>Students will be notified about the carried forward fees</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeesCarryForward;

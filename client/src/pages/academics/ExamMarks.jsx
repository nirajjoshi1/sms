import React, { useState, useEffect } from 'react';
import { BarChart2, Search, Download, Filter } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';

const ExamMarks = () => {
  const [marks, setMarks] = useState([]);
  const [summary, setSummary] = useState({ total: 0, passing: 0, failing: 0, avgMarks: 0 });
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [examTypeFilter, setExamTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (classFilter) params.append('classId', classFilter);
      if (subjectFilter) params.append('subjectId', subjectFilter);
      if (examTypeFilter) params.append('examType', examTypeFilter);

      const [marksRes, classesRes, subjectsRes] = await Promise.all([
        api.get(`/academics/marks?${params}`),
        api.get('/academics/classes'),
        api.get('/academics/subjects'),
      ]);
      setMarks(marksRes.data.data?.marks || []);
      setSummary(marksRes.data.data?.summary || {});
      setClasses(classesRes.data.data || []);
      setSubjects(subjectsRes.data.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to fetch marks'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [classFilter, subjectFilter, examTypeFilter]);

  const filtered = marks.filter(m => {
    const name = `${m.Student?.firstName || ''} ${m.Student?.lastName || ''}`.toLowerCase();
    const admNo = (m.Student?.admissionNo || '').toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || admNo.includes(searchQuery.toLowerCase());
  });

  const exportCSV = () => {
    if (!filtered.length) return toast.info('No data to export');
    const headers = ['Student', 'Admission No', 'Class', 'Section', 'Subject', 'Exam Type', 'Marks Obtained', 'Total Marks', 'Grade', 'Teacher'];
    const rows = filtered.map(m => [
      `${m.Student?.firstName || ''} ${m.Student?.lastName || ''}`.trim(),
      m.Student?.admissionNo || '',
      m.Class?.name || '',
      m.Section?.name || '',
      m.Subject?.name || '',
      m.examType || '',
      m.marksObtained ?? '',
      m.totalMarks ?? '',
      m.grade || '',
      `${m.Staff?.firstName || ''} ${m.Staff?.lastName || ''}`.trim()
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `exam-marks-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('Marks exported');
  };

  const gradeColor = (g) => {
    if (!g) return 'bg-muted/30 text-muted-foreground border-border';
    if (['A+','A','O'].includes(g)) return 'bg-green-500/10 text-green-600 border-green-500/20';
    if (['B+','B'].includes(g)) return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    if (['C','D'].includes(g)) return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    return 'bg-red-500/10 text-red-600 border-red-500/20';
  };

  const examTypes = [...new Set(marks.map(m => m.examType).filter(Boolean))];

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Exam Marks Overview</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">Admin view of all student exam results</p>
        </div>
        <button onClick={exportCSV} className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 flex items-center gap-2 w-fit">
          <Download className="w-3 h-3" /> Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Records', value: summary.total || 0, color: 'text-primary' },
          { label: 'Passing', value: summary.passing || 0, color: 'text-green-600' },
          { label: 'Failing', value: summary.failing || 0, color: 'text-red-600' },
          { label: 'Average Marks', value: summary.avgMarks || '0', color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-muted/30 border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20">
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20">
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={examTypeFilter} onChange={e => setExamTypeFilter(e.target.value)} className="h-9 bg-muted/30 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20">
            <option value="">All Exam Types</option>
            {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-6 h-6 border-b-2 border-primary rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <BarChart2 className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-30" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No marks found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/5 border-b border-border">
                <tr>
                  {['Student', 'Class / Section', 'Subject', 'Exam Type', 'Marks', 'Grade', 'Teacher'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((m, i) => (
                  <tr key={m.id || i} className="hover:bg-muted/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-foreground">{m.Student?.firstName} {m.Student?.lastName}</p>
                      <p className="text-[10px] text-muted-foreground">{m.Student?.admissionNo}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{m.Class?.name}{m.Section?.name ? ` - ${m.Section.name}` : ''}</td>
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{m.Subject?.name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{m.examType || '—'}</td>
                    <td className="px-4 py-3 text-xs font-bold text-foreground">
                      {m.marksObtained ?? '—'}{m.totalMarks ? `/${m.totalMarks}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-black border ${gradeColor(m.grade)}`}>
                        {m.grade || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{m.Staff?.firstName} {m.Staff?.lastName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamMarks;

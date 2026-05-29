import React from 'react';
import {
  Users,
  GraduationCap,
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  ArrowUpRight,
  Search,
  FileDown,
  Filter,
  ArrowUpDown,
  Check,
  MoreVertical,
  X,
  Eye,
  Edit2,
  Trash2,
  UserX
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../../../context/AuthContext';
import { useDashboardStats } from '../../../hooks/useDashboardStats';

const AdminDashboard = () => {
  const { user } = useAuth();

  const [timeFilter, setTimeFilter] = React.useState('6months');
  const { statsData, recentStudents, classDistribution, genderStats, chartData, loading } = useDashboardStats(timeFilter);
  const [tableSearch, setTableSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [dateFilter, setDateFilter] = React.useState('all');
  const [selectedStudents, setSelectedStudents] = React.useState([]);
  const [studentMenuOpen, setStudentMenuOpen] = React.useState(null);

  const timeFilterOptions = {
    '3months': 'Last 3 months',
    '6months': 'Last 6 months',
    '1year': 'Last year'
  };

  const getFilteredStudents = () => {
    let filtered = recentStudents || [];

    // Search filter
    if (tableSearch) {
      const query = tableSearch.toLowerCase();
      filtered = filtered.filter(s =>
        s.firstName?.toLowerCase().includes(query) ||
        s.lastName?.toLowerCase().includes(query) ||
        s.admissionNo?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s =>
        statusFilter === 'active' ? !s.isDisabled : s.isDisabled
      );
    }

    // Date filter (last 30 days, 60 days, etc.)
    if (dateFilter !== 'all') {
      const now = new Date();
      const days = dateFilter === '30days' ? 30 : dateFilter === '60days' ? 60 : 90;
      const cutoff = new Date(now.setDate(now.getDate() - days));

      filtered = filtered.filter(s =>
        new Date(s.admissionDate || s.createdAt) >= cutoff
      );
    }

    return filtered;
  };

  const filteredStudents = getFilteredStudents();

  const toggleStudentSelection = (id) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const toggleAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const handleExport = () => {
    // CSV Export
    const headers = ['Name', 'Admission No', 'Class', 'Section', 'Status', 'Admission Date'];
    const rows = filteredStudents.map(s => [
      `${s.firstName} ${s.lastName}`,
      s.admissionNo,
      s.class?.name || '-',
      s.section?.name || '-',
      !s.isDisabled ? 'Active' : 'Disabled',
      new Date(s.admissionDate || s.createdAt).toLocaleDateString()
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleViewReport = () => {
    // Generate and download detailed report
    window.open('/students?report=true', '_blank');
  };

  const stats = [
    {
      label: 'Total Students',
      value: loading ? '...' : statsData?.totalStudents?.toLocaleString() || '0',
      change: loading ? '...' : statsData?.studentGrowth || '+0%',
      trend: 'up',
      desc: `${statsData?.activeStudents || 0} active students`,
      icon: <GraduationCap className="w-5 h-5" />
    },
    {
      label: 'Total Classes',
      value: loading ? '...' : statsData?.totalClasses?.toLocaleString() || '0',
      change: `${statsData?.totalSections || 0} sections`,
      trend: 'neutral',
      desc: 'Academic structure',
      icon: <Users className="w-5 h-5" />
    },
    {
      label: 'Categories',
      value: loading ? '...' : statsData?.totalCategories?.toLocaleString() || '0',
      change: `${statsData?.totalHouses || 0} houses`,
      trend: 'neutral',
      desc: 'Student classifications',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      label: 'Active Users',
      value: loading ? '...' : statsData?.totalUsers?.toLocaleString() || '0',
      change: 'System access',
      trend: 'up',
      desc: 'Staff and admin accounts',
      icon: <TrendingUp className="w-5 h-5" />
    },
  ];


  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {user?.school?.name || 'Dashboard'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Overview for the {timeFilterOptions[timeFilter].toLowerCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-background border border-border text-foreground text-xs rounded-lg px-3 py-2 pr-8 outline-none focus:ring-2 focus:ring-primary/20 transition cursor-pointer hover:border-primary/50 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat"
            style={{ colorScheme: 'dark' }}
          >
            <option value="3months">Last 3 months</option>
            <option value="6months">Last 6 months</option>
            <option value="1year">Last year</option>
          </select>
          <button
            onClick={handleViewReport}
            className="bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-lg font-bold text-xs transition shadow-sm active:scale-95"
          >
            View report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-2xl hover:border-ring transition-all group shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="text-muted-foreground group-hover:text-foreground transition">
                {stat.icon}
              </div>
              <button className="text-muted-foreground hover:text-foreground transition">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-card-foreground">{stat.value}</h3>
                {stat.trend !== 'neutral' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 ${
                    stat.trend === 'up' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {stat.trend === 'up' ? <ArrowUpRight className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Chart Area */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-card-foreground">Student Admissions Trend</h3>
            <p className="text-xs text-muted-foreground">Monthly student enrollment and active count</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-[11px] text-muted-foreground">Active Students</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-destructive rounded-full"></div>
              <span className="text-[11px] text-muted-foreground">New Admissions</span>
            </div>
          </div>
        </div>
        <div className="h-[400px] w-full p-6">
          {loading || chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="active" 
                stroke="var(--primary)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorActive)" 
              />
              <Area
                type="monotone"
                dataKey="admissions"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Class Distribution & Gender Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Distribution */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-bold text-card-foreground">Class Distribution</h3>
            <p className="text-xs text-muted-foreground">Students per class</p>
          </div>
          <div className="h-[300px] w-full p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : classDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="students" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No class data available
              </div>
            )}
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-bold text-card-foreground">Gender Distribution</h3>
            <p className="text-xs text-muted-foreground">Student demographics</p>
          </div>
          <div className="h-[300px] w-full p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : genderStats.length > 0 ? (
              <div className="flex items-center justify-center h-full gap-12">
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderStats}
                      dataKey="count"
                      nameKey="gender"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => entry.gender}
                    >
                      {genderStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.gender === 'Male'
                              ? 'hsl(var(--primary))'
                              : entry.gender === 'Female'
                              ? 'hsl(var(--destructive))'
                              : 'hsl(var(--muted-foreground))'
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {genderStats.map((stat, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            stat.gender === 'Male'
                              ? 'hsl(var(--primary))'
                              : stat.gender === 'Female'
                              ? 'hsl(var(--destructive))'
                              : 'hsl(var(--muted-foreground))'
                        }}
                      ></div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{stat.gender}</p>
                        <p className="text-xs text-muted-foreground">{stat.count} students</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No gender data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Students Table Area */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-foreground">
              {loading ? '...' : filteredStudents.length.toLocaleString()} Students
              {tableSearch || statusFilter !== 'all' || dateFilter !== 'all' ? (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (filtered from {statsData?.totalStudents?.toLocaleString() || '0'})
                </span>
              ) : null}
            </h3>
            <p className="text-sm text-muted-foreground">Recent student records with class, section, and admission details.</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedStudents.length > 0 && (
              <span className="text-xs text-muted-foreground px-3 py-2 bg-primary/10 rounded-lg border border-primary/20">
                {selectedStudents.length} selected
              </span>
            )}
            <button
              onClick={handleExport}
              disabled={filteredStudents.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-xs font-bold text-foreground hover:bg-accent transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/20">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search students..."
                className="w-full h-10 bg-background border border-border rounded-lg pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
              />
              {tableSearch && (
                <button
                  onClick={() => setTableSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 h-10 pr-8 bg-background border border-border rounded-lg text-xs font-bold text-foreground hover:border-primary/50 transition cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat focus:outline-none focus:ring-2 focus:ring-primary/20"
                style={{ colorScheme: 'dark' }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 h-10 pr-8 bg-background border border-border rounded-lg text-xs font-bold text-foreground hover:border-primary/50 transition cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat focus:outline-none focus:ring-2 focus:ring-primary/20"
                style={{ colorScheme: 'dark' }}
              >
                <option value="all">All Time</option>
                <option value="30days">Last 30 days</option>
                <option value="60days">Last 60 days</option>
                <option value="90days">Last 90 days</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                      onChange={toggleAllStudents}
                      className="w-4 h-4 border border-border rounded bg-background cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Class / Section</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Admission Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-6 h-16 bg-muted/5"></td>
                    </tr>
                  ))
                ) : filteredStudents.length > 0 ? filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
                        className="w-4 h-4 border border-border rounded bg-background cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-foreground font-bold text-sm border border-border overflow-hidden">
                          {student.photo ? <img src={student.photo} alt="" className="w-full h-full object-cover" /> : student.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-muted-foreground">Admin No: {student.admissionNo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          !student.isDisabled ? 'bg-primary/10 text-primary border-primary/20' : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}>
                          {!student.isDisabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                      {student.Class?.name} - {student.Section?.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(student.admissionDate || student.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative">
                        <button
                          onClick={() => setStudentMenuOpen(studentMenuOpen === student.id ? null : student.id)}
                          className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {studentMenuOpen === student.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setStudentMenuOpen(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-20 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                              <button
                                onClick={() => {
                                  window.location.href = `/students/${student.id}`;
                                  setStudentMenuOpen(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent transition flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  window.location.href = `/students/edit/${student.id}`;
                                  setStudentMenuOpen(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent transition flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit Student
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Disable this student?')) {
                                    // API call to disable student
                                    setStudentMenuOpen(null);
                                  }
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition flex items-center gap-2"
                              >
                                <UserX className="w-4 h-4" />
                                Disable Student
                              </button>
                              <div className="border-t border-border my-1" />
                              <button
                                onClick={() => {
                                  if (window.confirm('Delete this student permanently?')) {
                                    // API call to delete student
                                    setStudentMenuOpen(null);
                                  }
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Student
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground italic">No recent students found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

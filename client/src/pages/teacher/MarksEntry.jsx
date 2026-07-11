import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Award, Save, BookOpen } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const MarksEntry = () => {
  const [searchParams] = useSearchParams();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examName, setExamName] = useState('First Term');
  const [maxMarks, setMaxMarks] = useState(100);
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load teaching classes list
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get('/teacher/classes');
        if (response.data.data) {
          const uniqueCombos = response.data.data.classes || [];
          setClasses(uniqueCombos);

          const urlClassId = searchParams.get('classId');
          const urlSectionId = searchParams.get('sectionId');

          if (urlClassId && urlSectionId) {
            setSelectedClass(urlClassId);
            setSelectedSection(urlSectionId);
          } else if (uniqueCombos.length > 0) {
            setSelectedClass(uniqueCombos[0].classId);
            setSelectedSection(uniqueCombos[0].sectionId);
          }
        }
      } catch (error) {
        toast.error('Failed to load setups');
      } finally {
        setLoadingSetup(false);
      }
    };
    fetchClasses();
  }, [searchParams]);

  // Load subjects for selected class
  useEffect(() => {
    if (!selectedClass || !selectedSection) return;

    const fetchSubjects = async () => {
      try {
        const selectedCombo = classes.find(c => c.classId === selectedClass && c.sectionId === selectedSection);
        if (selectedCombo?.Subjects?.length) {
          setSubjects(selectedCombo.Subjects);
          setSelectedSubject(selectedCombo.Subjects[0].id);
          return;
        }

        const response = await api.get(`/academics/subject-group?classId=${selectedClass}&sectionId=${selectedSection}`);
        const list = response.data.data || [];
        const allSubjects = [];
        list.forEach(sg => {
          if (sg.Subject) {
            sg.Subject.forEach(s => {
              if (!allSubjects.some(sub => sub.id === s.id)) {
                allSubjects.push(s);
              }
            });
          }
        });
        setSubjects(allSubjects);
        if (allSubjects.length > 0) {
          setSelectedSubject(allSubjects[0].id);
        } else {
          setSelectedSubject('');
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchSubjects();
  }, [selectedClass, selectedSection, classes]);

  // Fetch student roster and existing scores
  const handleLoadStudents = async () => {
    if (!selectedClass || !selectedSection || !selectedSubject || !examName) return;

    try {
      setLoadingStudents(true);
      // 1. Fetch students in the class
      const studentsRes = await api.get(`/teacher/students?classId=${selectedClass}&sectionId=${selectedSection}`);
      const studentsList = studentsRes.data.data || [];
      setStudents(studentsList);

      // 2. Fetch existing marks for this class, subject, and exam session
      const marksRes = await api.get(
        `/teacher/marks?classId=${selectedClass}&sectionId=${selectedSection}&subjectId=${selectedSubject}&examName=${examName}`
      );
      const existingMarks = marksRes.data.data || [];

      // Set maxMarks from first record if exists
      if (existingMarks.length > 0) {
        setMaxMarks(existingMarks[0].maxMarks);
      }

      // Build initial state map
      const stateMap = {};
      studentsList.forEach(s => {
        const record = existingMarks.find(m => m.studentId === s.id);
        stateMap[s.id] = {
          marks: record ? record.marks : '',
          grade: record ? (record.grade || '') : '',
          remarks: record ? (record.remarks || '') : ''
        };
      });
      setMarksData(stateMap);
    } catch (error) {
      toast.error('Failed to load student scores roster');
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (selectedClass && selectedSection && selectedSubject) {
      handleLoadStudents();
    }
  }, [selectedClass, selectedSection, selectedSubject, examName]);

  const handleScoreChange = (studentId, field, value) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  };

  const handleClassSelection = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [cId, sId] = val.split(':');
    setSelectedClass(cId);
    setSelectedSection(sId);
  };

  const handleSubmit = async () => {
    // Validate scores
    const marksList = [];
    let isValid = true;

    for (let i = 0; i < students.length; i++) {
      const sId = students[i].id;
      const score = marksData[sId]?.marks;
      if (score === '' || score === undefined) {
        toast.error(`Please enter marks for student: ${students[i].firstName} ${students[i].lastName}`);
        isValid = false;
        break;
      }
      const numScore = parseFloat(score);
      if (isNaN(numScore) || numScore < 0 || numScore > maxMarks) {
        toast.error(`Marks for ${students[i].firstName} must be a number between 0 and ${maxMarks}`);
        isValid = false;
        break;
      }

      marksList.push({
        studentId: sId,
        marks: numScore,
        maxMarks: parseFloat(maxMarks),
        grade: marksData[sId]?.grade || '',
        remarks: marksData[sId]?.remarks || ''
      });
    }

    if (!isValid) return;

    try {
      setSubmitting(true);
      const payload = {
        examName,
        subjectId: selectedSubject,
        classId: selectedClass,
        sectionId: selectedSection,
        marks: marksList
      };

      await api.post('/teacher/marks', payload);
      toast.success('Exam marks updated and saved successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit marks entry');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSetup) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Loading setup...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" /> Examination Marks Entry
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">
            Log subject examination terms grade sheets
          </p>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-wrap items-end gap-3 bg-card border border-border rounded-xl p-3 shadow-sm">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Class & Section</label>
            <select
              value={`${selectedClass}:${selectedSection}`}
              onChange={handleClassSelection}
              className="bg-muted/30 border border-border rounded-lg h-9 px-2 text-xs font-bold focus:outline-none"
            >
              {classes.map((c, i) => (
                <option key={i} value={`${c.classId}:${c.sectionId}`}>
                  Class {c.Class?.name} - {c.Section?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-muted/30 border border-border rounded-lg h-9 px-2 text-xs font-bold focus:outline-none w-40"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Exam Term</label>
            <select
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="bg-muted/30 border border-border rounded-lg h-9 px-2 text-xs font-bold focus:outline-none w-40"
            >
              <option value="First Term">First Term</option>
              <option value="Mid Term">Mid Term</option>
              <option value="Second Term">Second Term</option>
              <option value="Final Exam">Final Exam</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Max Marks</label>
            <input
              type="number"
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              className="bg-muted/30 border border-border rounded-lg h-9 w-20 px-2 text-xs font-bold focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Spreadsheet Input Table */}
      {loadingStudents ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-xs font-bold uppercase tracking-wider">No active students found</p>
        </div>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/10">
                    <th className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-16">Roll No</th>
                    <th className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Student</th>
                    <th className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-36 text-center">Marks Scored</th>
                    <th className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-24 text-center">Grade</th>
                    <th className="p-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Grading Comments / Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((student) => {
                    const current = marksData[student.id] || { marks: '', grade: '', remarks: '' };
                    return (
                      <tr key={student.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-3 text-xs font-black text-foreground">
                          {student.rollNumber || student.admissionNo.slice(-3)}
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="text-xs font-bold text-foreground">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-[9px] text-muted-foreground font-bold">Admin No: {student.admissionNo}</p>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max={maxMarks}
                              value={current.marks}
                              onChange={(e) => handleScoreChange(student.id, 'marks', e.target.value)}
                              className="w-20 text-center h-8 bg-muted/20 focus:bg-background border border-border focus:border-primary/55 rounded-lg text-xs font-black focus:outline-none"
                              required
                            />
                            <span className="text-[10px] font-bold text-muted-foreground">/ {maxMarks}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="text"
                            placeholder="A+, B..."
                            value={current.grade}
                            onChange={(e) => handleScoreChange(student.id, 'grade', e.target.value)}
                            className="w-16 text-center h-8 bg-muted/20 focus:bg-background border border-border focus:border-primary/55 rounded-lg text-xs font-bold focus:outline-none uppercase"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            placeholder="Add evaluation comments..."
                            value={current.remarks}
                            onChange={(e) => handleScoreChange(student.id, 'remarks', e.target.value)}
                            className="w-full h-8 bg-muted/20 focus:bg-background border border-border focus:border-primary/55 rounded-lg px-3 text-xs focus:outline-none"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 px-6 h-10 rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-50 shadow-md transition-all"
            >
              {submitting ? (
                <>Submitting Marks...</>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Marks Sheet
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarksEntry;

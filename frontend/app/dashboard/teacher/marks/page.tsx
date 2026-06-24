"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, FileText, Plus } from "lucide-react";

export default function TeacherMarksPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  
  const [marksData, setMarksData] = useState<Record<string, { marks: string, remarks: string }>>({});
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);
  const [examForm, setExamForm] = useState({
    name: "", classId: "", subject: "", examDate: "", totalMarks: "100", academicYear: "2026"
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchExams(selectedClass);
    } else {
      setExams([]);
      setSelectedExam("");
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedExam) {
      fetchStudentsAndResults();
    } else {
      setStudents([]);
      setMarksData({});
    }
  }, [selectedClass, selectedExam]);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      if (res.ok) setClasses(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchExams = async (classId: string) => {
    try {
      const res = await fetch(`/api/exams?classId=${classId}`);
      if (res.ok) setExams(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchStudentsAndResults = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const stRes = await fetch(`/api/students?classId=${selectedClass}&limit=100`);
      if (stRes.ok) {
        const data = await stRes.json();
        setStudents(data.data);
        
        // Initialize marks data
        const initialMarks: any = {};
        data.data.forEach((s: any) => {
          initialMarks[s.id] = { marks: "", remarks: "" };
        });
        setMarksData(initialMarks);
        
        // We should ideally fetch existing results here too, but for simplicity we'll assume fresh entry
        // A real implementation would fetch GET /api/results?examId=xxx
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to load students", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (studentId: string, field: "marks" | "remarks", value: string) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const calculateGrade = (marks: number, total: number) => {
    const percentage = (marks / total) * 100;
    if (percentage >= 80) return "A+";
    if (percentage >= 70) return "A";
    if (percentage >= 60) return "A-";
    if (percentage >= 50) return "B";
    if (percentage >= 40) return "C";
    if (percentage >= 33) return "D";
    return "F";
  };

  const handleSaveMarks = async () => {
    if (!selectedExam) return;
    setSaving(true);
    setMessage({ text: "", type: "" });

    const exam = exams.find(e => e.id === selectedExam);
    if (!exam) return;

    try {
      // For simplicity in this demo, we save one by one. In production, use bulk insert
      let successCount = 0;
      for (const student of students) {
        const data = marksData[student.id];
        if (data.marks) {
          const marksVal = parseFloat(data.marks);
          const grade = calculateGrade(marksVal, exam.totalMarks);
          
          await fetch("/api/results", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              examId: selectedExam,
              studentId: student.id,
              marksObtained: marksVal,
              grade,
              remarks: data.remarks
            })
          });
          successCount++;
        }
      }
      setMessage({ text: `Successfully saved ${successCount} results!`, type: "success" });
    } catch (err) {
      setMessage({ text: "Error saving results.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingExam(true);
    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(examForm)
      });
      if (res.ok) {
        setIsModalOpen(false);
        if (examForm.classId === selectedClass) {
          fetchExams(selectedClass);
        }
        setExamForm({ ...examForm, name: "", subject: "", examDate: "" });
      } else {
        alert("Failed to create exam");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingExam(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Marks Entry</h1>
          <p className="text-slate-400 text-sm">Enter student marks and generate results.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Exam
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Class
            </label>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select Class</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Exam
            </label>
            <select 
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              disabled={!selectedClass}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            >
              <option value="">Select Exam</option>
              {exams.map(e => (
                <option key={e.id} value={e.id}>{e.name} - {e.subject}</option>
              ))}
            </select>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            {message.text}
          </div>
        )}

        {!selectedExam ? (
          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-700 rounded-xl">
            Please select a class and exam to enter marks.
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-700 rounded-xl">
            No students found in this class.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto border border-slate-700 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-sm border-b border-slate-700">
                    <th className="p-4 font-medium w-20">Roll</th>
                    <th className="p-4 font-medium">Student Name</th>
                    <th className="p-4 font-medium w-32">Marks ({exams.find(e => e.id === selectedExam)?.totalMarks})</th>
                    <th className="p-4 font-medium">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 text-slate-300 font-medium">{student.rollNo}</td>
                      <td className="p-4">
                        <div className="text-slate-200 font-medium">{student.name}</div>
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          min="0"
                          max={exams.find(e => e.id === selectedExam)?.totalMarks}
                          value={marksData[student.id]?.marks || ""}
                          onChange={(e) => handleMarksChange(student.id, "marks", e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-blue-500 focus:outline-none"
                          placeholder="e.g. 85"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="text"
                          value={marksData[student.id]?.remarks || ""}
                          onChange={(e) => handleMarksChange(student.id, "remarks", e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-blue-500 focus:outline-none"
                          placeholder="Optional remark..."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={handleSaveMarks}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Results
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-100">Create New Exam</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>
            
            <form onSubmit={handleCreateExam} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Exam Name *</label>
                <input required value={examForm.name} onChange={e => setExamForm({...examForm, name: e.target.value})} placeholder="e.g. Mid Term Exam" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Class *</label>
                <select required value={examForm.classId} onChange={e => setExamForm({...examForm, classId: e.target.value})} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200">
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Subject *</label>
                <input required value={examForm.subject} onChange={e => setExamForm({...examForm, subject: e.target.value})} placeholder="e.g. Mathematics" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Date *</label>
                  <input required type="date" value={examForm.examDate} onChange={e => setExamForm({...examForm, examDate: e.target.value})} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Total Marks *</label>
                  <input required type="number" value={examForm.totalMarks} onChange={e => setExamForm({...examForm, totalMarks: e.target.value})} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg">Cancel</button>
                <button type="submit" disabled={isSubmittingExam} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Create Exam</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

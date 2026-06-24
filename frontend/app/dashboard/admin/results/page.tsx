"use client";

import { useState, useEffect } from "react";
import {
  BookOpen, Plus, Loader2, ChevronDown, ChevronUp,
  CheckCircle, Trash2, Trophy, X, Save
} from "lucide-react";

// Auto-calculate grade from marks and totalMarks
function calcGrade(marks: number, total: number): string {
  const pct = (marks / total) * 100;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}

export default function ResultsManagementPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("admin");
  const [settings, setSettings] = useState<any>({});
  const [customExam, setCustomExam] = useState("");
  const [customSubject, setCustomSubject] = useState("");

  // Step tracking
  const [step, setStep] = useState<"exam" | "marks">("exam");

  // Exam form
  const [showExamForm, setShowExamForm] = useState(false);
  const [examForm, setExamForm] = useState({
    name: "", classId: "", subject: "", examDate: "", totalMarks: "100", academicYear: "2025-2026"
  });
  const [examSubmitting, setExamSubmitting] = useState(false);
  const [examError, setExamError] = useState("");

  // Selected exam for marks entry
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [marks, setMarks] = useState<Record<string, string>>({}); // studentId -> marks
  const [remarks, setRemarks] = useState<Record<string, string>>({}); // studentId -> remarks
  const [savingAll, setSavingAll] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const baseSubjects = ["Bangla", "English", "Mathematics", "Science", "Social Science", "Islam", "ICT", "Arts", "Physical Education"];
  const customSubjects = settings?.subjectsList ? JSON.parse(settings.subjectsList) : [];
  const SUBJECTS = Array.from(new Set([...baseSubjects, ...customSubjects]));

  const baseExams = ["1st Term Exam", "2nd Term Exam", "Final Exam"];
  const customExams = settings?.examNamesList ? JSON.parse(settings.examNamesList) : [];
  const EXAMS = Array.from(new Set([...baseExams, ...customExams]));

  const YEARS = ["2024-2025", "2025-2026", "2026-2027"];

  // Load initial data
  useEffect(() => {
    async function load() {
      try {
        const [clsRes, examRes, authRes, setRes] = await Promise.all([
          fetch("/api/classes"),
          fetch("/api/exams"),
          fetch("/api/auth/me"),
          fetch("/api/settings")
        ]);
        if (clsRes.ok) setClasses(await clsRes.json());
        if (examRes.ok) setExams(await examRes.json());
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.user) setRole(authData.user.role);
        }
        if (setRes.ok) setSettings(await setRes.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // When exam is selected, load students of that class + existing results
  const handleSelectExam = async (exam: any) => {
    setSelectedExam(exam);
    setMarks({});
    setRemarks({});
    setSaveMsg("");
    setStep("marks");

    const [studRes, resRes] = await Promise.all([
      fetch(`/api/students?classId=${exam.classId}&limit=100`),
      fetch(`/api/results?examId=${exam.id}`),
    ]);

    const studData = await studRes.json();
    const resData = await resRes.json();

    const studList = studData.data || studData || [];
    setStudents(studList);
    setResults(resData);

    // Pre-fill existing marks
    const preMarks: Record<string, string> = {};
    const preRemarks: Record<string, string> = {};
    if (Array.isArray(resData)) {
      resData.forEach((r: any) => {
        preMarks[r.studentId] = String(r.marksObtained);
        preRemarks[r.studentId] = r.remarks || "";
      });
    }
    setMarks(preMarks);
    setRemarks(preRemarks);
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setExamSubmitting(true);
    setExamError("");

    const finalExamName = examForm.name === "Custom" ? customExam : examForm.name;
    const finalSubject = examForm.subject === "Custom" ? customSubject : examForm.subject;

    try {
      if (examForm.name === "Custom" && role === "superadmin") {
         const newExams = Array.from(new Set([...customExams, customExam]));
         await fetch("/api/settings", {
           method: "PUT",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ examNamesList: JSON.stringify(newExams) })
         });
         setSettings({ ...settings, examNamesList: JSON.stringify(newExams) });
      }
      if (examForm.subject === "Custom" && role === "superadmin") {
         const newSubjects = Array.from(new Set([...customSubjects, customSubject]));
         await fetch("/api/settings", {
           method: "PUT",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ subjectsList: JSON.stringify(newSubjects) })
         });
         setSettings({ ...settings, subjectsList: JSON.stringify(newSubjects) });
      }

      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...examForm, name: finalExamName, subject: finalSubject })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setExams(prev => [data.exam, ...prev]);
      setShowExamForm(false);
      setExamForm({ name: "", classId: "", subject: "", examDate: "", totalMarks: "100", academicYear: "2025-2026" });
    } catch (err: any) {
      setExamError(err.message);
    } finally {
      setExamSubmitting(false);
    }
  };

  const handleSaveAllMarks = async () => {
    if (!selectedExam) return;
    setSavingAll(true);
    setSaveMsg("");

    const studentIds = students.map((s: any) => s.id);
    let saved = 0;
    let failed = 0;

    for (const sid of studentIds) {
      const m = marks[sid];
      if (!m || m === "") continue; // skip empty

      const marksNum = parseFloat(m);
      if (isNaN(marksNum)) continue;

      const grade = calcGrade(marksNum, selectedExam.totalMarks);

      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selectedExam.id,
          studentId: sid,
          marksObtained: marksNum,
          grade,
          remarks: remarks[sid] || "",
        }),
      });

      if (res.ok) saved++;
      else failed++;
    }

    setSaveMsg(failed > 0 ? `✅ ${saved} saved, ❌ ${failed} failed` : `✅ ${saved} results published successfully!`);
    setSavingAll(false);

    // Reload results
    const resRes = await fetch(`/api/results?examId=${selectedExam.id}`);
    if (resRes.ok) setResults(await resRes.json());
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm("Delete this exam and all its results?")) return;
    const res = await fetch(`/api/exams/${examId}`, { method: "DELETE" }).catch(() => null);
    if (res?.ok) {
      setExams(prev => prev.filter(e => e.id !== examId));
      if (selectedExam?.id === examId) { setSelectedExam(null); setStep("exam"); }
    }
  };

  if (loading) return (
    <div className="h-64 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gold" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gold-light mb-1">Result Management</h1>
          <p className="text-sm text-cream/60">Create exams, enter marks, and publish results to the public board.</p>
        </div>
        <button
          onClick={() => { setShowExamForm(!showExamForm); setExamError(""); }}
          className="bg-gold hover:bg-gold-light text-navy-deep font-display font-bold px-4 py-2 rounded-md transition-colors flex items-center gap-2"
        >
          {showExamForm ? <X size={18} /> : <Plus size={18} />}
          {showExamForm ? "Cancel" : "Create Exam"}
        </button>
      </div>

      {/* Create Exam Form */}
      {showExamForm && (
        <div className="bg-navy border border-gold/20 rounded-xl p-6 shadow-xl animate-fade-up">
          <h2 className="text-lg font-serif font-semibold text-cream mb-5">New Exam Setup</h2>
          {examError && <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 p-3 rounded">{examError}</p>}
          <form onSubmit={handleCreateExam} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label-gold">Class</label>
              <select required value={examForm.classId} onChange={e => setExamForm({ ...examForm, classId: e.target.value })}
                className="input-gold w-full">
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
              </select>
            </div>
            <div>
              <label className="label-gold">Exam Name</label>
              <select required value={examForm.name} onChange={e => {
                setExamForm({ ...examForm, name: e.target.value });
                if (e.target.value !== "Custom") setCustomExam("");
              }}
                className="input-gold w-full">
                <option value="">Select Exam</option>
                {EXAMS.map(ex => <option key={ex as string} value={ex as string}>{ex as string}</option>)}
                {role === "superadmin" && <option value="Custom">Custom (Add New)</option>}
              </select>
              {examForm.name === "Custom" && (
                <input type="text" value={customExam} onChange={e => setCustomExam(e.target.value)}
                  placeholder="Enter Custom Exam Name"
                  className="input-gold w-full mt-2" required />
              )}
            </div>
            <div>
              <label className="label-gold">Subject</label>
              <select required value={examForm.subject} onChange={e => {
                setExamForm({ ...examForm, subject: e.target.value });
                if (e.target.value !== "Custom") setCustomSubject("");
              }}
                className="input-gold w-full">
                <option value="">Select Subject</option>
                {SUBJECTS.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
                {role === "superadmin" && <option value="Custom">Custom (Add New)</option>}
              </select>
              {examForm.subject === "Custom" && (
                <input type="text" value={customSubject} onChange={e => setCustomSubject(e.target.value)}
                  placeholder="Enter Custom Subject"
                  className="input-gold w-full mt-2" required />
              )}
            </div>
            <div>
              <label className="label-gold">Exam Date</label>
              <input required type="date" value={examForm.examDate} onChange={e => setExamForm({ ...examForm, examDate: e.target.value })}
                className="input-gold w-full" />
            </div>
            <div>
              <label className="label-gold">Total Marks</label>
              <input required type="number" min="1" value={examForm.totalMarks} onChange={e => setExamForm({ ...examForm, totalMarks: e.target.value })}
                className="input-gold w-full" />
            </div>
            <div>
              <label className="label-gold">Academic Year</label>
              <select required value={examForm.academicYear} onChange={e => setExamForm({ ...examForm, academicYear: e.target.value })}
                className="input-gold w-full">
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="lg:col-span-3 flex justify-end pt-2 border-t border-gold/10">
              <button type="submit" disabled={examSubmitting}
                className="bg-gold hover:bg-gold-light text-navy-deep font-display font-bold px-6 py-2.5 rounded-sm transition-all disabled:opacity-50 flex items-center gap-2">
                {examSubmitting ? <Loader2 size={16} className="animate-spin" /> : <BookOpen size={16} />}
                Create Exam
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exam List */}
        <div className="lg:col-span-1">
          <div className="bg-navy border border-gold/15 rounded-xl overflow-hidden shadow-xl">
            <div className="px-5 py-4 border-b border-gold/10 bg-navy-light/20">
              <h2 className="text-sm font-display uppercase tracking-widest text-gold-light font-bold flex items-center gap-2">
                <BookOpen size={16} /> Exams ({exams.length})
              </h2>
            </div>
            <div className="divide-y divide-gold/5 max-h-[600px] overflow-y-auto">
              {exams.length === 0 ? (
                <p className="text-cream/40 text-sm text-center py-8 italic">No exams yet. Create one above.</p>
              ) : exams.map(exam => (
                <div key={exam.id}
                  className={`p-4 cursor-pointer transition-all hover:bg-navy-light/20 ${selectedExam?.id === exam.id ? "bg-gold/10 border-l-2 border-gold" : "border-l-2 border-transparent"}`}
                  onClick={() => handleSelectExam(exam)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-cream font-semibold text-sm truncate">{exam.name}</p>
                      <p className="text-cream/50 text-xs mt-0.5">{exam.class?.name} · {exam.subject}</p>
                      <p className="text-cream/40 text-xs mt-0.5">{new Date(exam.examDate).toLocaleDateString('en-GB')} · {exam.totalMarks} marks</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); handleDeleteExam(exam.id); }}
                      className="shrink-0 text-red-400/50 hover:text-red-400 p-1 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Marks Entry Panel */}
        <div className="lg:col-span-2">
          {!selectedExam ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-navy border border-gold/10 border-dashed rounded-xl text-cream/30">
              <Trophy size={48} strokeWidth={1} className="mb-3" />
              <p className="text-sm">Select an exam from the left to enter marks</p>
            </div>
          ) : (
            <div className="bg-navy border border-gold/15 rounded-xl shadow-xl overflow-hidden">
              {/* Exam Header */}
              <div className="px-6 py-4 border-b border-gold/10 bg-navy-light/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-cream font-bold">{selectedExam.name}</h2>
                    <p className="text-xs text-cream/50 mt-0.5">
                      {selectedExam.class?.name} · {selectedExam.subject} · Total: {selectedExam.totalMarks} marks
                    </p>
                  </div>
                  <button onClick={handleSaveAllMarks} disabled={savingAll}
                    className="bg-gold hover:bg-gold-light text-navy-deep font-display font-bold px-5 py-2 rounded-sm transition-all disabled:opacity-50 flex items-center gap-2 shrink-0">
                    {savingAll ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Publish Results
                  </button>
                </div>
                {saveMsg && (
                  <div className="mt-3 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded flex items-center gap-2">
                    <CheckCircle size={16} /> {saveMsg}
                  </div>
                )}
              </div>

              {/* Grade legend */}
              <div className="px-6 py-3 border-b border-gold/5 flex flex-wrap gap-3 text-xs text-cream/50">
                <span>Grade Scale:</span>
                {[["A+","90-100"],["A","80-89"],["B","70-79"],["C","60-69"],["D","50-59"],["F","<50"]].map(([g,r]) => (
                  <span key={g}><strong className="text-gold-light">{g}</strong> {r}%</span>
                ))}
              </div>

              {/* Students marks table */}
              {students.length === 0 ? (
                <p className="text-cream/40 text-sm text-center py-8 italic">No students in this class.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs font-display uppercase tracking-widest text-gold-light/70 border-b border-gold/10 bg-navy-light/10">
                      <tr>
                        <th className="px-5 py-3 text-left">Roll</th>
                        <th className="px-5 py-3 text-left">Student Name</th>
                        <th className="px-5 py-3 text-left">Marks <span className="text-cream/30 normal-case font-normal">/ {selectedExam.totalMarks}</span></th>
                        <th className="px-5 py-3 text-left">Grade</th>
                        <th className="px-5 py-3 text-left">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold/5">
                      {students.map((s: any) => {
                        const m = marks[s.id] || "";
                        const mNum = parseFloat(m);
                        const grade = m && !isNaN(mNum) ? calcGrade(mNum, selectedExam.totalMarks) : "–";
                        const gradeColor = grade === "A+" || grade === "A" ? "text-emerald-400" :
                          grade === "B" ? "text-blue-400" :
                          grade === "C" ? "text-amber-400" :
                          grade === "D" ? "text-orange-400" :
                          grade === "F" ? "text-red-400" : "text-cream/40";
                        const existing = results.find((r: any) => r.studentId === s.id);

                        return (
                          <tr key={s.id} className={`hover:bg-navy-light/10 transition-colors ${existing ? "bg-green-500/3" : ""}`}>
                            <td className="px-5 py-3 font-mono text-cream/70 text-xs">{s.rollNo}</td>
                            <td className="px-5 py-3 font-semibold text-cream">
                              {s.name}
                              {existing && <span className="ml-2 text-[10px] text-green-400 border border-green-400/20 px-1.5 py-0.5 rounded-full">Published</span>}
                            </td>
                            <td className="px-5 py-3">
                              <input
                                type="number"
                                min="0"
                                max={selectedExam.totalMarks}
                                value={m}
                                onChange={e => setMarks(prev => ({ ...prev, [s.id]: e.target.value }))}
                                placeholder="–"
                                className="w-20 bg-navy-light/50 border border-gold/20 focus:border-gold outline-none rounded-sm px-3 py-1.5 text-cream text-sm text-center transition-all"
                              />
                            </td>
                            <td className={`px-5 py-3 font-bold ${gradeColor}`}>{grade}</td>
                            <td className="px-5 py-3">
                              <input
                                type="text"
                                value={remarks[s.id] || ""}
                                onChange={e => setRemarks(prev => ({ ...prev, [s.id]: e.target.value }))}
                                placeholder="Optional..."
                                className="w-32 bg-navy-light/30 border border-gold/10 focus:border-gold/40 outline-none rounded-sm px-3 py-1.5 text-cream/70 text-xs transition-all"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Footer save button */}
              {students.length > 0 && (
                <div className="px-6 py-4 border-t border-gold/10 flex items-center justify-between">
                  <p className="text-xs text-cream/40">
                    {results.length} of {students.length} students results published
                  </p>
                  <button onClick={handleSaveAllMarks} disabled={savingAll}
                    className="bg-gold hover:bg-gold-light text-navy-deep font-display font-bold px-6 py-2 rounded-sm transition-all disabled:opacity-50 flex items-center gap-2">
                    {savingAll ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Publish All Results
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .label-gold { display: block; font-size: 0.7rem; font-family: var(--font-display); font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: #d4af37; margin-bottom: 0.5rem; }
        .input-gold { background: rgba(30,40,60,0.5); border: 1px solid rgba(212,175,55,0.2); color: #f5f0e0; outline: none; border-radius: 2px; padding: 0.75rem 1rem; font-size: 0.875rem; transition: border-color 0.2s; }
        .input-gold:focus { border-color: #d4af37; }
        .input-gold option { background: #1a2540; }
      `}</style>
    </div>
  );
}

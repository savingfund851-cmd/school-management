"use client";

import { useState, useEffect } from "react";
import { Loader2, Award, BookOpen } from "lucide-react";

export default function StudentResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.student) {
            setStudentId(data.student.id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (studentId) {
      fetchResults();
    }
  }, [studentId]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      // In a real app, we'd have GET /api/results/[studentId] implemented.
      // Assuming it's implemented.
      const res = await fetch(`/api/results/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">My Results</h1>
        <p className="text-slate-400 text-sm">View your academic performance and exam grades.</p>
      </div>

      {!studentId && !loading ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
          Student profile not found. Please contact administration.
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-sm border-b border-slate-700">
                  <th className="p-4 font-medium">Exam</th>
                  <th className="p-4 font-medium">Subject</th>
                  <th className="p-4 font-medium text-center">Marks</th>
                  <th className="p-4 font-medium text-center">Grade</th>
                  <th className="p-4 font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                      Loading results...
                    </td>
                  </tr>
                ) : results.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No results published yet.
                    </td>
                  </tr>
                ) : (
                  results.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-slate-200 flex items-center gap-2">
                          <Award className="w-4 h-4 text-blue-400" />
                          {r.exam?.name || "Exam"}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {new Date(r.exam?.examDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-300">
                          <BookOpen className="w-4 h-4 text-slate-500" />
                          {r.exam?.subject || "Subject"}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="font-medium text-slate-200">
                          {r.marksObtained} <span className="text-slate-500 font-normal">/ {r.exam?.totalMarks || 100}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-sm font-bold ${
                          ['A+', 'A'].includes(r.grade) ? 'bg-emerald-500/10 text-emerald-400' :
                          ['A-', 'B'].includes(r.grade) ? 'bg-blue-500/10 text-blue-400' :
                          ['C', 'D'].includes(r.grade) ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {r.grade}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-sm">
                        {r.remarks || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

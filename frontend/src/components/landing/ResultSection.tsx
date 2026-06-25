"use client";

import { useEffect, useState } from "react";
import { Search, BookOpen, Trophy, Loader2 } from "lucide-react";
import { useLanguage } from "@/src/lib/i18n";

export default function ResultSection() {
  const { t } = useLanguage();
  const [classes, setClasses] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    // Load classes and available exams on mount
    Promise.all([
      fetch("/api/classes").then(r => r.json()),
      fetch("/api/results").then(r => r.json()),
    ]).then(([cls, exms]) => {
      if (Array.isArray(cls)) setClasses(cls);
      if (Array.isArray(exms)) setExams(exms);
    });
  }, []);

  const filteredExams = selectedClass
    ? exams.filter(e => e.class?.id === selectedClass || e.classId === selectedClass)
    : exams;

  const handleSearch = async () => {
    if (!selectedClass && !selectedExam) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (selectedExam) params.set("examId", selectedExam);
      else if (selectedClass) params.set("classId", selectedClass);

      const res = await fetch(`/api/results?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setResults(data);
      else setResults([]);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const gradeColor = (grade: string) => {
    if (["A+", "A"].includes(grade)) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (["B"].includes(grade)) return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    if (["C"].includes(grade)) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  return (
    <section id="results" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-5">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-10 bg-gold" />
            <span className="font-display uppercase tracking-[0.3em] text-gold text-xs">{t("Results", "ফলাফল")}</span>
            <span className="h-px w-10 bg-gold" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl text-navy font-600">
            {t("Exam Results", "পরীক্ষার ফলাফল")}
          </h2>
          <p className="mt-4 text-navy/65 text-lg">
            {t("Search exam results by class and exam name.", "শ্রেণী ও পরীক্ষার নাম দিয়ে ফলাফল অনুসন্ধান করুন।")}
          </p>
        </div>

        {/* Search Panel */}
        <div className="bg-navy rounded-sm p-6 md:p-8 shadow-2xl mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="text-xs font-display uppercase tracking-widest text-gold block mb-2">{t("Select Class", "শ্রেণী নির্বাচন করুন")}</label>
              <select
                value={selectedClass}
                onChange={e => { setSelectedClass(e.target.value); setSelectedExam(""); setResults([]); setSearched(false); }}
                className="w-full bg-navy-light/50 border border-gold/20 focus:border-gold outline-none rounded-sm px-4 py-3 text-cream text-sm transition-all"
              >
                <option value="">{t("-- All Classes --", "-- সকল শ্রেণী --")}</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{t(c.name)} - {t("Section", "বিভাগ")} {c.section}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-1">
              <label className="text-xs font-display uppercase tracking-widest text-gold block mb-2">{t("Select Exam", "পরীক্ষা নির্বাচন করুন")}</label>
              <select
                value={selectedExam}
                onChange={e => { setSelectedExam(e.target.value); setResults([]); setSearched(false); }}
                className="w-full bg-navy-light/50 border border-gold/20 focus:border-gold outline-none rounded-sm px-4 py-3 text-cream text-sm transition-all"
              >
                <option value="">{t("-- All Exams --", "-- সকল পরীক্ষা --")}</option>
                {exams.filter(e => !selectedClass || e.classId === selectedClass).map(e => (
                  <option key={e.id} value={e.id}>{t(e.name)} ({t(e.subject)})</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading || (!selectedClass && !selectedExam)}
                className="w-full bg-gold hover:bg-gold-light text-navy-deep font-display uppercase tracking-widest font-bold py-3 px-6 rounded-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                {t("Search", "অনুসন্ধান")}
              </button>
            </div>
          </div>
        </div>

        {/* Results Table */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-gold" />
          </div>
        ) : searched && results.length === 0 ? (
          <div className="text-center py-16 border border-navy/20 rounded-sm text-navy/50">
            <BookOpen size={48} className="mx-auto mb-4 text-gold/30" />
            <p className="text-lg">{t("No results found for this selection.", "এই নির্বাচনের জন্য কোনো ফলাফল পাওয়া যায়নি।")}</p>
          </div>
        ) : results.length > 0 ? (
          <div className="bg-navy rounded-sm shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gold/10 flex items-center gap-2">
              <Trophy className="text-gold" size={20} />
              <h3 className="font-display text-gold-light uppercase tracking-widest text-sm font-bold">
                {t(results[0]?.exam?.name)} — {t(results[0]?.exam?.class?.name)} {results[0]?.exam?.class?.section}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-cream/75">
                <thead className="text-xs font-display uppercase tracking-widest text-gold-light/70 border-b border-gold/10 bg-navy-light/20">
                  <tr>
                    <th className="px-6 py-3">{t("Rank", "ক্রমিক")}</th>
                    <th className="px-6 py-3">{t("Roll No", "রোল নং")}</th>
                    <th className="px-6 py-3">{t("Name", "নাম")}</th>
                    <th className="px-6 py-3">{t("Subject", "বিষয়")}</th>
                    <th className="px-6 py-3">{t("Marks", "নম্বর")}</th>
                    <th className="px-6 py-3">{t("Grade", "গ্রেড")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/5">
                  {results.map((r, i) => (
                    <tr key={r.id} className={`hover:bg-navy-light/10 transition-colors ${i === 0 ? "bg-gold/5" : ""}`}>
                      <td className="px-6 py-4">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </td>
                      <td className="px-6 py-4 font-mono text-cream/80">{r.student?.rollNo}</td>
                      <td className="px-6 py-4 font-semibold text-cream">{r.student?.name}</td>
                      <td className="px-6 py-4">{r.exam?.subject ? t(r.exam.subject) : ""}</td>
                      <td className="px-6 py-4 font-bold text-cream">{r.marksObtained}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase border ${gradeColor(r.grade)}`}>
                          {r.grade ? t(r.grade) : ""}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

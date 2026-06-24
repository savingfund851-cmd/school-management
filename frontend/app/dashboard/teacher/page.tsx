"use client";

import { useEffect, useState } from "react";
import { Bell, ClipboardList, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface Notice {
  id: string;
  title: string;
  publishedAt: string;
}

export default function TeacherDashboard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Notice post form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState("student");
  const [submittingNotice, setSubmittingNotice] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/notices");
        if (res.ok) {
          const data = await res.json();
          setNotices(data.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to fetch notices", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setNoticeMessage("");
    setSubmittingNotice(true);

    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, targetRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Notice post failed");
      }

      setNoticeMessage("Notice published successfully!");
      setTitle("");
      setContent("");
      // Refresh notices list
      setNotices(prev => [data.notice, ...prev].slice(0, 5));
    } catch (err: any) {
      setNoticeMessage(`Error: ${err.message}`);
    } finally {
      setSubmittingNotice(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Teacher Workspace</h1>
        <p className="text-slate-400 text-sm">Post class notices and manage student records</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Column 1: Notice Board Creator */}
        <div className="border border-slate-800 bg-slate-900/20 rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-teal-400" /> Create School Notice
          </h2>

          {noticeMessage && (
            <div className={`p-4 rounded-xl border mb-6 text-sm flex items-start gap-2.5 ${
              noticeMessage.startsWith("Error:") 
                ? "border-rose-500/20 bg-rose-500/5 text-rose-400" 
                : "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
            }`}>
              {noticeMessage.startsWith("Error:") ? (
                <AlertCircle className="h-5 w-5 shrink-0" />
              ) : (
                <CheckCircle className="h-5 w-5 shrink-0" />
              )}
              <span>{noticeMessage}</span>
            </div>
          )}

          <form onSubmit={handlePostNotice} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                Notice Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Syllabus changes for Midterm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none rounded-xl px-4 py-3 text-sm transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                Target Audience
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none rounded-xl px-4 py-3 text-sm transition-all"
              >
                <option value="student">Students</option>
                <option value="teacher">Teachers Only</option>
                <option value="all">Everyone</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                Notice Content
              </label>
              <textarea
                required
                rows={4}
                placeholder="Write notice details here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none rounded-xl px-4 py-3 text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submittingNotice}
              className="w-full bg-gradient-to-r from-teal-400 to-emerald-400 hover:opacity-95 disabled:opacity-50 transition-opacity text-slate-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {submittingNotice ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Publishing...
                </>
              ) : (
                "Publish Notice"
              )}
            </button>
          </form>
        </div>

        {/* Column 2: Recent Notices Feed */}
        <div className="border border-slate-800 bg-slate-900/20 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-teal-400" /> Recent Notices Published
          </h2>

          {notices.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-12">No notices published yet.</p>
          ) : (
            <div className="space-y-4">
              {notices.map((notice) => (
                <div 
                  key={notice.id} 
                  className="p-4 border border-slate-800/80 rounded-xl bg-slate-950/40 hover:border-slate-800 transition-colors"
                >
                  <h3 className="text-sm font-bold text-white mb-1">{notice.title}</h3>
                  <span className="text-xs text-slate-500">
                    {new Date(notice.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Megaphone, Clock } from "lucide-react";

export default function TeacherNoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentEmail, setCurrentEmail] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "", content: "", targetRole: "all"
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMe();
    fetchNotices();
  }, []);

  const fetchMe = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setCurrentEmail(data.user.email);
      }
    } catch(err) {}
  };

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notices");
      if (res.ok) {
        const data = await res.json();
        setNotices(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to publish notice");
      }

      setIsModalOpen(false);
      setFormData({ title: "", content: "", targetRole: "all" });
      fetchNotices();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      const res = await fetch(`/api/notices/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchNotices();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete notice.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Notice Board</h1>
          <p className="text-slate-400 text-sm">Publish and view announcements for your students.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Publish Notice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : notices.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-800 rounded-xl border border-slate-700">
            No notices found.
          </div>
        ) : (
          notices.map((n) => {
            const isMine = n.publishedBy?.email === currentEmail;
            
            return (
            <div key={n.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col hover:border-slate-600 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className={`px-2.5 py-1 rounded-full border ${
                    n.targetRole === 'all' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    n.targetRole === 'teacher' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {n.targetRole === 'all' ? 'All Roles' : n.targetRole === 'teacher' ? 'Teachers' : 'Students'}
                  </span>
                </div>
                {isMine && (
                  <button 
                    onClick={() => handleDelete(n.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-slate-100 mb-2">{n.title}</h3>
              <p className="text-slate-400 text-sm mb-6 flex-grow whitespace-pre-wrap">{n.content}</p>
              
              <div className="flex justify-between items-center text-xs text-slate-500 mt-auto pt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(n.publishedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5" />
                  {isMine ? 'You' : n.publishedBy?.email?.split('@')[0]}
                </div>
              </div>
            </div>
          )})
        )}
      </div>

      {/* Add Notice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-100">Publish Notice</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Target Audience *</label>
                <select 
                  required 
                  name="targetRole" 
                  value={formData.targetRole} 
                  onChange={handleInputChange} 
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">Everyone</option>
                  <option value="student">Students Only</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Title *</label>
                <input 
                  required 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Extra Class on Saturday"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-blue-500 focus:outline-none" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Content *</label>
                <textarea 
                  required 
                  name="content" 
                  value={formData.content} 
                  onChange={handleInputChange} 
                  rows={5} 
                  placeholder="Notice details..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

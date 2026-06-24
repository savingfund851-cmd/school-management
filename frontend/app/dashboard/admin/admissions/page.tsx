"use client";

import { useState, useEffect } from "react";
import { Loader2, Check, X, Eye } from "lucide-react";

export default function AdminAdmissionsPage() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admissions");
      if (res.ok) {
        const data = await res.json();
        setAdmissions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    if (!confirm(`Are you sure you want to mark this application as ${status}?`)) return;
    
    try {
      const res = await fetch(`/api/admissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      
      if (res.ok) {
        fetchAdmissions();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAdmissions = admissions.filter(a => statusFilter === "all" || a.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Admissions</h1>
          <p className="text-slate-400 text-sm">Review and manage online admission applications.</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-800/50">
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === status 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-sm border-b border-slate-700">
                <th className="p-4 font-medium">Applicant Info</th>
                <th className="p-4 font-medium">Class Applied</th>
                <th className="p-4 font-medium">Guardian Info</th>
                <th className="p-4 font-medium">Applied Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading applications...
                  </td>
                </tr>
              ) : filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No admission applications found.
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-200">{a.applicantName}</div>
                      <div className="text-xs text-slate-500">DOB: {new Date(a.dob).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4 text-slate-300 font-medium">
                      {a.applyingClass}
                    </td>
                    <td className="p-4">
                      <div className="text-slate-300 text-sm">{a.guardianName}</div>
                      <div className="text-xs text-slate-500">{a.guardianPhone}</div>
                      <div className="text-xs text-slate-500">{a.email}</div>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {new Date(a.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        a.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        a.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        {a.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => updateStatus(a.id, 'approved')}
                              className="p-2 hover:bg-emerald-500/10 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => updateStatus(a.id, 'rejected')}
                              className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="p-2 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-slate-200 transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

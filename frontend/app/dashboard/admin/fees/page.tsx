"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function AdminFeesPage() {
  const [fees, setFees] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "", amount: "", feeType: "tuition", dueDate: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFees();
    fetchStudents(); // Pre-load students for the add fee dropdown
  }, [statusFilter]);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fees?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setFees(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      // Get all active students without pagination limit for the dropdown (in a real app, use a searchable combobox)
      const res = await fetch(`/api/students?limit=1000`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add fee");
      }

      setIsModalOpen(false);
      setFormData({ studentId: "", amount: "", feeType: "tuition", dueDate: "" });
      fetchFees();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFeeStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/fees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        fetchFees();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Fee Management</h1>
          <p className="text-slate-400 text-sm">Track student payments and issue new fees.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Issue Fee
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-800/50">
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            {['all', 'paid', 'unpaid', 'partial'].map(status => (
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
                <th className="p-4 font-medium">Student</th>
                <th className="p-4 font-medium">Fee Type</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Due Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading fees...
                  </td>
                </tr>
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No fee records found.
                  </td>
                </tr>
              ) : (
                fees.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-200">{f.student?.name}</div>
                      <div className="text-xs text-slate-500">
                        Roll: {f.student?.rollNo} | {f.student?.class?.name}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 capitalize">{f.feeType}</td>
                    <td className="p-4 text-slate-200 font-medium">৳{f.amount}</td>
                    <td className="p-4">
                      <div className={`flex items-center gap-1.5 text-sm ${new Date(f.dueDate) < new Date() && f.status !== 'paid' ? 'text-red-400' : 'text-slate-400'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(f.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        f.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        f.status === 'unpaid' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {f.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        {f.status !== 'paid' && (
                          <button 
                            onClick={() => updateFeeStatus(f.id, 'paid')}
                            className="p-2 hover:bg-emerald-500/10 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors"
                            title="Mark as Paid"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {f.status !== 'unpaid' && (
                          <button 
                            onClick={() => updateFeeStatus(f.id, 'unpaid')}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                            title="Mark as Unpaid"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Fee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-100">Issue New Fee</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Student *</label>
                <select 
                  required 
                  name="studentId" 
                  value={formData.studentId} 
                  onChange={handleInputChange} 
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Student</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Roll: {s.rollNo})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Fee Type *</label>
                <select 
                  required 
                  name="feeType" 
                  value={formData.feeType} 
                  onChange={handleInputChange} 
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="tuition">Tuition Fee</option>
                  <option value="exam">Exam Fee</option>
                  <option value="admission">Admission Fee</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Amount (৳) *</label>
                <input 
                  required 
                  type="number"
                  step="0.01"
                  name="amount" 
                  value={formData.amount} 
                  onChange={handleInputChange} 
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-blue-500 focus:outline-none" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Due Date *</label>
                <input 
                  required 
                  type="date"
                  name="dueDate" 
                  value={formData.dueDate} 
                  onChange={handleInputChange} 
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-blue-500 focus:outline-none" 
                />
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
                  Issue Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

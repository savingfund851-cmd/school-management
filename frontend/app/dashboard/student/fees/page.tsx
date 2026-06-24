"use client";

import { useState, useEffect } from "react";
import { Loader2, DollarSign, Clock, CreditCard } from "lucide-react";

export default function StudentFeesPage() {
  const [fees, setFees] = useState<any[]>([]);
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
      fetchFees();
    }
  }, [studentId]);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fees/${studentId}`);
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

  const totalDue = fees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Fee Payments</h1>
        <p className="text-slate-400 text-sm">View your fee history and pending dues.</p>
      </div>

      {!studentId && !loading ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
          Student profile not found. Please contact administration.
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800 border border-red-500/30 p-6 rounded-xl flex items-center gap-4">
              <div className="bg-red-500/10 p-3 rounded-lg text-red-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-slate-400 text-sm mb-1">Total Amount Due</div>
                <div className="text-2xl font-bold text-red-400">৳{totalDue.toFixed(2)}</div>
              </div>
            </div>
            <div className="bg-slate-800 border border-emerald-500/30 p-6 rounded-xl flex items-center gap-4">
              <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-400">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <div className="text-slate-400 text-sm mb-1">Total Paid</div>
                <div className="text-2xl font-bold text-emerald-400">৳{totalPaid.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50">
              <h2 className="font-semibold text-slate-200">Fee Details</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-sm border-b border-slate-700">
                    <th className="p-4 font-medium">Fee Type</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium">Due Date</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                        Loading fee records...
                      </td>
                    </tr>
                  ) : fees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No fee records found.
                      </td>
                    </tr>
                  ) : (
                    fees.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-slate-200 capitalize">{f.feeType}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-slate-200">৳{f.amount.toFixed(2)}</div>
                        </td>
                        <td className="p-4">
                          <div className={`text-sm flex items-center gap-1.5 ${new Date(f.dueDate) < new Date() && f.status !== 'paid' ? 'text-red-400' : 'text-slate-300'}`}>
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(f.dueDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${
                            f.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            f.status === 'unpaid' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}>
                            {f.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {f.status !== 'paid' ? (
                            <button className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                              <CreditCard className="w-4 h-4" /> Pay Now
                            </button>
                          ) : (
                            <span className="text-slate-500 text-sm">
                              Paid on {new Date(f.paidDate).toLocaleDateString()}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

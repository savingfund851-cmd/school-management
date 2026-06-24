"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  UserCheck, 
  ClipboardList, 
  GraduationCap, 
  Check, 
  X, 
  Loader2 
} from "lucide-react";

interface Stats {
  students: number;
  teachers: number;
  admissions: number;
}

interface Admission {
  id: string;
  applicantName: string;
  applyingClass: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ students: 0, teachers: 0, admissions: 0 });
  const [recentAdmissions, setRecentAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [studentsRes, teachersRes, admissionsRes] = await Promise.all([
          fetch("/api/students"),
          fetch("/api/teachers"),
          fetch("/api/admissions")
        ]);

        const students = await studentsRes.json();
        const teachers = await teachersRes.json();
        const admissions = await admissionsRes.json();

        setStats({
          students: students.meta?.total || 0,
          teachers: teachers.meta?.total || 0,
          admissions: Array.isArray(admissions) ? admissions.length : 0
        });

        if (Array.isArray(admissions)) {
          setRecentAdmissions(admissions.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to load admin dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleReviewAdmission = async (id: string, status: "approved" | "rejected") => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        // Update local status
        setRecentAdmissions(prev => 
          prev.map(adm => adm.id === id ? { ...adm, status } : adm)
        );
        // Recalculate stats
        setStats(prev => ({
          ...prev,
          admissions: status === "approved" ? prev.admissions - 1 : prev.admissions
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
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
        <h1 className="text-2xl font-bold text-white mb-1">Administrative Overview</h1>
        <p className="text-slate-400 text-sm">Real-time metrics and quick management panels</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Students */}
        <div className="p-6 border border-slate-800 bg-slate-900/40 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-slate-400 block mb-1">Enrolled Students</span>
            <span className="text-3xl font-extrabold text-white">{stats.students}</span>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Total Teachers */}
        <div className="p-6 border border-slate-800 bg-slate-900/40 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-slate-400 block mb-1">Active Faculty</span>
            <span className="text-3xl font-extrabold text-white">{stats.teachers}</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Pending Admissions */}
        <div className="p-6 border border-slate-800 bg-slate-900/40 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-slate-400 block mb-1">Admission Requests</span>
            <span className="text-3xl font-extrabold text-white">{stats.admissions}</span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <ClipboardList className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Recent Admissions Review */}
      <div className="border border-slate-800 bg-slate-900/20 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-teal-400" /> Recent Admission Applications
        </h2>
        
        {recentAdmissions.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">No applications received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Applicant Name</th>
                  <th className="py-3 px-4">Applying Class</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentAdmissions.map((adm) => (
                  <tr key={adm.id} className="border-b border-slate-800/50 hover:bg-slate-900/20">
                    <td className="py-4 px-4 font-semibold text-white">{adm.applicantName}</td>
                    <td className="py-4 px-4">{adm.applyingClass}</td>
                    <td className="py-4 px-4">{adm.email}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                        adm.status === "pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        adm.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        {adm.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right flex justify-end gap-2">
                      {adm.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleReviewAdmission(adm.id, "approved")}
                            disabled={actionLoading !== null}
                            className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Approve"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleReviewAdmission(adm.id, "rejected")}
                            disabled={actionLoading !== null}
                            className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Reject"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

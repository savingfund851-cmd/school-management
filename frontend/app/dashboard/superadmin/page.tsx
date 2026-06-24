"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, ClipboardList, GraduationCap, Check, X, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface Stats {
  admins: number;
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

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stats>({ admins: 0, students: 0, teachers: 0, admissions: 0 });
  const [recentAdmissions, setRecentAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [adminsRes, studentsRes, teachersRes, admissionsRes] = await Promise.all([
          fetch("/api/admins"),
          fetch("/api/students"),
          fetch("/api/teachers"),
          fetch("/api/admissions"),
        ]);

        const admins = await adminsRes.json();
        const students = await studentsRes.json();
        const teachers = await teachersRes.json();
        const admissions = await admissionsRes.json();

        setStats({
          admins: Array.isArray(admins) ? admins.length : 0,
          students: students.meta?.total || 0,
          teachers: teachers.meta?.total || 0,
          admissions: Array.isArray(admissions) ? admissions.length : 0,
        });

        if (Array.isArray(admissions)) {
          setRecentAdmissions(admissions.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to load super admin dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleReview = async (id: string, status: "approved" | "rejected") => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRecentAdmissions(prev => prev.map(a => a.id === id ? { ...a, status } : a));
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
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Admins", value: stats.admins, icon: ShieldCheck, href: "/dashboard/superadmin/admins", color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Enrolled Students", value: stats.students, icon: Users, href: "/dashboard/admin/students", color: "text-gold-light", bg: "bg-gold/10" },
    { label: "Active Faculty", value: stats.teachers, icon: UserCheck, href: "/dashboard/admin/teachers", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Admission Requests", value: stats.admissions, icon: ClipboardList, href: "/dashboard/admin/admissions", color: "text-blue-400", bg: "bg-blue-500/10" },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-2xl font-serif font-bold text-gold-light mb-1">Super Admin Overview</h1>
        <p className="text-sm text-cream/60">Complete system visibility — manage everything from one place.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map(({ label, value, icon: Icon, href, color, bg }) => (
          <Link key={label} href={href} className="block group">
            <div className="bg-navy border border-gold/15 hover:border-gold/40 rounded-xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5">
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl bg-gold/5 group-hover:bg-gold/10 transition-colors" />
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-xs font-display tracking-widest text-cream/50 uppercase mb-2">{label}</p>
                  <h3 className="text-4xl font-bold text-cream">{value}</h3>
                </div>
                <div className={`p-3 ${bg} rounded-lg ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Admissions */}
      <div className="bg-navy border border-gold/15 rounded-xl shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gold/10 flex items-center justify-between">
          <h2 className="text-base font-serif font-bold text-cream flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-gold" /> Recent Admission Applications
          </h2>
          <Link href="/dashboard/admin/admissions" className="text-xs text-gold hover:text-gold-light font-display uppercase tracking-widest transition-colors">
            View All →
          </Link>
        </div>

        {recentAdmissions.length === 0 ? (
          <p className="text-cream/50 text-sm text-center py-8 italic">No applications received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-cream/75">
              <thead className="text-xs uppercase text-gold-light/70 font-display tracking-widest border-b border-gold/10 bg-navy-light/20">
                <tr>
                  <th className="py-3 px-6">Applicant</th>
                  <th className="py-3 px-6">Class</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {recentAdmissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-navy-light/10 transition-colors">
                    <td className="py-4 px-6 font-semibold text-cream">{adm.applicantName}</td>
                    <td className="py-4 px-6">{adm.applyingClass}</td>
                    <td className="py-4 px-6">{adm.email}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                        adm.status === "pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        adm.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {adm.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {adm.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleReview(adm.id, "approved")}
                            disabled={actionLoading !== null}
                            className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReview(adm.id, "rejected")}
                            disabled={actionLoading !== null}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
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

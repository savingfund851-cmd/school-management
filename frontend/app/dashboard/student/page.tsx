"use client";

import { useEffect, useState } from "react";
import { 
  Bell, 
  Calendar, 
  DollarSign, 
  Award, 
  BookOpen, 
  Loader2 
} from "lucide-react";

interface Notice {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
}

interface StudentDashboardData {
  studentId: string;
  name: string;
  rollNo: string;
  className: string;
  section: string;
  guardianName: string;
  guardianPhone: string;
}

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentDashboardData | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [attendancePercent, setAttendancePercent] = useState<number>(95); // Default display
  const [unpaidFeesCount, setUnpaidFeesCount] = useState<number>(0);

  useEffect(() => {
    async function loadStudentData() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          
          // Me endpoint gives full user object with profiles
          // Fetch student details from API if we need or resolve from auth
          // Since the database client we wrote returns user details:
          const user = meData.user;
          
          // Fetch student profile details from db or api
          // Let's call /api/students with the userId or retrieve via api
          const studentsRes = await fetch("/api/students");
          if (studentsRes.ok) {
            const studentsData = await studentsRes.json();
            const currentStudent = studentsData.data?.find(
              (std: any) => std.user.email === user.email
            );
            if (currentStudent) {
              setProfile({
                studentId: currentStudent.id,
                name: currentStudent.name,
                rollNo: currentStudent.rollNo,
                className: currentStudent.class?.name || "Class 10",
                section: currentStudent.section,
                guardianName: currentStudent.guardianName,
                guardianPhone: currentStudent.guardianPhone,
              });

              // Load attendance status
              const attRes = await fetch(`/api/attendance/${currentStudent.id}`);
              if (attRes.ok) {
                const attData = await attRes.json();
                if (attData.length > 0) {
                  const present = attData.filter((a: any) => a.status === "present").length;
                  setAttendancePercent(Math.round((present / attData.length) * 100));
                }
              }

              // Load fees status
              const feesRes = await fetch(`/api/fees/${currentStudent.id}`);
              if (feesRes.ok) {
                const feesData = await feesRes.json();
                const unpaid = feesData.filter((f: any) => f.status === "unpaid").length;
                setUnpaidFeesCount(unpaid);
              }
            }
          }
        }

        // Fetch notices
        const noticesRes = await fetch("/api/notices");
        if (noticesRes.ok) {
          const noticesData = await noticesRes.json();
          setNotices(noticesData.slice(0, 5));
        }

      } catch (err) {
        console.error("Failed to load student dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadStudentData();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome & Profile Info */}
      <div className="border border-slate-800 bg-slate-900/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {profile?.name || "Student Portal"}
          </h1>
          <p className="text-slate-400 text-sm">
            {profile ? `${profile.className} - Section ${profile.section} | Roll: ${profile.rollNo}` : "Loading profile details..."}
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="px-4 py-2 border border-slate-800 bg-slate-950 rounded-xl text-center">
            <span className="text-xs text-slate-500 block">Attendance</span>
            <span className="text-base font-bold text-teal-400">{attendancePercent}%</span>
          </div>
          <div className="px-4 py-2 border border-slate-800 bg-slate-950 rounded-xl text-center">
            <span className="text-xs text-slate-500 block">Unpaid Fees</span>
            <span className={`text-base font-bold ${unpaidFeesCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
              {unpaidFeesCount}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Student Modules */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Column 1 & 2: Notices Feed */}
        <div className="lg:col-span-2 border border-slate-800 bg-slate-900/20 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-teal-400" /> Announcements & Bulletins
          </h2>

          {notices.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-12">No active announcements at the moment.</p>
          ) : (
            <div className="space-y-4">
              {notices.map((notice) => (
                <div 
                  key={notice.id} 
                  className="p-5 border border-slate-800/80 rounded-xl bg-slate-950/40 hover:border-slate-800 transition-colors"
                >
                  <h3 className="text-base font-bold text-teal-400 mb-1">{notice.title}</h3>
                  <p className="text-slate-300 text-sm mb-3">{notice.content}</p>
                  <span className="text-xs text-slate-500 block">
                    Published on {new Date(notice.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 3: Stats & Profile Summary */}
        <div className="border border-slate-800 bg-slate-900/20 rounded-2xl p-6 space-y-6 h-fit">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-teal-400" /> Academic Profile
          </h2>

          <div className="space-y-4 text-sm">
            <div className="pb-3 border-b border-slate-800/50 flex justify-between">
              <span className="text-slate-400">Guardian Name</span>
              <span className="text-white font-medium">{profile?.guardianName || "N/A"}</span>
            </div>
            <div className="pb-3 border-b border-slate-800/50 flex justify-between">
              <span className="text-slate-400">Guardian Contact</span>
              <span className="text-white font-medium">{profile?.guardianPhone || "N/A"}</span>
            </div>
            <div className="pb-3 border-b border-slate-800/50 flex justify-between">
              <span className="text-slate-400">Term Grades</span>
              <span className="text-teal-400 font-bold flex items-center gap-1">
                <Award className="h-4 w-4" /> Good Standing
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

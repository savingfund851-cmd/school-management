"use client";

import { useState, useEffect } from "react";
import { Loader2, CalendarCheck, CalendarX, Clock } from "lucide-react";

export default function StudentAttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    // Need to get student ID from auth profile
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
      fetchAttendance();
    }
  }, [studentId]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setAttendance(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;
  const lateCount = attendance.filter(a => a.status === 'late').length;
  const totalDays = attendance.length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">My Attendance</h1>
        <p className="text-slate-400 text-sm">View your daily attendance records and statistics.</p>
      </div>

      {!studentId && !loading ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
          Student profile not found. Please contact administration.
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
              <div className="text-slate-400 text-sm mb-1">Total Days</div>
              <div className="text-2xl font-bold text-slate-100">{totalDays}</div>
            </div>
            <div className="bg-slate-800 border border-emerald-500/30 p-4 rounded-xl">
              <div className="text-emerald-400/80 text-sm mb-1 flex items-center gap-1.5"><CalendarCheck className="w-4 h-4"/> Present</div>
              <div className="text-2xl font-bold text-emerald-400">{presentCount}</div>
            </div>
            <div className="bg-slate-800 border border-red-500/30 p-4 rounded-xl">
              <div className="text-red-400/80 text-sm mb-1 flex items-center gap-1.5"><CalendarX className="w-4 h-4"/> Absent</div>
              <div className="text-2xl font-bold text-red-400">{absentCount}</div>
            </div>
            <div className="bg-slate-800 border border-yellow-500/30 p-4 rounded-xl">
              <div className="text-yellow-400/80 text-sm mb-1 flex items-center gap-1.5"><Clock className="w-4 h-4"/> Late</div>
              <div className="text-2xl font-bold text-yellow-400">{lateCount}</div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
              <h2 className="font-semibold text-slate-200">Attendance History</h2>
              <div className="text-sm">
                <span className="text-slate-400">Attendance Rate: </span>
                <span className={`font-bold ${attendancePercentage >= 80 ? 'text-emerald-400' : attendancePercentage >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {attendancePercentage}%
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-sm border-b border-slate-700">
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Marked By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                        Loading attendance...
                      </td>
                    </tr>
                  ) : attendance.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-400">
                        No attendance records found.
                      </td>
                    </tr>
                  ) : (
                    attendance.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="p-4 text-slate-300">
                          {new Date(a.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                            a.status === 'present' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            a.status === 'absent' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-sm">
                          {a.markedBy?.name || "Teacher"}
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

"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Calendar, Users } from "lucide-react";

export default function TeacherAttendancePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      fetchStudentsAndAttendance();
    } else {
      setStudents([]);
      setAttendance({});
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudentsAndAttendance = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      // Fetch students for the class
      const stRes = await fetch(`/api/students?classId=${selectedClass}&limit=100`);
      let fetchedStudents = [];
      if (stRes.ok) {
        const data = await stRes.json();
        fetchedStudents = data.data;
        setStudents(fetchedStudents);
      }

      // Fetch existing attendance
      const attRes = await fetch(`/api/attendance?classId=${selectedClass}&date=${selectedDate}`);
      const attMap: Record<string, string> = {};
      
      if (attRes.ok) {
        const attData = await attRes.json();
        attData.forEach((record: any) => {
          attMap[record.studentId] = record.status;
        });
      }

      // Pre-fill default status as 'present' if no record exists
      fetchedStudents.forEach((student: any) => {
        if (!attMap[student.id]) {
          attMap[student.id] = "present";
        }
      });
      
      setAttendance(attMap);
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to load data", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    if (!selectedClass || !selectedDate) return;
    
    setSaving(true);
    setMessage({ text: "", type: "" });
    
    const records = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      status
    }));

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass,
          date: selectedDate,
          records
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: "Attendance saved successfully!", type: "success" });
      } else {
        setMessage({ text: data.error || "Failed to save attendance", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Network error occurred", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Mark Attendance</h1>
        <p className="text-slate-400 text-sm">Record daily attendance for your classes.</p>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Date
            </label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5 flex items-center gap-2">
              <Users className="w-4 h-4" /> Class
            </label>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select Class</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            {message.text}
          </div>
        )}

        {!selectedClass ? (
          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-700 rounded-xl">
            Please select a class to mark attendance.
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-700 rounded-xl">
            No students found in this class.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto border border-slate-700 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-sm border-b border-slate-700">
                    <th className="p-4 font-medium w-20">Roll</th>
                    <th className="p-4 font-medium">Student Name</th>
                    <th className="p-4 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 text-slate-300 font-medium">{student.rollNo}</td>
                      <td className="p-4">
                        <div className="text-slate-200 font-medium">{student.name}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          {['present', 'absent', 'late'].map((statusOption) => (
                            <button
                              key={statusOption}
                              onClick={() => handleStatusChange(student.id, statusOption)}
                              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                                attendance[student.id] === statusOption
                                  ? statusOption === 'present' ? 'bg-emerald-500 text-white' 
                                  : statusOption === 'absent' ? 'bg-red-500 text-white'
                                  : 'bg-yellow-500 text-white'
                                  : 'bg-slate-900 text-slate-400 hover:bg-slate-700'
                              }`}
                            >
                              {statusOption}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Attendance
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

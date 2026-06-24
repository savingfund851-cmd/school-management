"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  GraduationCap, 
  Users, 
  UserCheck, 
  FileText, 
  Bell, 
  LogOut, 
  LayoutDashboard, 
  Calendar, 
  DollarSign, 
  ClipboardList,
  Menu,
  X,
  Loader2,
  Settings
} from "lucide-react";

interface User {
  id: string;
  email: string;
  role: "superadmin" | "admin" | "teacher" | "student";
  name: string;
  permissions?: string[];
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [authRes, settingsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/settings")
        ]);
        
        if (!authRes.ok) {
          router.push("/login");
          return;
        }
        const authData = await authRes.json();
        setUser(authData.user);

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);
        }
      } catch (err) {
        console.error("Fetch failed", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error(err);
    }
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-deep flex items-center justify-center text-gold-light">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-gold" />
          <span className="text-sm font-semibold tracking-wide text-cream/70 font-display uppercase">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Sidebar Links based on Role
  const getSidebarLinks = () => {
    const base = [
      { name: "Dashboard", href: `/dashboard/${user.role}`, icon: LayoutDashboard },
    ];

    if (user.role === "superadmin") {
      return [
        ...base,
        { name: "Manage Admins", href: "/dashboard/superadmin/admins", icon: Users },
        { name: "Site Settings", href: "/dashboard/superadmin/settings", icon: Settings },
        { name: "Students", href: "/dashboard/admin/students", icon: Users },
        { name: "Teachers", href: "/dashboard/admin/teachers", icon: UserCheck },
        { name: "Admissions", href: "/dashboard/admin/admissions", icon: ClipboardList },
        { name: "Fee Status", href: "/dashboard/admin/fees", icon: DollarSign },
        { name: "Notice Board", href: "/dashboard/admin/notices", icon: Bell },
        { name: "Result Management", href: "/dashboard/admin/results", icon: FileText },
      ];
    }

    if (user.role === "admin") {
      const perms = user.permissions || [];
      const adminLinks = [];
      if (perms.includes("manage_students")) adminLinks.push({ name: "Students", href: "/dashboard/admin/students", icon: Users });
      if (perms.includes("manage_teachers")) adminLinks.push({ name: "Teachers", href: "/dashboard/admin/teachers", icon: UserCheck });
      if (perms.includes("manage_admissions")) adminLinks.push({ name: "Admissions", href: "/dashboard/admin/admissions", icon: ClipboardList });
      if (perms.includes("manage_fees")) adminLinks.push({ name: "Fee Status", href: "/dashboard/admin/fees", icon: DollarSign });
      if (perms.includes("manage_notices")) adminLinks.push({ name: "Notice Board", href: "/dashboard/admin/notices", icon: Bell });
      if (perms.includes("manage_results")) adminLinks.push({ name: "Result Management", href: "/dashboard/admin/results", icon: FileText });
      return [...base, ...adminLinks];
    }

    if (user.role === "teacher") {
      return [
        ...base,
        { name: "Attendance", href: "/dashboard/teacher/attendance", icon: ClipboardList },
        { name: "Marks Entry", href: "/dashboard/teacher/marks", icon: FileText },
        { name: "Notices", href: "/dashboard/teacher/notices", icon: Bell },
      ];
    }

    // Student Links
    return [
      ...base,
      { name: "My Attendance", href: "/dashboard/student/attendance", icon: ClipboardList },
      { name: "My Results", href: "/dashboard/student/results", icon: FileText },
      { name: "Fee Status", href: "/dashboard/student/fees", icon: DollarSign },
    ];
  };

  const links = getSidebarLinks();
  const schoolName = settings?.schoolNameEn || "Rafiq Raju";

  return (
    <div className="min-h-screen bg-navy-deep text-cream flex flex-col md:flex-row font-sans selection:bg-gold selection:text-navy-deep">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-navy border-r border-gold/10 shrink-0 shadow-xl shadow-black/50 z-20">
        <div className="p-6 border-b border-gold/10 flex items-center gap-3">
          <img src={settings?.logoUrl || "/images/crest.png"} alt="Logo" className="h-10 w-10 object-contain drop-shadow" />
          <span className="font-serif font-bold tracking-wide text-lg text-cream leading-tight">
            {schoolName}
          </span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-display uppercase tracking-wider transition-all ${
                  active 
                    ? "bg-gold/10 border border-gold/30 text-gold-light shadow-inner" 
                    : "text-cream/60 hover:bg-navy-light/50 hover:text-cream"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gold/10 bg-navy-light/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-md text-sm font-display uppercase tracking-wider text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile Menu */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-navy-deep/90 backdrop-blur-sm md:hidden animate-in fade-in">
          <aside className="w-64 h-full bg-navy flex flex-col border-r border-gold/10 shadow-2xl">
            <div className="p-6 border-b border-gold/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={settings?.logoUrl || "/images/crest.png"} alt="Logo" className="h-8 w-8 object-contain" />
                <span className="font-serif font-bold tracking-wide text-lg text-cream">
                  {schoolName}
                </span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-cream/60 hover:text-gold transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              {links.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-display uppercase tracking-wider transition-all ${
                      active 
                        ? "bg-gold/10 border border-gold/30 text-gold-light" 
                        : "text-cream/60 hover:bg-navy-light/50 hover:text-cream"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gold/10">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-md text-sm font-display uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-navy-light/20 via-navy-deep to-navy-deep">
        {/* Top Header */}
        <header className="h-16 border-b border-gold/10 bg-navy/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-cream/60 hover:text-gold transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-sm font-display tracking-wide text-cream/70 uppercase">
              Welcome back, <span className="text-gold-light font-bold">{user.name}</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 rounded-sm text-xs font-bold font-display bg-gold/10 text-gold border border-gold/20 uppercase tracking-widest shadow-[0_0_10px_rgba(212,175,55,0.1)]">
              {user.role}
            </div>
          </div>
        </header>

        {/* Dynamic Page content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

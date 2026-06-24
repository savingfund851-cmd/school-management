"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/src/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((err) => console.error("Failed to fetch settings", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      const role = data.user.role;
      if (role === "superadmin") {
        router.push("/dashboard/superadmin");
      } else if (role === "admin") {
        router.push("/dashboard/admin");
      } else if (role === "teacher") {
        router.push("/dashboard/teacher");
      } else {
        router.push("/dashboard/student");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-deep flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 z-0">
        <img 
          src={settings?.heroImageUrl || "/images/hero.jpg"} 
          alt="Background" 
          className="w-full h-full object-cover opacity-20 scale-105 animate-[pulse_20s_ease-in-out_infinite]"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-navy-deep via-navy-deep/90 to-navy-light/40" />
      </div>

      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] bg-cream/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-5xl mx-4 lg:mx-auto flex flex-col md:flex-row bg-navy/60 backdrop-blur-2xl border border-gold/20 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 animate-fade-up">
        
        {/* Left Side: Branding */}
        <div className="hidden md:flex flex-col justify-between w-1/2 p-12 relative border-r border-gold/10">
          <div className="absolute inset-0">
            <img 
              src={settings?.heroImageUrl || "/images/campus.jpg"} 
              alt="Campus" 
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-navy/90 via-navy/50 to-navy-deep/90" />
          </div>
          
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 text-gold-light hover:text-gold transition-colors font-display uppercase tracking-wider text-xs">
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>

          <div className="relative z-10 mt-20 mb-10">
            <img src={settings?.logoUrl || "/images/crest.png"} alt="Crest" className="w-24 h-24 mb-8 drop-shadow-2xl" />
            <h1 className="font-serif text-4xl font-bold text-cream leading-tight mb-4 text-shadow">
              Welcome to<br />
              <span className="text-gold-light">
                {settings ? t(settings.schoolNameEn, settings.schoolNameBn) : "Rafiq Raju"}
              </span>
            </h1>
            <p className="text-cream/70 font-display tracking-widest uppercase text-sm">
              {settings ? t(settings.schoolSubtitleEn, settings.schoolSubtitleBn) : "Cadet School"}
            </p>
            <div className="w-12 h-px bg-gold my-6" />
            <p className="text-cream/60 italic font-serif text-lg leading-relaxed max-w-sm">
              "{settings ? t(settings.mottoEn, settings.mottoBn) : "Discipline · Knowledge · Honour"}"
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center relative">
          <div className="md:hidden flex flex-col items-center mb-8">
            <img src="/images/crest.png" alt="Crest" className="w-16 h-16 mb-4" />
            <h1 className="font-serif text-2xl font-bold text-cream text-center">
              {settings ? t(settings.schoolNameEn, settings.schoolNameBn) : "Rafiq Raju"}
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-white mb-2 tracking-wide uppercase">Sign In</h2>
            <p className="text-sm text-cream/50">Enter your credentials to access your portal</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-md border border-red-500/30 bg-red-500/10 text-sm text-red-200 flex items-start gap-3 animate-fade-up">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-xs font-display font-semibold uppercase tracking-widest text-gold block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cream/30 group-focus-within:text-gold transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="admin@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-navy-light/50 border border-gold/20 focus:border-gold focus:bg-navy-light/80 outline-none rounded-sm pl-12 pr-4 py-3.5 text-cream text-sm transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex items-center justify-between">
                <label className="text-xs font-display font-semibold uppercase tracking-widest text-gold block">
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-cream/50 hover:text-gold transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cream/30 group-focus-within:text-gold transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-navy-light/50 border border-gold/20 focus:border-gold focus:bg-navy-light/80 outline-none rounded-sm pl-12 pr-4 py-3.5 text-cream text-sm transition-all shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-light text-navy-deep font-display uppercase tracking-widest font-bold py-4 px-4 rounded-sm flex items-center justify-center gap-2 transition-all mt-4 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] disabled:opacity-70 disabled:hover:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Authenticating...
                </>
              ) : (
                "Secure Login"
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-gold/10 text-center text-xs text-cream/40 space-y-1 font-mono">
            <p className="text-gold/60 font-sans tracking-widest uppercase mb-3">Demo Accounts</p>
            <p>Super Admin: <span className="text-cream/80">superadmin@school.com</span> / password123</p>
            <p>Admin: <span className="text-cream/80">admin@school.com</span> / password123</p>
            <p>Teacher: <span className="text-cream/80">teacher@school.com</span> / password123</p>
            <p>Student: <span className="text-cream/80">student@school.com</span> / password123</p>
          </div>
        </div>
      </div>
      
      {/* Mobile Back to Home */}
      <div className="md:hidden absolute bottom-6 w-full text-center z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-gold-light hover:text-gold transition-colors font-display uppercase tracking-wider text-xs">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    </div>
  );
}

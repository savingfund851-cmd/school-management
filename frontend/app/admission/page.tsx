"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Phone, Mail, User, Calendar, MapPin, FileText } from "lucide-react";
import { useLanguage } from "@/src/lib/i18n";

export default function AdmissionPage() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    applicantName: "",
    dob: "",
    applyingClass: "",
    guardianName: "",
    guardianPhone: "",
    email: "",
    document: null as File | null,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then(r => r.json()).catch(() => null),
      fetch("/api/classes").then(r => r.json()).catch(() => [])
    ]).then(([settData, classData]) => {
      if (settData) setSettings(settData);
      if (Array.isArray(classData) && classData.length > 0) {
        setClasses(classData);
        setFormData(prev => ({ ...prev, applyingClass: classData[0].name }));
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, document: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          data.append(key, value as Blob | string);
        }
      });

      const res = await fetch("/api/admissions", {
        method: "POST",
        body: data,
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Submission failed");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const schoolName = settings ? t(settings.schoolNameEn, settings.schoolNameBn) : "Rafiq Raju";
  const schoolSub = settings ? t(settings.schoolSubtitleEn, settings.schoolSubtitleBn) : "Cadet School";

  return (
    <div className="min-h-screen bg-navy-deep text-cream font-sans relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <img 
          src={settings?.heroImageUrl || "/images/campus.jpg"} 
          alt="Campus" 
          className="w-full h-full object-cover opacity-10 scale-105 animate-[pulse_20s_ease-in-out_infinite]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-navy/80 via-navy-deep to-navy-deep" />
      </div>

      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gold-light hover:text-gold transition-colors mb-6 text-sm font-display uppercase tracking-widest font-semibold"
        >
          <ArrowLeft className="h-4 w-4" /> {t("Back to Home", "মূল পাতায় ফিরে যান")}
        </Link>

        {success ? (
          <div className="bg-navy/60 backdrop-blur-xl border border-gold/30 rounded-2xl p-10 sm:p-16 text-center shadow-2xl shadow-black/50 animate-fade-up">
            <div className="mx-auto w-24 h-24 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cream mb-4">{t("Application Submitted!", "আবেদন জমা হয়েছে!")}</h2>
            <p className="text-cream/60 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              {t("Thank you for applying to ", "ধন্যবাদ ")}{schoolName}. {t("Our admissions team will review your application and contact you shortly with the next steps.", "আমাদের ভর্তি বিষয়ক দল আপনার আবেদনটি পর্যালোচনা করবে এবং পরবর্তী পদক্ষেপের জন্য আপনার সাথে যোগাযোগ করবে।")}
            </p>
            <Link 
              href="/"
              className="inline-block px-8 py-4 text-sm font-display font-bold uppercase tracking-widest text-navy-deep bg-gold hover:bg-gold-light transition-all rounded-sm shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]"
            >
              {t("Return to Homepage", "হোমপেজে ফিরে যান")}
            </Link>
          </div>
        ) : (
          <div className="bg-navy/60 backdrop-blur-xl border border-gold/20 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 flex flex-col md:flex-row animate-fade-up">
            
            {/* Left Side: Information */}
            <div className="md:w-5/12 bg-navy-light/30 border-r border-gold/10 p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
              
              <div className="relative z-10">
                <img src={settings?.logoUrl || "/images/crest.png"} alt="Logo" className="h-20 w-20 object-contain mb-8 drop-shadow-xl" />
                <h1 className="font-serif text-3xl font-bold text-cream mb-2 leading-tight">
                  {t("Online Admission", "অনলাইন ভর্তি")}
                </h1>
                <h2 className="font-display text-gold-light uppercase tracking-widest text-sm font-semibold mb-8">
                  {schoolName} <span className="block text-[10px] text-cream/50 mt-1">{schoolSub}</span>
                </h2>
                
                <p className="text-cream/60 text-sm leading-relaxed mb-10">
                  {t("Begin your journey of excellence. Fill out the application form with accurate information to start the admission process.", "আপনার সাফল্যের যাত্রা শুরু করুন। ভর্তি প্রক্রিয়া শুরু করতে সঠিক তথ্য দিয়ে আবেদন ফরমটি পূরণ করুন।")}
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-gold/10 text-gold-light border border-gold/20">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-display uppercase tracking-widest text-cream/50 mb-1">{t("Contact Support", "যোগাযোগ করুন")}</p>
                      <p className="text-sm text-cream font-semibold">{settings?.contactPhoneEn || "+880 1700 000000"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-gold/10 text-gold-light border border-gold/20">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-display uppercase tracking-widest text-cream/50 mb-1">{t("Email Us", "ইমেইল করুন")}</p>
                      <p className="text-sm text-cream font-semibold">{settings?.contactEmail || "admission@rafiqraju.edu.bd"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="md:w-7/12 p-8 sm:p-12 relative">
              <h3 className="font-display text-xl font-bold text-white mb-2 tracking-wide uppercase">{t("Application Form", "আবেদন ফরম")}</h3>
              <p className="text-sm text-cream/40 mb-8">{t("All fields marked with * are required.", "* চিহ্নিত সব ফিল্ড পূরণ করা আবশ্যক।")}</p>

              {error && (
                <div className="mb-8 p-4 rounded-md border border-red-500/30 bg-red-500/10 text-sm text-red-300 flex items-start gap-3 animate-fade-in">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 group">
                  <label className="text-xs font-display font-semibold uppercase tracking-widest text-gold block">{t("Applicant Full Name *", "আবেদনকারীর পুরো নাম *")}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cream/30 group-focus-within:text-gold transition-colors" />
                    <input type="text" name="applicantName" required placeholder="John Doe" value={formData.applicantName} onChange={handleChange}
                      className="w-full bg-navy-light/40 border border-gold/20 focus:border-gold outline-none rounded-sm pl-12 pr-4 py-3 text-cream text-sm transition-all shadow-inner" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <label className="text-xs font-display font-semibold uppercase tracking-widest text-gold block">{t("Date of Birth *", "জন্ম তারিখ *")}</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cream/30 group-focus-within:text-gold transition-colors" />
                      <input type="date" name="dob" required value={formData.dob} onChange={handleChange}
                        className="w-full bg-navy-light/40 border border-gold/20 focus:border-gold outline-none rounded-sm pl-12 pr-4 py-3 text-cream text-sm transition-all shadow-inner" />
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-xs font-display font-semibold uppercase tracking-widest text-gold block">{t("Applying Class *", "ভর্তির শ্রেণী *")}</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cream/30 group-focus-within:text-gold transition-colors" />
                      <select name="applyingClass" required value={formData.applyingClass} onChange={handleChange}
                        className="w-full bg-navy-light/40 border border-gold/20 focus:border-gold outline-none rounded-sm pl-12 pr-4 py-3 text-cream text-sm transition-all shadow-inner appearance-none">
                        {classes.length > 0 ? (
                          classes.map(c => <option key={c.id} value={c.name} className="bg-navy">{c.name}</option>)
                        ) : (
                          ["Play", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9"].map(c => (
                            <option key={c} value={c} className="bg-navy">{c}</option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <label className="text-xs font-display font-semibold uppercase tracking-widest text-gold block">{t("Guardian Name *", "অভিভাবকের নাম *")}</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cream/30 group-focus-within:text-gold transition-colors" />
                      <input type="text" name="guardianName" required placeholder="Mr. Parent" value={formData.guardianName} onChange={handleChange}
                        className="w-full bg-navy-light/40 border border-gold/20 focus:border-gold outline-none rounded-sm pl-12 pr-4 py-3 text-cream text-sm transition-all shadow-inner" />
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-xs font-display font-semibold uppercase tracking-widest text-gold block">{t("Guardian Phone *", "অভিভাবকের ফোন নম্বর *")}</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cream/30 group-focus-within:text-gold transition-colors" />
                      <input type="tel" name="guardianPhone" required placeholder="+88017XXXXXXXX" value={formData.guardianPhone} onChange={handleChange}
                        className="w-full bg-navy-light/40 border border-gold/20 focus:border-gold outline-none rounded-sm pl-12 pr-4 py-3 text-cream text-sm transition-all shadow-inner" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label className="text-xs font-display font-semibold uppercase tracking-widest text-gold block">{t("Contact Email *", "ইমেইল *")}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cream/30 group-focus-within:text-gold transition-colors" />
                    <input type="email" name="email" required placeholder="applicant@example.com" value={formData.email} onChange={handleChange}
                      className="w-full bg-navy-light/40 border border-gold/20 focus:border-gold outline-none rounded-sm pl-12 pr-4 py-3 text-cream text-sm transition-all shadow-inner" />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label className="text-xs font-display font-semibold uppercase tracking-widest text-gold block">{t("Upload Document (JPG/PNG/PDF)", "ডকুমেন্ট আপলোড (JPG/PNG/PDF)")}</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cream/30 group-focus-within:text-gold transition-colors" />
                    <input type="file" name="document" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange}
                      className="w-full bg-navy-light/40 border border-gold/20 focus:border-gold outline-none rounded-sm pl-12 pr-4 py-2.5 text-cream text-sm transition-all shadow-inner file:mr-4 file:py-1 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-gold file:text-navy-deep hover:file:bg-gold-light cursor-pointer" />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-gold hover:bg-gold-light text-navy-deep font-display uppercase tracking-widest font-bold py-4 px-4 rounded-sm flex items-center justify-center gap-3 transition-all mt-8 shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] disabled:opacity-70 disabled:shadow-none"
                >
                  {loading ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> {t("Submitting...", "জমা দেওয়া হচ্ছে...")}</>
                  ) : (
                    <>{t("Submit Application", "আবেদন জমা দিন")}</>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

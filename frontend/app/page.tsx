"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Users, 
  Award, 
  Bell, 
  ArrowRight, 
  GraduationCap, 
  ShieldCheck, 
  Clock,
  Globe
} from "lucide-react";
import About from "@/src/components/landing/About";
import Academics from "@/src/components/landing/Academics";
import CampusLife from "@/src/components/landing/CampusLife";
import Admissions from "@/src/components/landing/Admissions";
import Footer from "@/src/components/landing/Footer";
import Navbar from "@/src/components/landing/Navbar";
import NoticeSection from "@/src/components/landing/NoticeSection";
import ResultSection from "@/src/components/landing/ResultSection";
import { useLanguage } from "@/src/lib/i18n";

interface Notice {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
}

export default function LandingPage() {
  const { language, setLanguage, t } = useLanguage();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [noticesRes, settingsRes] = await Promise.all([
          fetch("/api/notices"),
          fetch("/api/settings")
        ]);
        
        if (noticesRes.ok) {
          setNotices(await noticesRes.json());
        }
        if (settingsRes.ok) {
          setSettings(await settingsRes.json());
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-teal-500 selection:text-slate-900 overflow-x-hidden">
      <Navbar settings={settings} />

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={settings?.heroImageUrl || "/images/hero.jpg"} 
            alt="School Hero" 
            className="w-full h-full object-cover transition-opacity duration-1000" 
            style={{ opacity: loading ? 0 : 1 }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy/80 to-navy/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 w-full pt-28">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <span className="h-px w-12 bg-gold" />
              <span className="font-display uppercase tracking-[0.35em] text-gold-light text-xs sm:text-sm">
                {settings ? t(settings.establishedYearEn, settings.establishedYearBn) : "Established 1998"}
              </span>
            </div>

            <h1
              className="font-serif text-cream text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] text-shadow-strong animate-fade-up"
              style={{ animationDelay: '0.25s' }}
            >
              {settings ? t(settings.schoolNameEn, settings.schoolNameBn) : "Rafiq Raju"}
              <span className="block text-gold-light">
                {settings ? t(settings.schoolSubtitleEn, settings.schoolSubtitleBn) : "Cadet School"}
              </span>
            </h1>

            <p
              className={`mt-4 ${language === 'bn' ? 'font-bangla' : 'font-serif tracking-widest'} text-cream/85 text-xl animate-fade-up`}
              style={{ animationDelay: '0.4s' }}
            >
              {settings ? t(settings.mottoEn, settings.mottoBn) : "Discipline · Knowledge · Honour"}
            </p>

            <p
              className="mt-6 text-cream/80 text-lg sm:text-xl leading-relaxed max-w-xl animate-fade-up"
              style={{ animationDelay: '0.55s' }}
            >
              {settings ? t(settings.descriptionEn, settings.descriptionBn) : "Forging tomorrow's leaders through academic brilliance, unbreakable discipline, and the timeless values of honour and service to the nation."}
            </p>

            <div className="mt-9 flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: '0.7s' }}>
              <Link
                href="/admission"
                className="bg-gold text-navy-deep font-display uppercase tracking-wider font-semibold px-8 py-4 rounded-sm hover:bg-gold-light transition-colors"
              >
                {t("Apply for Admission", "ভর্তির আবেদন করুন")}
              </Link>
              <a
                href="#features"
                className="border border-cream/40 text-cream font-display uppercase tracking-wider font-semibold px-8 py-4 rounded-sm hover:bg-cream hover:text-navy-deep transition-colors"
              >
                {t("Discover More", "আরও জানুন")}
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 z-10 border-t border-gold/20 bg-navy-deep/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-5 grid grid-cols-2 sm:grid-cols-4 divide-x divide-gold/15">
            {[
              [settings?.stat1Value || "1200+", settings ? t(settings.stat1LabelEn, settings.stat1LabelBn) : "Cadets"],
              [settings?.stat2Value || "98%", settings ? t(settings.stat2LabelEn, settings.stat2LabelBn) : "Pass Rate"],
              [settings?.stat3Value || "60+", settings ? t(settings.stat3LabelEn, settings.stat3LabelBn) : "Faculty"],
              [settings?.stat4Value || "26", settings ? t(settings.stat4LabelEn, settings.stat4LabelBn) : "Years of Legacy"],
            ].map(([n, l]) => (
              <div key={l} className="py-6 px-4 text-center">
                <div className="font-display text-gold-light text-2xl sm:text-3xl font-bold">{n}</div>
                <div className="font-display uppercase tracking-widest text-cream/70 text-[10px] sm:text-xs mt-1">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <About settings={settings} />
      <Academics settings={settings} />
      <CampusLife settings={settings} />
      <Admissions settings={settings} />
      <NoticeSection />
      <ResultSection />
      <Footer settings={settings} />
    </div>
  );
}

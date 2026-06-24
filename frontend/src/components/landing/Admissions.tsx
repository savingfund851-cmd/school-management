"use client";
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from "@/src/lib/i18n";
import Link from 'next/link';

export default function Admissions({ settings }: { settings?: any }) {
  const { t } = useLanguage();

  const title = settings ? t(settings.admissionsTitleEn, settings.admissionsTitleBn) : "Take The First Step";
  const desc = settings ? t(settings.admissionsTextEn, settings.admissionsTextBn) : "Join a legacy of excellence. We select candidates who demonstrate academic potential, physical fitness, and strong moral character.";

  return (
    <section id="admissions" className="py-24 bg-navy-deep relative overflow-hidden">
      <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full text-gold fill-current" preserveAspectRatio="none">
          <polygon points="100,0 0,0 100,100" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-5 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-gold" />
              <span className="font-display uppercase tracking-[0.3em] text-gold-light text-xs">Admissions</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-600 text-cream leading-tight">
              {title}
            </h2>
            <p className="mt-6 text-cream/70 text-lg leading-relaxed whitespace-pre-wrap">
              {desc}
            </p>

            <ul className="mt-8 space-y-4">
              {[
                t('Written Examination', 'লিখিত পরীক্ষা'),
                t('Physical Fitness Test', 'শারীরিক যোগ্যতা পরীক্ষা'),
                t('Medical Screening', 'মেডিকেল স্ক্রিনিং'),
                t('Final Interview', 'চূড়ান্ত সাক্ষাৎকার')
              ].map((step) => (
                <li key={step} className="flex items-center gap-3 text-cream/80">
                  <CheckCircle2 className="text-gold" size={20} />
                  <span>{step}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Link
                href="/admission"
                className="inline-flex items-center justify-center gap-3 bg-gold hover:bg-gold-light text-navy-deep font-display uppercase tracking-wider font-bold px-8 py-4 rounded-sm transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:-translate-y-1"
              >
                {t("Apply Now", "এখনই আবেদন করুন")} <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute inset-0 border-2 border-gold/30 rounded-sm translate-x-4 translate-y-4" />
            <img
              src={settings?.admissionImageUrl || "/images/hero.jpg"}
              alt="Admissions"
              className="relative z-10 w-full h-[500px] object-cover rounded-sm shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

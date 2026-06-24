"use client";
import { FlaskConical, Globe2, Calculator, Palette, Cpu, Dumbbell } from 'lucide-react';
import { useLanguage } from "@/src/lib/i18n";

export default function Academics({ settings }: { settings?: any }) {
  const { t } = useLanguage();

  const title = settings ? t(settings.academicsTitleEn, settings.academicsTitleBn) : "A Curriculum Built for Leaders";
  const desc = settings ? t(settings.academicsTextEn, settings.academicsTextBn) : "Comprehensive programmes designed to challenge intellect, ignite curiosity and cultivate well-rounded excellence.";

  const defaultProgramsData = [
    { nameEn: 'Science', nameBn: 'বিজ্ঞান', descEn: 'Physics, Chemistry & Biology with modern laboratories.', descBn: 'আধুনিক ল্যাবরেটরিসহ পদার্থ, রসায়ন এবং জীববিজ্ঞান।' },
    { nameEn: 'Mathematics', nameBn: 'গণিত', descEn: 'Advanced reasoning and problem-solving foundations.', descBn: 'উন্নত যুক্তিবাদ এবং সমস্যা সমাধানের ভিত্তি।' },
    { nameEn: 'Humanities', nameBn: 'মানবিক', descEn: 'History, geography and civic responsibility.', descBn: 'ইতিহাস, ভূগোল এবং নাগরিক দায়িত্ব।' },
    { nameEn: 'ICT', nameBn: 'আইসিটি', descEn: 'Computer science and digital literacy for the future.', descBn: 'ভবিষ্যতের জন্য কম্পিউটার বিজ্ঞান এবং ডিজিটাল সাক্ষরতা।' },
    { nameEn: 'Arts & Culture', nameBn: 'শিল্প ও সংস্কৃতি', descEn: 'Music, debate, art and creative expression.', descBn: 'সঙ্গীত, বিতর্ক, শিল্প এবং সৃজনশীল প্রকাশ।' },
    { nameEn: 'Physical Training', nameBn: 'শারীরিক প্রশিক্ষণ', descEn: 'Drill, sports and fitness for body and mind.', descBn: 'শরীর ও মনের জন্য ড্রিল, খেলাধুলা এবং ফিটনেস।' },
  ];

  const programs = settings?.academicsPrograms ? JSON.parse(settings.academicsPrograms) : defaultProgramsData;

  const getIcon = (index: number) => {
    const icons = [FlaskConical, Calculator, Globe2, Cpu, Palette, Dumbbell];
    return icons[index] || FlaskConical;
  };

  return (
    <section id="academics" className="relative py-24 bg-navy text-cream overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '28px 28px' }} />
      <div className="relative max-w-7xl mx-auto px-5">
        <div className="text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-10 bg-gold" />
            <span className="font-display uppercase tracking-[0.3em] text-gold-light text-xs">Academics</span>
            <span className="h-px w-10 bg-gold" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-600">{title}</h2>
          <p className="mt-5 text-cream/70 text-lg whitespace-pre-wrap">
            {desc}
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog: any, index: number) => {
            const Icon = getIcon(index);
            const itemName = t(prog.nameEn, prog.nameBn);
            const itemDesc = t(prog.descEn, prog.descBn);
            return (
              <div
                key={index}
                className="group bg-navy-light/40 border border-gold/15 rounded-sm p-7 hover:border-gold/50 hover:bg-navy-light/70 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-sm bg-gold/10 flex items-center justify-center group-hover:bg-gold transition-colors">
                  <Icon className="text-gold-light group-hover:text-navy-deep transition-colors" size={24} strokeWidth={1.5} />
                </div>
                <h3 className="font-display uppercase tracking-wider text-lg mt-5 font-600 text-cream">{itemName}</h3>
                <p className="text-cream/65 mt-2 leading-relaxed">{itemDesc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

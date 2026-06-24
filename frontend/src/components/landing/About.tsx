"use client";
import { ShieldCheck, BookOpenText, Medal } from 'lucide-react';
import { useLanguage } from "@/src/lib/i18n";

export default function About({ settings }: { settings?: any }) {
  const { t } = useLanguage();

  const imageUrl = settings?.aboutImageUrl || "/images/campus.jpg";
  const title = settings ? t(settings.aboutTitleEn, settings.aboutTitleBn) : "Who We Are";
  const desc = settings ? t(settings.aboutTextEn, settings.aboutTextBn) : "Welcome to Rafiq Raju Cadet School, where we nurture tomorrow's leaders today. Founded in 1995, our institution has been at the forefront of holistic education, combining rigorous academics with comprehensive character development.";

  const defaultPillarsData = [
    { titleEn: 'Discipline', titleBn: 'শৃঙ্খলা', textEn: 'A structured, military-style routine that instils punctuality, resilience and self-mastery in every cadet.', textBn: 'একটি সুশৃঙ্খল, সামরিক ধাঁচের রুটিন যা প্রতিটি ক্যাডেটের মধ্যে সময়ানুবর্তিতা, স্থিতিস্থাপকতা এবং আত্মনিয়ন্ত্রণ জাগিয়ে তোলে।' },
    { titleEn: 'Knowledge', titleBn: 'জ্ঞান', textEn: 'A rigorous academic curriculum led by dedicated faculty, balancing science, arts and critical thinking.', textBn: 'নিবেদিত শিক্ষকমণ্ডলী দ্বারা পরিচালিত একটি কঠোর একাডেমিক পাঠ্যক্রম, যা বিজ্ঞান, কলা এবং সমালোচনামূলক চিন্তাভাবনার ভারসাম্য বজায় রাখে।' },
    { titleEn: 'Honour', titleBn: 'সম্মান', textEn: 'A code of integrity, leadership and service that shapes character far beyond the classroom walls.', textBn: 'সততা, নেতৃত্ব এবং সেবার একটি নিয়ম যা শ্রেণীকক্ষের দেয়ালের বাইরেও চরিত্র গঠন করে।' },
  ];

  const pillars = settings?.aboutPillars ? JSON.parse(settings.aboutPillars) : defaultPillarsData;

  const getPillarIcon = (index: number) => {
    const icons = [ShieldCheck, BookOpenText, Medal];
    return icons[index] || ShieldCheck;
  };

  return (
    <section id="about" className="py-24 bg-navy-deep relative overflow-hidden border-t border-gold/10">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex items-center justify-center gap-3 mb-16">
          <span className="h-px w-10 bg-gold" />
          <span className="font-display uppercase tracking-[0.3em] text-gold-light text-xs">About Us</span>
        </div>
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div className="relative">
            <img
              src={imageUrl}
              alt="Campus"
              className="w-full h-[460px] object-cover rounded-sm shadow-2xl"
            />
            <div className="absolute -bottom-6 -right-6 hidden sm:block bg-navy text-cream p-7 rounded-sm shadow-xl max-w-[220px] border-l-4 border-gold">
              <p className="font-serif text-xl italic leading-snug">
                “We do not merely teach — we build nations, one cadet at a time.”
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-gold" />
              <span className="font-display uppercase tracking-[0.3em] text-gold text-xs">{title}</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-600 text-cream leading-tight">
              A Tradition of Excellence & Discipline
            </h2>
            <p className="mt-6 text-cream/75 text-lg leading-relaxed whitespace-pre-wrap">
              {desc}
            </p>

            <div className="mt-10 grid sm:grid-cols-3 gap-6">
              {pillars.map((pillar: any, index: number) => {
                const Icon = getPillarIcon(index);
                const itemTitle = t(pillar.titleEn, pillar.titleBn);
                const itemText = t(pillar.textEn, pillar.textBn);
                return (
                  <div key={index} className="group">
                    <Icon className="text-gold" size={32} strokeWidth={1.5} />
                    <h3 className="font-display uppercase tracking-wider text-cream mt-3 text-sm font-600">
                      {itemTitle}
                    </h3>
                    <p className="text-cream/65 text-sm mt-2 leading-relaxed">{itemText}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

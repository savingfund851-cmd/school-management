"use client";
import { useLanguage } from "@/src/lib/i18n";

export default function CampusLife({ settings }: { settings?: any }) {
  const { t } = useLanguage();

  const title = settings ? t(settings.campusTitleEn, settings.campusTitleBn) : "Where Character Is Forged Daily";
  const desc = settings ? t(settings.campusTextEn, settings.campusTextBn) : "Life at Rafiq Raju Cadet School is a rigorous balance of academics, physical training, and moral development.";

  const items = [
    { img: settings?.campusImage1Url || '/images/campus.jpg', tag: 'Academics', title: 'Focus & Dedication' },
    { img: settings?.campusImage2Url || '/images/hero.jpg', tag: 'Drill', title: 'Military Precision' },
    { img: settings?.campusImage3Url || '/images/campus.jpg', tag: 'Campus', title: 'A Living Heritage' },
  ];

  return (
    <section id="campus-life" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-gold" />
              <span className="font-display uppercase tracking-[0.3em] text-gold text-xs">Campus Life</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-600 text-navy leading-tight max-w-xl">
              {title}
            </h2>
          </div>
          <p className="text-navy/65 text-lg max-w-sm whitespace-pre-wrap">
            {desc}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(({ img, tag, title: itemTitle }) => (
            <div key={itemTitle} className="group cursor-pointer">
              <div className="relative h-80 overflow-hidden rounded-sm">
                <div className="absolute inset-0 bg-navy/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <img
                  src={img}
                  alt={itemTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-5 left-5 z-20 bg-gold px-3 py-1 text-navy-deep font-display uppercase tracking-widest text-[10px] font-bold">
                  {tag}
                </div>
              </div>
              <h3 className="font-serif text-xl text-navy mt-5 font-600 group-hover:text-gold transition-colors">
                {itemTitle}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Bell, Clock, ChevronRight, Megaphone } from "lucide-react";
import { useLanguage } from "@/src/lib/i18n";

export default function NoticeSection() {
  const { t } = useLanguage();
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    fetch("/api/notices?public=true")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setNotices(data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="notices" className="py-24 bg-navy-deep relative overflow-hidden">
      {/* subtle dot grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #d4af37 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      <div className="relative max-w-7xl mx-auto px-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-gold" />
              <span className="font-display uppercase tracking-[0.3em] text-gold-light text-xs">{t("Notice Board", "নোটিশ বোর্ড")}</span>
              <span className="h-px w-10 bg-gold" />
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl text-cream font-600">
              {t("Latest Announcements", "সর্বশেষ বিজ্ঞপ্তি")}
            </h2>
          </div>
          <Bell className="text-gold/30 shrink-0" size={64} strokeWidth={0.8} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-navy border border-gold/10 rounded-sm h-44 animate-pulse" />
            ))}
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-16 text-cream/40 border border-gold/10 rounded-sm">
            <Megaphone size={48} className="mx-auto mb-4 text-gold/20" />
            <p className="text-lg">{t("No notices published yet.", "এখনো কোনো বিজ্ঞপ্তি প্রকাশিত হয়নি।")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {notices.map((n, i) => (
              <button
                key={n.id}
                onClick={() => setSelected(n)}
                className="group text-left bg-navy border border-gold/15 hover:border-gold/50 rounded-sm p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 animate-fade-up"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-display uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                    n.targetRole === 'all' ? 'bg-gold/10 text-gold border-gold/20' :
                    n.targetRole === 'teacher' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {n.targetRole === 'all' ? t('General', 'সাধারণ') : n.targetRole === 'teacher' ? t('Teachers', 'শিক্ষকদের') : t('Students', 'শিক্ষার্থীদের')}
                  </span>
                  <ChevronRight size={16} className="text-gold/40 group-hover:text-gold transition-colors" />
                </div>
                <h3 className="font-serif text-cream text-lg font-600 leading-snug mb-3 group-hover:text-gold-light transition-colors line-clamp-2">
                  {n.title}
                </h3>
                <p className="text-cream/55 text-sm leading-relaxed line-clamp-3">{n.content}</p>
                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gold/10 text-xs text-cream/40">
                  <Clock size={12} />
                  {new Date(n.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal for full notice */}
      {selected && (
        <div className="fixed inset-0 bg-navy-deep/80 backdrop-blur-sm z-50 flex items-center justify-center p-5" onClick={() => setSelected(null)}>
          <div className="bg-navy border border-gold/30 rounded-sm max-w-xl w-full shadow-2xl shadow-black/50 animate-fade-up" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gold/15 flex items-start justify-between gap-4">
              <div>
                <span className={`text-[10px] font-display uppercase tracking-widest px-2 py-1 rounded-full border inline-block mb-3 ${
                  selected.targetRole === 'all' ? 'bg-gold/10 text-gold border-gold/20' :
                  selected.targetRole === 'teacher' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {selected.targetRole === 'all' ? t('General', 'সাধারণ') : selected.targetRole === 'teacher' ? t('Teachers', 'শিক্ষকদের') : t('Students', 'শিক্ষার্থীদের')}
                </span>
                <h3 className="font-serif text-xl text-cream font-600">{selected.title}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-cream/40 hover:text-cream transition-colors shrink-0 text-xl">✕</button>
            </div>
            <div className="p-6">
              <p className="text-cream/75 leading-relaxed whitespace-pre-wrap">{selected.content}</p>
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gold/10 text-xs text-cream/40">
                <Clock size={12} />
                {new Date(selected.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                {selected.publishedBy && <span className="ml-auto">by {selected.publishedBy.email.split('@')[0]}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

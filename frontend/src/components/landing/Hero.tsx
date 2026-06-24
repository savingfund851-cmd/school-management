"use client";
export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src="/images/hero.jpg" alt="Cadets on parade" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy/80 to-navy/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 w-full pt-28">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <span className="h-px w-12 bg-gold" />
            <span className="font-display uppercase tracking-[0.35em] text-gold-light text-xs sm:text-sm">
              Established 1998
            </span>
          </div>

          <h1
            className="font-serif text-cream text-5xl sm:text-6xl lg:text-7xl font-600 leading-[1.05] text-shadow-strong animate-fade-up"
            style={{ animationDelay: '0.25s' }}
          >
            Rafiq Raju
            <span className="block text-gold-light">Cadet School</span>
          </h1>

          <p
            className="mt-4 font-bangla text-cream/85 text-xl animate-fade-up"
            style={{ animationDelay: '0.4s' }}
          >
            শৃঙ্খলা · জ্ঞান · সম্মান
          </p>

          <p
            className="mt-6 text-cream/80 text-lg sm:text-xl leading-relaxed max-w-xl animate-fade-up"
            style={{ animationDelay: '0.55s' }}
          >
            Forging tomorrow's leaders through academic brilliance, unbreakable discipline,
            and the timeless values of honour and service to the nation.
          </p>

          <div className="mt-9 flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: '0.7s' }}>
            <a
              href="#admissions"
              className="bg-gold text-navy-deep font-display uppercase tracking-wider font-600 px-8 py-4 rounded-sm hover:bg-gold-light transition-colors"
            >
              Apply for Admission
            </a>
            <a
              href="#about"
              className="border border-cream/40 text-cream font-display uppercase tracking-wider px-8 py-4 rounded-sm hover:bg-cream hover:text-navy-deep transition-colors"
            >
              Discover More
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 z-10 border-t border-gold/20 bg-navy-deep/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-5 grid grid-cols-2 sm:grid-cols-4 divide-x divide-gold/15">
          {[
            ['1200+', 'Cadets'],
            ['98%', 'Pass Rate'],
            ['60+', 'Faculty'],
            ['26', 'Years of Legacy'],
          ].map(([n, l]) => (
            <div key={l} className="py-6 px-4 text-center">
              <div className="font-display text-gold-light text-2xl sm:text-3xl font-600">{n}</div>
              <div className="font-display uppercase tracking-widest text-cream/70 text-[10px] sm:text-xs mt-1">
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

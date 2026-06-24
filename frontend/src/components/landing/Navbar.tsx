"use client";
import { useState, useEffect } from 'react';
import { Menu, X, Phone, User, Mail } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from "@/src/lib/i18n";

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Academics', href: '#academics' },
  { label: 'Campus Life', href: '#campus-life' },
  { label: 'Notices', href: '#notices' },
  { label: 'Results', href: '#results' },
  { label: 'Admissions', href: '#admissions' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar({ settings }: { settings: any }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-navy-deep/95 backdrop-blur shadow-lg shadow-black/30 py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-3 group">
          <img src={settings?.logoUrl || "/images/crest.png"} alt="Crest" className={`object-contain transition-all duration-300 ${scrolled ? 'h-10 w-10' : 'h-14 w-14'}`} />
          <div className="leading-tight">
            <div className="font-display tracking-[0.15em] text-gold-light text-sm sm:text-base font-600 uppercase">
              {settings ? t(settings.schoolNameEn, settings.schoolNameBn) : "Rafiq Raju"}
            </div>
            <div className="font-display tracking-[0.3em] text-cream/80 text-[10px] sm:text-xs uppercase">
              {settings ? t(settings.schoolSubtitleEn, settings.schoolSubtitleBn) : "Cadet School"}
            </div>
          </div>
        </a>

        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="font-display text-xs tracking-wider uppercase text-cream/85 hover:text-gold-light transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 hover:after:w-full after:bg-gold after:transition-all after:duration-300"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 bg-navy/50 border border-gold/20 rounded-sm p-1">
            <button 
              onClick={() => setLanguage("en")}
              className={`px-2 py-1 text-xs font-bold rounded-sm font-sans ${language === "en" ? "bg-gold text-navy-deep" : "text-cream/70 hover:text-white"}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage("bn")}
              className={`px-2 py-1 text-xs font-bold rounded-sm font-sans ${language === "bn" ? "bg-gold text-navy-deep" : "text-cream/70 hover:text-white"}`}
            >
              BN
            </button>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-2 text-cream/85 hover:text-gold-light font-display uppercase tracking-wider text-sm transition-colors"
          >
            <User size={15} /> Login
          </Link>
          <a
            href="#admissions"
            className="flex items-center gap-2 bg-gold text-navy-deep font-display uppercase tracking-wider text-sm font-600 px-5 py-2.5 rounded-sm hover:bg-gold-light transition-colors"
          >
            <Phone size={15} /> Admission
          </a>
        </div>

        <button onClick={() => setOpen(!open)} className="lg:hidden text-cream p-2">
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-navy-deep/98 backdrop-blur border-t border-gold/20 mt-2">
          <nav className="flex flex-col px-5 py-4">
            <div className="flex flex-col gap-2 mb-4 text-cream/70 text-sm">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gold" />
                <span>{settings ? t(settings.contactPhoneEn, settings.contactPhoneBn) : "+880 1700 000000"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-gold" />
                <span>{settings?.contactEmail || "info@rafiqrajucadet.edu.bd"}</span>
              </div>
            </div>
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-display uppercase tracking-wider text-cream/85 py-3 border-b border-white/5 hover:text-gold-light"
              >
                {l.label}
              </a>
            ))}
            <div className="py-3 border-b border-white/5 flex gap-4">
              <button 
                onClick={() => { setLanguage("en"); setOpen(false); }}
                className={`text-sm font-bold ${language === "en" ? "text-gold" : "text-cream/70"}`}
              >
                English
              </button>
              <button 
                onClick={() => { setLanguage("bn"); setOpen(false); }}
                className={`text-sm font-bold ${language === "bn" ? "text-gold" : "text-cream/70"}`}
              >
                বাংলা
              </button>
            </div>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="font-display uppercase tracking-wider text-cream/85 py-3 border-b border-white/5 hover:text-gold-light flex items-center gap-2"
            >
              <User size={15} /> Login
            </Link>
            <a
              href="#admissions"
              onClick={() => setOpen(false)}
              className="font-display uppercase tracking-wider text-gold-light py-3 hover:text-gold flex items-center gap-2"
            >
              <Phone size={15} /> Admission
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

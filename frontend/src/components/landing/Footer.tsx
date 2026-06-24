"use client";
import { MapPin, Phone, Mail, Globe, MessageCircle, Share2 } from 'lucide-react';
import { useLanguage } from "@/src/lib/i18n";

export default function Footer({ settings }: { settings?: any }) {
  const { t } = useLanguage();

  const logoUrl = settings?.logoUrl || "/images/crest.png";
  const name = settings ? t(settings.schoolNameEn, settings.schoolNameBn) : "Rafiq Raju";
  const subtitle = settings ? t(settings.schoolSubtitleEn, settings.schoolSubtitleBn) : "Cadet School";
  const about = settings ? t(settings.footerAboutEn, settings.footerAboutBn) : "Shaping disciplined, knowledgeable and honourable leaders since 1998.";
  
  const address = settings ? t(settings.contactAddressEn, settings.contactAddressBn) : "Cantonment Road, Dhaka, Bangladesh";
  const phone = settings ? t(settings.contactPhoneEn, settings.contactPhoneBn) : "+880 1700 000000";
  const email = settings?.contactEmail || "info@rafiqrajucadet.edu.bd";

  return (
    <footer id="contact" className="bg-navy text-cream pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3">
              <img src={logoUrl} alt="Crest" className="h-14 w-14 object-contain" />
              <div>
                <div className="font-display uppercase tracking-widest text-gold-light text-sm font-600">{name}</div>
                <div className="font-display uppercase tracking-[0.3em] text-cream/70 text-[10px]">{subtitle}</div>
              </div>
            </div>
            <p className="mt-5 text-cream/60 leading-relaxed text-sm whitespace-pre-wrap">
              {about}
            </p>
            <div className="flex gap-3 mt-6">
              {[Globe, MessageCircle, Share2].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-sm bg-navy-light/60 border border-gold/20 flex items-center justify-center hover:bg-gold hover:text-navy-deep transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display uppercase tracking-wider text-gold-light text-sm mb-5">Explore</h4>
            <ul className="space-y-3 text-cream/65 text-sm">
              {['About Us', 'Academics', 'Admissions', 'Campus Life', 'Faculty'].map((x) => (
                <li key={x}><a href="#about" className="hover:text-gold-light transition-colors">{x}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display uppercase tracking-wider text-gold-light text-sm mb-5">Resources</h4>
            <ul className="space-y-3 text-cream/65 text-sm">
              {['Notice Board', 'Academic Calendar', 'Results', 'Library', 'Gallery'].map((x) => (
                <li key={x}><a href="#" className="hover:text-gold-light transition-colors">{x}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display uppercase tracking-wider text-gold-light text-sm mb-5">Contact</h4>
            <ul className="space-y-4 text-cream/65 text-sm">
              <li className="flex gap-3"><MapPin size={18} className="text-gold shrink-0" /> {address}</li>
              <li className="flex gap-3"><Phone size={18} className="text-gold shrink-0" /> {phone}</li>
              <li className="flex gap-3"><Mail size={18} className="text-gold shrink-0" /> {email}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gold/20 mt-14 mb-6" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-cream/50 text-xs">
          <p>© 2026 {name}. All rights reserved.</p>
          <p className="font-bangla text-gold-light/80">{settings ? t(settings.mottoEn, settings.mottoBn) : "শৃঙ্খলা · জ্ঞান · সম্মান"}</p>
        </div>
      </div>
    </footer>
  );
}

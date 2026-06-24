"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "bn";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (enText: string, bnText: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    // Check google translate cookie instead of local storage
    const match = document.cookie.match(/(^|;) ?googtrans=([^;]*)(;|$)/);
    const saved = match ? match[2] : null;
    if (saved === "/en/bn") {
      setLanguage("bn");
    } else {
      setLanguage("en");
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    if (lang === "bn") {
      document.cookie = "googtrans=/en/bn; path=/";
      document.cookie = "googtrans=/en/bn; path=/; domain=" + window.location.hostname;
    } else {
      document.cookie = "googtrans=/en/en; path=/";
      document.cookie = "googtrans=/en/en; path=/; domain=" + window.location.hostname;
    }
    // Reload to apply google translate script
    window.location.reload();
  };

  const t = (enText: string, bnText: string) => {
    // Always return English text. Google Translate will auto-translate the DOM
    // returning bnText would interfere with Google Translate and cause it to translate Bengali to Bengali.
    return enText;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

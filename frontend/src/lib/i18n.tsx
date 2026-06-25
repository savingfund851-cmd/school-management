"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "bn";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (enText: string, bnText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("app_lang") as Language;
    if (saved === "en" || saved === "bn") {
      setLanguage(saved);
      document.documentElement.lang = saved;
    } else {
      document.documentElement.lang = "en";
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("app_lang", lang);
    document.documentElement.lang = lang;
  };

  // Dictionary for dynamic DB data
  const dictionary: Record<string, string> = {
    "Class 6": "ষষ্ঠ শ্রেণি",
    "Class 7": "সপ্তম শ্রেণি",
    "Class 8": "অষ্টম শ্রেণি",
    "Class 9": "নবম শ্রেণি",
    "Class 10": "দশম শ্রেণি",
    "1st Term Exam": "প্রথম সাময়িক পরীক্ষা",
    "2nd Term Exam": "দ্বিতীয় সাময়িক পরীক্ষা",
    "Mid Term Exam": "অর্ধ-বার্ষিক পরীক্ষা",
    "Final Exam": "বার্ষিক পরীক্ষা",
    "Bangla": "বাংলা",
    "English": "ইংরেজি",
    "Mathematics": "গণিত",
    "Science": "বিজ্ঞান",
    "Social Science": "সমাজ বিজ্ঞান",
    "Islam": "ইসলাম শিক্ষা",
    "ICT": "তথ্য ও যোগাযোগ প্রযুক্তি",
    "Arts": "চারু ও কারুকলা",
    "Physical Education": "শারীরিক শিক্ষা",
    "A+": "এ+",
    "A": "এ",
    "A-": "এ-",
    "B": "বি",
    "C": "সি",
    "D": "ডি",
    "F": "এফ",
    "Select Class": "শ্রেণি নির্বাচন করুন",
    "Select Exam": "পরীক্ষা নির্বাচন করুন",
    "Select Subject": "বিষয় নির্বাচন করুন",
    "Exam Name": "পরীক্ষার নাম",
    "Subject": "বিষয়",
    "Marks": "নম্বর",
    "Grade": "গ্রেড",
    "Remarks": "মন্তব্য"
  };

  const t = (enText: string, bnText?: string) => {
    if (language !== "bn") return enText;
    if (bnText) return bnText;
    return dictionary[enText] || enText;
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

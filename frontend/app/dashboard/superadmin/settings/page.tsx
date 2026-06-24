"use client";

import { useState, useEffect } from "react";
import { Upload, Save, CheckCircle, Image as ImageIcon, Loader2 } from "lucide-react";

const InputRow = ({ label, fieldEn, fieldBn, type = "text", settings, handleInputChange }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
    <div>
      <label className="block text-xs font-display text-gold mb-1 uppercase tracking-widest">{label} (English)</label>
      {type === "textarea" ? (
        <textarea rows={3} value={settings?.[fieldEn] || ""} onChange={(e) => handleInputChange(fieldEn, e.target.value)} className="w-full bg-navy-light/50 border border-gold/20 focus:border-gold rounded-sm px-4 py-2 text-cream text-sm outline-none" />
      ) : (
        <input type="text" value={settings?.[fieldEn] || ""} onChange={(e) => handleInputChange(fieldEn, e.target.value)} className="w-full bg-navy-light/50 border border-gold/20 focus:border-gold rounded-sm px-4 py-2 text-cream text-sm outline-none" />
      )}
    </div>
    <div>
      <label className="block text-xs font-display text-gold mb-1 uppercase tracking-widest">{label} (Bengali)</label>
      {type === "textarea" ? (
        <textarea rows={3} value={settings?.[fieldBn] || ""} onChange={(e) => handleInputChange(fieldBn, e.target.value)} className="w-full bg-navy-light/50 border border-gold/20 focus:border-gold rounded-sm px-4 py-2 text-cream text-sm outline-none" />
      ) : (
        <input type="text" value={settings?.[fieldBn] || ""} onChange={(e) => handleInputChange(fieldBn, e.target.value)} className="w-full bg-navy-light/50 border border-gold/20 focus:border-gold rounded-sm px-4 py-2 text-cream text-sm outline-none" />
      )}
    </div>
  </div>
);

const ImageUpload = ({ label, fileState, setFileState, currentUrl }: any) => (
  <div className="bg-navy border border-gold/10 p-4 rounded-xl flex items-center gap-6">
    <div className="w-32 h-32 bg-navy-deep border border-gold/20 rounded-lg overflow-hidden flex items-center justify-center relative shrink-0">
      <img src={fileState ? URL.createObjectURL(fileState) : currentUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
    </div>
    <div>
      <h3 className="text-sm font-display text-gold uppercase tracking-widest mb-2">{label}</h3>
      <label className="cursor-pointer px-4 py-2 bg-gold/10 hover:bg-gold/20 text-gold-light border border-gold/20 rounded-sm text-sm flex items-center gap-2 transition-colors">
        <Upload size={16} /> Choose File
        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && setFileState(e.target.files[0])} />
      </label>
    </div>
  </div>
);

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [logoImageFile, setLogoImageFile] = useState<File | null>(null);
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);

  const [campusImage1File, setCampusImage1File] = useState<File | null>(null);
  const [campusImage2File, setCampusImage2File] = useState<File | null>(null);
  const [campusImage3File, setCampusImage3File] = useState<File | null>(null);
  const [admissionImageFile, setAdmissionImageFile] = useState<File | null>(null);

  const [activeTab, setActiveTab] = useState("General");

  const tabs = ["General", "About Section", "Academics", "Campus Life", "Admissions", "Contact & Footer"];

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setSettings({ ...settings, [field]: value });
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      return data.url;
    }
    throw new Error("Upload failed");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    let updatedSettings = { ...settings };

    try {
      if (heroImageFile) updatedSettings.heroImageUrl = await uploadImage(heroImageFile);
      if (logoImageFile) updatedSettings.logoUrl = await uploadImage(logoImageFile);
      if (aboutImageFile) updatedSettings.aboutImageUrl = await uploadImage(aboutImageFile);
      if (campusImage1File) updatedSettings.campusImage1Url = await uploadImage(campusImage1File);
      if (campusImage2File) updatedSettings.campusImage2Url = await uploadImage(campusImage2File);
      if (campusImage3File) updatedSettings.campusImage3Url = await uploadImage(campusImage3File);
      if (admissionImageFile) updatedSettings.admissionImageUrl = await uploadImage(admissionImageFile);

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });

      if (res.ok) {
        setSettings(updatedSettings);
        setMessage("Settings updated successfully!");
        setHeroImageFile(null);
        setLogoImageFile(null);
        setAboutImageFile(null);
        setCampusImage1File(null);
        setCampusImage2File(null);
        setCampusImage3File(null);
        setAdmissionImageFile(null);
      } else {
        setMessage("Failed to update settings.");
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred during save.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) {
    return <div className="p-8 text-cream/60 animate-pulse">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-serif font-bold text-gold-light mb-1">Site Configuration</h1>
        <p className="text-sm text-cream/60">Fully customize the public website's text and imagery.</p>
      </div>

      <div className="flex overflow-x-auto space-x-2 border-b border-gold/10 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-display uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 ${activeTab === tab ? "border-gold text-gold" : "border-transparent text-cream/50 hover:text-cream"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="bg-navy border border-gold/20 rounded-xl p-6 shadow-xl">
        {message && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-sm flex items-center gap-3">
            <CheckCircle size={18} /> {message}
          </div>
        )}

        {/* GENERAL TAB */}
        {activeTab === "General" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUpload label="School Logo" fileState={logoImageFile} setFileState={setLogoImageFile} currentUrl={settings.logoUrl} />
              <ImageUpload label="Hero Background" fileState={heroImageFile} setFileState={setHeroImageFile} currentUrl={settings.heroImageUrl} />
            </div>
            
            <div className="mt-6 border-t border-gold/10 pt-6">
              <InputRow label="School Name" fieldEn="schoolNameEn" fieldBn="schoolNameBn" settings={settings} handleInputChange={handleInputChange} />
              <InputRow label="School Subtitle" fieldEn="schoolSubtitleEn" fieldBn="schoolSubtitleBn" settings={settings} handleInputChange={handleInputChange} />
              <InputRow label="Established Text" fieldEn="establishedYearEn" fieldBn="establishedYearBn" settings={settings} handleInputChange={handleInputChange} />
              <InputRow label="Motto" fieldEn="mottoEn" fieldBn="mottoBn" settings={settings} handleInputChange={handleInputChange} />
            </div>
          </div>
        )}

        {/* ABOUT SECTION TAB */}
        {activeTab === "About Section" && (
          <div className="space-y-6">
            <ImageUpload label="About Section Image" fileState={aboutImageFile} setFileState={setAboutImageFile} currentUrl={settings.aboutImageUrl} />
            <div className="mt-6 border-t border-gold/10 pt-6">
              <InputRow label="Section Title" fieldEn="aboutTitleEn" fieldBn="aboutTitleBn" settings={settings} handleInputChange={handleInputChange} />
              <InputRow label="Section Description" fieldEn="aboutTextEn" fieldBn="aboutTextBn" type="textarea" settings={settings} handleInputChange={handleInputChange} />
              
              <div className="mt-6 border-t border-gold/10 pt-6">
                <h3 className="text-gold font-display uppercase tracking-widest text-sm mb-4">About Pillars</h3>
                {(() => {
                  const pillars = settings.aboutPillars ? JSON.parse(settings.aboutPillars) : [
                    { titleEn: 'Discipline', titleBn: 'শৃঙ্খলা', textEn: 'A structured, military-style routine that instils punctuality, resilience and self-mastery in every cadet.', textBn: 'একটি সুশৃঙ্খল, সামরিক ধাঁচের রুটিন যা প্রতিটি ক্যাডেটের মধ্যে সময়ানুবর্তিতা, স্থিতিস্থাপকতা এবং আত্মনিয়ন্ত্রণ জাগিয়ে তোলে।' },
                    { titleEn: 'Knowledge', titleBn: 'জ্ঞান', textEn: 'A rigorous academic curriculum led by dedicated faculty, balancing science, arts and critical thinking.', textBn: 'নিবেদিত শিক্ষকমণ্ডলী দ্বারা পরিচালিত একটি কঠোর একাডেমিক পাঠ্যক্রম, যা বিজ্ঞান, কলা এবং সমালোচনামূলক চিন্তাভাবনার ভারসাম্য বজায় রাখে।' },
                    { titleEn: 'Honour', titleBn: 'সম্মান', textEn: 'A code of integrity, leadership and service that shapes character far beyond the classroom walls.', textBn: 'সততা, নেতৃত্ব এবং সেবার একটি নিয়ম যা শ্রেণীকক্ষের দেয়ালের বাইরেও চরিত্র গঠন করে।' },
                  ];
                  
                  const updatePillar = (index: number, field: string, val: string) => {
                    const newPillars = [...pillars];
                    newPillars[index][field] = val;
                    handleInputChange("aboutPillars", JSON.stringify(newPillars));
                  };

                  return (
                    <div className="space-y-6">
                      {pillars.map((pillar: any, i: number) => (
                        <div key={i} className="bg-navy-deep p-4 rounded-lg border border-gold/10">
                          <h4 className="text-cream text-xs font-bold mb-3">Pillar {i + 1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-xs font-display text-gold mb-1 uppercase tracking-widest">Title (English)</label>
                              <input type="text" value={pillar.titleEn} onChange={(e) => updatePillar(i, "titleEn", e.target.value)} className="w-full bg-navy-light/50 border border-gold/20 focus:border-gold rounded-sm px-4 py-2 text-cream text-sm outline-none" />
                            </div>
                            <div>
                              <label className="block text-xs font-display text-gold mb-1 uppercase tracking-widest">Title (Bengali)</label>
                              <input type="text" value={pillar.titleBn} onChange={(e) => updatePillar(i, "titleBn", e.target.value)} className="w-full bg-navy-light/50 border border-gold/20 focus:border-gold rounded-sm px-4 py-2 text-cream text-sm outline-none" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-display text-gold mb-1 uppercase tracking-widest">Text (English)</label>
                              <textarea rows={2} value={pillar.textEn} onChange={(e) => updatePillar(i, "textEn", e.target.value)} className="w-full bg-navy-light/50 border border-gold/20 focus:border-gold rounded-sm px-4 py-2 text-cream text-sm outline-none" />
                            </div>
                            <div>
                              <label className="block text-xs font-display text-gold mb-1 uppercase tracking-widest">Text (Bengali)</label>
                              <textarea rows={2} value={pillar.textBn} onChange={(e) => updatePillar(i, "textBn", e.target.value)} className="w-full bg-navy-light/50 border border-gold/20 focus:border-gold rounded-sm px-4 py-2 text-cream text-sm outline-none" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ACADEMICS TAB */}
        {activeTab === "Academics" && (
          <div className="space-y-6">
            <InputRow label="Section Title" fieldEn="academicsTitleEn" fieldBn="academicsTitleBn" settings={settings} handleInputChange={handleInputChange} />
            <InputRow label="Section Description" fieldEn="academicsTextEn" fieldBn="academicsTextBn" type="textarea" settings={settings} handleInputChange={handleInputChange} />
            <div className="mt-6 border-t border-gold/10 pt-6">
              <h3 className="text-gold font-display uppercase tracking-widest text-sm mb-4">Academic Programs</h3>
              {(() => {
                const programs = settings.academicsPrograms ? JSON.parse(settings.academicsPrograms) : [
                  { nameEn: 'Science', nameBn: 'বিজ্ঞান', descEn: 'Physics, Chemistry & Biology with modern laboratories.', descBn: 'আধুনিক ল্যাবরেটরিসহ পদার্থ, রসায়ন এবং জীববিজ্ঞান।' },
                  { nameEn: 'Mathematics', nameBn: 'গণিত', descEn: 'Advanced reasoning and problem-solving foundations.', descBn: 'উন্নত যুক্তিবাদ এবং সমস্যা সমাধানের ভিত্তি।' },
                  { nameEn: 'Humanities', nameBn: 'মানবিক', descEn: 'History, geography and civic responsibility.', descBn: 'ইতিহাস, ভূগোল এবং নাগরিক দায়িত্ব।' },
                  { nameEn: 'ICT', nameBn: 'আইসিটি', descEn: 'Computer science and digital literacy for the future.', descBn: 'ভবিষ্যতের জন্য কম্পিউটার বিজ্ঞান এবং ডিজিটাল সাক্ষরতা।' },
                  { nameEn: 'Arts & Culture', nameBn: 'শিল্প ও সংস্কৃতি', descEn: 'Music, debate, art and creative expression.', descBn: 'সঙ্গীত, বিতর্ক, শিল্প এবং সৃজনশীল প্রকাশ।' },
                  { nameEn: 'Physical Training', nameBn: 'শারীরিক প্রশিক্ষণ', descEn: 'Drill, sports and fitness for body and mind.', descBn: 'শরীর ও মনের জন্য ড্রিল, খেলাধুলা এবং ফিটনেস।' },
                ];
                
                const updateProgram = (index: number, field: string, val: string) => {
                  const newPrograms = [...programs];
                  newPrograms[index][field] = val;
                  handleInputChange("academicsPrograms", JSON.stringify(newPrograms));
                };

                return (
                  <div className="space-y-6">
                    {programs.map((prog: any, i: number) => (
                      <div key={i} className="bg-navy-deep p-4 rounded-lg border border-gold/10">
                        <h4 className="text-cream text-xs font-bold mb-3">Program {i + 1}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-display text-gold mb-1 uppercase tracking-widest">Name (English)</label>
                            <input type="text" value={prog.nameEn} onChange={(e) => updateProgram(i, "nameEn", e.target.value)} className="w-full bg-navy-light/50 border border-gold/20 focus:border-gold rounded-sm px-4 py-2 text-cream text-sm outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-display text-gold mb-1 uppercase tracking-widest">Name (Bengali)</label>
                            <input type="text" value={prog.nameBn} onChange={(e) => updateProgram(i, "nameBn", e.target.value)} className="w-full bg-navy-light/50 border border-gold/20 focus:border-gold rounded-sm px-4 py-2 text-cream text-sm outline-none" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-display text-gold mb-1 uppercase tracking-widest">Description (English)</label>
                            <textarea rows={2} value={prog.descEn} onChange={(e) => updateProgram(i, "descEn", e.target.value)} className="w-full bg-navy-light/50 border border-gold/20 focus:border-gold rounded-sm px-4 py-2 text-cream text-sm outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-display text-gold mb-1 uppercase tracking-widest">Description (Bengali)</label>
                            <textarea rows={2} value={prog.descBn} onChange={(e) => updateProgram(i, "descBn", e.target.value)} className="w-full bg-navy-light/50 border border-gold/20 focus:border-gold rounded-sm px-4 py-2 text-cream text-sm outline-none" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* CAMPUS LIFE TAB */}
        {activeTab === "Campus Life" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ImageUpload label="Campus Image 1" fileState={campusImage1File} setFileState={setCampusImage1File} currentUrl={settings.campusImage1Url || "/images/campus.jpg"} />
              <ImageUpload label="Campus Image 2" fileState={campusImage2File} setFileState={setCampusImage2File} currentUrl={settings.campusImage2Url || "/images/hero.jpg"} />
              <ImageUpload label="Campus Image 3" fileState={campusImage3File} setFileState={setCampusImage3File} currentUrl={settings.campusImage3Url || "/images/campus.jpg"} />
            </div>
            <div className="mt-6 border-t border-gold/10 pt-6">
              <InputRow label="Section Title" fieldEn="campusTitleEn" fieldBn="campusTitleBn" settings={settings} handleInputChange={handleInputChange} />
              <InputRow label="Section Description" fieldEn="campusTextEn" fieldBn="campusTextBn" type="textarea" settings={settings} handleInputChange={handleInputChange} />
            </div>
          </div>
        )}

        {/* ADMISSIONS TAB */}
        {activeTab === "Admissions" && (
          <div className="space-y-6">
            <ImageUpload label="Admissions Side Image" fileState={admissionImageFile} setFileState={setAdmissionImageFile} currentUrl={settings.admissionImageUrl || "/images/hero.jpg"} />
            <div className="mt-6 border-t border-gold/10 pt-6">
              <InputRow label="Section Title" fieldEn="admissionsTitleEn" fieldBn="admissionsTitleBn" settings={settings} handleInputChange={handleInputChange} />
              <InputRow label="Section Description" fieldEn="admissionsTextEn" fieldBn="admissionsTextBn" type="textarea" settings={settings} handleInputChange={handleInputChange} />
            </div>
          </div>
        )}

        {/* CONTACT & FOOTER TAB */}
        {activeTab === "Contact & Footer" && (
          <div className="space-y-6">
            <InputRow label="Address" fieldEn="contactAddressEn" fieldBn="contactAddressBn" settings={settings} handleInputChange={handleInputChange} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-display text-gold mb-1 uppercase tracking-widest">Phone</label>
                <input type="text" value={settings.contactPhoneEn || ""} onChange={(e) => handleInputChange("contactPhoneEn", e.target.value)} className="w-full bg-navy-light/50 border border-gold/20 focus:border-gold rounded-sm px-4 py-2 text-cream text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-display text-gold mb-1 uppercase tracking-widest">Email</label>
                <input type="email" value={settings.contactEmail || ""} onChange={(e) => handleInputChange("contactEmail", e.target.value)} className="w-full bg-navy-light/50 border border-gold/20 focus:border-gold rounded-sm px-4 py-2 text-cream text-sm outline-none" />
              </div>
            </div>
            <InputRow label="Footer About Text" fieldEn="footerAboutEn" fieldBn="footerAboutBn" type="textarea" settings={settings} handleInputChange={handleInputChange} />
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gold/20 flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-2 bg-gold hover:bg-gold-light text-navy-deep font-bold font-display uppercase tracking-widest px-8 py-3 rounded-sm transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

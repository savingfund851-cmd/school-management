"use client";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [noticeIndex, setNoticeIndex] = useState(0);

  const notices = [
    "📢 ২০২৫ সালের ভর্তি কার্যক্রম শুরু হয়েছে — আজই আবেদন করুন",
    "📢 বার্ষিক পরীক্ষার সময়সূচি প্রকাশিত হয়েছে",
    "📢 অভিভাবক দিবস আগামী ১৫ জুলাই অনুষ্ঠিত হবে",
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNoticeIndex((i) => (i + 1) % notices.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#f8fafc", color: "#1e293b" }}>

      {/* Notice Ticker */}
      <div style={{ background: "#1d4ed8", color: "#fff", textAlign: "center", padding: "8px 16px", fontSize: "14px" }}>
        {notices[noticeIndex]}
      </div>

      {/* Navbar */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: scrolled ? "rgba(255,255,255,0.97)" : "#fff",
        boxShadow: scrolled ? "0 2px 16px #0001" : "0 1px 0 #e2e8f0",
        transition: "box-shadow 0.3s",
        padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "linear-gradient(135deg,#1d4ed8,#06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: "18px"
          }}>স</div>
          <span style={{ fontWeight: 700, fontSize: "20px", color: "#1d4ed8" }}>শিক্ষাঙ্গন</span>
        </div>

        {/* Desktop Nav */}
        <div style={{ display: "flex", gap: "28px", alignItems: "center" }} className="desktop-nav">
          {["হোম", "বিভাগসমূহ", "শিক্ষকমণ্ডলী", "নোটিশ", "যোগাযোগ"].map((item) => (
            <a key={item} href="#" style={{ color: "#475569", textDecoration: "none", fontSize: "15px", fontWeight: 500 }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = "#1d4ed8"}
              onMouseLeave={e => (e.target as HTMLElement).style.color = "#475569"}>
              {item}
            </a>
          ))}
          <a href="/login" style={{
            background: "#1d4ed8", color: "#fff", padding: "9px 22px",
            borderRadius: "8px", textDecoration: "none", fontWeight: 600, fontSize: "14px"
          }}>লগইন</a>
          <a href="/admission" style={{
            background: "#fff", color: "#1d4ed8", padding: "9px 22px",
            borderRadius: "8px", textDecoration: "none", fontWeight: 600, fontSize: "14px",
            border: "2px solid #1d4ed8"
          }}>ভর্তি আবেদন</a>
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: "none", background: "none", border: "none", fontSize: "26px", cursor: "pointer" }}
          className="hamburger">☰</button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: "#fff", borderBottom: "1px solid #e2e8f0",
          padding: "16px 32px", display: "flex", flexDirection: "column", gap: "14px"
        }}>
          {["হোম", "বিভাগসমূহ", "শিক্ষকমণ্ডলী", "নোটিশ", "যোগাযোগ"].map((item) => (
            <a key={item} href="#" style={{ color: "#475569", textDecoration: "none", fontSize: "15px" }}>{item}</a>
          ))}
          <a href="/login" style={{ color: "#1d4ed8", fontWeight: 600 }}>লগইন</a>
          <a href="/admission" style={{ color: "#1d4ed8", fontWeight: 600 }}>ভর্তি আবেদন</a>
        </div>
      )}

      {/* Hero */}
      <section style={{
        background: "linear-gradient(120deg, #1e3a8a 0%, #1d4ed8 50%, #0ea5e9 100%)",
        color: "#fff", padding: "80px 32px", textAlign: "center"
      }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <span style={{
            background: "rgba(255,255,255,0.15)", borderRadius: "999px",
            padding: "6px 20px", fontSize: "13px", fontWeight: 600, letterSpacing: "1px",
            display: "inline-block", marginBottom: "24px"
          }}>🎓 ডিজিটাল শিক্ষা ব্যবস্থাপনা</span>

          <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 800, lineHeight: 1.2, marginBottom: "20px" }}>
            স্বাগতম শিক্ষাঙ্গন<br />
            <span style={{ color: "#7dd3fc" }}>স্কুল ম্যানেজমেন্ট সিস্টেমে</span>
          </h1>
          <p style={{ fontSize: "18px", color: "#bfdbfe", lineHeight: 1.7, marginBottom: "36px" }}>
            শিক্ষার্থী, শিক্ষক ও অভিভাবকদের জন্য একটি সমন্বিত ডিজিটাল প্ল্যাটফর্ম।
            উপস্থিতি, ফলাফল, বেতন ও নোটিশ — সব এক জায়গায়।
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/admission" style={{
              background: "#fff", color: "#1d4ed8", padding: "14px 32px",
              borderRadius: "10px", fontWeight: 700, fontSize: "16px", textDecoration: "none"
            }}>ভর্তি আবেদন করুন →</a>
            <a href="/login" style={{
              background: "rgba(255,255,255,0.15)", color: "#fff", padding: "14px 32px",
              borderRadius: "10px", fontWeight: 600, fontSize: "16px", textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.3)"
            }}>পোর্টালে প্রবেশ করুন</a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: "#fff", padding: "48px 32px" }}>
        <div style={{
          maxWidth: "960px", margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "24px", textAlign: "center"
        }}>
          {[
            { number: "১,২০০+", label: "শিক্ষার্থী" },
            { number: "৮০+", label: "অভিজ্ঞ শিক্ষক" },
            { number: "৩৫+", label: "বছরের অভিজ্ঞতা" },
            { number: "৯৮%", label: "পাসের হার" },
          ].map((stat) => (
            <div key={stat.label} style={{ padding: "24px 16px", borderRadius: "12px", background: "#f0f9ff", border: "1px solid #e0f2fe" }}>
              <div style={{ fontSize: "36px", fontWeight: 800, color: "#1d4ed8" }}>{stat.number}</div>
              <div style={{ color: "#64748b", fontSize: "15px", marginTop: "6px" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "64px 32px", background: "#f8fafc" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "32px", fontWeight: 800, marginBottom: "12px" }}>
            সিস্টেমের সুবিধাসমূহ
          </h2>
          <p style={{ textAlign: "center", color: "#64748b", marginBottom: "48px", fontSize: "16px" }}>
            শিক্ষার্থী, শিক্ষক ও প্রশাসনের জন্য আলাদা আলাদা সুবিধা
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "24px" }}>
            {[
              { icon: "👨‍🎓", title: "শিক্ষার্থী পোর্টাল", desc: "উপস্থিতি, পরীক্ষার ফলাফল, বেতনের তথ্য ও নোটিশ সরাসরি দেখুন।" },
              { icon: "👨‍🏫", title: "শিক্ষক ড্যাশবোর্ড", desc: "ক্লাস পরিচালনা, উপস্থিতি নেওয়া ও মার্কস এন্ট্রি করুন সহজে।" },
              { icon: "🏫", title: "অ্যাডমিন প্যানেল", desc: "সকল শিক্ষার্থী ও শিক্ষকদের তথ্য পরিচালনা করুন এক জায়গা থেকে।" },
              { icon: "📝", title: "অনলাইন ভর্তি", desc: "ঘরে বসেই ভর্তির আবেদন করুন এবং আবেদনের অগ্রগতি ট্র্যাক করুন।" },
              { icon: "📊", title: "রিপোর্ট ও বিশ্লেষণ", desc: "স্বয়ংক্রিয় রিপোর্ট তৈরি করুন — উপস্থিতি, ফলাফল ও বেতন।" },
              { icon: "🔔", title: "নোটিশ বোর্ড", desc: "গুরুত্বপূর্ণ বিজ্ঞপ্তি সকলের কাছে তাৎক্ষণিকভাবে পৌঁছে দিন।" },
            ].map((f) => (
              <div key={f.title} style={{
                background: "#fff", borderRadius: "14px", padding: "28px 24px",
                border: "1px solid #e2e8f0",
                transition: "box-shadow 0.2s"
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px #1d4ed820"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}>
                <div style={{ fontSize: "36px", marginBottom: "14px" }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: "18px", marginBottom: "10px" }}>{f.title}</h3>
                <p style={{ color: "#64748b", fontSize: "15px", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: "#fff", padding: "64px 32px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "12px" }}>কীভাবে ব্যবহার করবেন</h2>
          <p style={{ color: "#64748b", marginBottom: "48px" }}>মাত্র তিনটি ধাপে শুরু করুন</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "32px" }}>
            {[
              { step: "১", title: "ভর্তি আবেদন", desc: "অনলাইনে ফর্ম পূরণ করুন এবং প্রয়োজনীয় কাগজপত্র আপলোড করুন।" },
              { step: "২", title: "অনুমোদন", desc: "প্রশাসন আবেদন পর্যালোচনা করবে এবং আপনাকে জানাবে।" },
              { step: "৩", title: "পোর্টালে প্রবেশ", desc: "অনুমোদনের পর লগইন করুন এবং সব সেবা উপভোগ করুন।" },
            ].map((s) => (
              <div key={s.step} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "linear-gradient(135deg,#1d4ed8,#0ea5e9)",
                  color: "#fff", fontWeight: 800, fontSize: "22px",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>{s.step}</div>
                <h3 style={{ fontWeight: 700, fontSize: "17px" }}>{s.title}</h3>
                <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: "linear-gradient(120deg,#1e3a8a,#1d4ed8)",
        padding: "64px 32px", textAlign: "center", color: "#fff"
      }}>
        <h2 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "16px" }}>
          আজই শুরু করুন
        </h2>
        <p style={{ color: "#bfdbfe", fontSize: "17px", marginBottom: "32px" }}>
          অনলাইনে ভর্তি আবেদন করুন — সহজ, দ্রুত এবং নিরাপদ
        </p>
        <a href="/admission" style={{
          background: "#fff", color: "#1d4ed8", padding: "14px 36px",
          borderRadius: "10px", fontWeight: 700, fontSize: "16px", textDecoration: "none",
          display: "inline-block"
        }}>ভর্তি আবেদন করুন →</a>
      </section>

      {/* Footer */}
      <footer style={{ background: "#0f172a", color: "#94a3b8", padding: "40px 32px" }}>
        <div style={{
          maxWidth: "960px", margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "32px"
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "18px", color: "#fff", marginBottom: "12px" }}>শিক্ষাঙ্গন</div>
            <p style={{ fontSize: "14px", lineHeight: 1.7 }}>একটি আধুনিক স্কুল ম্যানেজমেন্ট সিস্টেম — শিক্ষার ডিজিটাল রূপান্তরে।</p>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "#e2e8f0", marginBottom: "12px" }}>দ্রুত লিংক</div>
            {["হোম", "ভর্তি আবেদন", "নোটিশ বোর্ড", "যোগাযোগ"].map((l) => (
              <div key={l} style={{ marginBottom: "8px" }}>
                <a href="#" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "14px" }}>{l}</a>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "#e2e8f0", marginBottom: "12px" }}>যোগাযোগ</div>
            <p style={{ fontSize: "14px", lineHeight: 1.9 }}>
              📍 ঢাকা, বাংলাদেশ<br />
              📞 +880 1700-000000<br />
              ✉️ info@shikkangon.edu.bd
            </p>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: "32px", fontSize: "13px", borderTop: "1px solid #1e293b", paddingTop: "24px" }}>
          © ২০২৫ শিক্ষাঙ্গন স্কুল ম্যানেজমেন্ট সিস্টেম। সর্বস্বত্ব সংরক্ষিত।
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>
    </div>
  );
}

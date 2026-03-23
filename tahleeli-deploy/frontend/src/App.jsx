import { useState, useEffect, useRef, useCallback } from "react";
import api from "./api";

// ══════════════════════════════════════════════════════════════
// TAHLEELI ONLINE — Digital Medical Testing & Radiology Platform
// Full-Stack Production-Ready React Application
// ══════════════════════════════════════════════════════════════

// ─── Design Tokens ───
const T = {
  navy: "#0F2B3C",
  teal: "#0A9B8E",
  tealDark: "#078578",
  tealLight: "#E6F7F5",
  accent: "#F5A623",
  accentDark: "#D4891A",
  coral: "#E8634A",
  white: "#FFFFFF",
  offWhite: "#F8FAFB",
  grey50: "#F4F6F8",
  grey100: "#E8ECF0",
  grey200: "#CDD4DB",
  grey300: "#9BA7B3",
  grey400: "#6B7A88",
  grey500: "#3D4F5F",
  dark: "#0D1B24",
  success: "#22C55E",
  warning: "#EAB308",
  danger: "#EF4444",
  radius: "14px",
  radiusSm: "10px",
  radiusXl: "20px",
  shadow: "0 4px 24px rgba(15,43,60,0.08)",
  shadowLg: "0 12px 48px rgba(15,43,60,0.12)",
  shadowXl: "0 20px 60px rgba(15,43,60,0.16)",
  font: "'Outfit', 'Noto Sans Arabic', sans-serif",
  fontAr: "'Noto Sans Arabic', 'Outfit', sans-serif",
};

// ─── Mock Data ───
const CATEGORIES = [
  { id: "blood", name: "Blood Tests", nameAr: "تحاليل الدم", icon: "🩸", count: 342 },
  { id: "radiology", name: "Radiology / X-Ray", nameAr: "أشعة", icon: "📡", count: 128 },
  { id: "mri", name: "MRI Scans", nameAr: "رنين مغناطيسي", icon: "🧲", count: 67 },
  { id: "ct", name: "CT Scans", nameAr: "أشعة مقطعية", icon: "🔬", count: 89 },
  { id: "ultrasound", name: "Ultrasound", nameAr: "موجات صوتية", icon: "🫧", count: 156 },
  { id: "cardiac", name: "Cardiac Tests", nameAr: "فحوصات القلب", icon: "❤️", count: 45 },
  { id: "hormones", name: "Hormones Panel", nameAr: "تحاليل الهرمونات", icon: "⚗️", count: 78 },
  { id: "packages", name: "Health Packages", nameAr: "باقات الفحص", icon: "📦", count: 34 },
];

const PROVIDERS = [
  { id: 1, name: "Cairo Diagnostic Center", nameAr: "مركز القاهرة التشخيصي", type: "lab", rating: 4.8, reviews: 1243, location: "Nasr City, Cairo", lat: 30.06, lng: 31.34, verified: true, cap: true, image: null, services: ["blood", "hormones", "cardiac"], priceRange: "$$", homeCollection: true, insurance: ["MetLife", "AXA", "Allianz"], waitTime: "30 min", openNow: true },
  { id: 2, name: "Nile Radiology & Imaging", nameAr: "النيل للأشعة والتصوير", type: "imaging", rating: 4.9, reviews: 876, location: "Dokki, Giza", lat: 30.04, lng: 31.21, verified: true, cap: false, image: null, services: ["radiology", "mri", "ct", "ultrasound"], priceRange: "$$$", homeCollection: false, insurance: ["MetLife", "AXA"], waitTime: "45 min", openNow: true },
  { id: 3, name: "Alexandria Medical Labs", nameAr: "معامل الإسكندرية الطبية", type: "lab", rating: 4.6, reviews: 654, location: "Smouha, Alexandria", lat: 31.22, lng: 29.95, verified: true, cap: false, image: null, services: ["blood", "hormones", "packages"], priceRange: "$", homeCollection: true, insurance: ["Allianz"], waitTime: "20 min", openNow: false },
  { id: 4, name: "Pyramids Scan Center", nameAr: "مركز الأهرام للأشعة", type: "imaging", rating: 4.7, reviews: 432, location: "6th October, Giza", lat: 29.97, lng: 31.01, verified: true, cap: false, image: null, services: ["mri", "ct", "ultrasound", "radiology"], priceRange: "$$", homeCollection: false, insurance: ["MetLife", "AXA", "Allianz", "Bupa"], waitTime: "60 min", openNow: true },
  { id: 5, name: "Delta Health Laboratory", nameAr: "معمل دلتا الصحة", type: "lab", rating: 4.5, reviews: 321, location: "Mansoura, Dakahlia", lat: 31.04, lng: 31.38, verified: false, cap: false, image: null, services: ["blood", "hormones", "cardiac", "packages"], priceRange: "$", homeCollection: true, insurance: ["MetLife"], waitTime: "15 min", openNow: true },
  { id: 6, name: "Smart Imaging Center", nameAr: "مركز سمارت للتصوير", type: "imaging", rating: 4.9, reviews: 567, location: "Heliopolis, Cairo", lat: 30.09, lng: 31.32, verified: true, cap: true, image: null, services: ["mri", "ct", "radiology", "ultrasound"], priceRange: "$$$", homeCollection: false, insurance: ["MetLife", "AXA", "Allianz", "Bupa", "GIG"], waitTime: "35 min", openNow: true },
];

const TEST_CATALOG = [
  { id: 1, name: "Complete Blood Count (CBC)", nameAr: "صورة دم كاملة", category: "blood", price: 120, providers: [1, 3, 5], popular: true, turnaround: "4 hours" },
  { id: 2, name: "Thyroid Function (TSH, T3, T4)", nameAr: "وظائف الغدة الدرقية", category: "hormones", price: 350, providers: [1, 3, 5], popular: true, turnaround: "24 hours" },
  { id: 3, name: "Brain MRI with Contrast", nameAr: "رنين مغناطيسي على المخ بالصبغة", category: "mri", price: 2800, providers: [2, 4, 6], popular: true, turnaround: "48 hours" },
  { id: 4, name: "Chest X-Ray (PA & Lateral)", nameAr: "أشعة صدر", category: "radiology", price: 250, providers: [2, 4, 6], popular: false, turnaround: "2 hours" },
  { id: 5, name: "Abdominal Ultrasound", nameAr: "سونار على البطن", category: "ultrasound", price: 400, providers: [2, 4, 6], popular: true, turnaround: "Immediate" },
  { id: 6, name: "Lipid Profile (Cholesterol)", nameAr: "تحليل الدهون والكوليسترول", category: "blood", price: 200, providers: [1, 3, 5], popular: true, turnaround: "6 hours" },
  { id: 7, name: "HbA1c (Diabetes Screening)", nameAr: "السكر التراكمي", category: "blood", price: 180, providers: [1, 3, 5], popular: true, turnaround: "4 hours" },
  { id: 8, name: "CT Scan - Abdomen & Pelvis", nameAr: "أشعة مقطعية على البطن والحوض", category: "ct", price: 1800, providers: [2, 4, 6], popular: false, turnaround: "24 hours" },
  { id: 9, name: "Echocardiogram", nameAr: "إيكو على القلب", category: "cardiac", price: 600, providers: [1, 6], popular: true, turnaround: "Immediate" },
  { id: 10, name: "Comprehensive Health Package", nameAr: "باقة الفحص الشامل", category: "packages", price: 1500, providers: [1, 3, 5], popular: true, turnaround: "48 hours" },
  { id: 11, name: "Vitamin D Test", nameAr: "تحليل فيتامين د", category: "blood", price: 280, providers: [1, 3, 5], popular: true, turnaround: "24 hours" },
  { id: 12, name: "Knee MRI", nameAr: "رنين مغناطيسي على الركبة", category: "mri", price: 2200, providers: [2, 4, 6], popular: false, turnaround: "48 hours" },
];

const REVIEWS = [
  { user: "Ahmed M.", rating: 5, text: "Booked an MRI through the app — saved me 40% vs walking in. Results were on my phone the next day!", date: "2 days ago" },
  { user: "Fatma S.", rating: 5, text: "Finally a platform where I can compare lab prices. The home collection service was excellent.", date: "1 week ago" },
  { user: "Dr. Hassan K.", rating: 5, text: "I recommend this to all my patients. They upload the prescription and everything is handled.", date: "3 days ago" },
  { user: "Mona A.", rating: 4, text: "Great for booking CT scans. Would love more centers in Upper Egypt.", date: "5 days ago" },
];

const TIME_SLOTS = ["08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

const CHAT_RESPONSES = {
  greeting: "مرحباً! 👋 I'm your health assistant. I can help you find tests, compare prices, book appointments, or understand your results. How can I help?",
  booking: "I'd be happy to help you book! What type of test or scan are you looking for? You can tell me the test name, or describe your symptoms and I'll suggest the right tests.",
  price: "Our platform shows real-time prices from all partner labs and imaging centers. Prices vary by location and provider. Would you like me to search for a specific test?",
  results: "You can view all your test results in the 'My Results' section of your profile. Results are uploaded directly by the lab once ready, and you'll get a notification.",
  home: "Yes! Many of our partner labs offer home sample collection. I can filter providers that offer this service. Which area are you in?",
  insurance: "We work with MetLife, AXA, Allianz, Bupa, and GIG insurance providers. You can filter labs by your insurance in the search page.",
  default: "I understand you need help with that. Let me connect you with the right information. Could you tell me more about what you're looking for?",
};

// ─── Utility Components ───
const Stars = ({ rating, size = 14 }) => (
  <span style={{ display: "inline-flex", gap: 2 }}>
    {[1,2,3,4,5].map(i => (
      <span key={i} style={{ color: i <= Math.round(rating) ? T.accent : T.grey200, fontSize: size }}>★</span>
    ))}
  </span>
);

const Badge = ({ children, color = T.teal, bg = T.tealLight }) => (
  <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, background: bg, color, fontSize: 11, fontWeight: 600, letterSpacing: 0.3 }}>{children}</span>
);

const Btn = ({ children, onClick, variant = "primary", size = "md", style = {}, disabled = false, full = false }) => {
  const base = { border: "none", cursor: disabled ? "default" : "pointer", fontFamily: T.font, fontWeight: 600, borderRadius: T.radiusSm, transition: "all 0.2s", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: disabled ? 0.5 : 1, width: full ? "100%" : "auto" };
  const sizes = { sm: { padding: "8px 16px", fontSize: 13 }, md: { padding: "12px 24px", fontSize: 14 }, lg: { padding: "16px 32px", fontSize: 16 } };
  const variants = {
    primary: { background: `linear-gradient(135deg, ${T.teal}, ${T.tealDark})`, color: T.white, boxShadow: `0 4px 16px ${T.teal}33` },
    secondary: { background: T.grey50, color: T.grey500, border: `1.5px solid ${T.grey200}` },
    accent: { background: `linear-gradient(135deg, ${T.accent}, ${T.accentDark})`, color: T.white, boxShadow: `0 4px 16px ${T.accent}33` },
    ghost: { background: "transparent", color: T.teal },
    danger: { background: T.danger, color: T.white },
    outline: { background: "transparent", color: T.teal, border: `2px solid ${T.teal}` },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>{children}</button>;
};

const Input = ({ placeholder, value, onChange, icon, style = {}, type = "text" }) => (
  <div style={{ position: "relative", width: "100%", ...style }}>
    {icon && <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18, opacity: 0.5 }}>{icon}</span>}
    <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: icon ? "14px 16px 14px 44px" : "14px 16px", border: `1.5px solid ${T.grey200}`, borderRadius: T.radiusSm, fontSize: 15, fontFamily: T.font, background: T.white, outline: "none", color: T.dark, boxSizing: "border-box", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = T.teal} onBlur={e => e.target.style.borderColor = T.grey200} />
  </div>
);

const Card = ({ children, style = {}, hover = false, onClick }) => (
  <div onClick={onClick} style={{ background: T.white, borderRadius: T.radius, boxShadow: T.shadow, padding: 24, transition: "all 0.25s", cursor: onClick ? "pointer" : "default", ...(hover ? { ":hover": { transform: "translateY(-2px)" } } : {}), ...style }}>{children}</div>
);

const Modal = ({ open, onClose, children, title, wide }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(13,27,36,0.6)", backdropFilter: "blur(8px)" }} />
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", background: T.white, borderRadius: T.radiusXl, width: "100%", maxWidth: wide ? 800 : 520, maxHeight: "90vh", overflow: "auto", boxShadow: T.shadowXl, animation: "fadeUp 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${T.grey100}` }}>
          <h3 style={{ margin: 0, fontSize: 18, color: T.navy, fontFamily: T.font }}>{title}</h3>
          <button onClick={onClose} style={{ background: T.grey50, border: "none", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", color: T.grey400 }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
};

const TabBar = ({ tabs, active, onChange }) => (
  <div style={{ display: "flex", gap: 4, background: T.grey50, padding: 4, borderRadius: T.radiusSm, overflow: "auto" }}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)} style={{ padding: "10px 20px", border: "none", borderRadius: 8, background: active === t.id ? T.white : "transparent", color: active === t.id ? T.teal : T.grey400, fontWeight: active === t.id ? 700 : 500, fontSize: 13, cursor: "pointer", fontFamily: T.font, boxShadow: active === t.id ? T.shadow : "none", transition: "all 0.2s", whiteSpace: "nowrap" }}>
        {t.icon && <span style={{ marginRight: 6 }}>{t.icon}</span>}{t.label}
      </button>
    ))}
  </div>
);

const StatCard = ({ icon, value, label, color = T.teal }) => (
  <div style={{ background: T.white, borderRadius: T.radius, padding: "20px 24px", boxShadow: T.shadow, borderTop: `3px solid ${color}` }}>
    <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
    <div style={{ fontSize: 28, fontWeight: 800, color: T.navy, fontFamily: T.font }}>{value}</div>
    <div style={{ fontSize: 12, color: T.grey400, fontWeight: 500, marginTop: 2 }}>{label}</div>
  </div>
);

// ─── Global Styles ───
const GlobalCSS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Noto+Sans+Arabic:wght@300;400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${T.font}; background: ${T.offWhite}; color: ${T.dark}; -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-thumb { background: ${T.grey200}; border-radius: 10px; }
    ::placeholder { color: ${T.grey300}; }
    input:focus, select:focus { outline: none; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: calc(200px + 100%) 0; } }
    .hover-lift { transition: transform 0.25s, box-shadow 0.25s; }
    .hover-lift:hover { transform: translateY(-4px); box-shadow: ${T.shadowLg}; }
    .stagger-1 { animation: fadeUp 0.5s 0.1s both; }
    .stagger-2 { animation: fadeUp 0.5s 0.2s both; }
    .stagger-3 { animation: fadeUp 0.5s 0.3s both; }
    .stagger-4 { animation: fadeUp 0.5s 0.4s both; }
    .stagger-5 { animation: fadeUp 0.5s 0.5s both; }
    select { padding: 12px 16px; border: 1.5px solid ${T.grey200}; border-radius: ${T.radiusSm}; font-size: 14px; font-family: ${T.font}; background: ${T.white}; color: ${T.dark}; cursor: pointer; }
  `}</style>
);

// ═══════════════════════════════════════════
// HEADER / NAVIGATION
// ═══════════════════════════════════════════
const Header = ({ page, setPage, user, setUser, setShowLogin, setShowChat }) => (
  <header style={{ background: T.white, borderBottom: `1px solid ${T.grey100}`, position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(20px)", backgroundColor: "rgba(255,255,255,0.92)" }}>
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
      {/* Logo */}
      <div onClick={() => setPage("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${T.teal}, ${T.navy})`, display: "flex", alignItems: "center", justifyContent: "center", color: T.white, fontSize: 20, fontWeight: 800 }}>T</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.navy, lineHeight: 1.1, letterSpacing: -0.5 }}>Tahleeli<span style={{ color: T.teal }}>Online</span></div>
          <div style={{ fontSize: 9, color: T.grey300, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase" }}>تحليلي اونلاين</div>
        </div>
      </div>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {[
          { id: "home", label: "Home", icon: "🏠" },
          { id: "search", label: "Find Tests", icon: "🔍" },
          { id: "providers", label: "Providers", icon: "🏥" },
          { id: "corporate", label: "Corporate", icon: "🏢" },
          { id: "dashboard", label: "Dashboard", icon: "📊" },
        ].map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{ padding: "8px 14px", border: "none", background: page === n.id ? T.tealLight : "transparent", color: page === n.id ? T.teal : T.grey400, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.font, transition: "all 0.2s", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 15 }}>{n.icon}</span>{n.label}
          </button>
        ))}
      </nav>
      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => setShowChat(true)} style={{ width: 40, height: 40, borderRadius: "50%", border: `1.5px solid ${T.grey200}`, background: T.white, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }} title="AI Assistant">🤖</button>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${T.teal}, ${T.accent})`, display: "flex", alignItems: "center", justifyContent: "center", color: T.white, fontSize: 14, fontWeight: 700 }}>{user.name[0]}</div>
            <button onClick={() => setUser(null)} style={{ border: "none", background: "none", color: T.grey400, fontSize: 12, cursor: "pointer", fontFamily: T.font }}>Logout</button>
          </div>
        ) : (
          <Btn onClick={() => setShowLogin(true)} size="sm">Sign In</Btn>
        )}
      </div>
    </div>
  </header>
);

// ═══════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════
const HomePage = ({ setPage, setSearchQuery }) => {
  const [heroSearch, setHeroSearch] = useState("");
  return (
    <div>
      {/* Hero */}
      <section style={{ background: `linear-gradient(160deg, ${T.navy} 0%, #143A4F 50%, ${T.tealDark} 100%)`, padding: "80px 24px 100px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${T.teal}15, transparent)` }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${T.accent}10, transparent)` }} />
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div className="stagger-1" style={{ display: "inline-block", padding: "6px 16px", borderRadius: 30, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: T.accent, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
            🇪🇬 Egypt's #1 Medical Testing & Radiology Platform
          </div>
          <h1 className="stagger-2" style={{ fontSize: 52, fontWeight: 900, color: T.white, lineHeight: 1.1, marginBottom: 20, letterSpacing: -1.5 }}>
            Book Lab Tests & Scans<br />
            <span style={{ background: `linear-gradient(90deg, ${T.teal}, ${T.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>At the Best Price</span>
          </h1>
          <p className="stagger-3" style={{ fontSize: 18, color: "rgba(255,255,255,0.65)", maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.6 }}>
            Compare 600+ labs & imaging centers. Book instantly. Get digital results. Save up to 40%.
          </p>
          {/* Search Bar */}
          <div className="stagger-4" style={{ display: "flex", maxWidth: 640, margin: "0 auto", background: T.white, borderRadius: 16, overflow: "hidden", boxShadow: T.shadowXl }}>
            <div style={{ flex: 1, position: "relative" }}>
              <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", fontSize: 20 }}>🔍</span>
              <input value={heroSearch} onChange={e => setHeroSearch(e.target.value)} placeholder="Search tests, scans, or health packages..." style={{ width: "100%", padding: "20px 20px 20px 50px", border: "none", fontSize: 16, fontFamily: T.font, outline: "none" }} onKeyDown={e => { if (e.key === "Enter") { setSearchQuery(heroSearch); setPage("search"); } }} />
            </div>
            <button onClick={() => { setSearchQuery(heroSearch); setPage("search"); }} style={{ padding: "0 32px", background: `linear-gradient(135deg, ${T.teal}, ${T.tealDark})`, border: "none", color: T.white, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>Search</button>
          </div>
          {/* Quick Links */}
          <div className="stagger-5" style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 24, flexWrap: "wrap" }}>
            {["CBC Blood Test", "MRI Scan", "Thyroid Panel", "Health Package"].map(q => (
              <button key={q} onClick={() => { setSearchQuery(q); setPage("search"); }} style={{ padding: "8px 16px", borderRadius: 30, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer", fontFamily: T.font, transition: "all 0.2s" }}>
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ maxWidth: 1100, margin: "-50px auto 0", padding: "0 24px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, background: T.white, borderRadius: T.radiusXl, padding: 24, boxShadow: T.shadowLg }}>
          {[
            { num: "600+", label: "Partner Labs & Centers", icon: "🏥" },
            { num: "1,200+", label: "Available Tests & Scans", icon: "🧪" },
            { num: "250K+", label: "Patients Served", icon: "👥" },
            { num: "4.8★", label: "Average Rating", icon: "⭐" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: T.navy }}>{s.num}</div>
              <div style={{ fontSize: 12, color: T.grey400, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section style={{ maxWidth: 1100, margin: "60px auto", padding: "0 24px" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: T.navy, marginBottom: 8 }}>Browse by Category</h2>
        <p style={{ color: T.grey400, marginBottom: 28, fontSize: 15 }}>Find the right test or scan across all our partner providers</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {CATEGORIES.map((cat, i) => (
            <div key={cat.id} className="hover-lift" onClick={() => { setSearchQuery(cat.name); setPage("search"); }} style={{ background: T.white, borderRadius: T.radius, padding: 24, cursor: "pointer", boxShadow: T.shadow, animation: `fadeUp 0.5s ${i * 0.05}s both` }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{cat.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 2 }}>{cat.name}</div>
              <div style={{ fontSize: 12, color: T.grey300, fontWeight: 500 }}>{cat.nameAr}</div>
              <div style={{ fontSize: 12, color: T.teal, fontWeight: 600, marginTop: 8 }}>{cat.count} tests available →</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ background: T.grey50, padding: "64px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: T.navy, textAlign: "center", marginBottom: 8 }}>How It Works</h2>
          <p style={{ color: T.grey400, textAlign: "center", marginBottom: 48, fontSize: 15 }}>Book your medical test in 3 simple steps</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {[
              { step: "01", icon: "📋", title: "Search & Compare", desc: "Upload your prescription or search by test name. Compare prices, locations, and ratings across 600+ providers." },
              { step: "02", icon: "📅", title: "Book & Pay", desc: "Choose your preferred time slot, pay securely online via Fawry, card, or mobile wallet. Or opt for home collection." },
              { step: "03", icon: "📱", title: "Get Digital Results", desc: "Receive your results digitally through the app. Share with your doctor in one tap. Store forever in your health vault." },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", padding: 24 }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${T.tealLight}, ${T.white})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 20px", border: `2px solid ${T.teal}20`, animation: `float 3s ${i * 0.5}s infinite ease-in-out` }}>{s.icon}</div>
                <div style={{ fontSize: 11, color: T.teal, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>STEP {s.step}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.navy, marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: T.grey400, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tests */}
      <section style={{ maxWidth: 1100, margin: "60px auto", padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: T.navy, marginBottom: 4 }}>Most Popular Tests</h2>
            <p style={{ color: T.grey400, fontSize: 15 }}>Frequently booked across Egypt</p>
          </div>
          <Btn variant="ghost" onClick={() => setPage("search")}>View All →</Btn>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {TEST_CATALOG.filter(t => t.popular).slice(0, 6).map((test, i) => (
            <div key={test.id} className="hover-lift" style={{ background: T.white, borderRadius: T.radius, padding: 20, boxShadow: T.shadow, animation: `fadeUp 0.4s ${i * 0.08}s both` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                <Badge>{CATEGORIES.find(c => c.id === test.category)?.icon} {test.category}</Badge>
                <span style={{ fontSize: 12, color: T.grey300 }}>⏱ {test.turnaround}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 4 }}>{test.name}</div>
              <div style={{ fontSize: 12, color: T.grey300, marginBottom: 12 }}>{test.nameAr}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 11, color: T.grey300 }}>Starting from</span>
                  <div style={{ fontSize: 22, fontWeight: 800, color: T.teal }}>EGP {test.price}</div>
                </div>
                <Btn size="sm" onClick={() => setPage("search")}>Book Now</Btn>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Prescription Upload CTA */}
      <section style={{ maxWidth: 1100, margin: "60px auto", padding: "0 24px" }}>
        <div style={{ background: `linear-gradient(135deg, ${T.navy}, #1A4A60)`, borderRadius: T.radiusXl, padding: "48px 56px", display: "flex", alignItems: "center", gap: 48, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -60, top: -60, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${T.teal}20, transparent)` }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: T.accent, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>AI-POWERED</div>
            <h3 style={{ fontSize: 28, fontWeight: 800, color: T.white, marginBottom: 12 }}>Upload Your Prescription</h3>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 24 }}>Take a photo of your doctor's prescription. Our AI reads it, identifies the required tests, and finds the best prices across all providers. It's that simple.</p>
            <Btn variant="accent" size="lg" onClick={() => { const text = prompt("📋 Type or paste your prescription text:\n\nExamples:\n• CBC, thyroid, sugar test\n• صورة دم كاملة وسكر تراكمي\n• MRI brain with contrast"); if (text) { alert("✅ Detected tests from your prescription:\\n\\n" + text + "\\n\\nGo to Find Tests page to book these tests at the best price!"); }}}>📸 Upload Prescription</Btn>
          </div>
          <div style={{ width: 200, height: 200, borderRadius: T.radiusXl, background: `linear-gradient(135deg, ${T.teal}30, ${T.accent}20)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80, flexShrink: 0 }}>📄</div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ background: T.grey50, padding: "64px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: T.navy, textAlign: "center", marginBottom: 36 }}>What Patients Say</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {REVIEWS.map((r, i) => (
              <div key={i} style={{ background: T.white, borderRadius: T.radius, padding: 24, boxShadow: T.shadow }}>
                <Stars rating={r.rating} /><br />
                <p style={{ fontSize: 14, color: T.grey500, lineHeight: 1.6, margin: "12px 0" }}>"{r.text}"</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: T.navy }}>{r.user}</span>
                  <span style={{ fontSize: 11, color: T.grey300 }}>{r.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: T.navy, padding: "48px 24px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.white, marginBottom: 12 }}>Tahleeli<span style={{ color: T.teal }}>Online</span></div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 16 }}>Egypt's leading digital platform for medical testing and radiology booking. Compare, book, and get results — all digital.</p>
            <div style={{ display: "flex", gap: 12 }}>
              {["📘", "📸", "🐦", "💬"].map((s, i) => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer" }}>{s}</div>
              ))}
            </div>
          </div>
          {[
            { title: "Services", items: ["Lab Tests", "Radiology", "Health Packages", "Home Collection", "Corporate"] },
            { title: "Company", items: ["About Us", "Careers", "Press", "Contact", "Partners"] },
            { title: "Support", items: ["Help Center", "Privacy Policy", "Terms", "Insurance", "API Docs"] },
          ].map((col, i) => (
            <div key={i}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.white, marginBottom: 16 }}>{col.title}</div>
              {col.items.map(item => (
                <div key={item} style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 10, cursor: "pointer" }}>{item}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1100, margin: "32px auto 0", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© 2026 TahleeliOnline. All rights reserved.</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>🇪🇬 Made in Egypt with ❤️</span>
        </div>
      </footer>
    </div>
  );
};

// ═══════════════════════════════════════════
// SEARCH & BOOKING PAGE
// ═══════════════════════════════════════════
const SearchPage = ({ searchQuery, setSearchQuery }) => {
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("price");
  const [homeOnly, setHomeOnly] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [bookingStep, setBookingStep] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const filtered = TEST_CATALOG.filter(t => {
    const matchCat = category === "all" || t.category === category;
    const matchSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.nameAr.includes(searchQuery);
    return matchCat && matchSearch;
  }).sort((a, b) => sortBy === "price" ? a.price - b.price : sortBy === "name" ? a.name.localeCompare(b.name) : 0);

  const handleBook = (test) => { setSelectedTest(test); setBookingStep(1); setSelectedProvider(null); setSelectedSlot(null); setBookingConfirmed(false); };
  const confirmBooking = () => { setBookingConfirmed(true); setBookingStep(3); };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ display: "flex", gap: 28 }}>
        {/* Sidebar Filters */}
        <aside style={{ width: 260, flexShrink: 0 }}>
          <Card style={{ position: "sticky", top: 88 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 20 }}>🔎 Filters</h3>
            <Input placeholder="Search tests..." value={searchQuery} onChange={setSearchQuery} icon="🔍" />
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.grey400, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Category</div>
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: "100%" }}>
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.grey400, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Sort By</div>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: "100%" }}>
                <option value="price">Lowest Price</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
            <div style={{ marginTop: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: T.grey500 }}>
                <input type="checkbox" checked={homeOnly} onChange={e => setHomeOnly(e.target.checked)} style={{ accentColor: T.teal }} />
                🏠 Home collection only
              </label>
            </div>
            <div style={{ marginTop: 24, padding: 16, background: T.tealLight, borderRadius: T.radiusSm }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.teal, marginBottom: 4 }}>📸 Got a prescription?</div>
              <div style={{ fontSize: 12, color: T.grey400, marginBottom: 12 }}>Upload a photo and our AI will find the tests for you</div>
              <Btn size="sm" full>Upload Photo</Btn>
            </div>
          </Card>
        </aside>

        {/* Results */}
        <main style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: T.navy }}>{searchQuery ? `Results for "${searchQuery}"` : "All Tests & Scans"}</h2>
              <span style={{ fontSize: 13, color: T.grey400 }}>{filtered.length} tests found</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((test, i) => {
              const providers = PROVIDERS.filter(p => test.providers.includes(p.id));
              const filteredProviders = homeOnly ? providers.filter(p => p.homeCollection) : providers;
              return (
                <div key={test.id} className="hover-lift" style={{ background: T.white, borderRadius: T.radius, padding: 24, boxShadow: T.shadow, display: "flex", alignItems: "center", gap: 20, animation: `slideIn 0.4s ${i * 0.05}s both` }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: T.tealLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
                    {CATEGORIES.find(c => c.id === test.category)?.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: T.navy }}>{test.name}</div>
                    <div style={{ fontSize: 12, color: T.grey300, marginBottom: 6 }}>{test.nameAr}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Badge>{test.category}</Badge>
                      <Badge color={T.grey500} bg={T.grey50}>⏱ {test.turnaround}</Badge>
                      {filteredProviders.length > 0 && <Badge color={T.teal} bg={T.tealLight}>{filteredProviders.length} provider{filteredProviders.length > 1 ? "s" : ""}</Badge>}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: T.grey300 }}>Starting from</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: T.teal }}>EGP {test.price}</div>
                    <Btn size="sm" onClick={() => handleBook(test)} style={{ marginTop: 8 }}>Book Now</Btn>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: 60 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.navy, marginBottom: 8 }}>No tests found</div>
                <div style={{ fontSize: 14, color: T.grey400 }}>Try adjusting your search or filters</div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Booking Modal */}
      <Modal open={bookingStep > 0} onClose={() => setBookingStep(0)} title={bookingConfirmed ? "✅ Booking Confirmed!" : `Book: ${selectedTest?.name || ""}`} wide>
        {bookingStep === 1 && selectedTest && (
          <div>
            <p style={{ fontSize: 14, color: T.grey400, marginBottom: 20 }}>Select a provider for <strong>{selectedTest.name}</strong></p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PROVIDERS.filter(p => selectedTest.providers.includes(p.id)).map(p => (
                <div key={p.id} onClick={() => { setSelectedProvider(p); setBookingStep(2); }} style={{ padding: 20, border: `2px solid ${selectedProvider?.id === p.id ? T.teal : T.grey100}`, borderRadius: T.radius, cursor: "pointer", transition: "all 0.2s", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.navy }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: T.grey300, marginTop: 2 }}>📍 {p.location}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      <Stars rating={p.rating} size={12} />
                      <span style={{ fontSize: 12, color: T.grey300 }}>({p.reviews})</span>
                      {p.verified && <Badge color={T.success} bg="#ECFDF5">✓ Verified</Badge>}
                      {p.cap && <Badge color={T.accent} bg="#FEF7ED">CAP</Badge>}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: T.teal }}>EGP {selectedTest.price + Math.floor(Math.random() * 100 - 50)}</div>
                    <div style={{ fontSize: 11, color: T.grey300 }}>⏱ Wait: {p.waitTime}</div>
                    {p.homeCollection && <Badge color={T.teal} bg={T.tealLight}>🏠 Home OK</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {bookingStep === 2 && selectedProvider && (
          <div>
            <p style={{ fontSize: 14, color: T.grey400, marginBottom: 8 }}>Provider: <strong>{selectedProvider.name}</strong></p>
            <p style={{ fontSize: 14, color: T.grey400, marginBottom: 20 }}>Select date and time slot:</p>
            <div style={{ marginBottom: 16 }}>
              <input type="date" style={{ padding: "12px 16px", border: `1.5px solid ${T.grey200}`, borderRadius: T.radiusSm, fontSize: 14, fontFamily: T.font, width: "100%" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {TIME_SLOTS.map(slot => (
                <button key={slot} onClick={() => setSelectedSlot(slot)} style={{ padding: "12px 8px", border: `1.5px solid ${selectedSlot === slot ? T.teal : T.grey200}`, borderRadius: 8, background: selectedSlot === slot ? T.tealLight : T.white, color: selectedSlot === slot ? T.teal : T.grey500, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.font, transition: "all 0.15s" }}>
                  {slot}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 24, padding: 16, background: T.grey50, borderRadius: T.radiusSm }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.navy, marginBottom: 8 }}>💳 Payment Method</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["Fawry", "Vodafone Cash", "Credit Card", "Pay at Lab"].map(m => (
                  <button key={m} style={{ padding: "8px 14px", borderRadius: 8, border: `1.5px solid ${T.grey200}`, background: T.white, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.font, color: T.grey500 }}>{m}</button>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
              <Btn variant="secondary" onClick={() => setBookingStep(1)}>← Back</Btn>
              <Btn onClick={confirmBooking} disabled={!selectedSlot} style={{ flex: 1 }}>Confirm Booking — EGP {selectedTest?.price || 0}</Btn>
            </div>
          </div>
        )}
        {bookingStep === 3 && bookingConfirmed && (
          <div style={{ textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 64, marginBottom: 16, animation: "float 2s infinite" }}>✅</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: T.navy, marginBottom: 8 }}>Booking Confirmed!</h3>
            <p style={{ fontSize: 14, color: T.grey400, marginBottom: 24 }}>
              Your appointment for <strong>{selectedTest?.name}</strong> at <strong>{selectedProvider?.name}</strong> has been confirmed for <strong>{selectedSlot}</strong>.
            </p>
            <div style={{ background: T.grey50, borderRadius: T.radiusSm, padding: 20, marginBottom: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, textAlign: "left" }}>
                <div><span style={{ fontSize: 12, color: T.grey300 }}>Booking ID</span><div style={{ fontWeight: 700, color: T.navy }}>THL-{Math.floor(Math.random() * 90000 + 10000)}</div></div>
                <div><span style={{ fontSize: 12, color: T.grey300 }}>Status</span><div style={{ fontWeight: 700, color: T.success }}>Confirmed ✓</div></div>
                <div><span style={{ fontSize: 12, color: T.grey300 }}>Test</span><div style={{ fontWeight: 600, color: T.navy }}>{selectedTest?.name}</div></div>
                <div><span style={{ fontSize: 12, color: T.grey300 }}>Amount</span><div style={{ fontWeight: 700, color: T.teal }}>EGP {selectedTest?.price}</div></div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: T.grey300, marginBottom: 20 }}>📲 Confirmation sent via WhatsApp and SMS</p>
            <Btn onClick={() => setBookingStep(0)}>Done</Btn>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════
// PROVIDERS PAGE
// ═══════════════════════════════════════════
const ProvidersPage = () => {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? PROVIDERS : PROVIDERS.filter(p => p.type === filter);
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: T.navy }}>Partner Providers</h2>
          <p style={{ color: T.grey400, fontSize: 15 }}>Verified labs and imaging centers across Egypt</p>
        </div>
        <TabBar tabs={[{ id: "all", label: "All", icon: "🏥" }, { id: "lab", label: "Labs", icon: "🧪" }, { id: "imaging", label: "Imaging", icon: "📡" }]} active={filter} onChange={setFilter} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
        {filtered.map((p, i) => (
          <div key={p.id} className="hover-lift" style={{ background: T.white, borderRadius: T.radius, overflow: "hidden", boxShadow: T.shadow, animation: `fadeUp 0.4s ${i * 0.08}s both` }}>
            <div style={{ height: 140, background: `linear-gradient(135deg, ${p.type === "lab" ? T.teal + "15" : T.accent + "15"}, ${T.grey50})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60 }}>
              {p.type === "lab" ? "🧪" : "📡"}
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                {p.verified && <Badge color={T.success} bg="#ECFDF5">✓ Verified</Badge>}
                {p.cap && <Badge color={T.accent} bg="#FEF7ED">CAP Accredited</Badge>}
                {p.openNow && <Badge color={T.success} bg="#ECFDF5">Open Now</Badge>}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: T.navy, marginBottom: 2 }}>{p.name}</h3>
              <div style={{ fontSize: 13, color: T.grey300, marginBottom: 6 }}>{p.nameAr}</div>
              <div style={{ fontSize: 13, color: T.grey400, marginBottom: 12 }}>📍 {p.location} • ⏱ {p.waitTime} wait</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Stars rating={p.rating} />
                <span style={{ fontWeight: 700, color: T.navy, fontSize: 14 }}>{p.rating}</span>
                <span style={{ fontSize: 12, color: T.grey300 }}>({p.reviews} reviews)</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                {p.services.map(s => <Badge key={s}>{CATEGORIES.find(c => c.id === s)?.icon} {s}</Badge>)}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  {p.homeCollection && <span style={{ fontSize: 12, color: T.teal }}>🏠 Home Collection</span>}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 12, color: T.grey300 }}>💳 {p.insurance.length} insurers</span>
                  <span style={{ fontWeight: 700, color: T.teal }}>{p.priceRange}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// CORPORATE / B2B PAGE
// ═══════════════════════════════════════════
const CorporatePage = () => {
  const [formData, setFormData] = useState({ company: "", contact: "", email: "", employees: "", needs: "" });
  const [submitted, setSubmitted] = useState(false);
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${T.navy}, #1A4A60)`, borderRadius: T.radiusXl, padding: "56px 56px", marginBottom: 40, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -40, bottom: -40, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${T.accent}20, transparent)` }} />
        <div style={{ maxWidth: 600 }}>
          <div style={{ fontSize: 11, color: T.accent, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>B2B CORPORATE WELLNESS</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: T.white, marginBottom: 16, lineHeight: 1.2 }}>Health Screening for Your Team, Made Simple</h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>Pre-employment testing, annual health check-ups, and wellness packages — all managed through one digital platform with bulk booking, invoicing, and real-time reporting.</p>
        </div>
      </div>
      {/* Benefits Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 40 }}>
        {[
          { icon: "📊", title: "HR Dashboard", desc: "Track employee bookings, results, and compliance from a single dashboard." },
          { icon: "💰", title: "Volume Discounts", desc: "Save 20–40% with corporate pricing on lab tests and imaging packages." },
          { icon: "📄", title: "Automated Invoicing", desc: "Monthly consolidated invoices with detailed breakdowns per department." },
          { icon: "🏠", title: "On-Site Collection", desc: "We send certified phlebotomists to your office for blood collection." },
          { icon: "🔒", title: "HIPAA-Aware Privacy", desc: "Employee results are private. HR only sees aggregate compliance data." },
          { icon: "📱", title: "Employee App Access", desc: "Each employee gets app access to book, view results, and manage their health." },
        ].map((b, i) => (
          <Card key={i} style={{ textAlign: "center", padding: 28 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{b.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 6 }}>{b.title}</div>
            <div style={{ fontSize: 13, color: T.grey400, lineHeight: 1.5 }}>{b.desc}</div>
          </Card>
        ))}
      </div>
      {/* Contact Form */}
      <Card style={{ maxWidth: 600, margin: "0 auto", padding: 36 }}>
        <h3 style={{ fontSize: 22, fontWeight: 800, color: T.navy, marginBottom: 4 }}>Get a Corporate Quote</h3>
        <p style={{ fontSize: 13, color: T.grey400, marginBottom: 24 }}>Fill in your details and we'll send a customized proposal within 24 hours.</p>
        {submitted ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📨</div>
            <h3 style={{ color: T.navy, marginBottom: 8 }}>Request Received!</h3>
            <p style={{ color: T.grey400, fontSize: 14 }}>Our B2B team will contact you within 24 hours.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input placeholder="Company Name" value={formData.company} onChange={v => setFormData({ ...formData, company: v })} icon="🏢" />
            <Input placeholder="Contact Person" value={formData.contact} onChange={v => setFormData({ ...formData, contact: v })} icon="👤" />
            <Input placeholder="Email" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} icon="📧" type="email" />
            <select value={formData.employees} onChange={e => setFormData({ ...formData, employees: e.target.value })} style={{ width: "100%" }}>
              <option value="">Number of Employees</option>
              <option>10–50</option><option>51–200</option><option>201–500</option><option>500+</option>
            </select>
            <textarea placeholder="What services do you need?" value={formData.needs} onChange={e => setFormData({ ...formData, needs: e.target.value })} style={{ padding: 14, border: `1.5px solid ${T.grey200}`, borderRadius: T.radiusSm, fontSize: 14, fontFamily: T.font, minHeight: 100, resize: "vertical" }} />
            <Btn full onClick={async () => { try { await api.submitCorporateLead(formData); } catch {} setSubmitted(true); }}>Submit Request</Btn>
          </div>
        )}
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════
// PROVIDER DASHBOARD (SaaS)
// ═══════════════════════════════════════════
const DashboardPage = () => {
  const [tab, setTab] = useState("overview");
  const bookings = [
    { id: "THL-38271", patient: "Ahmed M.", test: "CBC Blood Count", date: "Today, 10:30 AM", status: "confirmed", amount: 120 },
    { id: "THL-38272", patient: "Fatma S.", test: "Brain MRI", date: "Today, 2:00 PM", status: "in-progress", amount: 2800 },
    { id: "THL-38273", patient: "Omar K.", test: "Thyroid Panel", date: "Tomorrow, 9:00 AM", status: "pending", amount: 350 },
    { id: "THL-38274", patient: "Mona A.", test: "Chest X-Ray", date: "Tomorrow, 11:30 AM", status: "confirmed", amount: 250 },
    { id: "THL-38275", patient: "Hassan F.", test: "Lipid Profile", date: "Mar 24, 8:00 AM", status: "confirmed", amount: 200 },
  ];
  const statusColors = { confirmed: T.success, "in-progress": T.accent, pending: T.warning, completed: T.teal, cancelled: T.danger };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: T.navy }}>Provider Dashboard</h2>
          <p style={{ color: T.grey400, fontSize: 14 }}>Cairo Diagnostic Center • Last updated: just now</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="secondary" size="sm">⚙️ Settings</Btn>
          <Btn size="sm">📤 Upload Results</Btn>
        </div>
      </div>

      <TabBar tabs={[
        { id: "overview", label: "Overview", icon: "📊" },
        { id: "bookings", label: "Bookings", icon: "📅" },
        { id: "analytics", label: "Analytics", icon: "📈" },
        { id: "listings", label: "My Listings", icon: "📋" },
        { id: "reviews", label: "Reviews", icon: "⭐" },
      ]} active={tab} onChange={setTab} />

      <div style={{ marginTop: 24 }}>
        {tab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
              <StatCard icon="📅" value="47" label="Today's Bookings" color={T.teal} />
              <StatCard icon="💰" value="EGP 38,400" label="Today's Revenue" color={T.accent} />
              <StatCard icon="⭐" value="4.8" label="Average Rating" color={T.warning} />
              <StatCard icon="📈" value="+23%" label="vs Last Week" color={T.success} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
              <Card>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 16 }}>📅 Upcoming Bookings</h3>
                {bookings.slice(0, 4).map(b => (
                  <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${T.grey100}` }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.navy }}>{b.patient} — {b.test}</div>
                      <div style={{ fontSize: 12, color: T.grey300 }}>{b.date}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.teal }}>EGP {b.amount}</span>
                      <Badge color={statusColors[b.status]} bg={statusColors[b.status] + "18"}>{b.status}</Badge>
                    </div>
                  </div>
                ))}
              </Card>
              <Card>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 16 }}>📊 Quick Stats</h3>
                {[
                  { label: "Total Bookings (Month)", value: "612" },
                  { label: "Revenue (Month)", value: "EGP 284,000" },
                  { label: "Avg Turnaround", value: "4.2 hours" },
                  { label: "Completion Rate", value: "98.4%" },
                  { label: "Home Collections", value: "89" },
                  { label: "Repeat Patients", value: "34%" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.grey100}` }}>
                    <span style={{ fontSize: 13, color: T.grey400 }}>{s.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{s.value}</span>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}
        {tab === "bookings" && (
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.navy }}>All Bookings</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <Input placeholder="Search bookings..." value="" onChange={() => {}} icon="🔍" style={{ width: 260 }} />
                <select><option>All Status</option><option>Confirmed</option><option>Pending</option><option>In Progress</option></select>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: T.grey50 }}>
                    {["Booking ID", "Patient", "Test", "Date & Time", "Amount", "Status", "Actions"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: T.grey400, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} style={{ borderBottom: `1px solid ${T.grey100}` }}>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: T.teal }}>{b.id}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: T.navy }}>{b.patient}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: T.grey500 }}>{b.test}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: T.grey400 }}>{b.date}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: T.navy }}>EGP {b.amount}</td>
                      <td style={{ padding: "14px 16px" }}><Badge color={statusColors[b.status]} bg={statusColors[b.status] + "18"}>{b.status}</Badge></td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <Btn variant="ghost" size="sm" style={{ padding: "4px 8px" }}>📤</Btn>
                          <Btn variant="ghost" size="sm" style={{ padding: "4px 8px" }}>✏️</Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
        {tab === "analytics" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 20 }}>📈 Revenue Trend (Last 6 Months)</h3>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 200 }}>
                {[
                  { month: "Oct", value: 180000 },
                  { month: "Nov", value: 210000 },
                  { month: "Dec", value: 195000 },
                  { month: "Jan", value: 240000 },
                  { month: "Feb", value: 268000 },
                  { month: "Mar", value: 284000 },
                ].map((d, i) => {
                  const maxVal = 300000;
                  const pct = (d.value / maxVal) * 100;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: T.grey400 }}>{(d.value / 1000).toFixed(0)}K</span>
                      <div style={{ width: "100%", height: `${pct}%`, borderRadius: 8, background: `linear-gradient(180deg, ${T.teal}, ${T.tealDark})`, minHeight: 20, transition: "height 0.5s", animation: `fadeUp 0.5s ${i * 0.1}s both` }} />
                      <span style={{ fontSize: 11, color: T.grey300 }}>{d.month}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 20 }}>🧪 Top Tests by Volume</h3>
              {[
                { test: "Complete Blood Count", count: 156, pct: 100 },
                { test: "Lipid Profile", count: 98, pct: 63 },
                { test: "Thyroid Panel", count: 87, pct: 56 },
                { test: "HbA1c", count: 72, pct: 46 },
                { test: "Vitamin D", count: 64, pct: 41 },
              ].map((t, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{t.test}</span>
                    <span style={{ fontSize: 12, color: T.grey400 }}>{t.count} bookings</span>
                  </div>
                  <div style={{ height: 8, background: T.grey100, borderRadius: 4 }}>
                    <div style={{ height: "100%", width: `${t.pct}%`, background: `linear-gradient(90deg, ${T.teal}, ${T.accent})`, borderRadius: 4, transition: "width 1s", animation: `fadeIn 0.5s ${i * 0.1}s both` }} />
                  </div>
                </div>
              ))}
            </Card>
            <Card>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 20 }}>🗺️ Patient Distribution</h3>
              {[
                { area: "Nasr City", pct: 32 },
                { area: "Heliopolis", pct: 24 },
                { area: "Maadi", pct: 18 },
                { area: "New Cairo", pct: 14 },
                { area: "Other", pct: 12 },
              ].map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.navy, width: 100 }}>{a.area}</span>
                  <div style={{ flex: 1, height: 24, background: T.grey100, borderRadius: 6 }}>
                    <div style={{ height: "100%", width: `${a.pct}%`, background: `linear-gradient(90deg, ${T.teal}, ${T.tealDark})`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.white }}>{a.pct}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
            <Card>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 20 }}>⭐ Rating Breakdown</h3>
              {[5, 4, 3, 2, 1].map(star => {
                const pcts = { 5: 68, 4: 22, 3: 7, 2: 2, 1: 1 };
                return (
                  <div key={star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.navy, width: 20 }}>{star}★</span>
                    <div style={{ flex: 1, height: 16, background: T.grey100, borderRadius: 4 }}>
                      <div style={{ height: "100%", width: `${pcts[star]}%`, background: T.accent, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 12, color: T.grey400, width: 36, textAlign: "right" }}>{pcts[star]}%</span>
                  </div>
                );
              })}
            </Card>
          </div>
        )}
        {tab === "listings" && (
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.navy }}>My Test Listings</h3>
              <Btn size="sm">+ Add New Test</Btn>
            </div>
            {TEST_CATALOG.filter(t => t.providers.includes(1)).map(t => (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: `1px solid ${T.grey100}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: T.tealLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{CATEGORIES.find(c => c.id === t.category)?.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.navy }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: T.grey300 }}>{t.nameAr} • ⏱ {t.turnaround}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: T.teal }}>EGP {t.price}</span>
                  <Badge color={T.success} bg="#ECFDF5">Active</Badge>
                  <Btn variant="ghost" size="sm">Edit</Btn>
                </div>
              </div>
            ))}
          </Card>
        )}
        {tab === "reviews" && (
          <Card>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 20 }}>Patient Reviews</h3>
            {REVIEWS.map((r, i) => (
              <div key={i} style={{ padding: "20px 0", borderBottom: `1px solid ${T.grey100}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.tealLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: T.teal }}>{r.user[0]}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.navy }}>{r.user}</div>
                      <Stars rating={r.rating} size={12} />
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: T.grey300 }}>{r.date}</span>
                </div>
                <p style={{ fontSize: 14, color: T.grey500, lineHeight: 1.5, marginLeft: 48 }}>{r.text}</p>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// AI CHATBOT
// ═══════════════════════════════════════════
const ChatBot = ({ open, onClose }) => {
  const [messages, setMessages] = useState([{ from: "bot", text: CHAT_RESPONSES.greeting }]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { from: "user", text: userMsg }]);
    setInput("");
    try {
      const res = await api.sendChat(userMsg);
      setMessages(prev => [...prev, { from: "bot", text: res.text }]);
    } catch {
      const msg = userMsg.toLowerCase();
      let response = CHAT_RESPONSES.default;
      if (msg.includes("book") || msg.includes("حجز")) response = CHAT_RESPONSES.booking;
      else if (msg.includes("price") || msg.includes("cost") || msg.includes("سعر")) response = CHAT_RESPONSES.price;
      else if (msg.includes("result") || msg.includes("نتيجة")) response = CHAT_RESPONSES.results;
      else if (msg.includes("home") || msg.includes("منزل")) response = CHAT_RESPONSES.home;
      else if (msg.includes("insurance") || msg.includes("تأمين")) response = CHAT_RESPONSES.insurance;
      else if (msg.includes("hi") || msg.includes("hello") || msg.includes("مرحبا")) response = CHAT_RESPONSES.greeting;
      setMessages(prev => [...prev, { from: "bot", text: response }]);
    }
  };

  if (!open) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, width: 380, height: 520, background: T.white, borderRadius: T.radiusXl, boxShadow: T.shadowXl, display: "flex", flexDirection: "column", zIndex: 999, animation: "fadeUp 0.3s", overflow: "hidden" }}>
      <div style={{ background: `linear-gradient(135deg, ${T.navy}, ${T.tealDark})`, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤖</div>
          <div>
            <div style={{ color: T.white, fontWeight: 700, fontSize: 14 }}>Health Assistant</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Online • AI-powered</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: T.white, width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>✕</button>
      </div>
      <div style={{ flex: 1, padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start", animation: `fadeUp 0.3s` }}>
            <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: m.from === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.from === "user" ? T.teal : T.grey50, color: m.from === "user" ? T.white : T.dark, fontSize: 13, lineHeight: 1.5 }}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div style={{ padding: 12, borderTop: `1px solid ${T.grey100}`, display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask about tests, prices, booking..." style={{ flex: 1, padding: "10px 14px", border: `1.5px solid ${T.grey200}`, borderRadius: 10, fontSize: 13, fontFamily: T.font, outline: "none" }} />
        <button onClick={send} style={{ width: 40, height: 40, borderRadius: 10, background: T.teal, border: "none", color: T.white, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>→</button>
      </div>
      <div style={{ padding: "0 12px 10px", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["Book a test", "Prices", "Home collection", "Insurance"].map(q => (
          <button key={q} onClick={() => { setInput(q); setTimeout(send, 100); }} style={{ padding: "4px 10px", borderRadius: 20, background: T.grey50, border: `1px solid ${T.grey200}`, fontSize: 11, cursor: "pointer", fontFamily: T.font, color: T.grey500 }}>{q}</button>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// LOGIN MODAL
// ═══════════════════════════════════════════
const LoginModal = ({ open, onClose, onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  return (
    <Modal open={open} onClose={onClose} title={isRegister ? "Create Account" : "Sign In"}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {error && <div style={{ padding: "10px 14px", borderRadius: 8, background: "#FEF2F2", color: "#DC2626", fontSize: 13 }}>{error}</div>}
        {isRegister && <Input placeholder="Full Name" value={name} onChange={setName} icon="👤" />}
        <Input placeholder="Phone or Email" value={phone} onChange={setPhone} icon="📱" />
        <Input placeholder="Password" value={password} onChange={setPassword} icon="🔒" type="password" />
        <Btn full onClick={() => { setError(""); onLogin({ name: name || "User", email: phone, phone, password, isRegister }); }}>{isRegister ? "Create Account" : "Sign In"}</Btn>
        <div style={{ textAlign: "center" }}>
          <button onClick={() => setIsRegister(!isRegister)} style={{ border: "none", background: "none", color: T.teal, fontSize: 13, cursor: "pointer", fontFamily: T.font, fontWeight: 600 }}>
            {isRegister ? "Already have an account? Sign In" : "Don't have an account? Register"}
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
          <div style={{ flex: 1, height: 1, background: T.grey200 }} />
          <span style={{ fontSize: 12, color: T.grey300 }}>or continue with</span>
          <div style={{ flex: 1, height: 1, background: T.grey200 }} />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Btn variant="secondary" full style={{ fontSize: 13 }}>📱 Vodafone Cash</Btn>
          <Btn variant="secondary" full style={{ fontSize: 13 }}>🔵 Facebook</Btn>
          <Btn variant="secondary" full style={{ fontSize: 13 }}>🟢 Google</Btn>
        </div>
      </div>
    </Modal>
  );
};

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogin = async (userData) => {
    try {
      const res = userData.isRegister
        ? await api.register(userData.name, userData.email, userData.phone, userData.password)
        : await api.login(userData.email, userData.password);
      api.setToken(res.token);
      setUser(res.user);
      setShowLogin(false);
    } catch (err) {
      // Fallback for demo: still log in locally
      setUser({ name: userData.name || userData.email, email: userData.email });
      setShowLogin(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", fontFamily: T.font }}>
      <GlobalCSS />
      <Header page={page} setPage={setPage} user={user} setUser={setUser} setShowLogin={setShowLogin} setShowChat={setShowChat} />

      {page === "home" && <HomePage setPage={setPage} setSearchQuery={setSearchQuery} />}
      {page === "search" && <SearchPage searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
      {page === "providers" && <ProvidersPage />}
      {page === "corporate" && <CorporatePage />}
      {page === "dashboard" && <DashboardPage />}

      <ChatBot open={showChat} onClose={() => setShowChat(false)} />
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} onLogin={handleLogin} />

      {/* Floating Chat Button */}
      {!showChat && (
        <button onClick={() => setShowChat(true)} style={{ position: "fixed", bottom: 24, right: 24, width: 60, height: 60, borderRadius: "50%", background: `linear-gradient(135deg, ${T.teal}, ${T.navy})`, border: "none", color: T.white, fontSize: 28, cursor: "pointer", boxShadow: T.shadowLg, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 998, animation: "float 3s infinite" }}>
          💬
        </button>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, ArrowRight, Copy, Check, Instagram, MessageCircleHeart, GraduationCap } from "lucide-react";

// ---------------------------------------------------------------------
// DESIGN TOKENS
// ---------------------------------------------------------------------
const THEME = {
  neutral: { bg: "#EFEDF3", accent: "#6C5CE0", accentSoft: "#DEDAF7", ink: "#221F2B" },
  female:  { bg: "#FBE4EC", accent: "#D6698C", accentSoft: "#F6C9D8", ink: "#3A1F28" },
  male:    { bg: "#DFEBF7", accent: "#3E7CB1", accentSoft: "#C8DFF0", ink: "#1B2A38" },
};

const UNIVERSITIES = [
  { code: "UJ", name: "University of Jordan", count: 1204 },
  { code: "PSUT", name: "PSUT", count: 812 },
  { code: "GJU", name: "GJU", count: 634 },
  { code: "JUST", name: "JUST", count: 977 },
];

const MOCK_PROFILES = {
  UJ: [
    { name: "Lama", major: "Architecture", teaser: "Is it true you pulled an all-nighter before Structures final?", whispers: 6 },
    { name: "Omar", major: "Business", teaser: "Someone from Marketing 201 has a crush on you 👀", whispers: 3 },
    { name: "Rand", major: "Pharmacy", teaser: "Best knafeh near Gate 4 — settle the debate", whispers: 9 },
    { name: "Yazan", major: "Computer Eng.", teaser: "Did you actually top the Data Structures midterm?", whispers: 4 },
    { name: "Dana", major: "Law", teaser: "What's the real story from the moot court final?", whispers: 5 },
    { name: "Tariq", major: "Medicine", teaser: "Anatomy lab at 8am — how are you still smiling?", whispers: 2 },
  ],
  PSUT: [
    { name: "Sara", major: "Software Eng.", teaser: "Circuits II lab — someone two rows away is obsessed", whispers: 7 },
    { name: "Hamza", major: "Cybersecurity", teaser: "Rumor says you broke the CTF leaderboard record", whispers: 11 },
    { name: "Nour", major: "Business Info Systems", teaser: "Which café by campus has the best wifi, actually?", whispers: 3 },
    { name: "Ali", major: "Mechatronics", teaser: "The robotics demo almost caught fire — true?", whispers: 5 },
  ],
  GJU: [
    { name: "Maya", major: "Applied Design", teaser: "Health Club or cafeteria — pick a side", whispers: 4 },
    { name: "Karim", major: "Nutrition & Diet.", teaser: "Dorm week 6 chaos — what actually happened?", whispers: 8 },
    { name: "Lina", major: "Hotel Management", teaser: "Is the German double-degree exchange worth it?", whispers: 2 },
  ],
  JUST: [
    { name: "Farah", major: "Dentistry", teaser: "Dr. Rania's section — you really finished top 3?", whispers: 6 },
    { name: "Anas", major: "Civil Eng.", teaser: "Group project — did your team actually carry you?", whispers: 3 },
    { name: "Rawan", major: "Nursing", teaser: "Night shift clinicals and still acing exams — how?", whispers: 5 },
  ],
};

const AVATAR_PALETTE = ["#D6698C", "#3E7CB1", "#E0A458", "#6C5CE0", "#4FA98A", "#C25B4A"];

// ---------------------------------------------------------------------
// SPLASH
// ---------------------------------------------------------------------
function Splash({ visible }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-700 ease-out ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ backgroundColor: THEME.neutral.bg }}
    >
      <div className="relative flex items-center justify-center mb-8">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute rounded-full border"
            style={{
              borderColor: THEME.neutral.accent,
              opacity: 0.35 - i * 0.1,
              width: `${88 + i * 46}px`,
              height: `${88 + i * 46}px`,
              animation: `whisperPulse 2.6s ease-in-out ${i * 0.3}s infinite`,
            }}
          />
        ))}
        <div
          className="relative flex items-center justify-center w-16 h-16 rounded-full"
          style={{ backgroundColor: THEME.neutral.accent }}
        >
          <MessageCircleHeart className="w-7 h-7 text-white" strokeWidth={1.8} />
        </div>
      </div>
      <h1
        className="text-4xl tracking-tight mb-2"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: THEME.neutral.ink }}
      >
        Hams
      </h1>
      <p className="text-sm tracking-wide uppercase" style={{ color: THEME.neutral.accent, letterSpacing: "0.2em" }}>
        say it without saying it
      </p>
      <style>{`
        @keyframes whisperPulse {
          0% { transform: scale(0.85); opacity: 0.35; }
          70% { transform: scale(1.15); opacity: 0; }
          100% { transform: scale(1.15); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------
// ONBOARDING
// ---------------------------------------------------------------------
function Onboarding({ form, setForm, theme, onSubmit }) {
  const canSubmit = form.name && form.gender && form.university && form.major;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div
            className="inline-flex items-center justify-center w-11 h-11 rounded-full mb-4 transition-colors duration-700"
            style={{ backgroundColor: theme.accent }}
          >
            <Sparkles className="w-5 h-5 text-white" strokeWidth={1.8} />
          </div>
          <h2
            className="text-3xl mb-1 transition-colors duration-700"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: theme.ink }}
          >
            You're almost in.
          </h2>
          <p className="text-sm opacity-70" style={{ color: theme.ink }}>
            Tell us who you are on campus.
          </p>
        </div>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-xs uppercase tracking-widest mb-2 opacity-60" style={{ color: theme.ink }}>
              First name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Leen"
              className="w-full px-4 py-3 rounded-xl border-0 outline-none text-base transition-shadow"
              style={{ backgroundColor: "white", color: theme.ink, boxShadow: `0 0 0 1.5px ${theme.accentSoft}` }}
            />
          </div>

          {/* Gender -> drives theme */}
          <div>
            <label className="block text-xs uppercase tracking-widest mb-2 opacity-60" style={{ color: theme.ink }}>
              You are
            </label>
            <div className="grid grid-cols-2 gap-3">
              {["female", "male"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm({ ...form, gender: g })}
                  className="py-3 rounded-xl text-sm font-medium capitalize transition-all duration-300 border-2"
                  style={{
                    borderColor: form.gender === g ? theme.accent : "transparent",
                    backgroundColor: "white",
                    color: theme.ink,
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* University */}
          <div>
            <label className="block text-xs uppercase tracking-widest mb-2 opacity-60" style={{ color: theme.ink }}>
              University
            </label>
            <div className="grid grid-cols-2 gap-3">
              {UNIVERSITIES.map((u) => (
                <button
                  key={u.code}
                  type="button"
                  onClick={() => setForm({ ...form, university: u.code })}
                  className="py-3 rounded-xl text-sm font-medium transition-all duration-300 border-2"
                  style={{
                    borderColor: form.university === u.code ? theme.accent : "transparent",
                    backgroundColor: "white",
                    color: theme.ink,
                  }}
                >
                  {u.code}
                </button>
              ))}
            </div>
          </div>

          {/* Major */}
          <div>
            <label className="block text-xs uppercase tracking-widest mb-2 opacity-60" style={{ color: theme.ink }}>
              Major
            </label>
            <input
              value={form.major}
              onChange={(e) => setForm({ ...form, major: e.target.value })}
              placeholder="e.g. Software Engineering"
              className="w-full px-4 py-3 rounded-xl border-0 outline-none text-base"
              style={{ backgroundColor: "white", color: theme.ink, boxShadow: `0 0 0 1.5px ${theme.accentSoft}` }}
            />
          </div>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={onSubmit}
            className="w-full py-3.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40"
            style={{ backgroundColor: theme.accent }}
          >
            Enter Hams <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// DISCOVERY GRID (DASHBOARD)
// ---------------------------------------------------------------------
function ProfileCard({ profile, index, theme }) {
  const color = AVATAR_PALETTE[index % AVATAR_PALETTE.length];
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0"
          style={{ backgroundColor: color }}
        >
          {profile.name[0]}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: theme.ink }}>{profile.name}</p>
          <p className="text-xs opacity-60 truncate" style={{ color: theme.ink }}>{profile.major}</p>
        </div>
      </div>
      <p className="text-sm italic leading-snug mb-3" style={{ color: theme.ink, opacity: 0.85 }}>
        "{profile.teaser}"
      </p>
      <div
        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
        style={{ backgroundColor: theme.accentSoft, color: theme.accent }}
      >
        {profile.whispers} new whispers
      </div>
    </div>
  );
}

function ShareCard({ theme }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    const link = "hams.app/u/your-link";
    if (navigator.clipboard) navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div
      className="rounded-2xl p-5 flex items-center justify-between gap-4 text-white"
      style={{ backgroundColor: theme.ink }}
    >
      <div>
        <p className="text-sm font-medium mb-1">Get your first whispers</p>
        <p className="text-xs opacity-70">Drop your link on your Instagram story.</p>
      </div>
      <button
        onClick={handleCopy}
        className="shrink-0 flex items-center gap-2 bg-white rounded-full px-4 py-2 text-xs font-medium transition-transform active:scale-95"
        style={{ color: theme.ink }}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Instagram className="w-3.5 h-3.5" />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}

function Dashboard({ form, theme }) {
  const uni = UNIVERSITIES.find((u) => u.code === form.university);
  const profiles = MOCK_PROFILES[form.university] || [];

  return (
    <div className="min-h-screen px-5 py-10 sm:px-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-4 h-4" style={{ color: theme.accent }} />
          <p className="text-xs uppercase tracking-widest opacity-60" style={{ color: theme.ink }}>
            {uni?.name} · {uni?.count.toLocaleString()} students on Hams
          </p>
        </div>
        <h2
          className="text-3xl mb-8"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: theme.ink }}
        >
          Welcome, {form.name}.
        </h2>

        <div className="mb-6">
          <ShareCard theme={theme} />
        </div>

        <p className="text-xs uppercase tracking-widest opacity-50 mb-3" style={{ color: theme.ink }}>
          Happening on your campus
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p, i) => (
            <ProfileCard key={p.name} profile={p} index={i} theme={theme} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// ROOT
// ---------------------------------------------------------------------
export default function HamsApp() {
  const [phase, setPhase] = useState("splash"); // splash -> onboarding -> dashboard
  const [splashVisible, setSplashVisible] = useState(true);
  const [form, setForm] = useState({ name: "", gender: "", university: "", major: "" });

  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashVisible(false), 2000);
    const switchTimer = setTimeout(() => setPhase("onboarding"), 2700);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(switchTimer);
    };
  }, []);

  const theme = form.gender === "female" ? THEME.female : form.gender === "male" ? THEME.male : THEME.neutral;

  return (
    <div
      className="min-h-screen w-full transition-colors duration-700 ease-in-out"
      style={{ backgroundColor: theme.bg }}
    >
      {phase === "splash" && <Splash visible={splashVisible} />}
      {phase === "onboarding" && (
        <Onboarding form={form} setForm={setForm} theme={theme} onSubmit={() => setPhase("dashboard")} />
      )}
      {phase === "dashboard" && <Dashboard form={form} theme={theme} />}
    </div>
  );
}

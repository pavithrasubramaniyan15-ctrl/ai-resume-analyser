"use client";
import { useResumeStore } from "@/store/useResumeStore";
import { motion } from "framer-motion";
import { Brain, Target, Zap, BarChart3, MessageSquare, User, Mail, Phone, Briefcase, GraduationCap, Code, TrendingUp, ArrowUpRight, ChevronRight } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { scoreToColor, scoreToLabel, cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = 45;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreToColor(score);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={color}
        strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dasharray 1s ease" }}
      />
      <text x="50" y="50" textAnchor="middle" dy="0.35em" fill={color} fontSize="20" fontWeight="bold">{score}</text>
      <text x="50" y="65" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8">/ 100</text>
    </svg>
  );
}

export default function DashboardPage() {
  const { resumeData, atsResult, jobMatches } = useResumeStore();
  const router = useRouter();

  if (!resumeData || !atsResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass rounded-3xl p-16 border border-white/8 max-w-md">
          <Brain className="w-16 h-16 text-[#8b5cf6] mx-auto mb-6 opacity-50" />
          <h2 className="text-2xl font-bold mb-3">No Resume Analyzed</h2>
          <p className="text-white/40 mb-8">Upload your resume to see your personalized dashboard.</p>
          <button onClick={() => router.push("/analyze")}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] text-white font-semibold">
            Analyze Resume
          </button>
        </div>
      </div>
    );
  }

  const radarData = [
    { subject: "Keywords", A: atsResult.keyword_score },
    { subject: "Semantic", A: atsResult.semantic_score },
    { subject: "Format", A: atsResult.format_score },
    { subject: "Experience", A: atsResult.experience_score },
    { subject: "Overall", A: atsResult.overall_score },
  ];

  const skillsData = resumeData.skills.slice(0, 8).map((s, i) => ({
    skill: s, strength: 60 + Math.floor(Math.random() * 40),
  }));

  return (
    <div className="min-h-screen pb-16">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">ResumeIQ <span className="gradient-text">AI</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/jobs" className="px-4 py-2 rounded-lg glass border border-white/8 text-sm text-white/60 hover:text-white transition-colors">Job Matches</Link>
            <Link href="/chat" className="px-4 py-2 rounded-lg glass border border-white/8 text-sm text-white/60 hover:text-white transition-colors">AI Coach</Link>
            <button onClick={() => router.push("/analyze")} className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] text-white text-sm font-medium">
              New Analysis
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-28">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-1">
                Welcome back, <span className="gradient-text">{resumeData.name.split(" ")[0]}</span>
              </h1>
              <p className="text-white/40">Here's your AI-powered resume analysis</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${atsResult.ats_friendly ? "bg-green-500/15 text-green-400 border border-green-500/20" : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"}`}>
              {atsResult.ats_friendly ? "✓ ATS Friendly" : "⚠ ATS Issues Detected"}
            </div>
          </div>
        </motion.div>

        {/* Score Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Overall ATS", value: atsResult.overall_score, icon: Target, color: "text-[#00d4ff]" },
            { label: "Semantic Match", value: atsResult.semantic_score, icon: Brain, color: "text-[#8b5cf6]" },
            { label: "Keyword Score", value: atsResult.keyword_score, icon: Zap, color: "text-[#ec4899]" },
            { label: "Job Matches", value: jobMatches.length, icon: BarChart3, color: "text-green-400", suffix: "" },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 border border-white/5"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/50 text-sm">{card.label}</span>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className={`text-4xl font-black ${card.color}`}>
                {card.value}{card.suffix !== undefined ? card.suffix : "%"}
              </div>
              <div className="mt-2 text-xs text-white/30">{card.label !== "Job Matches" ? scoreToLabel(card.value as number) : "positions found"}</div>
            </motion.div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Profile + Skills */}
          <div className="space-y-6">
            {/* Profile */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6 border border-white/5">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-5">Profile</h3>
              <div className="space-y-4">
                {[
                  { icon: User, label: resumeData.name },
                  { icon: Mail, label: resumeData.email },
                  { icon: Phone, label: resumeData.phone },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg glass-strong flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-white/40" />
                    </div>
                    <span className="text-sm text-white/70 truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Skills */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 border border-white/5">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-5">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 rounded-full glass-strong border border-white/10 text-xs text-white/70">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Center: Radar + Missing Skills */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Score Breakdown</h3>
                <ScoreRing score={atsResult.overall_score} size={80} />
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                  <Radar name="Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 border border-white/5">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Missing Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {atsResult.missing_keywords.map((kw) => (
                  <span key={kw} className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs text-red-400">{kw}</span>
                ))}
                {atsResult.missing_keywords.length === 0 && <p className="text-white/30 text-sm">All key terms matched!</p>}
              </div>
            </motion.div>
          </div>

          {/* Right: Experience + Suggestions */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-6 border border-white/5">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-5">Experience</h3>
              <div className="space-y-4">
                {resumeData.experience.slice(0, 3).map((exp, i) => (
                  <div key={i} className="relative pl-4 border-l border-white/10">
                    <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-[#8b5cf6]" style={{ boxShadow: "0 0 8px #8b5cf6" }} />
                    <p className="text-sm font-semibold">{exp.title}</p>
                    <p className="text-xs text-white/40">{exp.company} · {exp.start_date} – {exp.end_date}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 border border-white/5">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">AI Suggestions</h3>
              <div className="space-y-3">
                {atsResult.suggestions.slice(0, 4).map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#00d4ff]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <TrendingUp className="w-3 h-3 text-[#00d4ff]" />
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
              <Link href="/chat" className="mt-5 flex items-center gap-2 text-[#8b5cf6] text-sm hover:text-[#a78bfa] transition-colors">
                <MessageSquare className="w-4 h-4" /> Ask AI Coach for more <ArrowUpRight className="w-3 h-3 ml-auto" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Skills Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 glass rounded-2xl p-6 border border-white/5">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-6">Skill Strength Analysis</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={skillsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="skill" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "rgba(10,10,10,0.9)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "12px", color: "#fff" }} />
              <Bar dataKey="strength" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, FileText, Target, Zap, BarChart3, MessageSquare, ArrowRight, Sparkles, Shield, TrendingUp } from "lucide-react";
import Link from "next/link";

const features = [
  { icon: FileText, title: "Smart Resume Parser", desc: "Extract skills, experience, education and projects with AI precision", color: "text-[#00d4ff]" },
  { icon: Target, title: "ATS Score Engine", desc: "Multi-dimensional scoring: semantic similarity, keyword match, format analysis", color: "text-[#8b5cf6]" },
  { icon: Zap, title: "AI Bullet Rewriter", desc: "Transform weak bullets into compelling, quantified achievements instantly", color: "text-[#ec4899]" },
  { icon: Brain, title: "RAG Resume Advisor", desc: "LangChain-powered retrieval augmented generation for contextual advice", color: "text-[#00d4ff]" },
  { icon: BarChart3, title: "Job Matcher", desc: "FAISS vector search + BERT embeddings for semantic job matching", color: "text-[#8b5cf6]" },
  { icon: MessageSquare, title: "AI Career Coach", desc: "Real-time AI chatbot trained on your resume for personalized guidance", color: "text-[#ec4899]" },
];

const stats = [
  { label: "Resumes Analyzed", value: "12,847" },
  { label: "ATS Match Rate", value: "94%" },
  { label: "Jobs Matched", value: "230K+" },
  { label: "Avg Score Boost", value: "+38pts" },
];

export default function HomePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">ResumeIQ <span className="gradient-text">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <Link href="/analyze" className="hover:text-white transition-colors">Analyze</Link>
            <Link href="/jobs" className="hover:text-white transition-colors">Jobs</Link>
            <Link href="/chat" className="hover:text-white transition-colors">AI Coach</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
          <button
            onClick={() => router.push("/analyze")}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-32 px-6 text-center overflow-hidden">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[#00d4ff]/20 text-[#00d4ff] text-sm mb-8">
          <Sparkles className="w-4 h-4" />
          <span>Powered by BERT · Sentence Transformers · FAISS · LangChain</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-none">
          Your Resume,<br />
          <span className="gradient-text">Supercharged</span><br />
          by AI
        </h1>
        <p className="text-white/50 text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          Upload your resume and get instant ATS scoring, semantic job matching,
          AI-powered rewrites, and personalized career coaching — all in seconds.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => router.push("/analyze")}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] text-white font-semibold text-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            Analyze My Resume <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-8 py-4 rounded-xl glass border border-white/10 text-white font-semibold text-lg hover:border-white/20 transition-colors"
          >
            View Dashboard
          </button>
        </div>

        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-[#8b5cf6]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-[#00d4ff]/10 blur-3xl pointer-events-none" />
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-black gradient-text mb-1">{s.value}</div>
              <div className="text-white/40 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black tracking-tight mb-4">
              Everything you need to<br /><span className="gradient-text">land your dream job</span>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Six AI-powered modules working together to transform your career documents
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <motion.div
                key={f.title}
                whileHover={{ y: -4, scale: 1.01 }}
                className="glass rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl glass-strong flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto glass rounded-3xl p-16 border border-white/10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-[#00d4ff]" />
            <span className="text-white/50 text-sm">Free · No signup required · Instant results</span>
          </div>
          <h2 className="text-5xl font-black tracking-tight mb-4">Ready to get <span className="gradient-text">hired faster?</span></h2>
          <p className="text-white/40 text-lg mb-10">Upload your resume now and get your AI-powered score in under 30 seconds.</p>
          <button
            onClick={() => router.push("/analyze")}
            className="px-10 py-5 rounded-xl bg-gradient-to-r from-[#00d4ff] via-[#8b5cf6] to-[#ec4899] text-white font-bold text-xl flex items-center gap-3 mx-auto hover:opacity-90 transition-opacity"
          >
            <TrendingUp className="w-6 h-6" />
            Start Analyzing Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-white/30 text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-[#8b5cf6]" />
          <span className="font-semibold text-white/50">ResumeIQ AI</span>
        </div>
        <p>Built with BERT · Sentence Transformers · FAISS · LangChain · FastAPI · Next.js 14</p>
      </footer>
    </div>
  );
}

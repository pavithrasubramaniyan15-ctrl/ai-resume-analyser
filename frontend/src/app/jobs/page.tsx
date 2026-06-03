"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Briefcase, MapPin, DollarSign, Star, ExternalLink, ChevronRight, Filter, Search } from "lucide-react";
import { useResumeStore, JobMatch } from "@/store/useResumeStore";
import { jobsAPI } from "@/lib/api";
import { scoreToColor } from "@/lib/utils";
import Link from "next/link";

export default function JobsPage() {
  const { jobMatches, resumeData, setJobMatches } = useResumeStore();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resumeData && jobMatches.length === 0) {
      setLoading(true);
      jobsAPI.match(resumeData.id).then((res) => {
        setJobMatches(res.data.matches || []);
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [resumeData]);

  const filtered = jobMatches.filter((j) => {
    const matchesSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || (filter === "high" && j.match_score >= 80) || (filter === "remote" && j.location.toLowerCase().includes("remote"));
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen pb-16">
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 h-16 flex items-center px-6">
        <div className="max-w-6xl mx-auto w-full flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">ResumeIQ <span className="gradient-text">AI</span></span>
          </Link>
          <ChevronRight className="w-4 h-4 text-white/30" />
          <span className="text-white/50 text-sm">Job Matches</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-28">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-black tracking-tight mb-2">
            Smart <span className="gradient-text">Job Matches</span>
          </h1>
          <p className="text-white/40">BERT embeddings + FAISS vector search — ranked by semantic similarity to your resume</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex-1 min-w-64 flex items-center gap-3 glass rounded-xl px-4 py-3 border border-white/8">
            <Search className="w-4 h-4 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..." className="bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none flex-1" />
          </div>
          <div className="flex gap-2">
            {["all", "high", "remote"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${filter === f ? "bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] text-white" : "glass border border-white/8 text-white/50 hover:text-white"}`}>
                {f === "high" ? "High Match" : f}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl p-6 border border-white/5 animate-pulse">
                <div className="h-4 bg-white/5 rounded mb-3 w-3/4" />
                <div className="h-3 bg-white/5 rounded mb-6 w-1/2" />
                <div className="h-16 bg-white/5 rounded mb-4" />
                <div className="h-8 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 glass rounded-3xl border border-white/5">
            <Briefcase className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/50 mb-2">No matches found</h3>
            <p className="text-white/30 text-sm">
              {resumeData ? "Try adjusting filters" : "Analyze your resume first to get job matches"}
            </p>
            {!resumeData && (
              <Link href="/analyze" className="inline-block mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] text-white text-sm font-medium">
                Analyze Resume
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((job, i) => (
              <JobCard key={job.id} job={job} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function JobCard({ job, index }: { job: JobMatch; index: number }) {
  const color = scoreToColor(job.match_score);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all flex flex-col"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base mb-1 truncate">{job.title}</h3>
          <p className="text-white/50 text-sm truncate">{job.company}</p>
        </div>
        <div className="ml-3 text-right flex-shrink-0">
          <div className="text-2xl font-black" style={{ color }}>{job.match_score}%</div>
          <div className="text-xs text-white/30">match</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-white/40 mb-4">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
        {job.salary_range && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{job.salary_range}</span>}
        <span className="px-2 py-0.5 rounded-full bg-white/5">{job.job_type}</span>
      </div>

      <p className="text-xs text-white/40 leading-relaxed mb-4 flex-1">{job.description_snippet}</p>

      <div className="mb-4">
        <p className="text-xs text-white/30 mb-2 uppercase tracking-wide">Matching skills</p>
        <div className="flex flex-wrap gap-1.5">
          {job.matched_skills.slice(0, 4).map((s) => (
            <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 border border-green-500/20 text-green-400">{s}</span>
          ))}
          {job.matched_skills.length > 4 && <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-white/30">+{job.matched_skills.length - 4}</span>}
        </div>
      </div>

      {job.missing_skills.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-white/30 mb-2 uppercase tracking-wide">Missing skills</p>
          <div className="flex flex-wrap gap-1.5">
            {job.missing_skills.slice(0, 3).map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-red-500/10 border border-red-500/20 text-red-400">{s}</span>
            ))}
          </div>
        </div>
      )}

      {job.apply_url && (
        <a href={job.apply_url} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl glass border border-white/10 text-sm text-white/60 hover:text-white hover:border-[#8b5cf6]/30 transition-all mt-auto">
          Apply Now <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </motion.div>
  );
}

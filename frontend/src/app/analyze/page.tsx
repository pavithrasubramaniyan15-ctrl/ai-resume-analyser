"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Upload, FileText, Brain, Zap, Target, CheckCircle,
  AlertCircle, X, ChevronRight, Loader2, Sparkles
} from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import { resumeAPI } from "@/lib/api";
import { formatBytes } from "@/lib/utils";
import Link from "next/link";

const STEPS = [
  { label: "Parsing PDF", icon: FileText, color: "#00d4ff" },
  { label: "Extracting entities", icon: Brain, color: "#8b5cf6" },
  { label: "Running NLP analysis", icon: Zap, color: "#ec4899" },
  { label: "Calculating ATS score", icon: Target, color: "#00d4ff" },
  { label: "Generating embeddings", icon: Sparkles, color: "#8b5cf6" },
  { label: "Matching jobs", icon: CheckCircle, color: "#22c55e" },
];

export default function AnalyzePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [step, setStep] = useState<"upload" | "analyzing" | "done">("upload");
  const [currentStep, setCurrentStep] = useState(0);
  const { setResumeData, setATSResult, setJobMatches } = useResumeStore();

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "application/msword": [".doc"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  async function handleAnalyze() {
    if (!file) return;
    setStep("analyzing");

    // Simulate step-by-step progress
    for (let i = 0; i < STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, 900 + Math.random() * 400));
    }

    try {
      const res = await resumeAPI.upload(file, jobDescription);
      const data = res.data;
      setResumeData(data.resume);
      setATSResult(data.ats_result);
      setJobMatches(data.job_matches || []);
      setStep("done");
      toast.success("Analysis complete!", { description: `ATS Score: ${data.ats_result?.overall_score}%` });
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (e: any) {
      toast.error("Analysis failed", { description: e.message });
      setStep("upload");
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">ResumeIQ <span className="gradient-text">AI</span></span>
          </Link>
          <ChevronRight className="w-4 h-4 text-white/30" />
          <span className="text-white/50 text-sm">Analyze Resume</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            Analyze Your <span className="gradient-text">Resume</span>
          </h1>
          <p className="text-white/40 mb-10">Upload your resume to get instant AI-powered insights, ATS scoring, and job matches.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`relative rounded-2xl border-2 border-dashed p-16 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive ? "border-[#00d4ff] bg-[#00d4ff]/5 neon-glow-blue" : "border-white/10 hover:border-white/20 glass"
                }`}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-2xl glass-strong flex items-center justify-center mx-auto">
                      <FileText className="w-8 h-8 text-[#00d4ff]" />
                    </div>
                    <p className="font-semibold text-lg">{file.name}</p>
                    <p className="text-white/40 text-sm">{formatBytes(file.size)}</p>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="inline-flex items-center gap-1 text-white/40 hover:text-white/70 text-sm transition-colors">
                      <X className="w-4 h-4" /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <motion.div animate={{ y: isDragActive ? -8 : 0 }} className="w-20 h-20 rounded-2xl glass-strong border border-[#00d4ff]/20 flex items-center justify-center mx-auto">
                      <Upload className="w-10 h-10 text-[#00d4ff]" />
                    </motion.div>
                    <div>
                      <p className="text-xl font-semibold mb-1">
                        {isDragActive ? "Drop your resume here" : "Drag & drop your resume"}
                      </p>
                      <p className="text-white/40">or <span className="text-[#00d4ff] hover:underline">browse files</span></p>
                    </div>
                    <p className="text-white/25 text-sm">PDF, DOC, DOCX — max 10MB</p>
                  </div>
                )}
              </div>

              {/* Job Description */}
              <div className="glass rounded-2xl p-6 border border-white/5">
                <label className="block text-sm font-medium mb-3 text-white/70">
                  Job Description <span className="text-white/30">(optional — improves ATS accuracy)</span>
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                  placeholder="Paste the job description here to get a targeted ATS score and see exactly which skills you're missing..."
                  className="w-full bg-transparent text-sm text-white/80 placeholder:text-white/20 resize-none focus:outline-none leading-relaxed"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0,212,255,0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnalyze}
                disabled={!file}
                className="w-full py-5 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] text-white font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <Brain className="w-6 h-6" />
                Analyze with AI
              </motion.button>
            </motion.div>
          )}

          {step === "analyzing" && (
            <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-12 border border-white/8 text-center scan-overlay">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#00d4ff]/20 to-[#8b5cf6]/20 flex items-center justify-center mx-auto mb-8">
                <Brain className="w-12 h-12 text-[#8b5cf6] animate-pulse" />
              </div>
              <h2 className="text-3xl font-black mb-2">Analyzing Your Resume</h2>
              <p className="text-white/40 mb-10">Running AI pipeline — this takes about 30 seconds</p>

              <div className="space-y-4 text-left max-w-sm mx-auto mb-10">
                {STEPS.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: i <= currentStep ? 1 : 0.2, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${i < currentStep ? "bg-green-500/20" : i === currentStep ? "bg-white/10" : "bg-white/5"}`}>
                      {i < currentStep ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : i === currentStep ? (
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: s.color }} />
                      ) : (
                        <s.icon className="w-4 h-4 text-white/20" />
                      )}
                    </div>
                    <span className={`text-sm ${i <= currentStep ? "text-white/80" : "text-white/20"}`}>{s.label}</span>
                  </motion.div>
                ))}
              </div>

              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6]"
                  animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-12 border border-green-500/20 text-center">
              <div className="w-24 h-24 rounded-3xl bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              <h2 className="text-3xl font-black mb-2 text-green-400">Analysis Complete!</h2>
              <p className="text-white/40">Redirecting to your dashboard...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

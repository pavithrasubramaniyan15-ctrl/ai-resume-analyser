import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ResumeData {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  summary?: string;
  linkedIn?: string;
  github?: string;
}

export interface ExperienceItem {
  company: string;
  title: string;
  start_date: string;
  end_date: string;
  bullets: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  field: string;
  graduation_year: string;
  gpa?: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface ATSResult {
  overall_score: number;
  semantic_score: number;
  keyword_score: number;
  format_score: number;
  experience_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  suggestions: string[];
  ats_friendly: boolean;
}

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  description_snippet: string;
  apply_url?: string;
  salary_range?: string;
  job_type: string;
}

export interface AnalysisState {
  resumeData: ResumeData | null;
  atsResult: ATSResult | null;
  jobMatches: JobMatch[];
  isAnalyzing: boolean;
  analysisProgress: number;
  analysisStep: string;
  jobDescription: string;
  conversationId: string | null;
  chatMessages: ChatMessage[];
  error: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ResumeStore extends AnalysisState {
  setResumeData: (data: ResumeData) => void;
  setATSResult: (result: ATSResult) => void;
  setJobMatches: (matches: JobMatch[]) => void;
  setIsAnalyzing: (v: boolean) => void;
  setAnalysisProgress: (progress: number, step: string) => void;
  setJobDescription: (jd: string) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setConversationId: (id: string) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

const initialState: AnalysisState = {
  resumeData: null,
  atsResult: null,
  jobMatches: [],
  isAnalyzing: false,
  analysisProgress: 0,
  analysisStep: "",
  jobDescription: "",
  conversationId: null,
  chatMessages: [],
  error: null,
};

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      ...initialState,
      setResumeData: (data) => set({ resumeData: data }),
      setATSResult: (result) => set({ atsResult: result }),
      setJobMatches: (matches) => set({ jobMatches: matches }),
      setIsAnalyzing: (v) => set({ isAnalyzing: v }),
      setAnalysisProgress: (progress, step) =>
        set({ analysisProgress: progress, analysisStep: step }),
      setJobDescription: (jd) => set({ jobDescription: jd }),
      addChatMessage: (msg) =>
        set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
      setConversationId: (id) => set({ conversationId: id }),
      setError: (e) => set({ error: e }),
      reset: () => set(initialState),
    }),
    {
      name: "resumeiq-store",
      partialize: (state) => ({
        resumeData: state.resumeData,
        atsResult: state.atsResult,
        jobMatches: state.jobMatches,
        conversationId: state.conversationId,
        chatMessages: state.chatMessages,
      }),
    }
  )
);

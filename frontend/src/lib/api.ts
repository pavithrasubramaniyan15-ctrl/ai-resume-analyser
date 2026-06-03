import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
});

api.interceptors.request.use((config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const msg = error.response?.data?.detail || error.message || "Request failed";
    console.error("[API Error]", msg);
    return Promise.reject(new Error(msg));
  }
);

// Resume endpoints
export const resumeAPI = {
  upload: (file: File, jobDescription?: string) => {
    const form = new FormData();
    form.append("file", file);
    if (jobDescription) form.append("job_description", jobDescription);
    return api.post("/resume/analyze", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getAnalysis: (id: string) => api.get(`/resume/analysis/${id}`),
  rewriteBullet: (bullet: string, role: string) =>
    api.post("/resume/rewrite-bullet", { bullet, role }),
  optimizeResume: (resumeId: string, jobDescription: string) =>
    api.post("/resume/optimize", { resume_id: resumeId, job_description: jobDescription }),
};

// Jobs endpoints
export const jobsAPI = {
  match: (resumeId: string) => api.get(`/jobs/match/${resumeId}`),
  search: (query: string) => api.get(`/jobs/search?q=${encodeURIComponent(query)}`),
};

// Chat endpoints
export const chatAPI = {
  sendMessage: (message: string, resumeId?: string, conversationId?: string) =>
    api.post("/chat/message", { message, resume_id: resumeId, conversation_id: conversationId }),
  getHistory: (conversationId: string) => api.get(`/chat/history/${conversationId}`),
};

// Analytics endpoints
export const analyticsAPI = {
  getDashboard: () => api.get("/analytics/dashboard"),
  getSkillsGap: (resumeId: string) => api.get(`/analytics/skills-gap/${resumeId}`),
};

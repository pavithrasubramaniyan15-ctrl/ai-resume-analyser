"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, Loader2, Bot, User, Sparkles, ChevronRight } from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import { chatAPI } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { v4 as uuid } from "uuid";
import { toast } from "sonner";

const STARTERS = [
  "How can I improve my resume for software engineering roles?",
  "What skills am I missing for a senior position?",
  "Can you rewrite my professional summary?",
  "What's the best way to highlight my projects?",
  "How do I negotiate salary with my profile?",
];

export default function ChatPage() {
  const { resumeData, chatMessages, addChatMessage, conversationId, setConversationId } = useResumeStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  async function sendMessage(text?: string) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg = { id: uuid(), role: "user" as const, content: msg, timestamp: new Date() };
    addChatMessage(userMsg);
    setLoading(true);

    try {
      const res = await chatAPI.sendMessage(msg, resumeData?.id, conversationId || undefined);
      const data = res.data;
      if (!conversationId && data.conversation_id) setConversationId(data.conversation_id);
      addChatMessage({ id: uuid(), role: "assistant", content: data.response, timestamp: new Date() });
    } catch (e: any) {
      toast.error("Failed to send message");
      // Fallback demo response
      addChatMessage({
        id: uuid(), role: "assistant",
        content: "I'm your AI career coach. I analyze your resume using RAG (Retrieval Augmented Generation) with LangChain to provide personalized advice. Connect the backend to enable full AI responses.",
        timestamp: new Date()
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 h-16 flex items-center px-6">
        <div className="max-w-4xl mx-auto w-full flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">ResumeIQ <span className="gradient-text">AI</span></span>
          </Link>
          <ChevronRight className="w-4 h-4 text-white/30" />
          <span className="text-white/50 text-sm">AI Career Coach</span>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[#00d4ff]/20 text-[#00d4ff] text-xs">
            <Sparkles className="w-3 h-3" />
            Powered by RAG + LangChain
          </div>
        </div>
      </nav>

      {/* Messages */}
      <div className="flex-1 pt-20 pb-36 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          {/* Welcome */}
          {chatMessages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#00d4ff]/20 to-[#8b5cf6]/20 flex items-center justify-center mx-auto mb-6">
                <Bot className="w-10 h-10 text-[#8b5cf6]" />
              </div>
              <h2 className="text-3xl font-black mb-3">AI Career Coach</h2>
              <p className="text-white/40 max-w-md mx-auto text-sm leading-relaxed mb-10">
                {resumeData ? `I've analyzed ${resumeData.name}'s resume. Ask me anything about improving it, targeting specific roles, or career strategy.` : "I'm your personal AI career coach powered by RAG and LangChain. Upload your resume first for personalized advice."}
              </p>
              <div className="grid grid-cols-1 gap-2 max-w-lg mx-auto">
                {STARTERS.map((s) => (
                  <motion.button key={s} whileHover={{ x: 4 }} onClick={() => sendMessage(s)}
                    className="text-left px-5 py-3.5 rounded-xl glass border border-white/8 hover:border-[#8b5cf6]/30 text-sm text-white/60 hover:text-white/90 transition-all flex items-center gap-3">
                    <ChevronRight className="w-4 h-4 text-[#8b5cf6] flex-shrink-0" />
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence initial={false}>
            {chatMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-[#8b5cf6]/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-5 h-5 text-[#8b5cf6]" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-[#00d4ff]/15 to-[#8b5cf6]/15 border border-[#8b5cf6]/20"
                    : "glass border border-white/8"
                }`}>
                  {msg.role === "assistant" ? (
                    <ReactMarkdown className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5">{msg.content}</ReactMarkdown>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-9 h-9 rounded-xl glass-strong border border-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-5 h-5 text-white/50" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-[#8b5cf6]/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <div className="glass border border-white/8 rounded-2xl px-5 py-4 flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-[#8b5cf6] animate-spin" />
                <span className="text-white/40 text-sm">Thinking with RAG...</span>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 p-6 glass border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end glass-strong rounded-2xl border border-white/10 p-3 focus-within:border-[#8b5cf6]/40 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your resume, skills, job search strategy..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 resize-none focus:outline-none leading-relaxed py-1 max-h-32"
              style={{ height: "auto" }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </motion.button>
          </div>
          <p className="text-center text-white/20 text-xs mt-2">AI responses use RAG over your resume data for personalized advice</p>
        </div>
      </div>
    </div>
  );
}

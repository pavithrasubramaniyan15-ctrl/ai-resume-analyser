"use client";
import { useRouter } from "next/navigation";
import { Brain } from "lucide-react";
export default function NotFound() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <div className="glass rounded-3xl p-16 border border-white/8 max-w-md">
        <Brain className="w-16 h-16 text-[#8b5cf6] mx-auto mb-6 opacity-50" />
        <h1 className="text-6xl font-black gradient-text mb-4">404</h1>
        <p className="text-white/40 mb-8">This page doesn't exist yet.</p>
        <button onClick={() => router.push("/")} className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] text-white font-semibold">
          Go Home
        </button>
      </div>
    </div>
  );
}

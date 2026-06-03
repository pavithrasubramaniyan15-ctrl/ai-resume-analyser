import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ResumeIQ AI — Smart Resume Analyzer",
  description:
    "AI-powered resume analysis, ATS scoring, semantic job matching and career coaching platform.",
  keywords: ["resume", "AI", "ATS", "job matching", "career"],
  openGraph: {
    title: "ResumeIQ AI",
    description: "AI-powered resume analysis platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#0a0a0a] text-white antialiased`}>
        <div className="fixed inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "rgba(10,10,10,0.9)",
              border: "1px solid rgba(139,92,246,0.3)",
              color: "#fff",
              backdropFilter: "blur(20px)",
            },
          }}
        />
      </body>
    </html>
  );
}

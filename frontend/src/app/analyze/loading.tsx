export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] animate-pulse" />
        <p className="text-white/30 text-sm">Loading...</p>
      </div>
    </div>
  );
}

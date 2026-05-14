import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-5xl font-bold text-[#8b3a2a] mb-4" style={{ fontFamily: "'Cinzel', serif" }}>404</h1>
      <p className="text-xl text-[#3b2a1a] mb-2" style={{ fontFamily: "'Lora', serif" }}>The scroll could not be found</p>
      <p className="text-sm opacity-60 mb-8 italic" style={{ fontFamily: "'Lora', serif" }}>Perhaps it was lost to the ages...</p>
      <Link href="/" className="px-4 py-2 rounded border-2 border-[#8b3a2a] text-[#8b3a2a] hover:bg-[#8b3a2a] hover:text-[#f4e4c1] transition-colors" style={{ fontFamily: "'Lora', serif" }}>
        Return to the Archives
      </Link>
    </div>
  );
}
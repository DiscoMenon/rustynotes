'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { PenNib, Scroll, House, SquaresFour, List, X } from '@phosphor-icons/react';

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full border-b border-[#c9a96e] bg-[#e8d5a3] px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        <Scroll size={24} weight="fill" className="text-[#8b3a2a]" />
        <span className="text-xl font-bold text-[#3b2a1a]" style={{ fontFamily: "'Cinzel', serif" }}>
          RustyNotes
        </span>
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-6">
        <Link href="/" className="flex items-center gap-1 text-sm text-[#3b2a1a] hover:text-[#8b3a2a] transition-colors" style={{ fontFamily: "'Lora', serif" }}>
          <House size={16} /> Home
        </Link>
        {session && (
          <>
            <Link href="/editor" className="flex items-center gap-1 text-sm text-[#3b2a1a] hover:text-[#8b3a2a] transition-colors" style={{ fontFamily: "'Lora', serif" }}>
              <PenNib size={16} /> Write
            </Link>
            <Link href="/dashboard" className="flex items-center gap-1 text-sm text-[#3b2a1a] hover:text-[#8b3a2a] transition-colors" style={{ fontFamily: "'Lora', serif" }}>
              <SquaresFour size={16} /> Dashboard
            </Link>
            <Link href={`/profile/${session.user.id}`} className="flex items-center gap-2 text-sm text-[#3b2a1a] hover:text-[#8b3a2a] transition-colors" style={{ fontFamily: "'Lora', serif" }}>
              <div className="w-7 h-7 rounded-full bg-[#8b3a2a] flex items-center justify-center text-[#f4e4c1] text-xs font-bold">
                {session.user.name?.[0]?.toUpperCase() ?? 'S'}
              </div>
              {session.user.name}
            </Link>
            <button
              onClick={() => signOut()}
              className="px-3 py-1.5 text-xs rounded border border-[#8b3a2a] text-[#8b3a2a] hover:bg-[#8b3a2a] hover:text-[#f4e4c1] transition-colors"
              style={{ fontFamily: "'Lora', serif" }}
            >
              Sign Out
            </button>
          </>
        )}
        {!session && (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[#3b2a1a] hover:text-[#8b3a2a]" style={{ fontFamily: "'Lora', serif" }}>Login</Link>
            <Link href="/signup" className="px-3 py-1.5 text-xs rounded bg-[#8b3a2a] text-[#f4e4c1] hover:bg-[#3b2a1a] transition-colors" style={{ fontFamily: "'Lora', serif" }}>Sign Up</Link>
          </div>
        )}
      </div>

      {/* Mobile hamburger */}
      <button className="md:hidden text-[#3b2a1a]" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={24} /> : <List size={24} />}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#e8d5a3] border-b border-[#c9a96e] flex flex-col gap-4 px-6 py-4 md:hidden">
          <Link href="/" onClick={() => setMenuOpen(false)} className="text-sm text-[#3b2a1a]" style={{ fontFamily: "'Lora', serif" }}>Home</Link>
          {session && (
            <>
              <Link href="/editor" onClick={() => setMenuOpen(false)} className="text-sm text-[#3b2a1a]" style={{ fontFamily: "'Lora', serif" }}>Write</Link>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm text-[#3b2a1a]" style={{ fontFamily: "'Lora', serif" }}>Dashboard</Link>
              <Link href={`/profile/${session.user.id}`} onClick={() => setMenuOpen(false)} className="text-sm text-[#3b2a1a]" style={{ fontFamily: "'Lora', serif" }}>{session.user.name}</Link>
              <button onClick={() => signOut()} className="text-left text-sm text-[#8b3a2a]" style={{ fontFamily: "'Lora', serif" }}>Sign Out</button>
            </>
          )}
          {!session && (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm text-[#3b2a1a]" style={{ fontFamily: "'Lora', serif" }}>Login</Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="text-sm text-[#3b2a1a]" style={{ fontFamily: "'Lora', serif" }}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
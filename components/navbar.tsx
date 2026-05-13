"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { List, NotePencil, SignIn, UserCircle } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Button } from "@/components/ui";
import { cn } from "@/lib/cn";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/write", label: "Write" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoggedIn = Boolean(session?.user);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = useMemo(() => {
    const name = session?.user?.name?.trim();
    if (name) return name;
    const email = session?.user?.email?.trim();
    if (email) return email.split("@")[0] ?? "Rusty Scribe";
    return "Rusty Scribe";
  }, [session?.user?.email, session?.user?.name]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", onClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(59,42,26,0.18)] bg-[rgba(244,228,193,0.93)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="font-display text-xl tracking-[0.16em] text-foreground transition-colors hover:text-accent"
        >
          RustyNotes
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 font-display text-xs uppercase tracking-[0.18em] transition-colors",
                  active
                    ? "bg-[rgba(139,58,42,0.16)] text-accent"
                    : "text-foreground/85 hover:bg-[rgba(59,42,26,0.08)] hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {status === "loading" ? (
            <div className="h-10 w-32 animate-pulse rounded-full bg-[rgba(59,42,26,0.14)]" />
          ) : isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(59,42,26,0.2)] bg-[rgba(255,248,230,0.55)] px-2 py-1 transition hover:bg-[rgba(255,248,230,0.8)]"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
              >
                <Avatar
                  size="sm"
                  src={session?.user?.image}
                  fallback={displayName}
                  alt={session?.user?.name ?? "Profile"}
                />
              </button>

              {dropdownOpen ? (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-[rgba(59,42,26,0.2)] bg-[rgba(250,238,212,0.98)] p-2 shadow-[0_14px_26px_rgba(59,42,26,0.2)]"
                  role="menu"
                >
                  <div className="border-b border-[rgba(59,42,26,0.12)] px-2 pb-2 pt-1">
                    <p className="truncate font-display text-xs uppercase tracking-[0.18em] text-foreground/75">
                      Signed In As
                    </p>
                    <p className="truncate text-sm text-foreground">{session?.user?.email ?? displayName}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="mt-2 flex items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground hover:bg-[rgba(59,42,26,0.08)]"
                    role="menuitem"
                  >
                    <UserCircle size={18} />
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-[#7a2820] hover:bg-[rgba(122,40,32,0.08)]"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    role="menuitem"
                  >
                    <SignIn size={18} className="rotate-180" />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">
                  Signup
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-[rgba(59,42,26,0.22)] bg-[rgba(255,248,230,0.5)] p-2 text-foreground md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          <List size={20} weight="bold" />
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[rgba(59,42,26,0.18)] bg-[rgba(244,228,193,0.98)] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-2 font-display text-sm uppercase tracking-[0.16em]",
                    active
                      ? "bg-[rgba(139,58,42,0.16)] text-accent"
                      : "text-foreground/85 hover:bg-[rgba(59,42,26,0.08)]",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-[rgba(59,42,26,0.14)] pt-4">
            {status === "loading" ? (
              <div className="h-10 w-full animate-pulse rounded-md bg-[rgba(59,42,26,0.14)]" />
            ) : isLoggedIn ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-md bg-[rgba(255,248,230,0.6)] px-2 py-2">
                  <Avatar
                    size="sm"
                    src={session?.user?.image}
                    fallback={displayName}
                    alt={session?.user?.name ?? "Profile"}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{displayName}</p>
                    <p className="truncate text-xs text-foreground/70">{session?.user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full"
                  leftIcon={SignIn}
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" className="w-full">
                  <Button variant="ghost" size="sm" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/signup" className="w-full">
                  <Button variant="primary" size="sm" leftIcon={NotePencil} className="w-full">
                    Signup
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

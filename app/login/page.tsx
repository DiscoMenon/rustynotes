import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in · Rustynotes",
  description: "Sign in to Rustynotes",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-16">
      <div className="auth-card w-full max-w-[440px] px-8 py-10 sm:px-11 sm:py-12">
        <h1 className="font-display text-center text-2xl sm:text-[1.75rem] tracking-[0.06em] text-foreground mb-2">
          Sign in
        </h1>
        <p className="text-center text-[0.95rem] text-foreground/78 mb-9 font-serif leading-relaxed">
          Return to your ledger.
        </p>
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
        <p className="mt-10 text-center text-sm text-foreground/72 font-serif">
          No account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-accent underline underline-offset-[5px] decoration-accent/70 hover:opacity-90"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

function LoginFormFallback() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-16 rounded-lg bg-foreground/10" />
      <div className="h-16 rounded-lg bg-foreground/10" />
      <div className="h-12 rounded-full bg-accent/25 mx-auto max-w-[200px]" />
    </div>
  );
}

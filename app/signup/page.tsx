import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create account · Rustynotes",
  description: "Join Rustynotes",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-16">
      <div className="auth-card w-full max-w-[440px] px-8 py-10 sm:px-11 sm:py-12">
        <h1 className="font-display text-center text-2xl sm:text-[1.75rem] tracking-[0.06em] text-foreground mb-2">
          New folio
        </h1>
        <p className="text-center text-[0.95rem] text-foreground/78 mb-9 font-serif leading-relaxed">
          Open an account and leave your mark.
        </p>
        <SignupForm />
        <p className="mt-10 text-center text-sm text-foreground/72 font-serif">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-accent underline underline-offset-[5px] decoration-accent/70 hover:opacity-90"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

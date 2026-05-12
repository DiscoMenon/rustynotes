"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { validateEmail, validatePassword } from "@/lib/auth-validation";
import { AuthField } from "@/components/auth/auth-field";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const registered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    const next: typeof fieldErrors = {};
    if (emailErr) next.email = emailErr;
    if (passwordErr) next.password = passwordErr;
    setFieldErrors(next);

    if (emailErr || passwordErr) return;

    setSubmitting(true);
    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setFormError("Invalid email or password.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {registered ? (
        <p
          className="rounded-md border border-accent/35 bg-accent/10 px-3 py-2 text-center text-sm text-foreground font-serif"
          role="status"
        >
          Account created. You may sign in below.
        </p>
      ) : null}

      {formError ? (
        <p className="rounded-md border border-accent/40 bg-accent/12 px-3 py-2 text-center text-sm text-accent font-serif" role="alert">
          {formError}
        </p>
      ) : null}

      <AuthField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(v) => {
          setEmail(v);
          setFieldErrors((prev) => ({ ...prev, email: undefined }));
        }}
        error={fieldErrors.email}
        disabled={submitting}
      />

      <AuthField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(v) => {
          setPassword(v);
          setFieldErrors((prev) => ({ ...prev, password: undefined }));
        }}
        error={fieldErrors.password}
        disabled={submitting}
      />

      <div className="pt-2">
        <button type="submit" className="wax-seal" disabled={submitting}>
          {submitting ? "Sealing…" : "Sign in"}
        </button>
      </div>
    </form>
  );
}

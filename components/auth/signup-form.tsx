"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  validateEmail,
  validateName,
  validatePassword,
  type FieldErrors,
} from "@/lib/auth-validation";
import { AuthField } from "@/components/auth/auth-field";

function validateConfirm(password: string, confirm: string): string | null {
  if (!confirm) return "Confirm your password.";
  if (confirm !== password) return "Passwords do not match.";
  return null;
}

export function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const next: FieldErrors = {};
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmErr = validateConfirm(password, confirmPassword);

    if (nameErr) next.name = nameErr;
    if (emailErr) next.email = emailErr;
    if (passwordErr) next.password = passwordErr;
    if (confirmErr) next.confirmPassword = confirmErr;

    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = (await res.json()) as {
        errors?: FieldErrors;
        error?: string;
      };

      if (!res.ok) {
        if (data.errors && typeof data.errors === "object") {
          setFieldErrors(data.errors);
          return;
        }
        setFormError(data.error ?? "Could not create account.");
        return;
      }

      router.push("/login?registered=1");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const confirmErrId = "confirmPassword-error";

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {formError ? (
        <p className="rounded-md border border-accent/40 bg-accent/12 px-3 py-2 text-center text-sm text-accent font-serif" role="alert">
          {formError}
        </p>
      ) : null}

      <AuthField
        id="name"
        label="Name"
        type="text"
        autoComplete="name"
        value={name}
        onChange={(v) => {
          setName(v);
          setFieldErrors((prev) => ({ ...prev, name: undefined }));
        }}
        error={fieldErrors.name}
        disabled={submitting}
        placeholder="Your name"
      />

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
        autoComplete="new-password"
        value={password}
        onChange={(v) => {
          setPassword(v);
          setFieldErrors((prev) => ({ ...prev, password: undefined }));
        }}
        error={fieldErrors.password}
        disabled={submitting}
        placeholder="At least 8 characters"
      />

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="auth-field-label block">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
          }}
          disabled={submitting}
          aria-invalid={fieldErrors.confirmPassword ? true : undefined}
          aria-describedby={fieldErrors.confirmPassword ? confirmErrId : undefined}
          className={`parchment-input font-serif ${fieldErrors.confirmPassword ? "parchment-input-invalid" : ""}`}
        />
        {fieldErrors.confirmPassword ? (
          <p id={confirmErrId} className="text-sm text-accent font-serif" role="alert">
            {fieldErrors.confirmPassword}
          </p>
        ) : null}
      </div>

      <div className="pt-2">
        <button type="submit" className="wax-seal" disabled={submitting}>
          {submitting ? "Pressing seal…" : "Create account"}
        </button>
      </div>
    </form>
  );
}

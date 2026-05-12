const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FieldErrors = Partial<Record<string, string>>;

export function validateEmail(email: string): string | null {
  const t = email.trim().toLowerCase();
  if (!t) return "Email is required.";
  if (!EMAIL_RE.test(t)) return "Enter a valid email address.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password.length > 128) return "Password is too long.";
  return null;
}

export function validateName(name: string): string | null {
  const t = name.trim();
  if (!t) return "Name is required.";
  if (t.length > 80) return "Name must be 80 characters or fewer.";
  return null;
}

export function validateSignupPayload(body: {
  name?: unknown;
  email?: unknown;
  password?: unknown;
}): FieldErrors | null {
  const errors: FieldErrors = {};

  const nameErr = validateName(typeof body.name === "string" ? body.name : "");
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(typeof body.email === "string" ? body.email : "");
  if (emailErr) errors.email = emailErr;

  const passwordErr = validatePassword(typeof body.password === "string" ? body.password : "");
  if (passwordErr) errors.password = passwordErr;

  return Object.keys(errors).length ? errors : null;
}

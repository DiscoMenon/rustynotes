"use client";

type AuthFieldProps = {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
};

export function AuthField({
  id,
  label,
  type = "text",
  autoComplete,
  value,
  onChange,
  error,
  disabled,
  placeholder,
}: AuthFieldProps) {
  const errId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="auth-field-label block">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errId : undefined}
        className={`parchment-input font-serif ${error ? "parchment-input-invalid" : ""}`}
      />
      {error ? (
        <p id={errId} className="text-sm text-accent font-serif" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

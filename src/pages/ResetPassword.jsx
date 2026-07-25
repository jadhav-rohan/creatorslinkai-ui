import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useRateLimitCountdown } from "../hooks/useRateLimitCountdown";

const REQUIREMENTS = [
  ["length", "8 or more characters", (value) => value.length >= 8],
  ["maximum", "128 characters or fewer", (value) => value.length > 0 && value.length <= 128],
  ["uppercase", "One uppercase letter", (value) => /[A-Z]/.test(value)],
  ["lowercase", "One lowercase letter", (value) => /[a-z]/.test(value)],
  ["number", "One number", (value) => /\d/.test(value)],
  ["special", "One special character", (value) => /[^A-Za-z0-9]/.test(value)],
];

function portalPaths(value) {
  if (value === "creator")
    return {
      loginPath: "/creator/login",
      forgotPath: "/forgot-password?portal=creator",
    };
  if (value === "brand")
    return {
      loginPath: "/brand/login",
      forgotPath: "/forgot-password?portal=brand",
    };
  return { loginPath: "/login", forgotPath: "/forgot-password" };
}

function removeResetToken(portal) {
  const portalQuery =
    portal === "creator" || portal === "brand" ? `?portal=${portal}` : "";
  window.history.replaceState(
    {},
    "",
    `${window.location.pathname}${window.location.search}#/reset-password${portalQuery}`,
  );
}

function PasswordChecklist({ password }) {
  return (
    <div
      aria-label="Password requirements"
      aria-live="polite"
      className="mt-3 border-2 border-zinc-200 bg-zinc-50 p-3"
    >
      <p className="text-xs font-black uppercase tracking-wide text-zinc-600">
        Password requirements
      </p>
      <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {REQUIREMENTS.map(([key, label, check]) => {
          const met = check(password);
          return (
            <li
              key={key}
              className={`flex items-center gap-2 text-xs font-bold ${
                met ? "text-emerald-700" : "text-zinc-500"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                  met
                    ? "border-emerald-700 bg-emerald-100"
                    : "border-zinc-400"
                }`}
              >
                {met ? "✓" : ""}
              </span>
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  visible,
  onChange,
  onToggle,
  error,
}) {
  return (
    <label htmlFor={id} className="block font-bold">
      {label}
      <span className="relative mt-2 block">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          value={value}
          maxLength={128}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="brutal-field w-full pr-12"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          className="absolute inset-y-0 right-0 flex min-h-0 w-11 items-center justify-center"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
      {error && (
        <span
          id={`${id}-error`}
          role="alert"
          className="mt-1 block text-sm text-red-700"
        >
          {error}
        </span>
      )}
    </label>
  );
}

export default function ResetPassword() {
  const [params] = useSearchParams();
  const [resetToken] = useState(() => params.get("token") || "");
  const portal = params.get("portal")?.toLowerCase();
  const paths = portalPaths(portal);
  const { clearLocalAuthentication } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);
  const [errors, setErrors] = useState({});
  const requestInFlight = useRef(false);
  const { isRateLimited, secondsRemaining, startRateLimit } =
    useRateLimitCountdown();

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "referrer";
    meta.content = "no-referrer";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const passwordValid = useMemo(
    () => REQUIREMENTS.every(([, , check]) => check(password)),
    [password],
  );
  const matches = password === confirmPassword && Boolean(confirmPassword);

  async function submit(event) {
    event.preventDefault();
    if (
      !resetToken ||
      requestInFlight.current ||
      submitting ||
      isRateLimited
    )
      return;
    const nextErrors = {};
    if (!passwordValid)
      nextErrors.password =
        "Password must satisfy every password requirement.";
    if (!matches) nextErrors.confirmPassword = "Passwords do not match.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    requestInFlight.current = true;
    setSubmitting(true);
    setErrors({});
    try {
      await api.resetPassword(resetToken, password);
      clearLocalAuthentication();
      setPassword("");
      setConfirmPassword("");
      removeResetToken(portal);
      setSuccess(true);
    } catch (requestError) {
      if (requestError.status === 429) {
        startRateLimit(requestError.retryAfter);
        setErrors({
          form: "Too many attempts. Please wait before trying again.",
        });
      } else if (
        requestError.status === 400 &&
        (/token|expired/i.test(requestError.code || "") ||
          /token.*(invalid|expired)|(invalid|expired).*token/i.test(
            requestError.message || "",
          ))
      ) {
        removeResetToken(portal);
        setInvalidToken(true);
      } else if (requestError.status === 400) {
        setErrors({
          password:
            requestError.message ||
            "The new password does not meet the password requirements.",
        });
      } else {
        setErrors({
          form:
            requestError.status >= 500
              ? "The service is temporarily unavailable. Please try again."
              : requestError.message ||
                "We couldn’t reset your password. Please try again.",
        });
      }
    } finally {
      requestInFlight.current = false;
      setSubmitting(false);
    }
  }

  if (!resetToken)
    return (
      <main className="brutal-page flex min-h-screen items-center justify-center p-5 sm:p-8">
        <section className="brutal-card w-full max-w-md p-8 text-center">
          <h1 className="text-3xl font-black">
            This password reset link is invalid.
          </h1>
          <Link to={paths.forgotPath} className="brutal-button mt-7 inline-flex">
            Request a new link
          </Link>
        </section>
      </main>
    );

  if (success)
    return (
      <main className="brutal-page flex min-h-screen items-center justify-center p-5 sm:p-8">
        <section
          role="status"
          aria-live="polite"
          className="brutal-card w-full max-w-md p-8 text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center border-2 border-zinc-900 bg-emerald-200">
            <KeyRound size={23} />
          </div>
          <h1 className="mt-6 text-3xl font-black">
            Your password has been reset.
          </h1>
          <p className="mt-3 text-zinc-600">
            Sign in with your new password.
          </p>
          <Link to={paths.loginPath} className="brutal-button mt-7 inline-flex w-full">
            Sign in
          </Link>
        </section>
      </main>
    );

  if (invalidToken)
    return (
      <main className="brutal-page flex min-h-screen items-center justify-center p-5 sm:p-8">
        <section className="brutal-card w-full max-w-md p-8 text-center">
          <h1 className="text-3xl font-black">Reset link expired</h1>
          <p role="alert" className="mt-4 text-zinc-600">
            This password reset link is invalid or has expired. Request a new
            link.
          </p>
          <Link to={paths.forgotPath} className="brutal-button mt-7 inline-flex">
            Request new reset link
          </Link>
        </section>
      </main>
    );

  return (
    <main className="brutal-page flex min-h-screen items-center justify-center p-5 sm:p-8">
      <section className="brutal-card w-full max-w-md p-6 sm:p-8">
        <p className="brutal-overline">Account security</p>
        <h1 className="mt-2 text-3xl font-black">Choose a new password</h1>
        <p className="mt-3 text-sm text-zinc-600">
          Your other CreatorLinksAI sessions will be signed out after this
          password is changed.
        </p>

        <form onSubmit={submit} className="mt-7 space-y-5" noValidate>
          <div>
            <PasswordField
              id="new-password"
              label="New password"
              value={password}
              visible={showPassword}
              onToggle={() => setShowPassword((value) => !value)}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrors((current) => ({ ...current, password: undefined }));
              }}
              error={errors.password}
            />
            <PasswordChecklist password={password} />
          </div>
          <PasswordField
            id="confirm-new-password"
            label="Confirm new password"
            value={confirmPassword}
            visible={showConfirm}
            onToggle={() => setShowConfirm((value) => !value)}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              setErrors((current) => ({
                ...current,
                confirmPassword: undefined,
              }));
            }}
            error={errors.confirmPassword}
          />

          {errors.form && (
            <p
              role="alert"
              className="border-2 border-red-700 bg-red-50 p-3 text-sm font-bold text-red-800"
            >
              {errors.form}
              {isRateLimited && (
                <span className="mt-1 block">
                  You can try again in {secondsRemaining} second
                  {secondsRemaining === 1 ? "" : "s"}.
                </span>
              )}
            </p>
          )}
          <button
            disabled={
              submitting || isRateLimited || !passwordValid || !matches
            }
            className="brutal-button w-full"
          >
            {submitting ? "Resetting…" : "Reset password"}
          </button>
        </form>
      </section>
    </main>
  );
}

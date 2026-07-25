import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Mail } from "lucide-react";
import { api } from "../api";
import { useRateLimitCountdown } from "../hooks/useRateLimitCountdown";

const SUCCESS_MESSAGE =
  "If an account exists for this email, we’ve sent a password reset link. Check your inbox and spam folder.";

function portalDetails(value) {
  if (value === "creator")
    return { name: "Creator", loginPath: "/creator/login" };
  if (value === "brand")
    return { name: "Brand / Agency", loginPath: "/brand/login" };
  return { name: "CreatorLinksAI", loginPath: "/login" };
}

export default function ForgotPassword() {
  const [params] = useSearchParams();
  const portal = params.get("portal")?.toLowerCase();
  const details = portalDetails(portal);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const requestInFlight = useRef(false);
  const { isRateLimited, secondsRemaining, startRateLimit } =
    useRateLimitCountdown();

  async function submit(event) {
    event.preventDefault();
    if (requestInFlight.current || submitting || isRateLimited) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    requestInFlight.current = true;
    setSubmitting(true);
    setError("");
    try {
      await api.forgotPassword(normalizedEmail);
      setSuccess(true);
    } catch (requestError) {
      if (requestError.status === 429) {
        startRateLimit(requestError.retryAfter);
        setError("Too many attempts. Please wait before trying again.");
      } else {
        setError(
          requestError.status >= 500
            ? "The service is temporarily unavailable. Please try again."
            : requestError.message ||
                "We couldn’t send the reset request. Please try again.",
        );
      }
    } finally {
      requestInFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <main className="brutal-page flex min-h-screen items-center justify-center p-5 sm:p-8">
      <section className="brutal-card w-full max-w-md p-6 sm:p-8">
        <Link to={details.loginPath} className="text-sm font-black underline">
          ← Back to sign in
        </Link>
        <div className="mt-8 flex h-12 w-12 items-center justify-center border-2 border-zinc-900 bg-yellow-300">
          <Mail size={23} />
        </div>
        <p className="brutal-overline mt-6">{details.name} account</p>
        <h1 className="mt-2 text-3xl font-black">Reset your password</h1>
        <p className="mt-3 text-sm text-zinc-600">
          Enter your account email and we’ll send password reset instructions
          if an account exists.
        </p>

        {success ? (
          <div
            role="status"
            aria-live="polite"
            className="mt-7 border-2 border-zinc-900 bg-emerald-100 p-4"
          >
            <p className="font-bold">{SUCCESS_MESSAGE}</p>
            <Link
              to={details.loginPath}
              className="brutal-button mt-6 inline-flex w-full"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-7" noValidate>
            <label htmlFor="reset-email" className="block font-bold">
              Email address
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "forgot-password-error" : undefined}
                className="brutal-field mt-2 w-full"
              />
            </label>
            {error && (
              <p
                id="forgot-password-error"
                role="alert"
                className="mt-4 border-2 border-red-700 bg-red-50 p-3 text-sm font-bold text-red-800"
              >
                {error}
                {isRateLimited && (
                  <span className="mt-1 block">
                    You can try again in {secondsRemaining} second
                    {secondsRemaining === 1 ? "" : "s"}.
                  </span>
                )}
              </p>
            )}
            <button
              disabled={submitting || isRateLimited}
              className="brutal-button mt-6 w-full"
            >
              {submitting ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

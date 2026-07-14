import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-bg-deep px-4 py-12">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-1/4 -left-10 w-80 h-80 bg-accent-primary/10 rounded-full blur-3xl animate-blob"></div>
      <div
        className="absolute bottom-1/4 -right-10 w-80 h-80 bg-accent-secondary/10 rounded-full blur-3xl animate-blob"
        style={{ animationDelay: "3s" }}
      ></div>

      <div className="relative z-10 w-full max-w-md p-8 md:p-10 rounded-3xl bg-panel/50 backdrop-blur-xl border border-panel-border shadow-2xl transition-all duration-300 hover:border-panel-border/80">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-accent-secondary animate-pulse"></span>
            <span className="text-xs font-semibold tracking-widest text-accent-secondary uppercase">
              CreatorLinksAI
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
            Create account
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Get started by creating your analytics account.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 animate-fadeIn">
            <svg
              className="w-4 h-4 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-bg-deep/60 border border-panel-border text-text-primary placeholder:text-text-secondary/30 text-sm focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-text-secondary uppercase tracking-wider"
              >
                Password
              </label>
              <span className="text-[10px] text-text-secondary/60">
                Min. 8 characters
              </span>
            </div>
            <input
              id="password"
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl bg-bg-deep/60 border border-panel-border text-text-primary placeholder:text-text-secondary/30 text-sm focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary hover:from-accent-primary/95 hover:to-accent-secondary/95 text-white text-sm font-semibold shadow-lg shadow-accent-primary/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating account...
              </span>
            ) : (
              "Register"
            )}
          </button>
          <p className="text-sm text-slate-400 mt-6 text-center">
            By continuing, you agree to our{" "}
            <Link
              to="/terms-of-service"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy-policy"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </form>

        <p className="mt-8 text-center text-xs text-text-secondary">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-accent-primary hover:text-accent-secondary transition-colors underline underline-offset-4"
          >
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}

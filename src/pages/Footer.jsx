import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#090a0f]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-slate-400 md:flex-row">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="font-medium text-slate-200">CreatorLinks AI</span>.
          All rights reserved.
        </p>

        <div className="flex items-center gap-6">
          <Link
            to="/privacy-policy"
            className="transition-colors hover:text-indigo-400"
          >
            Privacy Policy
          </Link>

          <Link
            to="/terms-of-service"
            className="transition-colors hover:text-indigo-400"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}

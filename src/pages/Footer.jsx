import { Link, useLocation } from "react-router-dom";
import { Camera } from "lucide-react";

export default function Footer() {
  const location = useLocation();
  if (location.pathname === "/") return null;
  return (
    <footer className="border-t border-white/10 bg-[#090a0f]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-slate-400 md:flex-row">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="font-medium text-slate-200">CreatorLinks AI</span>.
          All rights reserved.
        </p>

        <div className="flex items-center gap-6">
          <a
            href="https://www.instagram.com/creatorlinksai/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-indigo-400"
            aria-label="Follow CreatorLinksAI on Instagram"
          >
            <Camera size={16} aria-hidden="true" />
            Instagram
          </a>

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

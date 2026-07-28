import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  Bot,
  Camera,
  Check,
  ChevronDown,
  FileImage,
  FileText,
  Menu,
  MessageCircle,
  PenLine,
  Play,
  Send,
  Sparkles,
  TrendingUp,
  UserCheck,
  X,
  Zap,
} from "lucide-react";

const features = [
  {
    id: "insights",
    eyebrow: "01 · Instagram Insights",
    title: "Know what’s working. Grow with confidence.",
    copy: "Turn Instagram data into a clear picture of your audience, reach, engagement, and best-performing Reels.",
    color: "bg-sky-200",
    icon: BarChart3,
  },
  {
    id: "auto-dm",
    eyebrow: "02 · Auto-DM",
    title: "Turn every comment into a conversation.",
    copy: "Reply to keywords, send private content, verify followers, and keep engagement moving while you create.",
    color: "bg-emerald-200",
    icon: MessageCircle,
  },
  {
    id: "scripts",
    eyebrow: "03 · AI Script Writer",
    title: "Go from rough idea to ready-to-film.",
    copy: "Generate hooks, structured scripts, captions, and fresh angles without losing your own voice.",
    color: "bg-violet-200",
    icon: PenLine,
  },
  {
    id: "media-kit",
    eyebrow: "04 · Media Kit",
    title: "Look ready before the brand even asks.",
    copy: "Package your profile, audience, rates, statistics, and collaborations into a polished creator media kit.",
    color: "bg-orange-200",
    icon: FileImage,
  },
  {
    id: "invoices",
    eyebrow: "05 · Invoices",
    title: "Keep the business side under control.",
    copy: "Create professional invoices, track payment status, and keep every brand collaboration organized.",
    color: "bg-rose-200",
    icon: FileText,
  },
];

const benefits = [
  ["Save hours every week", "Automate repetitive engagement and admin work.", Zap],
  ["Understand your audience", "See useful insights without digging through multiple screens.", BarChart3],
  ["Never miss warm leads", "Move interested commenters into private conversations.", MessageCircle],
  ["Show up professionally", "Share a polished media kit and creator-ready invoices.", UserCheck],
  ["Create with momentum", "Turn content ideas into structured scripts faster.", Sparkles],
  ["Build a real business", "Keep growth, engagement, and operations in one workspace.", TrendingUp],
];

const faqs = [
  [
    "What type of Instagram accounts are supported?",
    "CreatorLinksAI is designed for professional Instagram accounts using Instagram Login. Availability of individual insights depends on the data Instagram provides for your connected account.",
  ],
  [
    "How does Auto-DM work?",
    "You choose a Reel or post, configure a keyword, and define the private response. When a matching comment arrives, CreatorLinksAI makes the configured reply attempt and records the delivery activity.",
  ],
  [
    "Do I need a Business account?",
    "You need an eligible professional Instagram account supported by Meta’s Instagram Login APIs. Personal accounts generally do not expose the insights and automation capabilities used by CreatorLinksAI.",
  ],
  [
    "Is CreatorLinksAI free?",
    "CreatorLinksAI is currently launching its Creator experience. Plan and pricing information will be shared as the product moves beyond the initial launch.",
  ],
  [
    "Does CreatorLinksAI store my Instagram password?",
    "No. Instagram authentication happens through Meta’s official connection flow. CreatorLinksAI never asks for or stores your Instagram password.",
  ],
];

function scrollToSection(sectionId) {
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function BrandMark({ className = "", wordmark = false }) {
  if (wordmark) {
    return (
      <img
        src="/creatorlinksai-wordmark.png"
        alt="CreatorLinksAI"
        className={`h-8 w-auto sm:h-9 ${className}`}
      />
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 font-black ${className}`}>
      <img src="/favicon.svg" alt="" className="h-7 w-7" />
      CreatorLinksAI
    </span>
  );
}

function MetricCard({ label, value, accent = "bg-white" }) {
  return (
    <div className={`border-2 border-zinc-900 p-3 shadow-[3px_3px_0_#18181b] ${accent}`}>
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-600">
        {label}
      </p>
      <p className="mt-2 font-mono text-xl font-black">{value}</p>
    </div>
  );
}

function MiniBars() {
  return (
    <div className="flex h-28 items-end gap-2 border-2 border-zinc-900 bg-zinc-50 p-3" aria-label="Engagement growth chart">
      {[32, 48, 42, 66, 55, 78, 92].map((height, index) => (
        <span
          key={height + index}
          className={`flex-1 border-2 border-zinc-900 ${index === 6 ? "bg-yellow-300" : "bg-sky-200"}`}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

function DashboardPreview({ compact = false }) {
  return (
    <div className={`homepage-window ${compact ? "p-3" : "p-3 sm:p-4"}`}>
      <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 border border-zinc-900 bg-rose-300" />
          <span className="h-3 w-3 border border-zinc-900 bg-yellow-300" />
          <span className="h-3 w-3 border border-zinc-900 bg-emerald-300" />
        </div>
        <span className="font-mono text-[9px] font-bold text-zinc-500">CREATOR WORKSPACE</span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em]">Instagram insights</p>
          <h3 className="mt-1 text-lg font-black">@yourcreator</h3>
        </div>
        <span className="border-2 border-zinc-900 bg-emerald-200 px-2 py-1 text-[9px] font-black">
          CONNECTED
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MetricCard label="Followers" value="48.2K" accent="bg-yellow-100" />
        <MetricCard label="Engagement" value="8.6%" />
        <MetricCard label="Avg views" value="23.4K" />
        <MetricCard label="Reach" value="91K" accent="bg-sky-100" />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1.25fr_.75fr]">
        <div className="border-2 border-zinc-900 bg-white p-3">
          <div className="mb-3 flex items-center justify-between">
            <strong className="text-xs">Audience growth</strong>
            <span className="text-[10px] font-bold text-emerald-700">↑ 18.4%</span>
          </div>
          <MiniBars />
        </div>
        <div className="border-2 border-zinc-900 bg-violet-100 p-3">
          <p className="text-[9px] font-black uppercase tracking-wider">Auto-DM</p>
          <p className="mt-2 text-sm font-black">“LINK” automation</p>
          <div className="mt-3 border-2 border-zinc-900 bg-white p-2 text-[10px]">
            <span className="font-black">Delivered</span>
            <strong className="float-right font-mono">1,248</strong>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-bold">
            <Check size={12} /> Active now
          </div>
        </div>
      </div>
    </div>
  );
}

function AutoDmVisual() {
  return (
    <div className="relative mx-auto max-w-xl p-4 sm:p-8">
      <div className="homepage-sticker absolute -left-1 top-1 rotate-[-7deg] bg-yellow-300">COMMENT: “LINK”</div>
      <div className="ml-auto mt-14 w-[86%] border-2 border-zinc-900 bg-white p-4 shadow-[5px_5px_0_#18181b]">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-zinc-900 bg-emerald-200">
            <Bot size={20} />
          </div>
          <div>
            <p className="text-xs font-black">CreatorLinksAI automation</p>
            <p className="mt-2 border-2 border-zinc-900 bg-zinc-50 p-3 text-sm">
              Thanks for commenting! Here’s the creator guide you asked for.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="border-2 border-zinc-900 bg-sky-100 px-3 py-2 text-xs font-black">Private DM sent</span>
          <span className="border-2 border-zinc-900 bg-orange-100 px-3 py-2 text-xs font-black">Follow verified</span>
          <span className="inline-flex items-center gap-1 border-2 border-zinc-900 bg-yellow-200 px-3 py-2 text-xs font-black">
            <FileText size={13} /> PDF ready
          </span>
        </div>
      </div>
      <div className="homepage-sticker mt-7 inline-flex rotate-2 items-center gap-2 bg-violet-200">
        <Send size={15} /> DELIVERED IN SECONDS
      </div>
    </div>
  );
}

function ScriptVisual() {
  return (
    <div className="homepage-window p-4">
      <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-3">
        <strong className="text-xs">NEW REEL SCRIPT</strong>
        <span className="border border-zinc-900 bg-violet-200 px-2 py-1 text-[9px] font-black">AI DRAFT</span>
      </div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[.18em] text-zinc-500">Hook</p>
      <p className="mt-2 border-l-4 border-yellow-400 pl-3 text-lg font-black">
        “Three things I wish I knew before my first brand deal…”
      </p>
      <div className="mt-5 space-y-2">
        {["Open with the real mistake", "Share the turning point", "End with one actionable takeaway"].map((line, index) => (
          <div key={line} className="flex items-center gap-3 border-2 border-zinc-900 bg-zinc-50 p-3 text-xs font-bold">
            <span className="flex h-6 w-6 items-center justify-center bg-yellow-300 font-mono">{index + 1}</span>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

function MediaKitVisual() {
  return (
    <div className="homepage-window overflow-hidden">
      <div className="grid grid-cols-[1.3fr_.7fr] bg-yellow-300 p-5">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[.24em]">Creator media kit</p>
          <h3 className="mt-4 text-2xl font-black">@yourcreator</h3>
          <p className="mt-1 text-xs font-bold">Lifestyle · Beauty · Travel</p>
        </div>
        <div className="flex aspect-square items-center justify-center border-2 border-zinc-900 bg-sky-200 text-2xl font-black">YC</div>
      </div>
      <div className="grid grid-cols-3 gap-2 p-4">
        <MetricCard label="Audience" value="48K" />
        <MetricCard label="Avg views" value="23K" />
        <MetricCard label="ER" value="8.6%" />
      </div>
      <div className="mx-4 mb-4 border-2 border-zinc-900 bg-zinc-900 p-4 text-white">
        <p className="text-[9px] font-black uppercase tracking-widest text-yellow-300">Partnership rates</p>
        <div className="mt-3 flex justify-between text-xs"><span>Reel package</span><strong>₹25,000</strong></div>
      </div>
    </div>
  );
}

function InvoiceVisual() {
  return (
    <div className="homepage-window p-4">
      <div className="flex items-center justify-between">
        <div><p className="text-[9px] font-black uppercase tracking-widest">Invoices</p><h3 className="mt-1 text-xl font-black">Creator finances</h3></div>
        <span className="border-2 border-zinc-900 bg-emerald-200 px-3 py-2 text-xs font-black">₹85K PAID</span>
      </div>
      <div className="mt-4 space-y-2">
        {[
          ["Glow Studio", "₹35,000", "PAID", "bg-emerald-200"],
          ["Wander Co.", "₹28,000", "SENT", "bg-sky-200"],
          ["Sunday Skin", "₹22,000", "DRAFT", "bg-zinc-200"],
        ].map(([brand, amount, status, color]) => (
          <div key={brand} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-2 border-zinc-900 p-3">
            <strong className="text-xs">{brand}</strong>
            <span className="font-mono text-xs font-bold">{amount}</span>
            <span className={`border border-zinc-900 px-2 py-1 text-[9px] font-black ${color}`}>{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Homepage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className="homepage-shell overflow-hidden bg-[#fffdf5] text-zinc-950">
      <header className="sticky top-0 z-50 border-b-2 border-zinc-900 bg-[#fffdf5]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6">
          <Link to="/" aria-label="CreatorLinksAI home" className="flex items-center">
            <BrandMark wordmark />
          </Link>
          <nav className="hidden h-full items-stretch gap-7 text-sm font-bold md:flex" aria-label="Homepage navigation">
            <button type="button" onClick={() => scrollToSection("features")} className="homepage-nav-link">Features</button>
            <button type="button" onClick={() => scrollToSection("how-it-works")} className="homepage-nav-link">How it works</button>
            <button type="button" onClick={() => scrollToSection("faq")} className="homepage-nav-link">FAQ</button>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link to="/creator/login" className="homepage-link-button">Sign In</Link>
            <Link to="/creator/register" className="brutal-button inline-flex min-h-11 px-5 py-2">Get Started</Link>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            className="flex h-11 w-11 items-center justify-center border-2 border-zinc-900 bg-yellow-300 md:hidden"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <nav className="border-t-2 border-zinc-900 bg-white p-4 md:hidden" aria-label="Mobile homepage navigation">
            <div className="grid gap-2 text-sm font-black">
              {[
                ["Features", "features"],
                ["How it works", "how-it-works"],
                ["FAQ", "faq"],
              ].map(([label, sectionId]) => (
                <button
                  key={sectionId}
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    window.requestAnimationFrame(() => scrollToSection(sectionId));
                  }}
                  className="border-2 border-zinc-900 bg-white p-3 text-left"
                >
                  {label}
                </button>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link to="/creator/login" className="homepage-link-button">Sign In</Link>
                <Link to="/creator/register" className="brutal-button inline-flex min-h-11 px-3 py-2">Get Started</Link>
              </div>
            </div>
          </nav>
        )}
      </header>

      <section className="relative border-b-2 border-zinc-900">
        <div className="homepage-dot-grid absolute inset-0 opacity-45" />
        <div className="homepage-blob absolute -left-36 top-24 h-72 w-72 bg-sky-200" />
        <div className="homepage-blob absolute -right-24 top-10 h-64 w-64 bg-violet-200" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[.88fr_1.12fr] lg:py-28">
          <div className="homepage-reveal">
            <div className="homepage-sticker inline-flex rotate-[-2deg] items-center gap-2 bg-emerald-200">
              <Camera size={15} /> BUILT FOR CREATORS
            </div>
            <h1 className="mt-7 max-w-3xl text-[clamp(3rem,7vw,6.7rem)] font-black leading-[.88] tracking-[-.065em]">
              Turn your audience into a{" "}
              <span className="relative inline-block">
                business.
                <span className="absolute inset-x-0 bottom-0 -z-10 h-[24%] -rotate-1 bg-yellow-300" />
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-base font-medium leading-7 text-zinc-600 sm:text-lg">
              CreatorLinksAI brings Instagram insights, Auto-DM, scripts, media kits, and invoices into one creator workspace—so you can create, engage, and grow without the busywork.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/creator/register" className="brutal-button inline-flex gap-2 text-base">
                Get Started <ArrowRight size={19} />
              </Link>
              <button type="button" onClick={() => scrollToSection("product-preview")} className="homepage-link-button gap-2 text-base">
                <Play size={17} fill="currentColor" /> View Demo
              </button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-black">
              <span className="flex items-center gap-2"><Check size={15} className="text-emerald-700" /> Official Instagram connection</span>
              <span className="flex items-center gap-2"><Check size={15} className="text-emerald-700" /> No Instagram password stored</span>
            </div>
          </div>
          <div className="relative homepage-float">
            <span className="homepage-sticker absolute -right-2 -top-7 z-10 rotate-3 bg-orange-200 sm:right-2">YOUR CREATOR HQ ↘</span>
            <DashboardPreview />
            <div className="homepage-sticker absolute -bottom-7 left-4 rotate-[-3deg] bg-emerald-200 sm:-left-6">
              +18.4% REACH THIS MONTH
            </div>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-zinc-900 bg-yellow-300 py-5">
        <div className="homepage-marquee flex min-w-max items-center gap-8 whitespace-nowrap font-black uppercase tracking-[.16em]">
          {[...Array(2)].flatMap(() => ["Insights", "Auto-DM", "AI Scripts", "Media Kit", "Invoices"]).map((item, index) => (
            <span key={`${item}-${index}`} className="flex items-center gap-8">
              {item} <span className="text-xl">✳</span>
            </span>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
        <div className="max-w-3xl">
          <p className="brutal-overline">One creator operating system</p>
          <h2 className="mt-4 text-4xl font-black leading-none tracking-[-.04em] sm:text-6xl">
            Everything behind the content, finally in one place.
          </h2>
        </div>

        <div className="mt-14 space-y-8">
          <article className="grid overflow-hidden border-2 border-zinc-900 bg-white shadow-[6px_6px_0_#18181b] lg:grid-cols-[.78fr_1.22fr]">
            <div className="flex flex-col justify-center border-b-2 border-zinc-900 bg-sky-200 p-7 lg:border-b-0 lg:border-r-2 lg:p-10">
              <p className="brutal-overline">{features[0].eyebrow}</p>
              <h3 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{features[0].title}</h3>
              <p className="mt-4 max-w-lg leading-7 text-zinc-700">{features[0].copy}</p>
              <div className="mt-7 flex flex-wrap gap-2">
                {["Followers", "Reach", "Engagement", "Reels", "Audience", "Growth"].map((item) => (
                  <span key={item} className="border-2 border-zinc-900 bg-white px-3 py-2 text-xs font-black">{item}</span>
                ))}
              </div>
            </div>
            <div className="p-5 sm:p-8"><DashboardPreview compact /></div>
          </article>

          <article className="grid overflow-hidden border-2 border-zinc-900 bg-white shadow-[6px_6px_0_#18181b] lg:grid-cols-2">
            <div className="p-5 sm:p-8"><AutoDmVisual /></div>
            <div className="flex flex-col justify-center border-t-2 border-zinc-900 bg-emerald-200 p-7 lg:border-l-2 lg:border-t-0 lg:p-10">
              <p className="brutal-overline">{features[1].eyebrow}</p>
              <h3 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{features[1].title}</h3>
              <p className="mt-4 leading-7 text-zinc-700">{features[1].copy}</p>
              <ul className="mt-6 grid gap-3 text-sm font-bold sm:grid-cols-2">
                {["Comment keywords", "Private replies", "Follower gate", "Secure PDF delivery", "Delivery tracking"].map((item) => (
                  <li key={item} className="flex items-center gap-2"><Check size={16} /> {item}</li>
                ))}
              </ul>
            </div>
          </article>

          <div className="grid gap-8 lg:grid-cols-3">
            {features.slice(2).map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.id} className="flex flex-col border-2 border-zinc-900 bg-white shadow-[5px_5px_0_#18181b]">
                  <div className={`flex items-center justify-between border-b-2 border-zinc-900 p-5 ${feature.color}`}>
                    <p className="brutal-overline">{feature.eyebrow}</p>
                    <Icon size={24} />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-2xl font-black leading-tight">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">{feature.copy}</p>
                    <div className="mt-7 flex-1">
                      {feature.id === "scripts" && <ScriptVisual />}
                      {feature.id === "media-kit" && <MediaKitVisual />}
                      {feature.id === "invoices" && <InvoiceVisual />}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 border-y-2 border-zinc-900 bg-zinc-950 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="brutal-overline text-yellow-300">How it works</p>
          <div className="mt-4 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <h2 className="max-w-3xl text-4xl font-black leading-none tracking-[-.04em] sm:text-6xl">From connected account to creator command center.</h2>
            <ArrowDown size={40} className="text-yellow-300 md:rotate-[-90deg]" />
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {[
              ["01", "Connect Instagram", "Use Meta’s official Instagram Login flow.", Camera, "bg-yellow-300"],
              ["02", "Import insights", "Bring audience and Reel performance into focus.", BarChart3, "bg-sky-200"],
              ["03", "Automate engagement", "Create keyword rules that keep conversations moving.", Bot, "bg-emerald-200"],
              ["04", "Grow your business", "Create, pitch, invoice, and make smarter decisions.", TrendingUp, "bg-violet-200"],
            ].map(([number, title, copy, Icon, color], index) => (
              <article key={title} className="relative border-2 border-white bg-zinc-900 p-5">
                {index < 3 && <ArrowRight className="absolute -right-5 top-8 z-10 hidden bg-zinc-950 text-yellow-300 md:block" />}
                <div className={`flex h-12 w-12 items-center justify-center border-2 border-white text-zinc-950 ${color}`}><Icon /></div>
                <p className="mt-7 font-mono text-xs text-yellow-300">{number}</p>
                <h3 className="mt-2 text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[.68fr_1.32fr]">
          <div>
            <p className="brutal-overline">Creator benefits</p>
            <h2 className="mt-4 text-4xl font-black leading-none tracking-[-.04em] sm:text-5xl">Less admin. More creative momentum.</h2>
            <p className="mt-5 max-w-lg leading-7 text-zinc-600">Built for creators who are ready to treat their audience, content, and partnerships like a real business.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map(([title, copy, Icon], index) => (
              <article key={title} className={`border-2 border-zinc-900 p-5 shadow-[4px_4px_0_#18181b] ${index % 3 === 0 ? "bg-yellow-100" : index % 3 === 1 ? "bg-sky-100" : "bg-white"}`}>
                <Icon size={22} />
                <h3 className="mt-5 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="product-preview" className="relative scroll-mt-20 border-y-2 border-zinc-900 bg-violet-200 py-20 sm:py-28">
        <div className="homepage-dot-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="brutal-overline">Product preview</p>
            <h2 className="mt-4 text-4xl font-black leading-none tracking-[-.04em] sm:text-6xl">Your creator business, wherever you work.</h2>
          </div>
          <div className="relative mx-auto mt-14 max-w-5xl pb-24 sm:pb-12">
            <div className="border-[3px] border-zinc-900 bg-zinc-900 p-2 shadow-[10px_10px_0_rgba(24,24,27,.35)] sm:p-4">
              <DashboardPreview />
            </div>
            <div className="absolute -bottom-3 -left-2 w-[42%] min-w-[180px] rotate-[-3deg] border-[3px] border-zinc-900 bg-white p-2 shadow-[6px_6px_0_#18181b] sm:-left-8 sm:w-[30%]">
              <div className="border-b-2 border-zinc-900 bg-emerald-200 p-2 text-[9px] font-black uppercase">Auto-DM live</div>
              <div className="p-3 text-xs"><strong>1,248 delivered</strong><p className="mt-1 text-zinc-500">Across 4 active rules</p></div>
            </div>
            <div className="absolute -bottom-16 right-1 w-[48%] min-w-[200px] rotate-2 border-[3px] border-zinc-900 bg-yellow-300 p-4 shadow-[6px_6px_0_#18181b] sm:-right-7 sm:bottom-8 sm:w-[27%]">
              <p className="text-[9px] font-black uppercase tracking-widest">Media kit</p>
              <p className="mt-2 text-lg font-black">Ready to share</p>
              <p className="mt-1 text-xs">Audience, pricing, portfolio ✓</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="brutal-overline">Creator-first by design</p>
            <h2 className="mt-4 max-w-2xl text-4xl font-black leading-none tracking-[-.04em] sm:text-5xl">Built around the work creators actually do.</h2>
          </div>
          <span className="homepage-sticker rotate-2 bg-orange-200">EARLY ACCESS</span>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            ["“My insights should tell me what to create next—not just give me more numbers.”", "Creator insight workflow"],
            ["“A comment is an opportunity. The follow-up should not depend on me being online.”", "Creator automation workflow"],
            ["“I want my business tools to look as professional as my content.”", "Creator operations workflow"],
          ].map(([quote, label], index) => (
            <article key={label} className={`border-2 border-zinc-900 p-6 shadow-[5px_5px_0_#18181b] ${index === 0 ? "bg-sky-100" : index === 1 ? "bg-yellow-100" : "bg-emerald-100"}`}>
              <p className="text-xl font-black leading-8">{quote}</p>
              <p className="mt-8 border-t-2 border-zinc-900 pt-4 text-xs font-black uppercase tracking-wider">{label}</p>
            </article>
          ))}
        </div>
        <p className="mt-4 text-xs text-zinc-500">Illustrative placeholders for future verified creator testimonials.</p>
      </section>

      <section id="faq" className="scroll-mt-20 border-y-2 border-zinc-900 bg-sky-100 py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[.7fr_1.3fr]">
          <div>
            <p className="brutal-overline">FAQ</p>
            <h2 className="mt-4 text-4xl font-black leading-none tracking-[-.04em] sm:text-5xl">Good questions. Straight answers.</h2>
          </div>
          <div className="space-y-3">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group border-2 border-zinc-900 bg-white shadow-[3px_3px_0_#18181b]">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 p-4 font-black">
                  {question}
                  <ChevronDown className="shrink-0 transition-transform group-open:rotate-180" size={20} />
                </summary>
                <p className="border-t-2 border-zinc-900 p-4 text-sm leading-6 text-zinc-600">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden border-[3px] border-zinc-900 bg-yellow-300 p-8 shadow-[9px_9px_0_#18181b] sm:p-14">
          <div className="homepage-dot-grid absolute inset-0 opacity-25" />
          <div className="relative max-w-4xl">
            <p className="brutal-overline">Your next chapter</p>
            <h2 className="mt-4 text-4xl font-black leading-none tracking-[-.045em] sm:text-6xl">Start growing your creator business today.</h2>
            <p className="mt-5 max-w-2xl text-base font-medium leading-7">Connect your Instagram account, understand your audience, automate engagement, and run the business behind your content.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/creator/register" className="homepage-dark-button inline-flex gap-2">Get Started <ArrowRight size={18} /></Link>
              <Link to="/creator/login" className="homepage-link-button bg-white">Sign In</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-zinc-900 bg-zinc-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,.6fr)]">
          <div>
            <BrandMark className="text-xl" />
            <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-400">The creator workspace for insights, engagement, content, and business.</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-yellow-300">Product</p>
            <div className="mt-4 grid gap-3 text-sm text-zinc-300">
              <button type="button" onClick={() => scrollToSection("features")} className="w-fit min-h-0 text-left">Features</button>
              <button type="button" onClick={() => scrollToSection("how-it-works")} className="w-fit min-h-0 text-left">How it works</button>
              <Link to="/creator/register">Get started</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-yellow-300">Legal</p>
            <div className="mt-4 grid gap-3 text-sm text-zinc-300"><Link to="/privacy-policy">Privacy</Link><Link to="/terms-of-service">Terms</Link></div>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-yellow-300">Connect</p>
            <div className="mt-4 grid gap-3 text-sm text-zinc-300"><a href="mailto:support@creatorlinksai.com">Contact</a><span className="text-zinc-500">Social links coming soon</span></div>
          </div>
        </div>
        <div className="border-t border-zinc-700 px-4 py-5 text-center text-xs text-zinc-500">© {new Date().getFullYear()} CreatorLinksAI. Built for creators.</div>
      </footer>
    </main>
  );
}

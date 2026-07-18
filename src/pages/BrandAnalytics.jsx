import {Link} from "react-router-dom";
import {BarChart3,ChartNoAxesCombined,Sparkles} from "lucide-react";

export default function BrandAnalytics(){
  return <main className="brutal-page min-h-[calc(100vh-82px)] p-4 sm:p-6 md:p-8">
    <div className="mx-auto max-w-6xl">
      <header className="border-b-2 border-zinc-900 pb-6">
        <p className="brutal-overline">Brand / Agency workspace</p>
        <h1 className="mt-2 text-4xl font-black">Analytics</h1>
        <p className="mt-2 max-w-2xl text-zinc-600">A clearer view of creator and campaign performance is on the way.</p>
      </header>
      <section className="brutal-card mt-7 overflow-hidden">
        <div className="grid lg:grid-cols-[1.1fr_.9fr]">
          <div className="p-6 sm:p-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-900 bg-yellow-300 px-3 py-1 text-xs font-black uppercase tracking-wide"><Sparkles size={14}/>Coming soon</span>
            <h2 className="mt-6 max-w-xl text-3xl font-black sm:text-4xl">Analytics built for smarter creator partnerships.</h2>
            <p className="mt-4 max-w-xl leading-7 text-zinc-600">We’re building a focused workspace for campaign results, creator comparisons, audience signals, and performance trends. No analytics data is requested while this preview is shown.</p>
            <Link to="/brand/discovery" className="brutal-button mt-8 inline-flex">Continue to Discovery</Link>
          </div>
          <div className="border-t-2 border-zinc-900 bg-sky-100 p-6 sm:p-8 lg:border-l-2 lg:border-t-0">
            <div className="flex h-full min-h-64 flex-col justify-between border-2 border-zinc-900 bg-white p-6 shadow-[4px_4px_0_#18181b]">
              <div className="flex items-center justify-between"><BarChart3 size={34}/><span className="font-mono text-xs font-bold">ANALYTICS / PREVIEW</span></div>
              <div className="my-8 flex h-28 items-end gap-3" aria-hidden="true">{[42,68,54,88,74,100].map((height,index)=><span key={index} style={{height:`${height}%`}} className={`min-w-0 flex-1 border-2 border-zinc-900 ${index===5?"bg-yellow-300":"bg-zinc-200"}`}/>)}</div>
              <div className="flex items-center gap-3 border-t-2 border-zinc-900 pt-4"><ChartNoAxesCombined size={22}/><p className="text-sm font-black">Performance insights are being prepared.</p></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
}

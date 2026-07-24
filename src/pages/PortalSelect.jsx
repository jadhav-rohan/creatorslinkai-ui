import {useState} from "react";
import {Link,Navigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {featureFlags} from "../config/featureFlags";

const NOTICE_KEY="creatorlinksai_auth_notice";

export default function PortalSelect(){
 const {isAuthenticated,activePersona,restoringSession,hasDisabledBrandSession}=useAuth();
 const [notice]=useState(()=>{const value=window.sessionStorage.getItem(NOTICE_KEY);window.sessionStorage.removeItem(NOTICE_KEY);return value});
 if(restoringSession)return <main className="brutal-page flex min-h-screen items-center justify-center p-6"><p className="brutal-card p-8 font-black">Restoring your session…</p></main>;
 if(hasDisabledBrandSession&&!featureFlags.brandPortalEnabled)return <Navigate to="/brand/coming-soon" replace/>;
 if(isAuthenticated)return <Navigate to={activePersona==="CREATOR"?"/creator/dashboard":featureFlags.brandPortalEnabled?"/brand/discovery":"/brand/coming-soon"} replace/>;
 return <main className="brutal-page flex min-h-screen items-center justify-center p-6"><div className="w-full max-w-4xl">
  <p className="brutal-overline">CreatorLinksAI</p>
  <h1 className="mt-3 text-5xl font-black tracking-tight">Choose your portal.</h1>
  <p className="mt-3 max-w-xl text-zinc-600">Start with the Creator experience. Brand and Agency collaboration tools are on the way.</p>
  {notice&&<p role="alert" className="mt-6 border-2 border-amber-700 bg-amber-50 p-4 font-bold text-amber-900">{notice}</p>}
  <div className="mt-10 grid gap-6 md:grid-cols-2">
   <Link to="/creator/login" className="brutal-card block p-8">
    <span className="brutal-overline">Creator · Active</span>
    <h2 className="mt-3 text-3xl font-black">I’m a Creator</h2>
    <p className="mt-3 text-zinc-600">Insights, media kit, invoices, and Instagram automation.</p>
    <span className="brutal-button mt-8 inline-flex">Continue as Creator →</span>
   </Link>
   {featureFlags.brandPortalEnabled?<Link to="/brand/login" className="brutal-card block p-8">
    <span className="brutal-overline">Brand / Agency</span>
    <h2 className="mt-3 text-3xl font-black">I’m a Brand or Agency</h2>
    <p className="mt-3 text-zinc-600">Discovery, creator lists, campaigns, and analytics.</p>
    <span className="brutal-button mt-8 inline-flex">Brand sign in →</span>
   </Link>:<article aria-disabled="true" className="brutal-card cursor-not-allowed bg-zinc-100 p-8 text-zinc-500">
    <div className="flex flex-wrap items-center justify-between gap-2"><span className="brutal-overline">Brand / Agency</span><span className="border-2 border-zinc-900 bg-sky-200 px-2 py-1 text-[10px] font-black uppercase text-zinc-900">Coming Soon</span></div>
    <h2 className="mt-3 text-3xl font-black text-zinc-700">I’m a Brand or Agency</h2>
    <p className="mt-3">Creator discovery and campaign tools are coming soon.</p>
    <span className="mt-8 inline-flex border-2 border-zinc-400 bg-zinc-200 px-5 py-3 font-black" aria-hidden="true">Coming Soon</span>
   </article>}
  </div>
 </div></main>;
}

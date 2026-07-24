import {Link} from "react-router-dom";
import {useAuth} from "../context/AuthContext";

export default function BrandComingSoon(){
 const {hasDisabledBrandSession,brandPortalMessage,logout,loggingOut,isAuthenticated,activePersona}=useAuth();
 return <main className="brutal-page flex min-h-screen items-center justify-center p-6"><section className="brutal-card w-full max-w-2xl p-7 text-center md:p-12">
  <span className="inline-flex border-2 border-zinc-900 bg-sky-200 px-3 py-1 text-xs font-black uppercase tracking-wide">Coming Soon</span>
  <p className="brutal-overline mt-7">Brand / Agency portal</p>
  <h1 className="mt-3 text-4xl font-black md:text-6xl">Creator partnerships are almost here.</h1>
  <p className="mx-auto mt-5 max-w-xl text-zinc-600">{brandPortalMessage||"Creator discovery, lists, campaigns, outreach, and campaign analytics are coming soon."}</p>
  <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
   {isAuthenticated&&activePersona==="CREATOR"?<Link to="/creator/dashboard" className="brutal-button justify-center">Return to Creator Dashboard</Link>:<Link to="/creator/login" className="brutal-button justify-center">Continue as Creator</Link>}
   <Link to="/login" className="border-2 border-zinc-900 bg-white px-5 py-3 font-black">Back to portal selection</Link>
  </div>
  {hasDisabledBrandSession&&<button type="button" onClick={()=>logout()} disabled={loggingOut} className="mt-7 font-black text-red-700 underline disabled:opacity-50">{loggingOut?"Signing out…":"Sign out of existing Brand session"}</button>}
 </section></main>;
}

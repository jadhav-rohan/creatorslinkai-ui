import {Link,useLocation} from "react-router-dom";
import ResendVerification from "../components/ResendVerification";
import {getPendingVerification} from "../services/pendingVerificationService";

export default function CheckEmail(){
 const location=useLocation(),stored=getPendingVerification(),email=location.state?.email||stored?.email||"",candidate=location.state?.persona||stored?.persona,persona=["CREATOR","BRAND"].includes(candidate)?candidate:null;
 const loginPath=persona==="BRAND"?"/brand/login":"/creator/login";
 const remaining=stored?.cooldownUntil?Math.max(0,Math.ceil((stored.cooldownUntil-Date.now())/1000)):0;
 return <main className="brutal-page flex min-h-screen items-center justify-center p-6"><section className="brutal-card w-full max-w-xl p-7 md:p-10">
  <p className="brutal-overline">Email verification</p><h1 className="mt-3 text-4xl font-black">Check your email</h1>
  <p className="mt-4 text-zinc-700">We sent a verification link{email?<><span> to </span><strong className="break-all">{email}</strong></>:" to the email used during registration"}. Open it to verify your account before signing in.</p>
  <div className="mt-5 border-2 border-zinc-900 bg-yellow-100 p-4 text-sm"><strong>The verification link expires after 24 hours.</strong> If the address is incorrect or the link expires, edit the email below and request another one.</div>
  <ResendVerification initialEmail={email} persona={persona} initialCooldownSeconds={remaining}/>
  {persona?<Link to={loginPath} className="mt-5 block text-center text-sm font-black underline">Back to {persona==="BRAND"?"Brand / Agency":"Creator"} sign in</Link>:<div className="mt-5 grid gap-3 sm:grid-cols-2"><Link to="/creator/login" className="border-2 border-zinc-900 bg-white p-3 text-center text-sm font-black">Creator sign in</Link><Link to="/brand/login" className="border-2 border-zinc-900 bg-white p-3 text-center text-sm font-black">Brand / Agency sign in</Link></div>}
 </section></main>;
}

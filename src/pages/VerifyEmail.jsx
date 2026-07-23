import {useEffect,useRef,useState} from "react";
import {Link,useSearchParams} from "react-router-dom";
import {api} from "../api";
import {useRateLimitCountdown} from "../hooks/useRateLimitCountdown";
import {clearPendingVerification,getPendingVerification} from "../services/pendingVerificationService";

function removeTokenFromUrl(){
 const clean=`${window.location.pathname}${window.location.search}#/verify-email`;
 window.history.replaceState({}, "", clean);
}

export default function VerifyEmail(){
 const [params]=useSearchParams(),[verificationToken]=useState(()=>params.get("token")||"");
 const pending=useRef(getPendingVerification()).current,persona=pending?.persona||null;
 const [state,setState]=useState(verificationToken?"verifying":"invalid"),[error,setError]=useState(""),[attempt,setAttempt]=useState(0);
 const request=useRef(0),lastAttempt=useRef(-1);
 const {isRateLimited,secondsRemaining,startRateLimit}=useRateLimitCountdown();
 useEffect(()=>{
  if(!verificationToken)return;
  if(lastAttempt.current===attempt)return;
  lastAttempt.current=attempt;
  const id=++request.current;setState("verifying");setError("");
  api.confirmEmailVerification(verificationToken).then(()=>{if(id!==request.current)return;clearPendingVerification();setState("success")}).catch(e=>{if(id!==request.current)return;if(e.status===400)setState("invalid");else if(e.status===429){setState("rate-limited");setError(e.message||"Too many attempts. Please try again later.");startRateLimit(e.retryAfter)}else if(e.status===503)setState("unavailable");else{setState("error");setError(e.status>=500?"Email verification failed. Please try again later.":e.message||"We could not verify this email.")}}).finally(()=>{if(id===request.current)removeTokenFromUrl()});
 },[verificationToken,attempt,startRateLimit]);
 const retry=()=>{if(!isRateLimited)setAttempt(value=>value+1)};
 const loginPath=persona==="BRAND"?"/brand/login":persona==="CREATOR"?"/creator/login":null;
 return <main className="brutal-page flex min-h-screen items-center justify-center p-6"><section className="brutal-card w-full max-w-xl p-7 text-center md:p-10">
  <p className="brutal-overline">Email verification</p>
  {state==="verifying"&&<><div className="mx-auto mt-6 h-12 w-12 animate-spin rounded-full border-4 border-zinc-900 border-t-yellow-300"/><h1 className="mt-6 text-3xl font-black">Verifying your email…</h1><p className="mt-3 text-zinc-600">Please keep this page open.</p></>}
  {state==="success"&&<><h1 className="mt-4 text-4xl font-black">Email verified successfully.</h1><p className="mt-4 text-zinc-600">Your account is ready. Sign in through the portal you registered for.</p>{loginPath?<Link to={loginPath} className="brutal-button mt-7 inline-flex">Continue to sign in</Link>:<div className="mt-7 grid gap-3 sm:grid-cols-2"><Link to="/creator/login" className="brutal-button justify-center">Creator sign in</Link><Link to="/brand/login" className="border-2 border-zinc-900 bg-white p-3 font-black">Brand / Agency sign in</Link></div>}</>}
  {state==="invalid"&&<><h1 className="mt-4 text-4xl font-black">Invalid verification link</h1><p className="mt-4 text-zinc-600">{verificationToken?"This verification link is invalid or has expired.":"This verification link is missing its token."}</p><Link to="/check-email" className="brutal-button mt-7 inline-flex">Request a new link</Link></>}
  {state==="rate-limited"&&<><h1 className="mt-4 text-4xl font-black">Too many attempts</h1><p role="alert" className="mt-4 text-zinc-700">{error}</p>{isRateLimited&&<p className="mt-2 font-bold">You can try again in {secondsRemaining} second{secondsRemaining===1?"":"s"}.</p>}<button onClick={retry} disabled={isRateLimited} className="brutal-button mt-7">Try again</button></>}
  {state==="unavailable"&&<><h1 className="mt-4 text-4xl font-black">Verification is temporarily unavailable</h1><p className="mt-4 text-zinc-600">The email provider or verification service is unavailable. Please try again.</p><button onClick={retry} className="brutal-button mt-7">Try again</button></>}
  {state==="error"&&<><h1 className="mt-4 text-4xl font-black">Email could not be verified</h1><p role="alert" className="mt-4 text-zinc-700">{error}</p><button onClick={retry} className="brutal-button mt-7">Try again</button></>}
 </section></main>;
}

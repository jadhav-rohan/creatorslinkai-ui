import {useEffect,useRef,useState} from "react";
import {api} from "../api";
import {useRateLimitCountdown} from "../hooks/useRateLimitCountdown";
import {setPendingVerification} from "../services/pendingVerificationService";

const GENERIC_SUCCESS="If this email belongs to an unverified account, a new verification link has been sent.";

export default function ResendVerification({initialEmail="",persona,initialCooldownSeconds=0}){
 const [email,setEmail]=useState(initialEmail),[sending,setSending]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState("");
 const started=useRef(false),requestInFlight=useRef(false);
 const {isRateLimited,secondsRemaining,startRateLimit}=useRateLimitCountdown();
 useEffect(()=>{if(!started.current&&initialCooldownSeconds>0){started.current=true;startRateLimit(initialCooldownSeconds)}},[initialCooldownSeconds,startRateLimit]);
 useEffect(()=>setEmail(initialEmail),[initialEmail]);
 async function resend(){
  const clean=email.trim();
  if(requestInFlight.current||sending||isRateLimited)return;
  if(!/^\S+@\S+\.\S+$/.test(clean)){setError("Enter a valid email address.");return}
  requestInFlight.current=true;setSending(true);setMessage("");setError("");
  try{
   await api.resendEmailVerification(clean);
   const cooldownUntil=Date.now()+60000;
   if(persona)setPendingVerification({email:clean,persona,cooldownUntil});
   setMessage(GENERIC_SUCCESS);
   startRateLimit(60);
  }catch(e){
   if(e.status===429){setError(e.message||"Too many attempts. Please try again later.");startRateLimit(e.retryAfter)}
   else if(e.status===503)setError("Email verification is temporarily unavailable. Please try again later.");
   else setError("We could not request another verification email. Please try again.");
  }finally{requestInFlight.current=false;setSending(false)}
 }
 return <div className="mt-6 border-t-2 border-zinc-900 pt-6">
  <label className="block text-sm font-black">Email address<input type="email" required autoComplete="email" value={email} onChange={event=>{setEmail(event.target.value);setMessage("");setError("")}} onKeyDown={event=>{if(event.key==="Enter"){event.preventDefault();resend()}}} className="brutal-field mt-2 w-full"/></label>
  {message&&<p role="status" className="mt-3 border-2 border-emerald-700 bg-emerald-50 p-3 text-sm font-bold text-emerald-900">{message}</p>}
  {error&&<p role="alert" className="mt-3 border-2 border-red-700 bg-red-50 p-3 text-sm font-bold text-red-800">{error}</p>}
  <button type="button" onClick={resend} disabled={sending||isRateLimited} className="brutal-button mt-4 w-full">{sending?"Sending…":isRateLimited?`Resend available in ${secondsRemaining}s`:"Resend verification email"}</button>
 </div>;
}

import {useRef,useState} from "react";
import {Link,Navigate,useLocation,useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {useRateLimitCountdown} from "../hooks/useRateLimitCountdown";

const PASSWORD_PATTERN=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const requirements=[
  ["length","8 or more characters",value=>value.length>=8],
  ["uppercase","One uppercase letter",value=>/[A-Z]/.test(value)],
  ["lowercase","One lowercase letter",value=>/[a-z]/.test(value)],
  ["number","One number",value=>/\d/.test(value)],
  ["special","One special character",value=>/[^A-Za-z0-9]/.test(value)],
];

function PasswordChecklist({password,touched}){
  return <div aria-label="Password requirements" aria-live="polite" className="mt-3 border-2 border-zinc-200 bg-zinc-50 p-3">
    <p className="text-xs font-black uppercase tracking-wide text-zinc-600">Password requirements</p>
    <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
      {requirements.map(([key,label,check])=>{const met=check(password),failed=touched&&!met;return <li key={key} className={`flex items-center gap-2 text-xs font-bold ${met?"text-emerald-700":failed?"text-red-700":"text-zinc-500"}`}><span aria-hidden="true" className={`flex h-4 w-4 items-center justify-center rounded-full border ${met?"border-emerald-700 bg-emerald-100":failed?"border-red-700 bg-red-50":"border-zinc-400"}`}>{met?"✓":failed?"×":""}</span>{label}</li>})}
    </ul>
  </div>
}

export default function PortalAuth({persona,mode}){
  const brand=persona==="BRAND",register=mode==="register";
  const {authenticatePortal,isAuthenticated,activePersona,restoringSession}=useAuth();
  const navigate=useNavigate(),location=useLocation();
  const [form,setForm]=useState({email:"",password:"",confirmPassword:"",workspaceName:"",workspaceType:"BRAND",acceptedLegal:false});
  const [errors,setErrors]=useState({}),[loading,setLoading]=useState(false),[requestId,setRequestId]=useState(null),[passwordTouched,setPasswordTouched]=useState(false);
  const requestInFlight=useRef(false);
  const {isRateLimited,secondsRemaining,startRateLimit}=useRateLimitCountdown();
  const set=(name,value)=>setForm(current=>({...current,[name]:value}));
  const emailValid=/^\S+@\S+\.\S+$/.test(form.email),passwordValid=PASSWORD_PATTERN.test(form.password);
  const registrationReady=emailValid&&passwordValid&&Boolean(form.confirmPassword)&&form.password===form.confirmPassword&&form.acceptedLegal&&(!brand||Boolean(form.workspaceName.trim()));

  function validate(){const next={};if(!emailValid)next.email="Enter a valid email address.";if(register&&!passwordValid)next.password="Password must satisfy every complexity requirement.";if(!register&&form.password.length<8)next.password="Password must be at least eight characters.";if(register&&form.password!==form.confirmPassword)next.confirmPassword="Passwords do not match.";if(register&&brand&&!form.workspaceName.trim())next.workspaceName="Organization name is required.";if(register&&!form.acceptedLegal)next.acceptedLegal="You must accept the Terms of Service and Privacy Policy to create an account.";setErrors(next);if(register)setPasswordTouched(true);return !Object.keys(next).length}
  async function submit(event){event.preventDefault();if(requestInFlight.current||loading||isRateLimited||!validate())return;requestInFlight.current=true;setLoading(true);setRequestId(null);try{await authenticatePortal(persona,mode,form);const intended=location.state?.from,validIntended=intended&&(brand?(intended.startsWith("/brand/")||intended==="/invitations/respond"):intended.startsWith("/creator/"));navigate(validIntended?intended:(brand?"/brand/discovery":"/creator/dashboard"),{replace:true})}catch(error){setRequestId(error.requestId);if(error.status===429)startRateLimit(error.retryAfter);const message=error.status===401?`Invalid credentials or this account does not have access to the ${brand?"Brand":"Creator"} portal.`:error.status===403?"This feature is not available for your account type.":error.status===409?"This email is already registered. Sign in instead.":error.status===429?"Too many attempts. Please try again later.":error.status>=500?"The service is temporarily unavailable. Please try again.":error.message;setErrors(current=>({...current,form:message}))}finally{requestInFlight.current=false;setLoading(false)}}
  const field=(name,label,type="text",props={})=><label className="block font-bold">{label}<input {...props} type={type} value={form[name]} onChange={event=>set(name,event.target.value)} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name]?`${name}-error`:undefined} className="brutal-field mt-2 w-full"/>{errors[name]&&<span id={`${name}-error`} role="alert" className="mt-1 block text-sm text-red-700">{errors[name]}</span>}</label>;

  if(restoringSession)return <main className="brutal-page flex min-h-screen items-center justify-center p-6"><p className="brutal-card p-8 font-black">Restoring your session…</p></main>;
  if(isAuthenticated)return <Navigate to={activePersona==="CREATOR"?"/creator/dashboard":"/brand/discovery"} replace/>;
  return <main className="brutal-page grid min-h-screen lg:grid-cols-2">
    <section className="hidden border-r-2 border-zinc-900 bg-yellow-300 p-12 lg:flex lg:flex-col lg:justify-between"><p className="brutal-overline">{brand?"Brand / Agency portal":"Creator portal"}</p><div><h1 className="max-w-xl text-6xl font-black leading-none tracking-[-3px]">{brand?"Build creator partnerships that perform.":"Turn your audience into a business."}</h1><p className="mt-6 max-w-lg text-lg font-medium">{brand?"Discover creators, organize campaigns, and understand performance.":"Connect Instagram, understand your reach, and grow your creator workflow."}</p></div><p className="font-mono text-sm">CREATORLINKSAI / 2026</p></section>
    <section className="flex items-center justify-center p-6 md:p-10"><form onSubmit={submit} className="brutal-card w-full max-w-md p-8" noValidate><Link to="/login" className="text-sm font-bold">← Choose portal</Link><p className="brutal-overline mt-8">{brand?(form.workspaceType==="AGENCY"?"Agency":"Brand"):"Creator"}</p><h2 className="mt-2 text-3xl font-black">{register?"Create your account":"Welcome back"}</h2><div className="mt-7 space-y-5">{field("email","Email","email",{autoComplete:"email",required:true})}<div>{field("password","Password","password",{autoComplete:register?"new-password":"current-password",required:true,onBlur:()=>register&&setPasswordTouched(true)})}{register&&<PasswordChecklist password={form.password} touched={passwordTouched}/>}</div>{register&&field("confirmPassword","Confirm password","password",{autoComplete:"new-password",required:true})}{register&&brand&&<>{field("workspaceName","Organization name","text",{maxLength:160,required:true})}<label className="block font-bold">Account type<select value={form.workspaceType} onChange={event=>set("workspaceType",event.target.value)} className="brutal-field mt-2 w-full"><option value="BRAND">Brand</option><option value="AGENCY">Agency</option></select></label></>}{register&&<div><div className={`flex items-start gap-3 border-2 p-4 text-sm ${errors.acceptedLegal?"border-red-700 bg-red-50":"border-zinc-900 bg-zinc-50"}`}><input id="accepted-legal" type="checkbox" checked={form.acceptedLegal} onChange={event=>{set("acceptedLegal",event.target.checked);if(event.target.checked)setErrors(current=>({...current,acceptedLegal:undefined}))}} aria-invalid={Boolean(errors.acceptedLegal)} aria-describedby={errors.acceptedLegal?"accepted-legal-error":undefined} className="mt-0.5 h-5 w-5 shrink-0 accent-zinc-900"/><p><label htmlFor="accepted-legal" className="cursor-pointer">I agree to the </label><Link to="/terms-of-service" target="_blank" rel="noopener noreferrer" className="font-black underline">Terms of Service</Link><label htmlFor="accepted-legal" className="cursor-pointer"> and acknowledge the </label><Link to="/privacy-policy" target="_blank" rel="noopener noreferrer" className="font-black underline">Privacy Policy</Link><label htmlFor="accepted-legal" className="cursor-pointer">.</label></p></div>{errors.acceptedLegal&&<p id="accepted-legal-error" role="alert" className="mt-2 text-sm font-bold text-red-700">{errors.acceptedLegal}</p>}</div>}</div>{errors.form&&<p role="alert" className="mt-5 border-2 border-red-700 bg-red-50 p-3 text-sm text-red-800">{errors.form}{isRateLimited&&<span className="mt-1 block font-bold">You can try again in {secondsRemaining} second{secondsRemaining===1?"":"s"}.</span>}{requestId&&<span className="mt-1 block font-mono text-xs">Support ID: {requestId}</span>}</p>}<button disabled={loading||isRateLimited||(register&&!registrationReady)} className="brutal-button mt-7 w-full">{loading?"Please wait…":register?"Create account":"Sign in"}</button><p className="mt-6 text-center text-sm">{register?"Already registered? ":"New here? "}<Link className="font-bold underline" to={brand?(register?"/brand/login":"/brand/register"):(register?"/creator/login":"/creator/register")} state={{from:location.state?.from}}>{register?"Sign in":"Create an account"}</Link></p></form></section>
  </main>
}

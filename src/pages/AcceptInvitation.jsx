import {useLayoutEffect,useState} from "react";
import {Link,useNavigate,useSearchParams} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {useWorkspace} from "../context/WorkspaceContext";
import {accountService} from "../services/accountService";
import {clearInvitationToken,readInvitationToken,rememberInvitationToken} from "../services/invitationTokenMemory";

const invalidMessage="This invitation is invalid or has already been used.";
function invitationError(error){
 const backend=String(error?.message||"");
 if(error?.status===400)return /expir/i.test(backend)?"This invitation has expired. Ask the workspace owner to resend it.":invalidMessage;
 if(error?.status===403)return /email|account/i.test(backend)?"Sign in using the email address that received this invitation.":"Workspace invitations are available only to brand or agency accounts.";
 if(error?.status===404)return invalidMessage;
 if(error?.status===429)return "Invitation requests are temporarily rate-limited. Please try again later.";
 return error?.status>=500?"The invitation service is temporarily unavailable.":invalidMessage;
}

export default function AcceptInvitation(){
 const {isAuthenticated,activePersona,token,restoringSession}=useAuth(),{reloadWorkspaces}=useWorkspace(),[params]=useSearchParams(),navigate=useNavigate();
 const [invitationToken,setInvitationToken]=useState(()=>{const incoming=params.get("token");if(incoming)rememberInvitationToken(incoming);return incoming||readInvitationToken()});
 const [busy,setBusy]=useState(false),[error,setError]=useState(null);
 useLayoutEffect(()=>{if(params.has("token"))window.history.replaceState(null,"",`${window.location.pathname}#/invitations/respond`)},[params]);
 async function act(accept){
  if(!invitationToken||busy||activePersona!=="BRAND")return;
  setBusy(true);setError(null);
  try{
   if(accept){const workspace=await accountService.accept(invitationToken,token);clearInvitationToken();setInvitationToken(null);await reloadWorkspaces();navigate("/brand/discovery",{replace:true,state:{notice:`Joined ${workspace.name}.`}})}
   else{await accountService.decline(invitationToken,token);clearInvitationToken();setInvitationToken(null);navigate("/invitations",{replace:true})}
  }catch(error){setError(invitationError(error))}finally{setBusy(false)}
 }
 if(restoringSession)return <main className="brutal-page flex min-h-screen items-center justify-center p-6"><p className="brutal-card p-8 font-black">Restoring your session…</p></main>;
 if(!invitationToken)return <main className="min-h-screen bg-bg-deep p-8 text-center"><h1 className="text-4xl">Invitation not found</h1><p className="mt-3">{invalidMessage}</p><Link to="/invitations" className="mt-5 inline-block underline">View your invitations</Link></main>;
 if(!isAuthenticated)return <main className="min-h-screen bg-bg-deep p-8"><div className="mx-auto max-w-lg rounded-2xl border bg-panel p-8 text-center"><h1 className="text-4xl">Sign in to continue</h1><p className="mt-3 text-text-secondary">Sign in using the email address that received this invitation.</p><Link to="/brand/login" state={{from:"/invitations/respond"}} className="mt-6 inline-block rounded-full bg-accent-primary px-5 py-3 text-white">Brand / Agency sign in</Link></div></main>;
 if(activePersona!=="BRAND")return <main className="min-h-screen bg-bg-deep p-8"><div className="mx-auto max-w-lg rounded-2xl border bg-panel p-8 text-center"><h1 className="text-3xl">Invitation unavailable</h1><p className="mt-3 text-text-secondary">Workspace invitations are available only to brand or agency accounts.</p><Link to="/creator/dashboard" className="mt-6 inline-block underline">Return to creator dashboard</Link></div></main>;
 return <main className="min-h-screen bg-bg-deep p-8"><div className="mx-auto max-w-lg rounded-2xl border bg-panel p-8 text-center"><p className="text-xs uppercase tracking-widest text-text-secondary">Workspace invitation</p><h1 className="mt-3 text-4xl">Respond to invitation</h1><p className="mt-3 text-text-secondary">Accepting grants this account access to the workspace. Nothing happens until you explicitly choose an action.</p>{error&&<p role="alert" className="mt-4 rounded-xl bg-red-500/10 p-3 text-red-300">{error}</p>}<div className="mt-6 flex justify-center gap-3"><button disabled={busy} onClick={()=>act(true)} className="bg-accent-primary px-5 py-3">{busy?"Please wait…":"Accept invitation"}</button><button disabled={busy} onClick={()=>act(false)} className="border px-5 py-3">Decline</button></div></div></main>;
}

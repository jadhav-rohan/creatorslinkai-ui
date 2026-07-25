import {useCallback,useEffect,useState} from "react";import {api,instagramInsightsErrorMessage} from "../api";import {useAuth} from "../context/AuthContext";import {useWorkspace} from "../context/WorkspaceContext";import {useWorkspaceAuthorization} from "../context/WorkspaceAuthorizationContext";import {connectionService} from "../services/connectionService";import {creatorDashboardService} from "../services/creatorDashboardService";import AutoDmActivityModal from "../components/AutoDmActivityModal";import AutoDmTemplateFields,{createTemplateElement,serializeTemplate,validateTemplate} from "../components/AutoDmTemplateFields";import AutoDmTemplatePreview from "../components/AutoDmTemplatePreview";import {useThemedDialog} from "../context/ThemedDialogContext";
const accountName=a=>a?.username||a?.igUsername||a?.handle||"Instagram account",support=e=>`${[403,404,502].includes(e?.status)?` ${instagramInsightsErrorMessage(e)}`:""}${e?.requestId?` Support ID: ${e.requestId}`:""}`;
const newRuleForm=()=>({mediaId:"",keyword:"",responseType:"TEXT",dmMessage:"",publicReplyMessage:"",requireFollower:false,elements:[createTemplateElement()]});
export default function CreatorAutoDm(){const {confirm}=useThemedDialog();const {token,logout}=useAuth(),{selectedWorkspace,loading:workspaceLoading}=useWorkspace(),{hasPermission,isLoading:permissionsLoading,error:permissionsError}=useWorkspaceAuthorization(),workspaceId=selectedWorkspace?.id||"",workspaceAllowed=["CREATOR","PERSONAL"].includes(selectedWorkspace?.type),canView=hasPermission("AUTO_DM_VIEW"),canEdit=hasPermission("AUTO_DM_EDIT"),[accounts,setAccounts]=useState([]),[accountsLoading,setAccountsLoading]=useState(false),[accountsError,setAccountsError]=useState(null),[selectedId,setSelectedId]=useState(""),[rules,setRules]=useState([]),[rulesLoading,setRulesLoading]=useState(false),[rulesError,setRulesError]=useState(null),[showForm,setShowForm]=useState(false),[form,setForm]=useState(newRuleForm),[formError,setFormError]=useState(""),[saving,setSaving]=useState(false),[deleting,setDeleting]=useState(""),[connecting,setConnecting]=useState(false),[notice,setNotice]=useState("");const loadAccounts=useCallback(async signal=>{if(!workspaceId||!workspaceAllowed||!canView)return;setAccountsLoading(true);setAccountsError(null);try{const x=await connectionService.listInstagram(workspaceId,token,signal),items=Array.isArray(x)?x:[];setAccounts(items);setSelectedId(current=>{const candidate=current||sessionStorage.getItem(`creatorAutoDmAccount:${workspaceId}`);return items.some(a=>a.igUserId===candidate)?candidate:items[0]?.igUserId||""})}catch(e){if(e.name==="AbortError")return;if(e.status===401)logout();else setAccountsError(e)}finally{if(!signal?.aborted)setAccountsLoading(false)}},[workspaceId,workspaceAllowed,canView,token,logout]);useEffect(()=>{setAccounts([]);setSelectedId("");setRules([]);const c=new AbortController();loadAccounts(c.signal);return()=>c.abort()},[loadAccounts]);const loadRules=useCallback(async()=>{if(!selectedId)return;setRulesLoading(true);setRulesError(null);try{const x=await api.fetchRules(selectedId,token);setRules(Array.isArray(x)?x:[])}catch(e){if(e.status===401)logout();else setRulesError(e)}finally{setRulesLoading(false)}},[selectedId,token,logout]);useEffect(()=>{setRules([]);setShowForm(false);if(selectedId){sessionStorage.setItem(`creatorAutoDmAccount:${workspaceId}`,selectedId);loadRules()}},[selectedId,workspaceId,loadRules]);async function connect(){if(connecting)return;setConnecting(true);setAccountsError(null);try{const x=await connectionService.connectInstagram(workspaceId,token);window.location.assign(x.authorizationUrl)}catch(e){if(e.status===401)logout();else setAccountsError(e);setConnecting(false)}}async function create(e){e.preventDefault();if(!canEdit||saving)return;const mediaId=form.mediaId.trim(),keyword=form.keyword.trim(),dmMessage=form.dmMessage.trim(),publicReplyMessage=form.publicReplyMessage.trim();if(!mediaId||!keyword||(form.responseType==="TEXT"&&!dmMessage)){setFormError(`Target Reel/Post, keyword${form.responseType==="TEXT"?", and private DM message":""} are required.`);return}if(form.responseType==="GENERIC_TEMPLATE"){const validationError=validateTemplate(form.elements);if(validationError){setFormError(validationError);return}}setSaving(true);setFormError("");try{const payload={mediaId,keyword,responseType:form.responseType,requireFollower:Boolean(form.requireFollower),...(publicReplyMessage?{publicReplyMessage}:{}),...(form.responseType==="GENERIC_TEMPLATE"?{elements:serializeTemplate(form.elements)}:{dmMessage})};await api.createRule(selectedId,payload,token);setForm(newRuleForm());setShowForm(false);creatorDashboardService.invalidate(workspaceId);await loadRules();setNotice("Comment Auto-DM rule created successfully.")}catch(err){if(err.status===401)logout();else setFormError(`${err.message}${support(err)}`)}finally{setSaving(false)}}async function remove(rule){if(!canEdit||deleting||!await confirm(`Delete the keyword rule “${rule.keyword}”?`,{title:"Delete Auto-DM rule",confirmLabel:"Delete"}))return;setDeleting(rule.id);setRulesError(null);try{await api.deleteRule(selectedId,rule.id,token);creatorDashboardService.invalidate(workspaceId);await loadRules();setNotice("Comment Auto-DM rule deleted.")}catch(e){if(e.status===401)logout();else setRulesError(e)}finally{setDeleting("")}}if(workspaceLoading||permissionsLoading)return <main className="brutal-page min-h-[calc(100vh-82px)] p-6 md:p-8">
<div className="mx-auto max-w-6xl brutal-card animate-pulse p-8">Restoring Comment Auto-DM access…</div>
</main>;if(!workspaceAllowed)return <main className="brutal-page min-h-[calc(100vh-82px)] p-6 md:p-8">
<div className="mx-auto max-w-3xl brutal-card p-8">
<h1 className="text-3xl font-black">Creator workspace required</h1>
<p className="mt-3">Comment Auto-DM is available only in Creator and legacy Personal workspaces.</p>
</div>
</main>;if(permissionsError||!canView)return <main className="brutal-page min-h-[calc(100vh-82px)] p-6 md:p-8">
<div className="mx-auto max-w-3xl brutal-card p-8">
<p className="brutal-overline">Access denied</p>
<h1 className="mt-3 text-3xl font-black">You don’t have permission to view Comment Auto-DM rules.</h1>
</div>
</main>;return <main className="brutal-page min-h-[calc(100vh-82px)] p-4 sm:p-6 md:p-8">
<div className="mx-auto max-w-6xl">
<header className="flex flex-col gap-5 border-b-2 border-zinc-900 pb-6 sm:flex-row sm:items-end sm:justify-between">
<div>
<p className="brutal-overline">Creator workspace</p>
<h1 className="mt-2 text-4xl font-black">Comment Auto-DM</h1>
<p className="mt-2 max-w-3xl text-zinc-600">Send one private-reply attempt when a comment on a selected Reel or post contains your keyword. A public reply is posted only when configured. This does not reply to incoming Instagram conversations.</p>
</div>{canEdit&&selectedId&&<button onClick={()=>{setFormError("");setShowForm(x=>!x)}} className="brutal-button">{showForm?"Close form":"Create Auto-DM Rule"}</button>}</header>
<div aria-live="polite">{notice&&<p role="status" className="mt-5 border-2 border-zinc-900 bg-emerald-200 p-3 font-bold">{notice}</p>}</div>{accountsLoading?<div className="brutal-card mt-7 animate-pulse p-8">Loading Instagram Login accounts…</div>:accountsError?<section className="brutal-card mt-7 p-8">
<h2 className="text-2xl font-black">Instagram accounts couldn’t be loaded.</h2>
<p role="alert" className="mt-3 text-red-700">{accountsError.message}{support(accountsError)}</p>
<button onClick={()=>loadAccounts()} className="brutal-button mt-5">Retry accounts</button>
</section>:!accounts.length?<section className="brutal-card mt-7 bg-yellow-200 p-8">
<h2 className="text-2xl font-black">Connect Instagram to create Comment Auto-DM rules.</h2>
<p className="mt-3">Connect an Instagram Login account. Insights and analytics snapshots are not required.</p>
<button onClick={connect} disabled={connecting} className="mt-6 min-h-13 border-2 border-zinc-900 bg-white px-6 py-3 font-black shadow-[4px_4px_0_#18181b]">{connecting?"Opening Instagram…":"Connect Instagram"}</button>
</section>:<>
<div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
<label className="font-bold">Instagram account<select value={selectedId} onChange={e=>setSelectedId(e.target.value)} className="brutal-field mt-2 block min-w-64">{accounts.map(a=>
<option key={a.igUserId} value={a.igUserId}>@{accountName(a)}</option>)}</select>
</label>{!canEdit&&<p className="border-2 border-zinc-900 bg-sky-100 p-3 font-bold">Read-only access</p>}</div>{showForm&&canEdit&&<form onSubmit={create} className="brutal-card mt-7 bg-yellow-50 p-5 sm:p-7">
<h2 className="text-2xl font-black">New keyword rule</h2>
<p className="mt-2 text-sm text-zinc-600">The keyword is matched against comments on the target Reel/Post. Each matching comment receives one private-reply attempt.</p>
<div className="mt-6 grid gap-5 sm:grid-cols-2">
<ReelSelect igUserId={selectedId} token={token} value={form.mediaId} onChange={mediaId=>setForm(x=>({...x,mediaId}))} logout={logout}/>
<label className="block font-bold">Keyword *<input value={form.keyword} onChange={e=>setForm(x=>({...x,keyword:e.target.value}))} required className="brutal-field mt-2 w-full"/>
</label>
<label className="block font-bold sm:col-span-2">Response type<select value={form.responseType} onChange={e=>setForm(x=>({...x,responseType:e.target.value}))} className="brutal-field mt-2 w-full sm:max-w-sm"><option value="TEXT">Text message</option><option value="GENERIC_TEMPLATE">Generic template</option></select>
</label>
<div className="sm:col-span-2"><label className="flex cursor-pointer items-start gap-3 border-2 border-zinc-900 bg-white p-4"><input type="checkbox" role="switch" checked={form.requireFollower} onChange={e=>setForm(x=>({...x,requireFollower:e.target.checked}))} className="mt-0.5 h-5 w-5 shrink-0 accent-zinc-900"/><span><span className="block font-black">Require users to follow me</span><span className="mt-1 block text-sm font-normal text-zinc-600">Commenters must follow your Instagram account and confirm before receiving the configured content.</span></span></label>{form.requireFollower&&<p className="mt-3 border-2 border-zinc-900 bg-sky-100 p-4 text-sm font-bold">The commenter will first receive a message asking them to follow your account. After following, they must tap ‘I've followed’. CreatorLinksAI will verify the follow before sending your configured reply.</p>}</div>
{form.responseType==="TEXT"?<label className="block font-bold">Private DM message *<textarea value={form.dmMessage} onChange={e=>setForm(x=>({...x,dmMessage:e.target.value}))} required rows={5} className="brutal-field mt-2 w-full"/></label>:<div className="border-2 border-zinc-900 bg-emerald-100 p-4 text-sm font-bold">{form.requireFollower?"The carousel is held until the commenter taps ‘I've followed’ and CreatorLinksAI verifies the follow.":"The carousel is sent immediately as the private reply when the keyword comment is received."}</div>}
<label className="block font-bold">Public comment reply (optional)<textarea value={form.publicReplyMessage} onChange={e=>setForm(x=>({...x,publicReplyMessage:e.target.value}))} rows={5} className="brutal-field mt-2 w-full"/>
</label>
</div>{form.responseType==="GENERIC_TEMPLATE"&&<><AutoDmTemplateFields elements={form.elements} onChange={elements=>setForm(current=>({...current,elements}))}/><AutoDmTemplatePreview elements={form.elements}/></>}{formError&&<p role="alert" className="mt-4 border-2 border-red-700 bg-red-50 p-3 text-red-800">{formError}</p>}<button type="submit" disabled={saving} className="brutal-button mt-5">{saving?"Creating rule…":"Create Rule"}</button>
</form>}<section className="mt-7">
<div className="flex items-end justify-between gap-4">
<div>
<p className="brutal-overline">Keyword rules</p>
<h2 className="mt-2 text-2xl font-black">Rules for @{accountName(accounts.find(a=>a.igUserId===selectedId))}</h2>
</div>{rulesError&&<button onClick={loadRules} className="font-black underline">Retry rules</button>}</div>{rulesLoading?<div className="brutal-card mt-5 animate-pulse p-8">Loading Comment Auto-DM rules…</div>:rulesError?<div role="alert" className="brutal-card mt-5 border-red-700 p-6 text-red-800">
<h3 className="font-black">Rules couldn’t be loaded.</h3>
<p className="mt-2">{rulesError.message}{support(rulesError)}</p>
</div>:!rules.length?<div className="brutal-card mt-5 p-8 text-center">
<h3 className="text-2xl font-black">No Comment Auto-DM rules yet.</h3>
<p className="mx-auto mt-3 max-w-xl text-zinc-600">Create a rule to send a private reply when someone comments a matching keyword on a selected Reel or post.</p>{canEdit&&<button onClick={()=>setShowForm(true)} className="brutal-button mt-6">Create Auto-DM Rule</button>}</div>:<div className="mt-5 grid gap-5 md:grid-cols-2">{rules.map(rule=>
<article key={rule.id} className="brutal-card min-w-0 p-5">
<div className="flex items-start justify-between gap-3">
<div>
<p className="brutal-overline">Keyword rule</p>
<h3 className="mt-2 break-words text-2xl font-black">“{rule.keyword}”</h3>
</div>
<div className="flex flex-wrap justify-end gap-2">{rule.requireFollower===true&&<span className="border border-zinc-900 bg-amber-200 px-2 py-1 text-xs font-black">Follow required</span>}<span className={`border border-zinc-900 px-2 py-1 text-xs font-black ${rule.responseType==="GENERIC_TEMPLATE"?"bg-violet-200":"bg-sky-200"}`}>{rule.responseType==="GENERIC_TEMPLATE"?"Generic Template":"Text"}</span><span className={`border border-zinc-900 px-2 py-1 text-xs font-black ${rule.active===false?"bg-zinc-200":"bg-emerald-200"}`}>{rule.active===false?"INACTIVE":"ACTIVE"}</span></div>
</div>
<dl className="mt-5 space-y-4 text-sm">
<div>
<dt className="font-bold text-zinc-500">Target Reel/Post</dt>
<dd className="break-all font-mono">{rule.mediaId}</dd>
</div>
{rule.responseType!=="GENERIC_TEMPLATE"&&<div>
<dt className="font-bold text-zinc-500">Private DM message</dt>
<dd className="mt-1 whitespace-pre-wrap border-2 border-zinc-900 bg-zinc-50 p-3">{rule.dmMessage}</dd>
</div>}
<div>
<dt className="font-bold text-zinc-500">Public comment reply</dt>
<dd className="mt-1 whitespace-pre-wrap">{rule.publicReplyMessage||"Not configured"}</dd>
</div>
<div>
<dt className="font-bold text-zinc-500">Created</dt>
<dd>{rule.createdAt?new Date(rule.createdAt).toLocaleString():"—"}</dd>
</div>
</dl>
{rule.responseType==="GENERIC_TEMPLATE"&&<AutoDmTemplatePreview elements={Array.isArray(rule.elements)?rule.elements:[]} collapsible/>}
<div className="mt-4 flex flex-wrap items-center gap-3 border-t-2 border-zinc-900 pt-4"><AutoDmActivityModal igUserId={selectedId} rule={rule} token={token} logout={logout}/>{canEdit&&<button onClick={()=>remove(rule)} disabled={deleting===rule.id} className="border-2 border-red-700 bg-white px-4 py-2 text-sm font-black text-red-800">{deleting===rule.id?"Deleting…":"Delete rule"}</button>}</div></article>)}</div>}</section>
</>}</div>
</main>}
function ReelSelect({igUserId,token,value,onChange,logout}){const [reels,setReels]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(null),[version,setVersion]=useState(0);useEffect(()=>{let active=true;setLoading(true);setError(null);api.getInsights(igUserId,token,20).then(x=>{if(active)setReels(Array.isArray(x?.reels)?x.reels:[])}).catch(e=>{if(!active)return;if(e.status===401)logout();else setError(e)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[igUserId,token,logout,version]);if(loading)return <label className="block font-bold">Target Reel/Post *<select disabled className="brutal-field mt-2 w-full"><option>Loading available Reels…</option></select></label>;if(error)return <div><label className="block font-bold">Target Reel/Post media ID *<input value={value} onChange={e=>onChange(e.target.value)} required className="brutal-field mt-2 w-full"/></label><p className="mt-2 text-sm text-red-700">Available Reels couldn’t be loaded.{support(error)}</p><button type="button" onClick={()=>setVersion(x=>x+1)} className="mt-2 font-black underline">Retry Reel list</button></div>;if(!reels.length)return <div><label className="block font-bold">Target Reel/Post media ID *<input value={value} onChange={e=>onChange(e.target.value)} required className="brutal-field mt-2 w-full"/></label><p className="mt-2 text-sm text-zinc-600">No Reels were returned. You can enter a media ID manually.</p></div>;return <label className="block font-bold">Target Reel/Post *<select value={value} onChange={e=>onChange(e.target.value)} required className="brutal-field mt-2 w-full"><option value="">Select a Reel or post</option>{reels.map(reel=><option key={reel.mediaId} value={reel.mediaId}>{reel.caption?.trim()?`${reel.caption.slice(0,70)}${reel.caption.length>70?"…":""}`:`Reel/Post · ${reel.mediaId}`}</option>)}</select><span className="mt-2 block text-xs font-normal text-zinc-500">Available media is loaded only while this form is open.</span></label>}

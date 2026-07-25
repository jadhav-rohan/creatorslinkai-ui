import {useCallback,useEffect,useState} from "react";import {Check,ExternalLink,Film,Image as ImageIcon,Images} from "lucide-react";import {api,instagramInsightsErrorMessage} from "../api";import {useAuth} from "../context/AuthContext";import {useWorkspace} from "../context/WorkspaceContext";import {useWorkspaceAuthorization} from "../context/WorkspaceAuthorizationContext";import {connectionService} from "../services/connectionService";import {creatorDashboardService} from "../services/creatorDashboardService";import AutoDmActivityModal from "../components/AutoDmActivityModal";import AutoDmTemplateFields,{createTemplateElement,serializeTemplate,validateTemplate} from "../components/AutoDmTemplateFields";import AutoDmTemplatePreview from "../components/AutoDmTemplatePreview";import {useThemedDialog} from "../context/ThemedDialogContext";
const accountName=a=>a?.username||a?.igUsername||a?.handle||"Instagram account",support=e=>`${[403,404,502].includes(e?.status)?` ${instagramInsightsErrorMessage(e)}`:""}${e?.requestId?` Support ID: ${e.requestId}`:""}`;
const newRuleForm=()=>({mediaId:"",keyword:"",responseType:"TEXT",dmMessage:"",publicReplyMessage:"",requireFollower:false,elements:[createTemplateElement()]});
export default function CreatorAutoDm(){const {confirm}=useThemedDialog();const {token,logout}=useAuth(),{selectedWorkspace,loading:workspaceLoading}=useWorkspace(),{hasPermission,isLoading:permissionsLoading,error:permissionsError}=useWorkspaceAuthorization(),workspaceId=selectedWorkspace?.id||"",workspaceAllowed=["CREATOR","PERSONAL"].includes(selectedWorkspace?.type),canView=hasPermission("AUTO_DM_VIEW"),canEdit=hasPermission("AUTO_DM_EDIT"),[accounts,setAccounts]=useState([]),[accountsLoading,setAccountsLoading]=useState(false),[accountsError,setAccountsError]=useState(null),[selectedId,setSelectedId]=useState(""),[rules,setRules]=useState([]),[rulesLoading,setRulesLoading]=useState(false),[rulesError,setRulesError]=useState(null),[showForm,setShowForm]=useState(false),[form,setForm]=useState(newRuleForm),[formError,setFormError]=useState(""),[saving,setSaving]=useState(false),[deleting,setDeleting]=useState(""),[connecting,setConnecting]=useState(false),[notice,setNotice]=useState("");const loadAccounts=useCallback(async signal=>{if(!workspaceId||!workspaceAllowed||!canView)return;setAccountsLoading(true);setAccountsError(null);try{const x=await connectionService.listInstagram(workspaceId,token,signal),items=Array.isArray(x)?x:[];setAccounts(items);setSelectedId(current=>{const candidate=current||sessionStorage.getItem(`creatorAutoDmAccount:${workspaceId}`);return items.some(a=>a.igUserId===candidate)?candidate:items[0]?.igUserId||""})}catch(e){if(e.name==="AbortError")return;if(e.status===401)logout();else setAccountsError(e)}finally{if(!signal?.aborted)setAccountsLoading(false)}},[workspaceId,workspaceAllowed,canView,token,logout]);useEffect(()=>{setAccounts([]);setSelectedId("");setRules([]);const c=new AbortController();loadAccounts(c.signal);return()=>c.abort()},[loadAccounts]);const loadRules=useCallback(async()=>{if(!selectedId)return;setRulesLoading(true);setRulesError(null);try{const x=await api.fetchRules(selectedId,token);setRules(Array.isArray(x)?x:[])}catch(e){if(e.status===401)logout();else setRulesError(e)}finally{setRulesLoading(false)}},[selectedId,token,logout]);useEffect(()=>{setRules([]);setShowForm(false);if(selectedId){sessionStorage.setItem(`creatorAutoDmAccount:${workspaceId}`,selectedId);loadRules()}},[selectedId,workspaceId,loadRules]);async function connect(){if(connecting)return;setConnecting(true);setAccountsError(null);try{const x=await connectionService.connectInstagram(workspaceId,token);window.location.assign(x.authorizationUrl)}catch(e){if(e.status===401)logout();else setAccountsError(e);setConnecting(false)}}async function create(e){e.preventDefault();if(!canEdit||saving)return;const mediaId=form.mediaId.trim(),keyword=form.keyword.trim(),dmMessage=form.dmMessage.trim(),publicReplyMessage=form.publicReplyMessage.trim();if(!mediaId){setFormError("Select a Reel or post for this Auto-DM rule.");return}if(!keyword||(form.responseType==="TEXT"&&!dmMessage)){setFormError(`Keyword${form.responseType==="TEXT"?" and private DM message":""} are required.`);return}if(form.responseType==="GENERIC_TEMPLATE"){const validationError=validateTemplate(form.elements);if(validationError){setFormError(validationError);return}}setSaving(true);setFormError("");try{const payload={mediaId,keyword,responseType:form.responseType,requireFollower:Boolean(form.requireFollower),...(publicReplyMessage?{publicReplyMessage}:{}),...(form.responseType==="GENERIC_TEMPLATE"?{elements:serializeTemplate(form.elements)}:{dmMessage})};await api.createRule(selectedId,payload,token);setForm(newRuleForm());setShowForm(false);creatorDashboardService.invalidate(workspaceId);await loadRules();setNotice("Comment Auto-DM rule created successfully.")}catch(err){if(err.status===401)logout();else if(err.message?.includes("Selected Instagram media does not belong to this creator account"))setFormError("This post is no longer available for the connected Instagram account. Refresh your media and select another post.");else setFormError(`${err.message}${support(err)}`)}finally{setSaving(false)}}async function remove(rule){if(!canEdit||deleting||!await confirm(`Delete the keyword rule “${rule.keyword}”?`,{title:"Delete Auto-DM rule",confirmLabel:"Delete"}))return;setDeleting(rule.id);setRulesError(null);try{await api.deleteRule(selectedId,rule.id,token);creatorDashboardService.invalidate(workspaceId);await loadRules();setNotice("Comment Auto-DM rule deleted.")}catch(e){if(e.status===401)logout();else setRulesError(e)}finally{setDeleting("")}}if(workspaceLoading||permissionsLoading)return <main className="brutal-page min-h-[calc(100vh-82px)] p-6 md:p-8">
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
</label>{!canEdit&&<p className="border-2 border-zinc-900 bg-sky-100 p-3 font-bold">Read-only access</p>}</div>{showForm&&canEdit&&<form onSubmit={create} className="brutal-card mt-7 bg-white p-5 sm:p-7">
<h2 className="text-2xl font-black">New keyword rule</h2>
<p className="mt-2 text-sm text-zinc-600">The keyword is matched against comments on the target Reel/Post. Each matching comment receives one private-reply attempt.</p>
<div className="mt-6 grid gap-5 sm:grid-cols-2">
<MediaPicker igUserId={selectedId} token={token} value={form.mediaId} onChange={mediaId=>setForm(x=>({...x,mediaId}))} logout={logout}/>
<div className="sm:col-span-2 border-t-2 border-zinc-900 pt-5"><p className="brutal-overline">Automation settings</p><h3 className="mt-1 text-xl font-black">Trigger and response</h3></div>
<label className="block font-bold">Keyword *<input value={form.keyword} onChange={e=>setForm(x=>({...x,keyword:e.target.value}))} required className="brutal-field mt-2 w-full"/>
</label>
<label className="block font-bold">Response type<select value={form.responseType} onChange={e=>setForm(x=>({...x,responseType:e.target.value}))} className="brutal-field mt-2 w-full"><option value="TEXT">Text message</option><option value="GENERIC_TEMPLATE">Generic template</option></select>
</label>
<div className="sm:col-span-2"><button type="button" role="switch" aria-checked={form.requireFollower} onClick={()=>setForm(x=>({...x,requireFollower:!x.requireFollower}))} className={`flex w-full items-center gap-4 border-2 border-zinc-900 p-4 text-left transition-colors ${form.requireFollower?"bg-yellow-100":"bg-zinc-50"}`}><span aria-hidden="true" className={`relative h-7 w-12 shrink-0 border-2 border-zinc-900 ${form.requireFollower?"bg-yellow-300":"bg-white"}`}><span className={`absolute top-0.5 h-5 w-5 border border-zinc-900 bg-zinc-900 transition-transform ${form.requireFollower?"translate-x-5":"translate-x-0.5"}`}/></span><span><span className="block font-black">Require users to follow me</span><span className="mt-1 block text-sm font-normal text-zinc-600">Commenters must follow your Instagram account and confirm before receiving the configured content.</span></span></button>{form.requireFollower&&<p className="mt-3 border-l-4 border-zinc-900 bg-sky-100 p-4 text-sm font-bold">The commenter will first receive a message asking them to follow your account. After following, they must tap ‘I've followed’. CreatorLinksAI will verify the follow before sending your configured reply.</p>}</div>
{form.responseType==="TEXT"?<label className="block font-bold">Private DM message *<textarea value={form.dmMessage} onChange={e=>setForm(x=>({...x,dmMessage:e.target.value}))} required rows={5} className="brutal-field mt-2 w-full"/></label>:<div className="border-2 border-zinc-900 bg-emerald-100 p-4 text-sm font-bold">{form.requireFollower?"The carousel is held until the commenter taps ‘I've followed’ and CreatorLinksAI verifies the follow.":"The carousel is sent immediately as the private reply when the keyword comment is received."}</div>}
<label className="block font-bold">Public comment reply (optional)<textarea value={form.publicReplyMessage} onChange={e=>setForm(x=>({...x,publicReplyMessage:e.target.value}))} rows={5} className="brutal-field mt-2 w-full"/>
</label>
</div>{form.responseType==="GENERIC_TEMPLATE"&&<><AutoDmTemplateFields elements={form.elements} onChange={elements=>setForm(current=>({...current,elements}))}/><AutoDmTemplatePreview elements={form.elements}/></>}{formError&&<p role="alert" className="mt-5 border-2 border-red-700 bg-red-50 p-3 text-red-800">{formError}</p>}<div className="mt-6 flex justify-end border-t-2 border-zinc-900 pt-5"><button type="submit" disabled={saving} className="brutal-button min-w-40">{saving?"Creating rule…":"Create Rule"}</button></div>
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
const contentLabels={REEL:"Reel",POST:"Post",CAROUSEL:"Carousel",VIDEO:"Video"};

function MediaPlaceholder({contentType}){
  const Icon=contentType==="CAROUSEL"?Images:contentType==="POST"?ImageIcon:Film;
  return <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-200 text-zinc-600"><Icon size={34}/><span className="mt-2 text-xs font-black">{contentLabels[contentType]||"Instagram media"}</span></div>;
}

function MediaPreview({item,failed,onFail}){
  const source=item.thumbnailUrl||item.mediaUrl;
  if(!source||failed)return <MediaPlaceholder contentType={item.contentType}/>;
  if(!item.thumbnailUrl&&item.mediaType==="VIDEO")return <video src={source} muted playsInline preload="metadata" onError={onFail} className="h-full w-full object-cover"/>;
  return <img src={source} alt="" loading="lazy" onError={onFail} className="h-full w-full object-cover"/>;
}

function MediaPicker({igUserId,token,value,onChange,logout}){
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [filter,setFilter]=useState("ALL");
  const [failed,setFailed]=useState(()=>new Set());
  const [version,setVersion]=useState(0);

  useEffect(()=>{
    const controller=new AbortController();
    setLoading(true);setError(null);
    api.getEligibleAutoDmMedia(igUserId,token,50,{signal:controller.signal}).then(result=>{
      const media=Array.isArray(result)?result:[];
      setItems(media);setFailed(new Set());
      if(value&&!media.some(item=>item.mediaId===value))onChange("");
    }).catch(err=>{if(err.name==="AbortError")return;if(err.status===401)logout();else setError(err)}).finally(()=>{if(!controller.signal.aborted)setLoading(false)});
    return()=>controller.abort();
  },[igUserId,token,logout,version]);

  const visible=items.filter(item=>filter==="ALL"||filter==="REELS"?filter==="ALL"||item.contentType==="REEL":["POST","CAROUSEL","VIDEO"].includes(item.contentType));
  const refresh=()=>{onChange("");setVersion(current=>current+1)};
  if(loading)return <div className="sm:col-span-2 border-2 border-zinc-900 bg-zinc-50 p-4 sm:p-5"><p className="font-black">Choose Instagram media</p><div className="mt-4 flex gap-3 overflow-hidden">{[1,2,3,4].map(item=><div key={item} className="h-60 w-40 shrink-0 animate-pulse border-2 border-zinc-900 bg-zinc-200 sm:w-48"/>)}</div></div>;
  if(error)return <div className="sm:col-span-2 border-2 border-red-700 bg-red-50 p-5"><p role="alert" className="font-bold text-red-800">Eligible Instagram media couldn’t be loaded.{support(error)}</p><button type="button" onClick={refresh} className="mt-3 border-2 border-zinc-900 bg-white px-4 py-2 font-black">Retry</button></div>;
  return <div className="sm:col-span-2 border-2 border-zinc-900 bg-zinc-50 p-4 sm:p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="brutal-overline">Step 1</p><h3 className="mt-1 text-xl font-black">Choose Instagram media *</h3><p className="mt-1 text-sm text-zinc-600">Select one Reel or feed post to watch for comments.</p></div><button type="button" onClick={refresh} className="w-fit border-2 border-zinc-900 bg-white px-4 py-2 text-sm font-black">Refresh media</button></div><div className="mt-4 inline-flex border-2 border-zinc-900 bg-white p-1" role="group" aria-label="Filter Instagram media">{[["ALL","All"],["REELS","Reels"],["POSTS","Posts"]].map(([key,label])=><button key={key} type="button" aria-pressed={filter===key} onClick={()=>setFilter(key)} className={`px-4 py-2 text-sm font-black ${filter===key?"bg-yellow-300":"bg-white hover:bg-zinc-100"}`}>{label}</button>)}</div>{!items.length?<div className="mt-4 border-2 border-dashed border-zinc-400 bg-white p-8 text-center"><p className="font-black">No eligible Instagram media found. Publish a Reel or feed post, then refresh this page.</p><button type="button" onClick={refresh} className="brutal-button mt-5">Refresh media</button></div>:!visible.length?<div className="mt-4 border-2 border-dashed border-zinc-400 bg-white p-7 text-center text-zinc-600">No media matches this filter.</div>:<div className="mt-4 flex snap-x gap-4 overflow-x-auto px-1 pb-3 pt-1">{visible.map(item=>{const selected=value===item.mediaId,caption=item.caption?.trim()||"No caption";return <article key={item.mediaId} className={`relative w-40 shrink-0 snap-start overflow-hidden border-2 border-zinc-900 bg-white transition-transform sm:w-48 ${selected?"-translate-y-1 bg-yellow-50 shadow-[5px_5px_0_#18181b]":""}`}><button type="button" onClick={()=>onChange(item.mediaId)} aria-pressed={selected} className="block w-full text-left"><div className="relative aspect-square border-b-2 border-zinc-900"><MediaPreview item={item} failed={failed.has(item.mediaId)} onFail={()=>setFailed(current=>new Set(current).add(item.mediaId))}/>{selected&&<span className="absolute bottom-2 left-2 flex items-center gap-1 border-2 border-zinc-900 bg-yellow-300 px-2 py-1 text-[10px] font-black"><Check size={12}/> Selected</span>}</div><div className="p-3"><span className="border border-zinc-900 bg-sky-100 px-2 py-1 text-[10px] font-black">{contentLabels[item.contentType]||item.contentType||"Media"}</span><p className="mt-3 line-clamp-2 min-h-10 text-sm font-bold">{caption}</p><p className="mt-2 text-xs text-zinc-500">{item.publishedAt?new Date(item.publishedAt).toLocaleDateString():"Date unavailable"}</p></div></button>{item.permalink&&<a href={item.permalink} target="_blank" rel="noreferrer" onClick={event=>event.stopPropagation()} aria-label={`View ${contentLabels[item.contentType]||"media"} on Instagram`} className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center border-2 border-zinc-900 bg-white shadow-[2px_2px_0_#18181b]"><ExternalLink size={16}/></a>}</article>})}</div>}</div>;
}

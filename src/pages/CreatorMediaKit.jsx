import {useEffect,useMemo,useRef,useState} from "react";
import {api} from "../api";
import {useAuth} from "../context/AuthContext";
import {useWorkspace} from "../context/WorkspaceContext";
import {useWorkspaceAuthorization} from "../context/WorkspaceAuthorizationContext";
import {useCreatorDashboard} from "../hooks/useCreatorDashboard";
import {useMediaKit} from "../hooks/useMediaKit";
import {mediaKitService} from "../services/mediaKitService";
import {creatorDashboardService} from "../services/creatorDashboardService";
import {useThemedDialog} from "../context/ThemedDialogContext";

const priceFields=[["reel","Reel"],["story","Story"],["post","Post"],["video","Video"],["collaboration","Collaboration"]];
const compact=new Intl.NumberFormat(undefined,{notation:"compact",maximumFractionDigits:1});
const collaborationsFrom=value=>{
  if(Array.isArray(value.brandCollaborations)&&value.brandCollaborations.length){
    return value.brandCollaborations.map(item=>({
      brandName:String(item?.brandName||""),
      evidenceUrl:String(item?.evidenceUrl||""),
    }));
  }
  return (value.brandsWorkedWith||[]).map(brandName=>({brandName:String(brandName),evidenceUrl:""}));
};
const draftFrom=value=>({
  displayName:value.preview?.displayName||"",
  about:value.about||"",
  currency:value.currency||"INR",
  pricing:Object.fromEntries(priceFields.map(([key])=>[key,value.pricing?.[key]==null?"":String(value.pricing[key])])),
  brandCollaborations:collaborationsFrom(value),
  email:value.contact?.email||"",
  phone:value.contact?.phone||"",
});
const serialize=draft=>{
  const brandCollaborations=draft.brandCollaborations.map(item=>({
    brandName:item.brandName.trim(),
    evidenceUrl:item.evidenceUrl.trim()||null,
  }));
  return {
    displayName:draft.displayName.trim()||null,
    about:draft.about||null,
    currency:draft.currency||null,
    pricing:Object.fromEntries(priceFields.map(([key])=>[key,draft.pricing[key]===""?null:Number(draft.pricing[key])])),
    brandsWorkedWith:brandCollaborations.map(item=>item.brandName),
    brandCollaborations,
    email:draft.email||null,
    phone:draft.phone||null,
  };
};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const money=(value,currency)=>value===""||value==null?"—":`${currency} ${Number(value).toLocaleString(undefined,{maximumFractionDigits:2})}`;
const metric=value=>value==null?"—":compact.format(value);
const initials=value=>(value||"Creator").replace(/^@/,"").split(/\s+/).map(part=>part[0]).join("").slice(0,2).toUpperCase();

function Section({title,children}){return <section className="border-t-2 border-zinc-900 pt-6 first:border-0 first:pt-0"><h2 className="text-xl font-black">{title}</h2><div className="mt-4">{children}</div></section>}
function FieldError({children}){return children?<p role="alert" className="mt-1 text-sm font-bold text-red-700">{children}</p>:null}

function ProfileAvatar({primaryUrl,fallbackUrl,display}){
  const [failed,setFailed]=useState([]);
  const url=[primaryUrl,fallbackUrl].find(item=>item&&!failed.includes(item));
  return <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border-2 border-zinc-900 bg-sky-200 text-xl font-black">
    {url?<img src={url} alt={`${display} profile`} onError={()=>setFailed(current=>[...current,url])} className="h-full w-full object-cover"/>:initials(display)}
  </div>;
}

function Preview({server,draft,userProfile}){
  const preview=server.preview||{},display=draft.displayName||preview.displayName||userProfile?.displayName||"Creator",handle=preview.handle||"@creator";
  return <aside className="brutal-card lg:sticky lg:top-28 lg:self-start">
    <div className="border-b-2 border-zinc-900 bg-yellow-300 p-5"><p className="brutal-overline">Live preview</p><p className="mt-1 text-sm font-bold">Stored metrics + your current draft</p></div>
    <div className="p-6">
      <div className="flex items-center gap-4"><ProfileAvatar primaryUrl={userProfile?.profilePictureUrl} fallbackUrl={preview.profilePictureUrl} display={display}/><div><h2 className="text-2xl font-black">{display}</h2><p className="font-mono text-zinc-600">{handle}</p></div></div>
      <dl className="mt-6 grid grid-cols-2 border-2 border-zinc-900 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        {[["Followers",metric(preview.followers)],["Engagement",preview.engagementRate==null?"—":`${Number(preview.engagementRate).toLocaleString(undefined,{maximumFractionDigits:2})}%`],["Avg. views",metric(preview.averageViews)],["Avg. likes",metric(preview.averageLikes)]].map(([label,value])=><div key={label} className="border-zinc-900 p-3 [&:not(:last-child)]:border-r-2"><dt className="text-xs text-zinc-500">{label}</dt><dd className="mt-1 font-mono font-bold">{value}</dd></div>)}
      </dl>
      {preview.metricsCapturedAt&&<p className="mt-2 text-xs text-zinc-500">Metrics captured {new Date(preview.metricsCapturedAt).toLocaleString()}</p>}
      <div className="mt-7 space-y-6">
        <div><p className="brutal-overline">About</p><p className="mt-2 whitespace-pre-wrap text-sm">{draft.about||"Tell brands what makes your work distinctive."}</p></div>
        <div><p className="brutal-overline">Pricing</p><dl className="mt-3 grid grid-cols-2 gap-3">{priceFields.map(([key,label])=><div key={key}><dt className="text-sm text-zinc-500">{label}</dt><dd className="font-mono font-bold">{money(draft.pricing[key],draft.currency)}</dd></div>)}</dl></div>
        <div>
          <p className="brutal-overline">Brands worked with</p>
          {draft.brandCollaborations.length?<ul className="mt-2 space-y-2">{draft.brandCollaborations.map((item,index)=><li key={`${item.brandName}-${index}`} className="flex flex-wrap items-center justify-between gap-2 border border-zinc-900 bg-zinc-100 px-3 py-2 text-sm"><strong>{item.brandName||"Unnamed brand"}</strong>{item.evidenceUrl&&<a href={item.evidenceUrl} target="_blank" rel="noopener noreferrer" className="font-black underline">View work</a>}</li>)}</ul>:<span className="mt-2 block text-sm text-zinc-500">No brands added yet.</span>}
        </div>
        <div><p className="brutal-overline">Contact</p><p className="mt-2 break-all text-sm">{draft.email||"Email not provided"}</p><p className="mt-1 break-all text-sm">{draft.phone||"Phone not provided"}</p></div>
      </div>
    </div>
  </aside>;
}

function downloadBlob({blob,disposition},handle){
  const match=disposition?.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
  const filename=match?decodeURIComponent(match[1].replace(/"$/,"")):`${(handle||"creator").replace(/^@/,"")}-media-kit.pdf`;
  const pdfBlob=blob.type==="application/pdf"?blob:new Blob([blob],{type:"application/pdf"});
  const url=URL.createObjectURL(pdfBlob),anchor=document.createElement("a");
  anchor.href=url;
  anchor.download=filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export default function CreatorMediaKit(){
  const {confirm}=useThemedDialog();
  const {token,profile,logout}=useAuth();
  const {selectedWorkspace,setSelectedWorkspaceId}=useWorkspace();
  const {hasPermission,isLoading:permissionsLoading,error:permissionsError}=useWorkspaceAuthorization();
  const workspaceId=selectedWorkspace?.id||"",workspaceAllowed=["CREATOR","PERSONAL"].includes(selectedWorkspace?.type);
  const canView=hasPermission("MEDIA_KIT_VIEW"),canEdit=hasPermission("MEDIA_KIT_EDIT"),canExport=hasPermission("MEDIA_KIT_EXPORT");
  const [igUserId,setIgUserId]=useState(()=>workspaceId?sessionStorage.getItem(`creatorDashboardAccount:${workspaceId}`)||"":"");
  const [saved,setSaved]=useState(null),[draft,setDraft]=useState(null),[errors,setErrors]=useState({}),[saving,setSaving]=useState(false),[exporting,setExporting]=useState(false),[notice,setNotice]=useState(""),[actionError,setActionError]=useState("");
  const workspaceRef=useRef(workspaceId),enabled=workspaceAllowed&&canView;
  const dashboard=useCreatorDashboard({workspaceId,igUserId:igUserId||null,token,enabled,onUnauthorized:logout});
  const kit=useMediaKit({workspaceId,igUserId:igUserId||null,token,enabled,onUnauthorized:logout});

  useEffect(()=>setIgUserId(workspaceId?sessionStorage.getItem(`creatorDashboardAccount:${workspaceId}`)||"":"") ,[workspaceId]);
  useEffect(()=>{if(!kit.data)return;setSaved(kit.data);setDraft(draftFrom(kit.data));setErrors({});setNotice("");setActionError("")},[kit.data]);
  const dirty=useMemo(()=>Boolean(saved&&draft&&!same(serialize(draft),serialize(draftFrom(saved)))),[saved,draft]);
  useEffect(()=>{if(workspaceRef.current===workspaceId)return;const previous=workspaceRef.current,target=workspaceId;if(dirty&&previous){setSelectedWorkspaceId(previous);confirm("Discard unsaved Media Kit changes and switch workspace?",{title:"Discard Media Kit changes",confirmLabel:"Discard and switch"}).then(approved=>{if(approved){workspaceRef.current=target;setSelectedWorkspaceId(target)}});return}workspaceRef.current=workspaceId},[workspaceId,dirty,setSelectedWorkspaceId,confirm]);
  useEffect(()=>{const warn=event=>{if(!dirty)return;event.preventDefault();event.returnValue=""};window.addEventListener("beforeunload",warn);return()=>window.removeEventListener("beforeunload",warn)},[dirty]);

  function update(key,value){if(!canEdit)return;setDraft(current=>({...current,[key]:value}));setNotice("")}
  function updatePrice(key,value){if(value!==""&&!/^\d*(\.\d{0,2})?$/.test(value))return;setDraft(current=>({...current,pricing:{...current.pricing,[key]:value}}));setNotice("")}
  function addBrand(){if(!canEdit||draft.brandCollaborations.length>=20)return;setDraft(current=>({...current,brandCollaborations:[...current.brandCollaborations,{brandName:"",evidenceUrl:""}]}));setErrors(current=>({...current,brands:undefined}))}
  function updateBrand(index,key,value){setDraft(current=>({...current,brandCollaborations:current.brandCollaborations.map((item,itemIndex)=>itemIndex===index?{...item,[key]:value}:item)}));setErrors(current=>({...current,[`brand-${index}-${key}`]:undefined,brands:undefined}))}
  function removeBrand(index){setDraft(current=>({...current,brandCollaborations:current.brandCollaborations.filter((_,itemIndex)=>itemIndex!==index)}));setErrors({})}
  function validate(){
    const next={};
    if(!draft.displayName.trim())next.displayName="Media Kit name is required.";
    else if(draft.displayName.trim().length>160)next.displayName="Media Kit name must be 160 characters or fewer.";
    if(draft.about.length>4000)next.about="About must be 4,000 characters or fewer.";
    if(draft.currency&&!/^[A-Za-z]{3}$/.test(draft.currency))next.currency="Use a three-letter currency code.";
    for(const [key,label] of priceFields){const value=draft.pricing[key];if(value!==""&&(Number(value)<0||!Number.isFinite(Number(value))))next[key]=`${label} must be zero or greater.`}
    if(draft.email&&(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)||draft.email.length>320))next.email="Enter a valid email address up to 320 characters.";
    if(draft.phone.length>64)next.phone="Phone must be 64 characters or fewer.";
    if(draft.brandCollaborations.length>20)next.brands="You can add up to 20 brands.";
    const names=new Map();
    draft.brandCollaborations.forEach((item,index)=>{
      const name=item.brandName.trim(),url=item.evidenceUrl.trim(),normalized=name.toLocaleLowerCase();
      if(!name)next[`brand-${index}-brandName`]="Brand name is required.";
      else if(name.length>120)next[`brand-${index}-brandName`]="Brand name must be 120 characters or fewer.";
      if(url&&(!url.startsWith("https://")||url.length>2048))next[`brand-${index}-evidenceUrl`]="Enter an HTTPS URL up to 2,048 characters.";
      if(normalized){if(names.has(normalized)){next[`brand-${index}-brandName`]="Brand names must be unique.";next[`brand-${names.get(normalized)}-brandName`]="Brand names must be unique."}else names.set(normalized,index)}
    });
    setErrors(next);
    return !Object.keys(next).length;
  }
  async function save(){
    if(saving||!canEdit||!validate())return;
    setSaving(true);setActionError("");setNotice("");
    try{const result=await mediaKitService.save(workspaceId,igUserId||null,serialize(draft),token);setSaved(result);setDraft(draftFrom(result));kit.setData(result);mediaKitService.invalidate(workspaceId);creatorDashboardService.invalidate(workspaceId);setNotice("Media Kit saved successfully.")}
    catch(error){if(error.status===401)logout();else setActionError(error.message||"The Media Kit could not be saved.")}
    finally{setSaving(false)}
  }
  async function download(){
    if(exporting||dirty||!canExport||!saved?.exists)return;
    setExporting(true);setActionError("");
    try{downloadBlob(await api.downloadMediaKitPdf(workspaceId,igUserId||null,token),saved.preview?.handle)}
    catch(error){if(error.status===401)logout();else setActionError(error.message||"The Media Kit PDF could not be generated.")}
    finally{setExporting(false)}
  }
  async function selectAccount(value){if(dirty&&!await confirm("Discard unsaved Media Kit changes and switch Instagram account?",{title:"Discard Media Kit changes",confirmLabel:"Discard and switch"}))return;setSaved(null);setDraft(null);setIgUserId(value);if(value)sessionStorage.setItem(`creatorDashboardAccount:${workspaceId}`,value);else sessionStorage.removeItem(`creatorDashboardAccount:${workspaceId}`)}

  if(permissionsLoading)return <main className="brutal-page min-h-[calc(100vh-82px)] p-6 md:p-8"><div className="mx-auto max-w-6xl brutal-card animate-pulse p-8">Checking Media Kit access…</div></main>;
  if(!workspaceAllowed)return <main className="brutal-page min-h-[calc(100vh-82px)] p-6 md:p-8"><div className="mx-auto max-w-3xl brutal-card p-8"><h1 className="text-3xl font-black">Creator workspace required</h1><p className="mt-3">Media Kits are available only in Creator and legacy Personal workspaces.</p></div></main>;
  if(permissionsError||!canView)return <main className="brutal-page min-h-[calc(100vh-82px)] p-6 md:p-8"><div className="mx-auto max-w-3xl brutal-card p-8"><p className="brutal-overline">Media Kit unavailable</p><h1 className="mt-3 text-3xl font-black">You don’t have permission to view this Media Kit.</h1>{permissionsError&&<p className="mt-3 text-zinc-600">{permissionsError}</p>}</div></main>;
  if((kit.loading||dashboard.loading)&&!draft)return <main className="brutal-page min-h-[calc(100vh-82px)] p-6 md:p-8"><div className="mx-auto max-w-6xl animate-pulse space-y-6"><div className="h-28 border-2 border-zinc-900 bg-zinc-200"/><div className="grid gap-6 lg:grid-cols-2"><div className="h-96 border-2 border-zinc-900 bg-zinc-200"/><div className="h-96 border-2 border-zinc-900 bg-zinc-200"/></div></div></main>;
  if(kit.error&&!draft)return <main className="brutal-page min-h-[calc(100vh-82px)] p-6 md:p-8"><div className="mx-auto max-w-3xl brutal-card p-8"><h1 className="text-3xl font-black">Media Kit couldn’t be loaded.</h1><p className="mt-3">{kit.error.message}</p><button onClick={kit.refetch} className="brutal-button mt-6">Retry</button></div></main>;
  if(!draft||!saved)return null;
  const status=!saved.exists?"Not saved":saved.complete?"Complete":"Draft";
  return <main className="brutal-page min-h-[calc(100vh-82px)] p-4 sm:p-6 md:p-8"><div className="mx-auto max-w-7xl">
    <header className="flex flex-col gap-5 border-b-2 border-zinc-900 pb-6 md:flex-row md:items-end md:justify-between"><div><p className="brutal-overline">Creator workspace</p><h1 className="mt-2 text-4xl font-black">Media Kit</h1><p className="mt-2 text-zinc-600">Build a polished, metrics-backed introduction for brand partners.</p><p className="mt-3 font-bold">Status: <span className="border border-zinc-900 bg-yellow-200 px-2 py-1">{status}</span>{saved.updatedAt&&<span className="ml-3 text-sm font-normal text-zinc-500">Updated {new Date(saved.updatedAt).toLocaleString()}</span>}</p></div><div className="flex flex-col gap-3 sm:flex-row"><button onClick={download} disabled={!canExport||exporting||dirty||!saved.exists} title={dirty?"Save changes before exporting":!saved.exists?"Save the Media Kit before exporting":""} className="min-h-13 border-2 border-zinc-900 bg-white px-5 py-3 font-black shadow-[4px_4px_0_#18181b] disabled:opacity-50">{exporting?"Downloading…":"Download PDF"}</button>{canEdit&&<button onClick={save} disabled={saving||!dirty} className="brutal-button">{saving?"Saving…":"Save Media Kit"}</button>}</div></header>
    {dirty&&canExport&&<p className="mt-4 border-2 border-zinc-900 bg-amber-100 p-3 text-sm font-bold">Save changes before exporting the PDF. Export uses the last saved version.</p>}
    <div aria-live="polite">{notice&&<p role="status" className="mt-4 border-2 border-zinc-900 bg-emerald-200 p-3 font-bold">{notice}</p>}{actionError&&<p role="alert" className="mt-4 border-2 border-red-700 bg-red-50 p-3 text-red-800">{actionError}</p>}</div>
    {dashboard.data?.accounts?.length>1&&<label className="mt-6 block max-w-sm font-bold">Instagram preview account<select className="brutal-field mt-2 w-full" value={dashboard.data.connection?.igUserId||igUserId} onChange={event=>selectAccount(event.target.value)}>{dashboard.data.accounts.map(account=><option key={account.igUserId} value={account.igUserId}>@{account.username}</option>)}</select></label>}
    {!canEdit&&<p className="mt-6 border-2 border-zinc-900 bg-sky-100 p-4 font-bold">Read-only: you can view this Media Kit, but you do not have permission to edit it.</p>}
    <div className="mt-7 grid min-w-0 gap-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)]">
      <form onSubmit={event=>{event.preventDefault();save()}} className="brutal-card min-w-0 space-y-8 p-5 sm:p-7">
        <Section title="About You">
          <label className="block font-bold">Media Kit name *<input value={draft.displayName} onChange={event=>update("displayName",event.target.value)} disabled={!canEdit} maxLength={160} required className="brutal-field mt-2 w-full"/><span className="mt-1 block text-xs font-normal text-zinc-500">This name is used only in your Media Kit and exported PDF. It does not change your account profile.</span><FieldError>{errors.displayName}</FieldError></label>
          <label className="mt-5 block font-bold">About<textarea value={draft.about} onChange={event=>update("about",event.target.value)} disabled={!canEdit} maxLength={4000} rows={8} className="brutal-field mt-2 w-full resize-y"/></label><div className="mt-1 flex justify-between gap-3 text-sm"><FieldError>{errors.about}</FieldError><span className="ml-auto text-zinc-500">{4000-draft.about.length} characters remaining</span></div>
        </Section>
        <Section title="Pricing"><div className="grid gap-4 sm:grid-cols-[1fr_160px]"><p className="text-sm text-zinc-600">Set optional rates. Blank prices stay blank.</p><label className="font-bold">Currency<input value={draft.currency} onChange={event=>update("currency",event.target.value.toUpperCase().replace(/[^A-Z]/g,"").slice(0,3))} disabled={!canEdit} list="media-kit-currencies" maxLength={3} className="brutal-field mt-2 w-full uppercase"/><datalist id="media-kit-currencies"><option value="INR"/><option value="USD"/><option value="EUR"/><option value="GBP"/></datalist><FieldError>{errors.currency}</FieldError></label></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{priceFields.map(([key,label])=><label key={key} className="font-bold">{label}<div className="mt-2 flex"><span className="flex items-center border-2 border-r-0 border-zinc-900 bg-zinc-100 px-3 font-mono text-sm">{draft.currency||"—"}</span><input type="number" inputMode="decimal" min="0" step="0.01" value={draft.pricing[key]} onChange={event=>updatePrice(key,event.target.value)} disabled={!canEdit} className="brutal-field min-w-0 flex-1"/></div><FieldError>{errors[key]}</FieldError></label>)}</div></Section>
        <Section title="Brands Worked With">
          <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-zinc-600">Add up to 20 collaborations and optional proof of work.</p>{canEdit&&<button type="button" onClick={addBrand} disabled={draft.brandCollaborations.length>=20} className="border-2 border-zinc-900 bg-yellow-300 px-4 py-2 font-black disabled:opacity-50">Add brand</button>}</div>
          <FieldError>{errors.brands}</FieldError><p className="mt-2 text-sm text-zinc-500">{draft.brandCollaborations.length}/20 brands</p>
          <div className="mt-4 space-y-4">{draft.brandCollaborations.map((item,index)=><fieldset key={index} className="border-2 border-zinc-900 bg-zinc-50 p-4"><legend className="px-2 text-sm font-black">Brand {index+1}</legend><div className="grid gap-4"><label className="font-bold">Brand name *<input value={item.brandName} onChange={event=>updateBrand(index,"brandName",event.target.value)} disabled={!canEdit} maxLength={120} required className="brutal-field mt-2 w-full"/><FieldError>{errors[`brand-${index}-brandName`]}</FieldError></label><label className="font-bold">Supporting reel/post URL (optional)<input type="url" inputMode="url" value={item.evidenceUrl} onChange={event=>updateBrand(index,"evidenceUrl",event.target.value)} disabled={!canEdit} maxLength={2048} placeholder="https://www.instagram.com/reel/…" className="brutal-field mt-2 w-full"/><span className="mt-1 block text-xs font-normal text-zinc-500">Add the Instagram reel or post that demonstrates this collaboration.</span><FieldError>{errors[`brand-${index}-evidenceUrl`]}</FieldError></label>{canEdit&&<button type="button" onClick={()=>removeBrand(index)} className="justify-self-start border-2 border-red-700 bg-white px-4 py-2 font-black text-red-700">Remove</button>}</div></fieldset>)}</div>
          {!draft.brandCollaborations.length&&<p className="mt-4 border-2 border-dashed border-zinc-400 p-5 text-center text-sm text-zinc-500">No brand collaborations added yet.</p>}
        </Section>
        <Section title="Contact Info"><div className="grid gap-4 sm:grid-cols-2"><label className="font-bold">Email<input type="email" value={draft.email} onChange={event=>update("email",event.target.value)} disabled={!canEdit} maxLength={320} className="brutal-field mt-2 w-full"/><FieldError>{errors.email}</FieldError></label><label className="font-bold">Phone<input type="tel" value={draft.phone} onChange={event=>update("phone",event.target.value)} disabled={!canEdit} maxLength={64} className="brutal-field mt-2 w-full"/><FieldError>{errors.phone}</FieldError></label></div></Section>
      </form>
      <Preview server={saved} draft={draft} userProfile={profile}/>
    </div>
  </div></main>;
}

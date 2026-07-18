import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { campaignService } from "../services/campaignService";
import { creatorListService } from "../services/creatorListService";
import CampaignForm from "../components/CampaignForm";
import DeliverablesSection from "../components/DeliverablesSection";
import { deliverableService } from "../services/deliverableService";
import CreatorContactSection from "../components/CreatorContactSection";
import OutreachSection from "../components/OutreachSection";
import { outreachService } from "../services/outreachService";
import { useWorkspaceAuthorization } from "../context/WorkspaceAuthorizationContext";

const STATUSES=["INVITED","NEGOTIATING","ACCEPTED","DECLINED","CONTRACTED","COMPLETED"];
const STATUS_STYLE={INVITED:"bg-blue-500/10 text-blue-300",NEGOTIATING:"bg-amber-500/10 text-amber-300",ACCEPTED:"bg-emerald-500/10 text-emerald-300",DECLINED:"bg-red-500/10 text-red-300",CONTRACTED:"bg-purple-500/10 text-purple-300",COMPLETED:"bg-indigo-500/10 text-indigo-300"};
function currency(amount,code){return amount!=null&&code?new Intl.NumberFormat(undefined,{style:"currency",currency:code}).format(amount):"No agreed cost"}

function CreatorCard({creator,busy,onUpdate,onRemove,deliverableProps,canEdit}){
 const [editing,setEditing]=useState(false);const [status,setStatus]=useState(creator.status);const [notes,setNotes]=useState(creator.notes||"");const [reason,setReason]=useState(creator.rejectionReason||"");const [cost,setCost]=useState(creator.agreedCost??"");const [code,setCode]=useState(creator.currency||"");const [error,setError]=useState(null);
 async function save(){if(!canEdit)return;if((cost!==""&&!code)||(cost===""&&code))return setError("Agreed cost and currency are required together.");if(code&&!/^[A-Za-z]{3}$/.test(code))return setError("Currency must be three letters.");const payload={status,notes:notes.trim(),rejectionReason:reason.trim(),clearAgreedCost:creator.agreedCost!=null&&cost===""};if(cost!==""){payload.agreedCost=Number(cost);payload.currency=code.toUpperCase()}try{await onUpdate(creator.creatorProfileId,payload);setEditing(false)}catch(err){setError(err.message)}}
 return <article className="border-2 border-zinc-900 bg-white p-4 shadow-[3px_3px_0_#18181b]">
<div className="flex gap-4">
<div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-accent-primary">{creator.profilePictureUrl?<img src={creator.profilePictureUrl} alt="" className="h-full w-full object-cover"/>:<span className="flex h-full items-center justify-center font-bold">{creator.instagramUsername?.[0]?.toUpperCase()}</span>}</div>
<div className="min-w-0 flex-1">
<div className="flex flex-wrap gap-2">
<h3 className="font-bold">@{creator.instagramUsername}</h3>
<span className={`rounded-full px-2 py-1 text-[10px] ${STATUS_STYLE[creator.status]}`}>{creator.status}</span>
<span className="rounded-full bg-panel-light px-2 py-1 text-[10px]">{creator.claimed?"Claimed":"Unclaimed"}</span>{creator.sourceListId&&<span className="rounded-full bg-accent-secondary/10 px-2 py-1 text-[10px] text-accent-secondary">Imported from list</span>}</div>
<p className="mt-2 text-xs text-text-secondary">{Number(creator.followersCount||0).toLocaleString()} followers</p>
</div>
</div>{!editing?<div className="mt-4 space-y-2 text-sm">
<p>{creator.notes||"No notes"}</p>
<p className="font-semibold">{currency(creator.agreedCost,creator.currency)}</p>{creator.rejectionReason&&<p className="text-red-300">Rejection: {creator.rejectionReason}</p>}</div>:<div className="mt-4 grid gap-3 sm:grid-cols-2">
<label className="text-xs text-text-secondary">Status<select value={status} onChange={e=>setStatus(e.target.value)} className="mt-1 w-full rounded-xl border border-panel-border bg-bg-deep p-3 text-text-primary">{STATUSES.map(x=>
<option key={x}>{x}</option>)}</select>
</label>
<label className="text-xs text-text-secondary sm:col-span-2">Notes<textarea maxLength={4000} rows="2" value={notes} onChange={e=>setNotes(e.target.value)} className="mt-1 w-full rounded-xl border border-panel-border bg-bg-deep p-3 text-text-primary"/>
</label>{status==="DECLINED"&&<label className="text-xs text-text-secondary sm:col-span-2">Rejection reason<textarea maxLength={1000} rows="2" value={reason} onChange={e=>setReason(e.target.value)} className="mt-1 w-full rounded-xl border border-panel-border bg-bg-deep p-3 text-text-primary"/>
</label>}<label className="text-xs text-text-secondary">Agreed cost<input type="number" min="0" step="0.01" value={cost} onChange={e=>setCost(e.target.value)} className="mt-1 w-full rounded-xl border border-panel-border bg-bg-deep p-3 text-text-primary"/>
</label>
<label className="text-xs text-text-secondary">Currency<input maxLength={3} value={code} onChange={e=>setCode(e.target.value)} className="mt-1 w-full rounded-xl border border-panel-border bg-bg-deep p-3 uppercase text-text-primary"/>
</label>
</div>}{error&&<p className="mt-3 text-xs text-red-400">{error}</p>}<div className="mt-5 flex gap-2">{canEdit&&(editing?<>
<button disabled={busy} onClick={save} className="rounded-lg bg-accent-primary px-4 py-2 text-xs">Save</button>
<button onClick={()=>setEditing(false)} className="rounded-lg border border-panel-border px-4 py-2 text-xs">Cancel</button>
</>:<button onClick={()=>setEditing(true)} className="rounded-lg border border-panel-border px-4 py-2 text-xs">Edit</button>)}{canEdit&&<button disabled={busy} onClick={()=>onRemove(creator)} className="rounded-lg border border-red-500/20 px-4 py-2 text-xs text-red-400">Remove</button>}</div>
<CreatorContactSection creatorProfileId={creator.creatorProfileId} {...deliverableProps}/>
<OutreachSection creator={creator} {...deliverableProps}/>
<DeliverablesSection creatorProfileId={creator.creatorProfileId} {...deliverableProps}/>
</article>
}

export default function CampaignDetails(){
 const {hasPermission}=useWorkspaceAuthorization();const canEditCampaign=hasPermission("CAMPAIGN_EDIT");
 const {campaignId}=useParams();const {token,logout}=useAuth();const {selectedWorkspace,selectedWorkspaceId,reloadWorkspaces}=useWorkspace();const navigate=useNavigate();const location=useLocation();const [campaign,setCampaign]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState(null);const [notice,setNotice]=useState(null);const [notFound,setNotFound]=useState(false);const [busy,setBusy]=useState(false);const [editing,setEditing]=useState(false);const [lists,setLists]=useState([]);const [importList,setImportList]=useState("");const [importOpen,setImportOpen]=useState(false);const [catalogQuery,setCatalogQuery]=useState("");const [catalog,setCatalog]=useState([]);const [pickerOpen,setPickerOpen]=useState(false);
 useEffect(()=>()=>{if(selectedWorkspaceId)deliverableService.clearWorkspace(selectedWorkspaceId);outreachService.clearWorkspace(selectedWorkspaceId)},[selectedWorkspaceId]);
 async function load(){setCampaign(null);setLoading(true);setError(null);setNotFound(false);if(!selectedWorkspaceId){setLoading(false);return}const controller=new AbortController();try{setCampaign(await campaignService.get(selectedWorkspaceId,campaignId,token,controller.signal))}catch(err){if(err.name==="AbortError")return;if(err.status===401)logout();else if(err.status===403){setError("You cannot access this workspace.");reloadWorkspaces()}else if(err.status===404)setNotFound(true);else setError(err.status>=500?"Campaign is temporarily unavailable. Please retry.":err.message)}finally{setLoading(false)}return()=>controller.abort()}
 useEffect(()=>{load()},[selectedWorkspaceId,campaignId,token]);
 async function saveCampaign(payload){if(!canEditCampaign)return;setBusy(true);try{const updated=await campaignService.update(selectedWorkspaceId,campaignId,payload,token);setCampaign(updated);setEditing(false);setNotice("Campaign updated.")}finally{setBusy(false)}}
 async function removeCampaign(){if(!canEditCampaign)return;if(!window.confirm(`Delete “${campaign.name}”?`))return;setBusy(true);try{await campaignService.delete(selectedWorkspaceId,campaignId,token);navigate("/campaigns",{replace:true,state:{campaignFilters:location.state?.campaignFilters,notice:"Campaign deleted."}})}catch(err){setError(err.message)}finally{setBusy(false)}}
 async function openImport(){setImportOpen(true);setError(null);try{const result=await creatorListService.list(selectedWorkspaceId,token);setLists(Array.isArray(result)?result:[]);setImportList(result?.[0]?.id||"")}catch(err){setError(err.message)}}
 async function doImport(){if(!canEditCampaign)return;if(busy||!importList)return;setBusy(true);try{const result=await campaignService.importList(selectedWorkspaceId,campaignId,importList,token);setNotice(`${result.importedCount} creators imported. ${result.skippedDuplicateCount} existing creator${result.skippedDuplicateCount===1?"":"s"} skipped.`);setImportOpen(false);await load()}catch(err){setError(err.message)}finally{setBusy(false)}}
 async function searchCatalog(e){e.preventDefault();setBusy(true);try{const result=await api.searchCreatorCatalog(catalogQuery,token,25);setCatalog(Array.isArray(result)?result:[])}catch(err){setError(err.message)}finally{setBusy(false)}}
 async function addCreator(profile){if(!canEditCampaign)return;if(busy)return;setBusy(true);try{await campaignService.addCreator(selectedWorkspaceId,campaignId,{creatorProfileId:profile.id,status:"INVITED",agreedCost:null,currency:null,notes:null,rejectionReason:null},token);setNotice(`@${profile.instagramUsername} added to campaign.`);setPickerOpen(false);await load()}catch(err){setError(err.status===409?"Creator is already in this campaign.":err.message)}finally{setBusy(false)}}
 async function updateCreator(id,payload){if(!canEditCampaign)return;setBusy(true);try{const updated=await campaignService.updateCreator(selectedWorkspaceId,campaignId,id,payload,token);setCampaign(c=>({...c,creators:c.creators.map(x=>x.creatorProfileId===id?updated:x)}))}finally{setBusy(false)}}
 async function removeCreator(creator){if(!canEditCampaign)return;if(!window.confirm(`Remove @${creator.instagramUsername} from this campaign? This does not remove them from the catalog or source list.`))return;setBusy(true);try{await campaignService.removeCreator(selectedWorkspaceId,campaignId,creator.creatorProfileId,token);setCampaign(c=>({...c,creatorCount:Math.max(0,c.creatorCount-1),creators:c.creators.filter(x=>x.creatorProfileId!==creator.creatorProfileId)}))}catch(err){setError(err.message)}finally{setBusy(false)}}
 if(loading||(campaign&&campaign.workspaceId!==selectedWorkspaceId))return <div className="min-h-screen bg-bg-deep p-8">
<div className="mx-auto h-72 max-w-6xl animate-pulse rounded-3xl bg-panel/50"/>
</div>;if(notFound)return <div className="min-h-screen bg-bg-deep p-8 text-text-primary">
<div className="mx-auto max-w-xl rounded-3xl bg-panel p-10 text-center">
<h1 className="text-xl font-bold">Campaign not found</h1>
<button onClick={()=>navigate("/campaigns",{state:{campaignFilters:location.state?.campaignFilters}})} className="mt-5 rounded-xl bg-accent-primary px-5 py-3">Return to campaigns</button>
</div>
</div>;
 if(!campaign)return <div className="min-h-screen bg-bg-deep p-8 text-text-primary">No campaign selected.</div>;
 return <div className="min-h-screen bg-bg-deep px-4 py-8 text-text-primary">
<div className="mx-auto max-w-[1600px] space-y-6">
<header className="border-b-2 border-zinc-900 pb-6">
<Link to="/campaigns" state={{campaignFilters:location.state?.campaignFilters}} className="text-sm font-black">← Back to Campaigns</Link>
<div className="mt-3 flex flex-wrap justify-between gap-4">
<div>
<h1 className="text-2xl font-bold">{campaign.name}</h1>
<p className="mt-1 text-sm text-text-secondary">{selectedWorkspace?.name}</p>
</div>
<span className={`h-fit rounded-full px-3 py-1 text-xs ${STATUS_STYLE[campaign.status]||"bg-panel-light"}`}>{campaign.status}</span>
</div>
<p className="mt-5 text-sm">{campaign.description||"No description"}</p>
<p className="mt-2 text-sm text-text-secondary">{campaign.objective||"No objective"}</p>
<div className="mt-4 flex flex-wrap gap-3 text-xs text-text-secondary">
<span>{campaign.startDate||"No start"} – {campaign.endDate||"No end"}</span>
<span>{currency(campaign.budget,campaign.currency)}</span>
<span>{campaign.creatorCount} creators</span>{campaign.targetPlatforms.map(x=>
<span key={x} className="rounded-full bg-panel-light px-2 py-1">{x}</span>)}</div>
<div className="mt-5 flex flex-wrap gap-2">{canEditCampaign&&<button onClick={()=>setEditing(true)} className="rounded-lg border border-panel-border px-4 py-2 text-xs">Edit</button>} {canEditCampaign&&<button onClick={openImport} className="rounded-lg bg-accent-secondary px-4 py-2 text-xs">Import from creator list</button>} {canEditCampaign&&<button onClick={()=>setPickerOpen(true)} className="rounded-lg bg-accent-primary px-4 py-2 text-xs">Add catalog creator</button>} {canEditCampaign&&<button disabled={busy} onClick={removeCampaign} className="rounded-lg border border-red-500/20 px-4 py-2 text-xs text-red-400">Delete</button>}</div>
</header>{notice&&<div role="status" className="border-2 border-zinc-900 bg-emerald-200 p-4 text-sm font-bold">{notice}</div>}{error&&<div role="alert" className="border-2 border-red-700 bg-red-50 p-4 text-sm text-red-800">{error}</div>}{editing&&<CampaignForm initial={campaign} submitting={busy} onSubmit={saveCampaign} onCancel={()=>setEditing(false)}/>}<CampaignKanban creators={campaign.creators} busy={busy} onUpdate={updateCreator} onRemove={removeCreator} canEdit={canEditCampaign} makeDeliverableProps={c=>({workspaceId:selectedWorkspaceId,campaignId,token,onUnauthorized:logout,onForbidden:reloadWorkspaces,onCreatorMissing:load,onNotice:setNotice,variables:{creatorName:c.instagramUsername,creatorUsername:`@${c.instagramUsername}`,campaignName:campaign.name,brandName:selectedWorkspace?.name,budget:currency(campaign.budget,campaign.currency),deadline:campaign.endDate||"{{deadline}}",deliverables:"{{deliverables}}"}})}/>
</div>{importOpen&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
<div role="dialog" aria-modal="true" className="w-full max-w-md rounded-3xl bg-panel p-6">
<h2 className="text-lg font-bold">Import from creator list</h2>
<p className="mt-2 text-xs text-text-secondary">Creators are copied as a snapshot. The source list is not changed and future list updates are not synchronized.</p>
<label className="mt-5 block text-xs text-text-secondary">Creator list<select value={importList} onChange={e=>setImportList(e.target.value)} className="mt-1 w-full rounded-xl border border-panel-border bg-bg-deep p-3 text-text-primary">{lists.map(x=>
<option key={x.id} value={x.id}>{x.name} ({x.creatorCount})</option>)}</select>
</label>
<div className="mt-5 flex gap-2">
<button disabled={busy||!importList} onClick={doImport} className="rounded-xl bg-accent-primary px-4 py-3 text-sm">Import creators</button>
<button onClick={()=>setImportOpen(false)} className="rounded-xl border border-panel-border px-4 py-3 text-sm">Cancel</button>
</div>
</div>
</div>}{pickerOpen&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
<div role="dialog" aria-modal="true" className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-panel p-6">
<h2 className="text-lg font-bold">Add catalog creator</h2>
<form onSubmit={searchCatalog} className="mt-4 flex gap-2">
<label className="sr-only" htmlFor="catalog-search">Search catalog</label>
<input id="catalog-search" value={catalogQuery} onChange={e=>setCatalogQuery(e.target.value)} placeholder="Instagram username" className="flex-1 rounded-xl border border-panel-border bg-bg-deep p-3"/>
<button disabled={busy} className="rounded-xl bg-accent-primary px-4">Search</button>
</form>
<div className="mt-4 space-y-2">{catalog.map(p=>
<button key={p.id} disabled={busy} onClick={()=>addCreator(p)} className="flex w-full items-center justify-between rounded-xl border border-panel-border p-3 text-left">
<span>@{p.instagramUsername}</span>
<span className="text-xs text-text-secondary">{Number(p.followersCount).toLocaleString()} followers • Add</span>
</button>)}</div>
<button onClick={()=>setPickerOpen(false)} className="mt-5 rounded-xl border border-panel-border px-4 py-2 text-sm">Close</button>
</div>
</div>}</div>;
}

const KANBAN_COLUMNS=[
 {key:"ACTIVE",label:"Active",color:"bg-sky-200",statuses:["INVITED","NEGOTIATING","ACCEPTED","DECLINED"]},
 {key:"SCRIPTING",label:"Scripting",color:"bg-yellow-300",statuses:["CONTRACTED"]},
 {key:"VIDEO_REVIEW",label:"Video Review",color:"bg-rose-200",statuses:[]},
 {key:"LIVE",label:"Live",color:"bg-emerald-200",statuses:["COMPLETED"]},
 {key:"PAYMENT",label:"Payment",color:"bg-zinc-200",statuses:[]},
];
function CampaignKanban({creators,busy,onUpdate,onRemove,canEdit,makeDeliverableProps}){return <section aria-labelledby="campaign-board-title"><p className="brutal-overline">Campaign board</p><h2 id="campaign-board-title" className="mt-2 text-2xl font-black">Creator workflow</h2><p className="mt-2 text-sm text-zinc-600">Creator lifecycle statuses are grouped into campaign workflow stages. Existing creator actions and backend statuses are unchanged.</p><div className="mt-6 overflow-x-auto pb-4"><div className="grid min-w-[1320px] grid-cols-5 gap-4">{KANBAN_COLUMNS.map(column=>{const items=creators.filter(creator=>column.statuses.includes(creator.status));return <section key={column.key} aria-labelledby={`column-${column.key}`} className="min-h-[420px] border-2 border-zinc-900 bg-white"><header className={`flex min-h-14 items-center justify-between gap-3 border-b-2 border-zinc-900 px-4 ${column.color}`}><h3 id={`column-${column.key}`} className="text-sm font-black uppercase tracking-wide">{column.label}</h3><span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-zinc-900 px-2 font-mono text-xs font-black text-white">{items.length}</span></header><div className="space-y-4 p-3">{items.map(creator=><CreatorCard key={creator.creatorProfileId} creator={creator} busy={busy} onUpdate={onUpdate} onRemove={onRemove} canEdit={canEdit} deliverableProps={makeDeliverableProps(creator)}/>)}{!items.length&&<p className="p-4 text-center text-xs text-zinc-400">No creators in this stage</p>}</div></section>})}</div></div></section>}

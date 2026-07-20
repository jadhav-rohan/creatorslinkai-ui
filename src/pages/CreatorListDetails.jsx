import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { creatorListService } from "../services/creatorListService";
import AddToCampaignDialog from "../components/AddToCampaignDialog";
import { useWorkspaceAuthorization } from "../context/WorkspaceAuthorizationContext";
import { useThemedDialog } from "../context/ThemedDialogContext";

const STATUSES = ["CONSIDERING", "SHORTLISTED", "SELECTED", "REJECTED"];
const STATUS_STYLES = { CONSIDERING: "bg-amber-500/10 text-amber-300", SHORTLISTED: "bg-indigo-500/10 text-indigo-300", SELECTED: "bg-emerald-500/10 text-emerald-300", REJECTED: "bg-red-500/10 text-red-300" };

function MemberCard({ member, onSave, onRemove, busy, canEdit, canAddCampaign }) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(member.status);
  const [notes, setNotes] = useState(member.notes || "");
  const [cost, setCost] = useState(member.proposedCost ?? "");
  const [currency, setCurrency] = useState(member.currency || "");
  const [error, setError] = useState(null);
  const [campaignOpen, setCampaignOpen] = useState(false);
  function save() {
    if ((cost !== "" && !currency) || (cost === "" && currency)) { setError("Cost and three-letter currency are required together."); return; }
    if (currency && !/^[A-Za-z]{3}$/.test(currency)) { setError("Use a three-letter currency code."); return; }
    const payload = { status, notes: notes.trim(), clearProposedCost: member.proposedCost != null && cost === "" };
    if (cost !== "") { payload.proposedCost = Number(cost); payload.currency = currency.toUpperCase(); }
    onSave(member.creatorProfileId, payload).then(() => setEditing(false)).catch((err) => setError(err.message));
  }
  return <article className="rounded-3xl border border-panel-border bg-panel/50 p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start"><div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-tr from-accent-primary to-accent-secondary">{member.profilePictureUrl ? <img src={member.profilePictureUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xl font-bold">{member.instagramUsername?.[0]?.toUpperCase()}</div>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold">@{member.instagramUsername}</h2><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${STATUS_STYLES[member.status] || STATUS_STYLES.CONSIDERING}`}>{member.status[0] + member.status.slice(1).toLowerCase()}</span><span className={`rounded-full px-2.5 py-1 text-[10px] ${member.claimed ? "bg-emerald-500/10 text-emerald-300" : "bg-panel-light text-text-secondary"}`}>{member.claimed ? "Claimed" : "Unclaimed"}</span></div><p className="mt-2 text-sm text-text-secondary">{Number(member.followersCount || 0).toLocaleString()} followers</p>{!editing && <><p className="mt-3 whitespace-pre-wrap text-sm">{member.notes || "No notes"}</p><p className="mt-3 text-sm font-semibold">{member.proposedCost != null && member.currency ? new Intl.NumberFormat(undefined, { style: "currency", currency: member.currency }).format(member.proposedCost) : "No proposed cost"}</p></>}</div></div>{error && <p role="alert" className="mt-3 text-xs text-red-400">{error}</p>}{canEdit&&editing && <div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-xs text-text-secondary">Status<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 w-full rounded-xl border border-panel-border bg-bg-deep p-3 text-text-primary">{STATUSES.map((value) => <option key={value}>{value}</option>)}</select></label><label className="text-xs text-text-secondary sm:col-span-2">Notes<textarea rows="3" maxLength={4000} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 w-full rounded-xl border border-panel-border bg-bg-deep p-3 text-text-primary" /></label><label className="text-xs text-text-secondary">Proposed cost<input type="number" min="0" step="0.01" value={cost} onChange={(event) => setCost(event.target.value)} className="mt-1 w-full rounded-xl border border-panel-border bg-bg-deep p-3 text-text-primary" /></label><label className="text-xs text-text-secondary">Currency<input maxLength={3} value={currency} onChange={(event) => setCurrency(event.target.value)} className="mt-1 w-full rounded-xl border border-panel-border bg-bg-deep p-3 uppercase text-text-primary" /></label></div>}<div className="mt-5 flex flex-wrap gap-2">{canEdit&&(editing ? <><button type="button" onClick={save} disabled={busy} className="rounded-lg bg-accent-primary px-4 py-2 text-xs font-semibold disabled:opacity-50">Save changes</button><button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-panel-border px-4 py-2 text-xs">Cancel</button></> : <button type="button" onClick={() => setEditing(true)} className="rounded-lg border border-panel-border px-4 py-2 text-xs">Edit</button>)} {canAddCampaign&&<button type="button" onClick={()=>setCampaignOpen(true)} className="rounded-lg border border-accent-secondary/30 px-4 py-2 text-xs text-accent-secondary">Add to campaign</button>} {canEdit&&<button type="button" onClick={() => onRemove(member)} disabled={busy} className="rounded-lg border border-red-500/20 px-4 py-2 text-xs text-red-400 disabled:opacity-50">Remove</button>}</div>{campaignOpen&&<AddToCampaignDialog creatorProfileId={member.creatorProfileId} creatorName={`@${member.instagramUsername}`} onClose={()=>setCampaignOpen(false)}/>}</article>;
}

export default function CreatorListDetails() {
  const { listId } = useParams(); const navigate = useNavigate();
  const { token, logout } = useAuth(); const { selectedWorkspaceId, reloadWorkspaces } = useWorkspace();
  const {hasPermission}=useWorkspaceAuthorization();const canEdit=hasPermission("CREATOR_LIST_EDIT"),canAddCampaign=hasPermission("CAMPAIGN_EDIT");
  const {confirm}=useThemedDialog();
  const [list, setList] = useState(null); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState(null); const [notFound, setNotFound] = useState(false);
  async function load() {
    if (!selectedWorkspaceId) { setLoading(false); return; }
    setLoading(true); setError(null); setList(null); setNotFound(false);
    try { setList(await creatorListService.get(selectedWorkspaceId, listId, token)); }
    catch (err) {
      if (err.status === 401) logout();
      else if (err.status === 403) { setError("You cannot access this workspace. Reloading available workspaces."); reloadWorkspaces(); }
      else if (err.status === 404) setNotFound(true);
      else setError(err.status >= 500 ? "This creator list is temporarily unavailable. Please retry." : err.message);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [selectedWorkspaceId, listId, token]);
  async function saveMember(creatorProfileId, payload) {
    if(!canEdit)return;
    if (busy) return; setBusy(true); setError(null);
    try { const updated = await creatorListService.updateCreator(selectedWorkspaceId, listId, creatorProfileId, payload, token); setList((current) => ({ ...current, creators: current.creators.map((member) => member.creatorProfileId === creatorProfileId ? updated : member) })); }
    catch (err) { setError(err.status >= 500 ? "The creator could not be updated. Please retry." : err.message); throw err; } finally { setBusy(false); }
  }
  async function removeMember(member) {
    if(!canEdit)return;
    if (busy || !await confirm(`Remove @${member.instagramUsername} from this list?`,{title:"Remove creator",confirmLabel:"Remove"})) return; setBusy(true); setError(null);
    try { await creatorListService.removeCreator(selectedWorkspaceId, listId, member.creatorProfileId, token); setList((current) => ({ ...current, creatorCount: Math.max(0, current.creatorCount - 1), creators: current.creators.filter((item) => item.creatorProfileId !== member.creatorProfileId) })); }
    catch (err) { setError(err.status >= 500 ? "The creator could not be removed. Please retry." : err.message); } finally { setBusy(false); }
  }
  if (loading) return <div className="min-h-screen bg-bg-deep p-8 text-text-primary"><div className="mx-auto h-64 max-w-6xl animate-pulse rounded-3xl bg-panel/50" /></div>;
  if (notFound) return <div className="min-h-screen bg-bg-deep p-8 text-text-primary"><div className="mx-auto max-w-xl rounded-3xl border border-panel-border bg-panel/50 p-10 text-center"><h1 className="text-xl font-bold">Creator list not found</h1><p className="mt-2 text-sm text-text-secondary">The list may have been deleted or belongs to another workspace.</p><button onClick={() => navigate("/creator-lists")} className="mt-5 rounded-xl bg-accent-primary px-5 py-3 text-sm">Return to creator lists</button></div></div>;
  return <div className="min-h-screen bg-bg-deep px-4 py-8 text-text-primary"><div className="mx-auto max-w-6xl space-y-6"><header className="rounded-3xl border border-panel-border bg-panel/50 p-6"><Link to="/creator-lists" className="text-xs text-text-secondary hover:text-accent-primary">← Creator Lists</Link><div className="mt-3 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-bold">{list?.name || "Creator list"}</h1><p className="mt-1 text-sm text-text-secondary">{list?.description || "No description"}</p></div><span className="text-sm text-text-secondary">{list?.creatorCount || 0} creators</span></div></header>{error && <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}{!list?.creators?.length ? <div className="rounded-3xl border border-dashed border-panel-border p-12 text-center"><h2 className="font-bold">No creators in this list</h2><p className="mt-2 text-sm text-text-secondary">Add catalog creators from supported discovery results.</p></div> : <div className="grid gap-4 lg:grid-cols-2">{list.creators.map((member) => <MemberCard key={member.creatorProfileId} member={member} onSave={saveMember} onRemove={removeMember} busy={busy} canEdit={canEdit} canAddCampaign={canAddCampaign} />)}</div>}</div></div>;
}

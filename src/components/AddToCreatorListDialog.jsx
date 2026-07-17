import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { creatorListService } from "../services/creatorListService";

export default function AddToCreatorListDialog({ creatorProfileId, creatorName, onClose, onAdded }) {
  const { token, logout } = useAuth();
  const { selectedWorkspaceId, reloadWorkspaces } = useWorkspace();
  const [lists, setLists] = useState([]);
  const [listId, setListId] = useState("");
  const [newListName, setNewListName] = useState("");
  const [status, setStatus] = useState("CONSIDERING");
  const [notes, setNotes] = useState("");
  const [proposedCost, setProposedCost] = useState("");
  const [currency, setCurrency] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true; setLists([]); setListId(""); setLoading(true); setError(null);
    creatorListService.list(selectedWorkspaceId, token)
      .then((result) => { if (active) { const items = Array.isArray(result) ? result : []; setLists(items); setListId(items[0]?.id || ""); } })
      .catch((err) => { if (!active) return; if (err.status === 401) logout(); else if (err.status === 403) { setError("You cannot access this workspace. Reloading available workspaces."); reloadWorkspaces(); } else setError(err.status >= 500 ? "Creator lists are temporarily unavailable. Please retry." : err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedWorkspaceId, token]);

  async function submit(event) {
    event.preventDefault();
    if (submitting) return;
    if (!listId && !newListName.trim()) { setError("Select a list or create one."); return; }
    if ((proposedCost && !currency.trim()) || (!proposedCost && currency.trim())) { setError("Proposed cost and three-letter currency must be supplied together."); return; }
    if (currency && !/^[A-Za-z]{3}$/.test(currency)) { setError("Currency must be a three-letter code such as USD."); return; }
    setSubmitting(true); setError(null);
    try {
      let targetListId = listId;
      if (newListName.trim()) {
        const created = await creatorListService.create(selectedWorkspaceId, { name: newListName.trim(), description: "" }, token);
        targetListId = created.id;
      }
      await creatorListService.addCreator(selectedWorkspaceId, targetListId, {
        creatorProfileId, status, notes: notes.trim() || null,
        proposedCost: proposedCost === "" ? null : Number(proposedCost),
        currency: currency.trim() ? currency.trim().toUpperCase() : null,
      }, token);
      onAdded?.(); onClose();
    } catch (err) {
      if (err.status === 401) logout();
      else if (err.status === 403) { setError("You cannot access this workspace. Reloading available workspaces."); reloadWorkspaces(); }
      else if (err.status === 409) setError("Creator is already in this list.");
      else setError(err.status >= 500 ? "The creator could not be added right now. Please retry." : err.message);
    } finally { setSubmitting(false); }
  }

  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true" aria-labelledby="add-list-title"><form onSubmit={submit} className="w-full max-w-lg rounded-3xl border border-panel-border bg-panel p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 id="add-list-title" className="text-lg font-bold">Add to creator list</h2><p className="mt-1 text-xs text-text-secondary">{creatorName}</p></div><button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg border border-panel-border px-3 py-2 text-xs">Close</button></div>{error && <div role="alert" className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">{error}</div>}{loading ? <div className="py-10 text-center text-xs text-text-secondary">Loading lists…</div> : <div className="mt-5 space-y-4"><label className="block text-xs text-text-secondary">Existing list<select value={listId} onChange={(event) => { setListId(event.target.value); setNewListName(""); }} className="mt-1.5 w-full rounded-xl border border-panel-border bg-bg-deep p-3 text-text-primary"><option value="">Select a list</option>{lists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}</select></label><label className="block text-xs text-text-secondary">Or create a new list<input value={newListName} maxLength={160} onChange={(event) => { setNewListName(event.target.value); if (event.target.value) setListId(""); }} className="mt-1.5 w-full rounded-xl border border-panel-border bg-bg-deep p-3 text-text-primary" placeholder="Campaign shortlist" /></label><label className="block text-xs text-text-secondary">Pipeline status<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1.5 w-full rounded-xl border border-panel-border bg-bg-deep p-3 text-text-primary">{["CONSIDERING","SHORTLISTED","SELECTED","REJECTED"].map((value) => <option key={value} value={value}>{value[0] + value.slice(1).toLowerCase()}</option>)}</select></label><label className="block text-xs text-text-secondary">Notes<textarea value={notes} maxLength={4000} onChange={(event) => setNotes(event.target.value)} rows="3" className="mt-1.5 w-full rounded-xl border border-panel-border bg-bg-deep p-3 text-text-primary" /></label><div className="grid grid-cols-2 gap-3"><label className="text-xs text-text-secondary">Proposed cost<input type="number" min="0" step="0.01" value={proposedCost} onChange={(event) => setProposedCost(event.target.value)} className="mt-1.5 w-full rounded-xl border border-panel-border bg-bg-deep p-3 text-text-primary" /></label><label className="text-xs text-text-secondary">Currency<input value={currency} maxLength={3} onChange={(event) => setCurrency(event.target.value)} placeholder="USD" className="mt-1.5 w-full rounded-xl border border-panel-border bg-bg-deep p-3 uppercase text-text-primary" /></label></div><button type="submit" disabled={submitting} className="w-full rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary py-3 text-sm font-semibold disabled:opacity-50">{submitting ? "Adding…" : "Add creator"}</button></div>}</form></div>;
}

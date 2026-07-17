import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { creatorListService } from "../services/creatorListService";

export default function CreatorLists() {
  const { token, logout } = useAuth();
  const { selectedWorkspace, selectedWorkspaceId, reloadWorkspaces } = useWorkspace();
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  async function load() {
    if (!selectedWorkspaceId) { setLists([]); setLoading(false); return; }
    setLoading(true); setError(null); setLists([]);
    try { const result = await creatorListService.list(selectedWorkspaceId, token); setLists(Array.isArray(result) ? result : []); }
    catch (err) {
      if (err.status === 401) logout();
      else if (err.status === 403) { setError("You cannot access this workspace. Reloading available workspaces."); reloadWorkspaces(); }
      else setError(err.status >= 500 ? "Creator lists are temporarily unavailable. Please retry." : err.message);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [selectedWorkspaceId, token]);

  function beginEdit(list) { setFormOpen(true); setEditing(list); setName(list?.name || ""); setDescription(list?.description || ""); setError(null); }
  async function save(event) {
    event.preventDefault(); if (submitting || !name.trim()) return; setSubmitting(true); setError(null);
    try {
      if (editing) {
        const updated = await creatorListService.update(selectedWorkspaceId, editing.id, { name: name.trim(), description: description.trim() }, token);
        setLists((current) => current.map((list) => list.id === updated.id ? updated : list));
      } else {
        const created = await creatorListService.create(selectedWorkspaceId, { name: name.trim(), description: description.trim() }, token);
        setLists((current) => [created, ...current]);
      }
      setFormOpen(false); setEditing(null); setName(""); setDescription("");
    } catch (err) { setError(err.status >= 500 ? "The creator list could not be saved. Please retry." : err.message); } finally { setSubmitting(false); }
  }
  async function remove(list) {
    if (!window.confirm(`Delete “${list.name}”? This cannot be undone.`)) return;
    setSubmitting(true); setError(null);
    try { await creatorListService.delete(selectedWorkspaceId, list.id, token); setLists((current) => current.filter((item) => item.id !== list.id)); }
    catch (err) { setError(err.status >= 500 ? "The creator list could not be deleted. Please retry." : err.message); } finally { setSubmitting(false); }
  }

  if (!selectedWorkspace) return <div className="min-h-screen bg-bg-deep p-8 text-text-primary"><div className="mx-auto max-w-4xl rounded-3xl border border-panel-border bg-panel/50 p-10 text-center"><h1 className="text-xl font-bold">No workspace selected</h1><p className="mt-2 text-sm text-text-secondary">Create or select a workspace from the dashboard before managing creator lists.</p><Link to="/dashboard" className="mt-5 inline-block rounded-xl bg-accent-primary px-5 py-3 text-sm font-semibold">Go to dashboard</Link></div></div>;
  return <div className="min-h-screen bg-bg-deep px-4 py-8 text-text-primary"><div className="mx-auto max-w-6xl space-y-6"><header className="flex flex-col gap-4 rounded-3xl border border-panel-border bg-panel/50 p-6 sm:flex-row sm:items-center sm:justify-between"><div><Link to="/dashboard" className="text-xs text-text-secondary hover:text-accent-primary">← Dashboard</Link><h1 className="mt-2 text-2xl font-bold">Creator Lists</h1><p className="mt-1 text-sm text-text-secondary">Organize creator candidates in {selectedWorkspace.name}.</p></div><button type="button" onClick={() => beginEdit(null)} className="rounded-xl bg-accent-primary px-5 py-3 text-sm font-semibold">Create list</button></header>{error && <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}{formOpen && <form onSubmit={save} className="rounded-3xl border border-panel-border bg-panel/50 p-6"><h2 className="font-bold">{editing ? "Edit creator list" : "Create creator list"}</h2><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="text-xs text-text-secondary">Name<input autoFocus required maxLength={160} value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-panel-border bg-bg-deep p-3 text-text-primary" /></label><label className="text-xs text-text-secondary">Description<textarea maxLength={4000} rows="2" value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1.5 w-full rounded-xl border border-panel-border bg-bg-deep p-3 text-text-primary" /></label></div><div className="mt-4 flex gap-3"><button disabled={submitting} className="rounded-xl bg-accent-primary px-5 py-2.5 text-xs font-semibold disabled:opacity-50">{submitting ? "Saving…" : "Save"}</button><button type="button" onClick={() => { setFormOpen(false); setEditing(null); setName(""); setDescription(""); }} className="rounded-xl border border-panel-border px-5 py-2.5 text-xs">Cancel</button></div></form>}{loading ? <div className="grid gap-4 md:grid-cols-2">{[1,2,3,4].map((item) => <div key={item} className="h-44 animate-pulse rounded-3xl bg-panel/50" />)}</div> : lists.length === 0 ? <div className="rounded-3xl border border-dashed border-panel-border p-12 text-center"><h2 className="font-bold">No creator lists yet</h2><p className="mt-2 text-sm text-text-secondary">Create a list for your first campaign shortlist.</p></div> : <div className="grid gap-4 md:grid-cols-2">{lists.map((list) => <article key={list.id} className="rounded-3xl border border-panel-border bg-panel/50 p-6"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold">{list.name}</h2><p className="mt-2 min-h-10 text-sm text-text-secondary">{list.description || "No description"}</p></div><span className="rounded-full bg-accent-primary/10 px-3 py-1 text-xs font-semibold text-accent-primary">{list.creatorCount} creators</span></div><p className="mt-4 text-[11px] text-text-secondary">Updated {new Date(list.updatedAt).toLocaleString()}</p><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => navigate(`/creator-lists/${list.id}`)} className="rounded-lg bg-accent-primary px-4 py-2 text-xs font-semibold">Open list</button><button type="button" onClick={() => beginEdit(list)} className="rounded-lg border border-panel-border px-4 py-2 text-xs">Edit</button><button type="button" onClick={() => remove(list)} disabled={submitting} className="rounded-lg border border-red-500/20 px-4 py-2 text-xs text-red-400 disabled:opacity-50">Delete</button></div></article>)}</div>}</div></div>;
}

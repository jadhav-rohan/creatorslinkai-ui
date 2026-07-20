import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { workspaceService } from "../services/workspaceService";

const WorkspaceContext = createContext(null);
const storageKeyFor = (persona) => `creatorlinksai_workspace_id_${persona}`;

export function WorkspaceProvider({ children }) {
  const { token, isAuthenticated, activePersona, workspaceId: sessionWorkspaceId, logout } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceIdState] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectFrom = useCallback((items) => {
    const storageKey = storageKeyFor(activePersona);
    const savedId = window.localStorage.getItem(storageKey) || sessionWorkspaceId;
    const selected = items.find((item) => item.id === savedId)
      || items.find((item) => item.personal)
      || items[0]
      || null;
    setSelectedWorkspaceIdState(selected?.id || "");
    if (selected) window.localStorage.setItem(storageKey, selected.id);
    else window.localStorage.removeItem(storageKey);
  }, [activePersona, sessionWorkspaceId]);

  const reloadWorkspaces = useCallback(async () => {
    if (!isAuthenticated || !token) { setWorkspaces([]); setSelectedWorkspaceIdState(""); return; }
    setLoading(true); setError(null);
    try {
      const result = await workspaceService.list(token);
      const allowedTypes = activePersona === "CREATOR"
        ? new Set(["CREATOR", "PERSONAL"])
        : new Set(["BRAND", "AGENCY", "PERSONAL"]);
      const items = (Array.isArray(result) ? result : []).filter((workspace) => allowedTypes.has(workspace.type));
      setWorkspaces(items); selectFrom(items);
    } catch (err) {
      if (err.status === 401) logout({ revoke: false, reason: "expired" });
      else setError(err.status === 500 ? "Workspaces are temporarily unavailable. Please retry." : err.message);
    } finally { setLoading(false); }
  }, [isAuthenticated, token, activePersona, logout, selectFrom]);

  useEffect(() => { reloadWorkspaces(); }, [reloadWorkspaces]);

  const setSelectedWorkspaceId = useCallback((id) => {
    if (!workspaces.some((workspace) => workspace.id === id)) return;
    setSelectedWorkspaceIdState(id); window.localStorage.setItem(storageKeyFor(activePersona), id);
  }, [workspaces, activePersona]);

  const createWorkspace = useCallback(async (name, type) => {
    const created = await workspaceService.create(name.trim(), type, token);
    setWorkspaces((current) => [...current, created]);
    setSelectedWorkspaceIdState(created.id); window.localStorage.setItem(storageKeyFor(activePersona), created.id);
    return created;
  }, [token, activePersona]);

  const updateWorkspace = useCallback(async (workspaceId, payload) => {
    const updated = await workspaceService.update(workspaceId, payload, token);
    setWorkspaces((current) => current.map((item) => item.id === updated.id ? updated : item));
    return updated;
  }, [token]);

  const selectedWorkspace = useMemo(() => workspaces.find((item) => item.id === selectedWorkspaceId) || null, [workspaces, selectedWorkspaceId]);
  const value = { workspaces, selectedWorkspace, selectedWorkspaceId, setSelectedWorkspaceId, loading, error, reloadWorkspaces, createWorkspace, updateWorkspace };
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return value;
}

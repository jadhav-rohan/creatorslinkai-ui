import { api } from "../api";

export const connectionKeys = {
  instagram: (workspaceId) => ["instagram-login-accounts", workspaceId],
  facebook: (workspaceId) => ["facebook-login-accounts", workspaceId],
};

export const connectionService = {
  listInstagram: (workspaceId, token, signal) => api.listAccounts(workspaceId, token, { signal }),
  connectInstagram: (workspaceId, token) => api.startConnect(workspaceId, token),
  disconnectInstagram: (igUserId, workspaceId, token) => api.disconnectAccount(igUserId, workspaceId, token),
  listFacebook: (workspaceId, token, signal) => api.listMetaBrandAccounts(workspaceId, token, { signal }),
  connectFacebook: (workspaceId, token) => api.startMetaBrandConnect(workspaceId, token),
  disconnectFacebook: (igUserId, workspaceId, token) => api.disconnectMetaBrandAccount(igUserId, workspaceId, token),
};

const MARKER_KEY = "creatorlinksai_connection_in_progress";
const MARKER_TTL_MS = 15 * 60 * 1000;

export function markConnectionInProgress(workspaceId, connectionType, existingAccountIds) {
  window.sessionStorage.setItem(MARKER_KEY, JSON.stringify({
    workspaceId,
    connectionType,
    startTime: Date.now(),
    existingAccountIds,
  }));
}

export function readConnectionMarker() {
  try {
    const marker = JSON.parse(window.sessionStorage.getItem(MARKER_KEY));
    if (!marker || Date.now() - marker.startTime > MARKER_TTL_MS) {
      window.sessionStorage.removeItem(MARKER_KEY);
      return null;
    }
    return marker;
  } catch {
    window.sessionStorage.removeItem(MARKER_KEY);
    return null;
  }
}

export function clearConnectionMarker() {
  window.sessionStorage.removeItem(MARKER_KEY);
}

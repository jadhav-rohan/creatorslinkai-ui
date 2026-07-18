import { api } from "../api";

export const workspaceService = {
  list: (token) => api.listWorkspaces(token),
  get: (workspaceId, token, signal) => api.getWorkspace(workspaceId, token, { signal }),
  create: (name, type, token) => api.createWorkspace(name, type, token),
  update: (workspaceId, payload, token) => api.updateWorkspace(workspaceId, payload, token),
};

import { api } from "../api";

export const workspaceService = {
  list: (token) => api.listWorkspaces(token),
  create: (name, token) => api.createWorkspace(name, token),
};

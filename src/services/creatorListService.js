import { api } from "../api";

export const creatorListService = {
  list: (workspaceId, token) => api.listCreatorLists(workspaceId, token),
  get: (workspaceId, listId, token) => api.getCreatorList(workspaceId, listId, token),
  create: (workspaceId, payload, token) => api.createCreatorList(workspaceId, payload, token),
  update: (workspaceId, listId, payload, token) => api.updateCreatorList(workspaceId, listId, payload, token),
  delete: (workspaceId, listId, token) => api.deleteCreatorList(workspaceId, listId, token),
  addCreator: (workspaceId, listId, payload, token) => api.addCreatorToList(workspaceId, listId, payload, token),
  updateCreator: (workspaceId, listId, creatorProfileId, payload, token) => api.updateListedCreator(workspaceId, listId, creatorProfileId, payload, token),
  removeCreator: (workspaceId, listId, creatorProfileId, token) => api.removeListedCreator(workspaceId, listId, creatorProfileId, token),
};

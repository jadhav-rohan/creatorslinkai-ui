import { api } from "../api";

export const campaignKeys = {
  all: (workspaceId) => ["campaigns", workspaceId],
  detail: (workspaceId, campaignId) => ["campaign", workspaceId, campaignId],
};

export const campaignService = {
  list: (workspaceId, token, signal) => api.listCampaigns(workspaceId, token, { signal }),
  get: (workspaceId, campaignId, token, signal) => api.getCampaign(workspaceId, campaignId, token, { signal }),
  create: (workspaceId, payload, token) => api.createCampaign(workspaceId, payload, token),
  update: (workspaceId, campaignId, payload, token) => api.updateCampaign(workspaceId, campaignId, payload, token),
  delete: (workspaceId, campaignId, token) => api.deleteCampaign(workspaceId, campaignId, token),
  addCreator: (workspaceId, campaignId, payload, token) => api.addCampaignCreator(workspaceId, campaignId, payload, token),
  importList: (workspaceId, campaignId, listId, token) => api.importCampaignCreatorList(workspaceId, campaignId, listId, token),
  updateCreator: (workspaceId, campaignId, creatorProfileId, payload, token) => api.updateCampaignCreator(workspaceId, campaignId, creatorProfileId, payload, token),
  removeCreator: (workspaceId, campaignId, creatorProfileId, token) => api.removeCampaignCreator(workspaceId, campaignId, creatorProfileId, token),
};

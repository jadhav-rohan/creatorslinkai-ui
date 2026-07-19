import { api } from "../api";

export const deliverableKeys = {
  all: (workspaceId, campaignId, creatorProfileId) => ["campaign-deliverables", workspaceId, campaignId, creatorProfileId],
  detail: (workspaceId, campaignId, creatorProfileId, deliverableId) => ["campaign-deliverable", workspaceId, campaignId, creatorProfileId, deliverableId],
};

const cache = new Map();
const key = (...parts) => JSON.stringify(deliverableKeys.all(...parts));

export const deliverableService = {
  cached: (workspaceId, campaignId, creatorProfileId) => cache.get(key(workspaceId, campaignId, creatorProfileId)),
  list: async (workspaceId, campaignId, creatorProfileId, token, signal) => {
    const result = await api.listCampaignDeliverables(workspaceId, campaignId, creatorProfileId, token, { signal });
    const list = Array.isArray(result) ? result : [];
    cache.set(key(workspaceId, campaignId, creatorProfileId), list);
    return list;
  },
  create: (workspaceId, campaignId, creatorProfileId, payload, token) => api.createCampaignDeliverable(workspaceId, campaignId, creatorProfileId, payload, token),
  update: (workspaceId, campaignId, creatorProfileId, deliverableId, payload, token) => api.updateCampaignDeliverable(workspaceId, campaignId, creatorProfileId, deliverableId, payload, token),
  delete: (workspaceId, campaignId, creatorProfileId, deliverableId, token) => api.deleteCampaignDeliverable(workspaceId, campaignId, creatorProfileId, deliverableId, token),
  set: (workspaceId, campaignId, creatorProfileId, value) => cache.set(key(workspaceId, campaignId, creatorProfileId), value),
  clearWorkspace: (workspaceId) => { for (const cacheKey of cache.keys()) if (cacheKey.includes(`\"${workspaceId}\"`)) cache.delete(cacheKey); },
  clear: () => cache.clear(),
};

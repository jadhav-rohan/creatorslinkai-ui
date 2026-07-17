const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(
  path,
  { method = "GET", body, token, headers = {}, signal } = {}
) {
  const finalHeaders = { ...headers };
  if (body !== undefined) finalHeaders["Content-Type"] = "application/json";
  if (token) finalHeaders["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no body - fine for some responses
  }

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return data;
}

function withQuery(path, params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  const suffix = query.toString();
  return suffix ? `${path}?${suffix}` : path;
}

export const api = {
  register: (email, password) =>
    request("/api/v1/auth/register", {
      method: "POST",
      body: { email, password },
    }),
  login: (email, password) =>
    request("/api/v1/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  startConnect: (workspaceId, token, options) =>
    request(withQuery("/api/v1/instagram-login/connect", { workspaceId }), { token, ...options }),
  listAccounts: (workspaceId, token, options) =>
    request(withQuery("/api/v1/instagram-login/accounts", { workspaceId }), { token, ...options }),
  disconnectAccount: (igUserId, workspaceId, token, options) =>
    request(withQuery(`/api/v1/instagram-login/${encodeURIComponent(igUserId)}`, { workspaceId }), { method: "DELETE", token, ...options }),
  startMetaBrandConnect: (workspaceId, token, options) =>
    request(withQuery("/api/v1/instagram/auth/connect", { workspaceId }), { token, ...options }),
  listMetaBrandAccounts: (workspaceId, token, options) =>
    request(withQuery("/api/v1/instagram/auth/accounts", { workspaceId }), { token, ...options }),
  disconnectMetaBrandAccount: (igUserId, workspaceId, token, options) =>
    request(withQuery(`/api/v1/instagram/auth/${encodeURIComponent(igUserId)}`, { workspaceId }), {
      method: "DELETE",
      token,
      ...options,
    }),
  getInsights: (igUserId, token, reelLimit = 10) =>
    request(`/api/v1/instagram/${igUserId}/insights?reelLimit=${reelLimit}`, {
      token,
    }),

  getPendingSelection: (selectionToken, token) =>
    request(`/api/v1/instagram/auth/pending/${selectionToken}`, { token }),
  selectPage: (selectionToken, pageId, token) =>
    request(`/api/v1/instagram/auth/pending/${selectionToken}/select`, {
      method: "POST",
      body: { pageId },
      token,
    }),

  discoverCreator: (username, workspaceId, token, callerIgUserId, options) =>
    request(withQuery(`/api/v1/instagram/discovery/${encodeURIComponent(username)}`, { workspaceId, callerIgUserId }), {
      token,
      ...options,
    }),
  searchCreatorCatalog: (query, token, limit = 25, options) =>
    request(withQuery("/api/v1/instagram/discovery/catalog", { query, limit }), { token, ...options }),

  fetchRules: (igUserId, token) =>
    request(`/api/v1/instagram/${igUserId}/auto-dm-rules`, { token }),
  createRule: (igUserId, rule, token) =>
    request(`/api/v1/instagram/${igUserId}/auto-dm-rules`, {
      method: "POST",
      body: rule,
      token,
    }),
  deleteRule: (igUserId, ruleId, token) =>
    request(`/api/v1/instagram/${igUserId}/auto-dm-rules/${ruleId}`, {
      method: "DELETE",
      token,
    }),
  getRuleLogs: (igUserId, ruleId, token) =>
    request(`/api/v1/instagram/${igUserId}/auto-dm-rules/${ruleId}/log`, {
      token,
    }),
  getInsightHistory: (igUserId, token, days = 30) =>
    request(`/api/v1/instagram/${igUserId}/history?days=${days}`, { token }),
  getAudienceQuality: (igUserId, token, days = 30) =>
    request(`/api/v1/instagram/${igUserId}/audience-quality?days=${days}`, {
      token,
    }),
  searchCreatorMarketplace: (filters, token) =>
    request("/api/v1/creator-marketplace/search", {
      method: "POST",
      body: filters,
      token,
    }),
  getMarketplaceCreator: (username, brandIgUserId, token) =>
    request(
      `/api/v1/creator-marketplace/creators/${encodeURIComponent(
        username
      )}?brandIgUserId=${encodeURIComponent(brandIgUserId)}`,
      { token }
    ),
  listWorkspaces: (token) => request("/api/v1/workspaces", { token }),
  createWorkspace: (name, token) =>
    request("/api/v1/workspaces", { method: "POST", body: { name }, token }),
  listCreatorLists: (workspaceId, token) =>
    request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/creator-lists`, { token }),
  getCreatorList: (workspaceId, listId, token) =>
    request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/creator-lists/${encodeURIComponent(listId)}`, { token }),
  createCreatorList: (workspaceId, payload, token) =>
    request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/creator-lists`, { method: "POST", body: payload, token }),
  updateCreatorList: (workspaceId, listId, payload, token) =>
    request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/creator-lists/${encodeURIComponent(listId)}`, { method: "PATCH", body: payload, token }),
  deleteCreatorList: (workspaceId, listId, token) =>
    request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/creator-lists/${encodeURIComponent(listId)}`, { method: "DELETE", token }),
  addCreatorToList: (workspaceId, listId, payload, token) =>
    request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/creator-lists/${encodeURIComponent(listId)}/creators`, { method: "POST", body: payload, token }),
  updateListedCreator: (workspaceId, listId, creatorProfileId, payload, token) =>
    request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/creator-lists/${encodeURIComponent(listId)}/creators/${encodeURIComponent(creatorProfileId)}`, { method: "PATCH", body: payload, token }),
  removeListedCreator: (workspaceId, listId, creatorProfileId, token) =>
    request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/creator-lists/${encodeURIComponent(listId)}/creators/${encodeURIComponent(creatorProfileId)}`, { method: "DELETE", token }),
  listCampaigns: (workspaceId, token, options) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/campaigns`, { token, ...options }),
  getCampaign: (workspaceId, campaignId, token, options) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/campaigns/${encodeURIComponent(campaignId)}`, { token, ...options }),
  createCampaign: (workspaceId, payload, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/campaigns`, { method: "POST", body: payload, token }),
  updateCampaign: (workspaceId, campaignId, payload, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/campaigns/${encodeURIComponent(campaignId)}`, { method: "PATCH", body: payload, token }),
  deleteCampaign: (workspaceId, campaignId, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/campaigns/${encodeURIComponent(campaignId)}`, { method: "DELETE", token }),
  addCampaignCreator: (workspaceId, campaignId, payload, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/campaigns/${encodeURIComponent(campaignId)}/creators`, { method: "POST", body: payload, token }),
  importCampaignCreatorList: (workspaceId, campaignId, creatorListId, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/campaigns/${encodeURIComponent(campaignId)}/creators/import-list`, { method: "POST", body: { creatorListId }, token }),
  updateCampaignCreator: (workspaceId, campaignId, creatorProfileId, payload, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/campaigns/${encodeURIComponent(campaignId)}/creators/${encodeURIComponent(creatorProfileId)}`, { method: "PATCH", body: payload, token }),
  removeCampaignCreator: (workspaceId, campaignId, creatorProfileId, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/campaigns/${encodeURIComponent(campaignId)}/creators/${encodeURIComponent(creatorProfileId)}`, { method: "DELETE", token }),
  listCampaignDeliverables: (workspaceId, campaignId, creatorProfileId, token, options) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/campaigns/${encodeURIComponent(campaignId)}/creators/${encodeURIComponent(creatorProfileId)}/deliverables`, { token, ...options }),
  getCampaignDeliverable: (workspaceId, campaignId, creatorProfileId, deliverableId, token, options) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/campaigns/${encodeURIComponent(campaignId)}/creators/${encodeURIComponent(creatorProfileId)}/deliverables/${encodeURIComponent(deliverableId)}`, { token, ...options }),
  createCampaignDeliverable: (workspaceId, campaignId, creatorProfileId, payload, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/campaigns/${encodeURIComponent(campaignId)}/creators/${encodeURIComponent(creatorProfileId)}/deliverables`, { method: "POST", body: payload, token }),
  updateCampaignDeliverable: (workspaceId, campaignId, creatorProfileId, deliverableId, payload, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/campaigns/${encodeURIComponent(campaignId)}/creators/${encodeURIComponent(creatorProfileId)}/deliverables/${encodeURIComponent(deliverableId)}`, { method: "PATCH", body: payload, token }),
  deleteCampaignDeliverable: (workspaceId, campaignId, creatorProfileId, deliverableId, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/campaigns/${encodeURIComponent(campaignId)}/creators/${encodeURIComponent(creatorProfileId)}/deliverables/${encodeURIComponent(deliverableId)}`, { method: "DELETE", token }),
};

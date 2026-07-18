const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export class ApiError extends Error {
  constructor(message, status, requestId) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.requestId = requestId || null;
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
    throw new ApiError(message, res.status, res.headers.get("X-Request-ID"));
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
  registerCreator: (email, password) => request("/api/v1/auth/creator/register", { method: "POST", body: { email, password } }),
  loginCreator: (email, password) => request("/api/v1/auth/creator/login", { method: "POST", body: { email, password } }),
  registerBrand: (email, password, workspaceName, workspaceType) => request("/api/v1/auth/brand/register", { method: "POST", body: { email, password, workspaceName, workspaceType } }),
  loginBrand: (email, password) => request("/api/v1/auth/brand/login", { method: "POST", body: { email, password } }),
  getCreatorDashboard: (workspaceId, igUserId, token, options) => request(withQuery(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/creator-dashboard`, { igUserId }), { token, ...options }),
  getMediaKit: (workspaceId, igUserId, token, options) => request(withQuery(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/media-kit`, { igUserId }), { token, ...options }),
  saveMediaKit: (workspaceId, igUserId, payload, token, options) => request(withQuery(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/media-kit`, { igUserId }), { method: "PUT", body: payload, token, ...options }),
  downloadMediaKitPdf: async (workspaceId, igUserId, token, options = {}) => {
    const response = await fetch(`${BASE_URL}${withQuery(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/media-kit/pdf`, { igUserId })}`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/pdf" }, signal: options.signal });
    if (!response.ok) { let data = null; try { data = await response.json(); } catch { /* empty error */ } throw new ApiError(data?.message || data?.error || `Request failed (${response.status})`, response.status, response.headers.get("X-Request-ID")); }
    return { blob: await response.blob(), disposition: response.headers.get("Content-Disposition") };
  },

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
  getInsightHistory: (igUserId, token, days = 30, options) =>
    request(`/api/v1/instagram/${igUserId}/history?days=${days}`, { token, ...options }),
  getAudienceQuality: (igUserId, token, days = 30, options) =>
    request(`/api/v1/instagram/${igUserId}/audience-quality?days=${days}`, {
      token,
      ...options,
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
  createWorkspace: (name, type, token) =>
    request("/api/v1/workspaces", { method: "POST", body: { name, type }, token }),
  getWorkspace: (workspaceId, token, options) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}`, { token, ...options }),
  updateWorkspace: (workspaceId, payload, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}`, { method: "PATCH", body: payload, token }),
  getWorkspacePermissions: (workspaceId, token, options) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/permissions`, { token, ...options }),
  getCurrentUser: (token, options) => request("/api/v1/users/me", { token, ...options }),
  updateCurrentUser: (payload, token) => request("/api/v1/users/me", { method: "PATCH", body: payload, token }),
  listWorkspaceMembers: (workspaceId, token, options) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/members`, { token, ...options }),
  updateWorkspaceMember: (workspaceId, userId, payload, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/members/${encodeURIComponent(userId)}`, { method: "PATCH", body: payload, token }),
  removeWorkspaceMember: (workspaceId, userId, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/members/${encodeURIComponent(userId)}`, { method: "DELETE", token }),
  transferWorkspaceOwnership: (workspaceId, userId, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/members/${encodeURIComponent(userId)}/transfer-ownership`, { method: "POST", token }),
  listWorkspaceInvitations: (workspaceId, token, options) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/invitations`, { token, ...options }),
  createWorkspaceInvitation: (workspaceId, payload, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/invitations`, { method: "POST", body: payload, token }),
  cancelWorkspaceInvitation: (workspaceId, invitationId, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/invitations/${encodeURIComponent(invitationId)}`, { method: "DELETE", token }),
  resendWorkspaceInvitation: (workspaceId, invitationId, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/invitations/${encodeURIComponent(invitationId)}/resend`, { method: "POST", token }),
  listMyWorkspaceInvitations: (token, options) => request("/api/v1/workspace-invitations", { token, ...options }),
  acceptWorkspaceInvitation: (invitationToken, token) => request(`/api/v1/workspace-invitations/${encodeURIComponent(invitationToken)}/accept`, { method: "POST", token }),
  declineWorkspaceInvitation: (invitationToken, token) => request(`/api/v1/workspace-invitations/${encodeURIComponent(invitationToken)}/decline`, { method: "POST", token }),
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
  listCreatorContacts: (workspaceId, token, options) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/creator-contacts`, { token, ...options }),
  getCreatorContact: (workspaceId, creatorProfileId, token, options) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/creator-contacts/${encodeURIComponent(creatorProfileId)}`, { token, ...options }),
  putCreatorContact: (workspaceId, creatorProfileId, payload, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/creator-contacts/${encodeURIComponent(creatorProfileId)}`, { method: "PUT", body: payload, token }),
  deleteCreatorContact: (workspaceId, creatorProfileId, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/creator-contacts/${encodeURIComponent(creatorProfileId)}`, { method: "DELETE", token }),
  listOutreachTemplates: (workspaceId, token, options) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/outreach-templates`, { token, ...options }),
  createOutreachTemplate: (workspaceId, payload, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/outreach-templates`, { method: "POST", body: payload, token }),
  updateOutreachTemplate: (workspaceId, templateId, payload, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/outreach-templates/${encodeURIComponent(templateId)}`, { method: "PATCH", body: payload, token }),
  deleteOutreachTemplate: (workspaceId, templateId, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/outreach-templates/${encodeURIComponent(templateId)}`, { method: "DELETE", token }),
  listOutreachMessages: (workspaceId, campaignId, creatorProfileId, token, options) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/campaigns/${encodeURIComponent(campaignId)}/creators/${encodeURIComponent(creatorProfileId)}/outreach`, { token, ...options }),
  createOutreachMessage: (workspaceId, campaignId, creatorProfileId, payload, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/campaigns/${encodeURIComponent(campaignId)}/creators/${encodeURIComponent(creatorProfileId)}/outreach`, { method: "POST", body: payload, token }),
  updateOutreachMessage: (workspaceId, campaignId, creatorProfileId, messageId, payload, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/campaigns/${encodeURIComponent(campaignId)}/creators/${encodeURIComponent(creatorProfileId)}/outreach/${encodeURIComponent(messageId)}`, { method: "PATCH", body: payload, token }),
  deleteOutreachMessage: (workspaceId, campaignId, creatorProfileId, messageId, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/campaigns/${encodeURIComponent(campaignId)}/creators/${encodeURIComponent(creatorProfileId)}/outreach/${encodeURIComponent(messageId)}`, { method: "DELETE", token }),
  listOutreachTasks: (workspaceId, token, options) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/outreach-tasks`, { token, ...options }),
  createOutreachTask: (workspaceId, payload, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/outreach-tasks`, { method: "POST", body: payload, token }),
  updateOutreachTask: (workspaceId, taskId, payload, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/outreach-tasks/${encodeURIComponent(taskId)}`, { method: "PATCH", body: payload, token }),
  deleteOutreachTask: (workspaceId, taskId, token) => request(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/outreach-tasks/${encodeURIComponent(taskId)}`, { method: "DELETE", token }),
};

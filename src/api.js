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
  { method = "GET", body, token, headers = {} } = {}
) {
  const finalHeaders = { ...headers };
  if (body !== undefined) finalHeaders["Content-Type"] = "application/json";
  if (token) finalHeaders["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
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

  startConnect: (token) =>
    request("/api/v1/instagram-login/connect", { token }),
  listAccounts: (token) =>
    request("/api/v1/instagram-login/accounts", { token }),
  disconnectAccount: (igUserId, token) =>
    request(`/api/v1/instagram-login/${igUserId}`, { method: "DELETE", token }),
  startMetaBrandConnect: (token) =>
    request("/api/v1/instagram/auth/connect", { token }),
  listMetaBrandAccounts: (token) =>
    request("/api/v1/instagram/auth/accounts", { token }),
  disconnectMetaBrandAccount: (igUserId, token) =>
    request(`/api/v1/instagram/auth/${encodeURIComponent(igUserId)}`, {
      method: "DELETE",
      token,
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

  discoverCreator: (username, token) =>
    request(`/api/v1/instagram/discovery/${encodeURIComponent(username)}`, {
      token,
    }),

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
};

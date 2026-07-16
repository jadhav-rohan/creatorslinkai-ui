import { notifyUnauthorized } from "./authEvents";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 15000;

function expectObject(data, label) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(`Invalid ${label} response from server`);
  }
  return data;
}

function expectArray(data, label) {
  if (!Array.isArray(data)) {
    throw new Error(`Invalid ${label} response from server`);
  }
  return data;
}

function expectAuth(data, label) {
  const auth = expectObject(data, label);
  if (typeof auth.token !== "string" || !auth.token) {
    throw new Error(`Invalid ${label} response from server`);
  }
  return auth;
}

async function request(
  path,
  { method = "GET", body, token, headers = {}, signal, validate } = {}
) {
  const finalHeaders = { ...headers };
  if (body !== undefined) finalHeaders["Content-Type"] = "application/json";
  if (token) finalHeaders["Authorization"] = `Bearer ${token}`;

  const timeoutController = new AbortController();
  const timeoutId = window.setTimeout(
    () => timeoutController.abort(new DOMException("Request timed out", "TimeoutError")),
    REQUEST_TIMEOUT_MS
  );
  const abortFromCaller = () => timeoutController.abort(signal.reason);
  if (signal) signal.addEventListener("abort", abortFromCaller, { once: true });

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: timeoutController.signal,
    });
  } catch (error) {
    if (timeoutController.signal.aborted && !signal?.aborted) {
      throw new Error("The server took too long to respond. Please try again.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
    if (signal) signal.removeEventListener("abort", abortFromCaller);
  }

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
    if (res.status === 401 && token) notifyUnauthorized();
    throw new Error(message);
  }

  return validate ? validate(data) : data;
}

export const api = {
  register: (email, password, options) =>
    request("/api/v1/auth/register", {
      method: "POST",
      body: { email, password },
      validate: (data) => expectAuth(data, "registration"),
      ...options,
    }),
  login: (email, password, options) =>
    request("/api/v1/auth/login", {
      method: "POST",
      body: { email, password },
      validate: (data) => expectAuth(data, "login"),
      ...options,
    }),

  startConnect: (token, options) =>
    request("/api/v1/instagram-login/connect", {
      token,
      validate: (data) => expectObject(data, "Instagram connect"),
      ...options,
    }),
  listAccounts: (token, options) =>
    request("/api/v1/instagram-login/accounts", {
      token,
      validate: (data) => expectArray(data, "account list"),
      ...options,
    }),
  disconnectAccount: (igUserId, token, options) =>
    request(`/api/v1/instagram-login/${igUserId}`, { method: "DELETE", token, ...options }),
  getInsights: (igUserId, token, reelLimit = 10, options) =>
    request(`/api/v1/instagram/${igUserId}/insights?reelLimit=${reelLimit}`, {
      token,
      validate: (data) => expectObject(data, "insights"),
      ...options,
    }),

  getPendingSelection: (selectionToken, token, options) =>
    request(`/api/v1/instagram/auth/pending/${selectionToken}`, {
      token,
      validate: (data) => expectObject(data, "pending selection"),
      ...options,
    }),
  selectPage: (selectionToken, pageId, token, options) =>
    request(`/api/v1/instagram/auth/pending/${selectionToken}/select`, {
      method: "POST",
      body: { pageId },
      token,
      validate: (data) => expectObject(data, "page selection"),
      ...options,
    }),

  discoverCreator: (username, token, options) =>
    request(`/api/v1/instagram/discovery/${encodeURIComponent(username)}`, {
      token,
      validate: (data) => expectObject(data, "creator discovery"),
      ...options,
    }),

  fetchRules: (igUserId, token, options) =>
    request(`/api/v1/instagram/${igUserId}/auto-dm-rules`, {
      token,
      validate: (data) => expectArray(data, "automation rules"),
      ...options,
    }),
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
  getRuleLogs: (igUserId, ruleId, token, options) =>
    request(`/api/v1/instagram/${igUserId}/auto-dm-rules/${ruleId}/log`, {
      token,
      validate: (data) => expectArray(data, "automation logs"),
      ...options,
    }),
  getInsightHistory: (igUserId, token, days = 30, options) =>
    request(`/api/v1/instagram/${igUserId}/history?days=${days}`, {
      token,
      validate: (data) => expectObject(data, "insight history"),
      ...options,
    }),
  getAudienceQuality: (igUserId, token, days = 30, options) =>
    request(`/api/v1/instagram/${igUserId}/audience-quality?days=${days}`, {
      token,
      validate: (data) => expectObject(data, "audience quality"),
      ...options,
    }),
};

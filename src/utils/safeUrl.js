const EXTERNAL_PROTOCOLS = new Set(["https:", "http:"]);
const INSTAGRAM_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
]);
const OAUTH_HOSTS = new Set([
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "instagram.com",
  "www.instagram.com",
  "api.instagram.com",
  "accountscenter.instagram.com",
]);

function parseUrl(value, baseUrl) {
  if (typeof value !== "string") return null;
  const candidate = value.trim();
  if (!candidate || candidate.length > 8192) return null;
  try {
    const url = new URL(candidate, baseUrl);
    if (url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

export function safeExternalUrl(value) {
  const url = parseUrl(value);
  return url && EXTERNAL_PROTOCOLS.has(url.protocol) ? url.href : null;
}

export function safeInstagramUrl(value) {
  const url = parseUrl(value);
  return url
    && url.protocol === "https:"
    && INSTAGRAM_HOSTS.has(url.hostname.toLowerCase())
    ? url.href
    : null;
}

export function safeRemoteImageUrl(value) {
  const baseUrl = typeof window === "undefined" ? undefined : window.location.origin;
  const url = parseUrl(value, baseUrl);
  if (!url) return null;
  const sameOrigin = baseUrl && url.origin === baseUrl;
  return url.protocol === "https:" || sameOrigin ? url.href : null;
}

export function requireOAuthAuthorizationUrl(value) {
  const url = parseUrl(value);
  if (
    !url
    || url.protocol !== "https:"
    || !OAUTH_HOSTS.has(url.hostname.toLowerCase())
  ) {
    throw new Error("The server returned an invalid authorization URL.");
  }
  return url.href;
}

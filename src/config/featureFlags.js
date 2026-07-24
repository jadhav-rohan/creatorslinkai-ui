const enabled = (value) =>
  typeof value === "string" && value.trim().toLowerCase() === "true";

export const featureFlags = Object.freeze({
  brandPortalEnabled: enabled(import.meta.env.VITE_BRAND_PORTAL_ENABLED),
});

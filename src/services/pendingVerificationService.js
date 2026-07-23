const KEY = "creatorlinksai_pending_email_verification";
const PERSONAS = new Set(["CREATOR", "BRAND"]);

export function getPendingVerification() {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(KEY));
    if (!value?.email || !PERSONAS.has(value.persona)) return null;
    return value;
  } catch {
    return null;
  }
}

export function setPendingVerification({ email, persona, cooldownUntil }) {
  if (!email || !PERSONAS.has(persona)) return;
  window.sessionStorage.setItem(KEY, JSON.stringify({
    email,
    persona,
    cooldownUntil: Number(cooldownUntil) || 0,
  }));
}

export function clearPendingVerification() {
  window.sessionStorage.removeItem(KEY);
}

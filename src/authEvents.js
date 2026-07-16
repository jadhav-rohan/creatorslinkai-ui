export const AUTH_UNAUTHORIZED_EVENT = "creatorlinksai:unauthorized";

export function notifyUnauthorized() {
  window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
}

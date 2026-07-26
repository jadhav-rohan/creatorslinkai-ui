const OVERLAY_ID = "instagram-ios-oauth-handoff";
const RETRY_DELAY_MS = 4500;

export function isIOSDevice() {
  const ua = window.navigator.userAgent || "";
  return /iPad|iPhone|iPod/.test(ua)
    || (window.navigator.platform === "MacIntel"
      && window.navigator.maxTouchPoints > 1);
}

export function openInstagramAuthorization(authorizationUrl, { onCancel } = {}) {
  if (!isIOSDevice()) {
    window.location.assign(authorizationUrl);
    return;
  }

  document.getElementById(OVERLAY_ID)?.remove();
  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.style.cssText = "position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(8,8,12,.88)";
  overlay.innerHTML = `
    <div style="width:min(100%,420px);border:2px solid #18181b;background:#fff;padding:24px;box-shadow:6px 6px 0 #18181b;color:#18181b;font-family:inherit">
      <h2 style="margin:0 0 10px;font-size:24px;font-weight:900">Connect Instagram</h2>
      <p style="margin:0 0 20px;line-height:1.5">Continue to Instagram to approve access to your creator account.</p>
      <a data-primary href="${escapeAttribute(authorizationUrl)}" style="display:block;border:2px solid #18181b;background:#fde047;padding:12px 16px;text-align:center;color:#18181b;font-weight:900;text-decoration:none">Continue to Instagram</a>
      <div data-recovery hidden style="margin-top:18px">
        <p style="margin:0 0 10px;font-size:14px;font-weight:700">Didn't connect?</p>
        <a data-retry href="${escapeAttribute(authorizationUrl)}" style="color:#18181b;font-weight:900;text-decoration:underline">Tap here to try again</a>
      </div>
      <button data-cancel type="button" style="width:100%;margin-top:18px;border:0;background:transparent;padding:8px;color:#52525b;font-weight:700">Cancel</button>
    </div>`;
  document.body.appendChild(overlay);

  let recoveryTimer;
  let navigationStarted = false;
  const recovery = overlay.querySelector("[data-recovery]");
  const scheduleRecovery = () => {
    clearTimeout(recoveryTimer);
    navigationStarted = true;
    recovery.hidden = true;
    recoveryTimer = window.setTimeout(() => {
      if (document.visibilityState === "visible" && overlay.isConnected) {
        recovery.hidden = false;
      }
    }, RETRY_DELAY_MS);
  };
  const noteDeparture = () => {
    if (navigationStarted) clearTimeout(recoveryTimer);
  };
  const noteReturn = () => {
    if (navigationStarted && document.visibilityState === "visible") {
      recovery.hidden = false;
    }
  };

  overlay.querySelector("[data-primary]").addEventListener("click", scheduleRecovery);
  overlay.querySelector("[data-retry]").addEventListener("click", scheduleRecovery);
  overlay.querySelector("[data-cancel]").addEventListener("click", () => {
    clearTimeout(recoveryTimer);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("pagehide", noteDeparture);
    window.removeEventListener("pageshow", noteReturn);
    overlay.remove();
    onCancel?.();
  });
  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") noteDeparture();
    else noteReturn();
  };
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("pagehide", noteDeparture);
  window.addEventListener("pageshow", noteReturn);
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

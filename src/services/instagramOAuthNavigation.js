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
      <a data-primary href="${escapeAttribute(authorizationUrl)}" target="_blank" rel="noopener noreferrer" style="display:block;border:2px solid #18181b;background:#fde047;padding:12px 16px;text-align:center;color:#18181b;font-weight:900;text-decoration:none">Continue to Instagram</a>
      <div data-recovery hidden style="margin-top:18px">
        <p style="margin:0 0 8px;font-size:14px;font-weight:900">Instagram app showed an error?</p>
        <p style="margin:0 0 12px;font-size:13px;line-height:1.45">
          Copy the secure login link, open a new Safari or Chrome tab, and paste it
          into the address bar. This keeps the login in your browser.
        </p>
        <button data-copy type="button" style="width:100%;border:2px solid #18181b;background:#fff;padding:11px 14px;color:#18181b;font-weight:900">Copy secure login link</button>
        <p data-copy-status role="status" hidden style="margin:8px 0 0;font-size:13px;font-weight:700;color:#166534">Link copied. Paste it into your browser address bar.</p>
        <a data-retry href="${escapeAttribute(authorizationUrl)}" target="_blank" rel="noopener noreferrer" style="display:block;margin-top:14px;color:#18181b;font-size:13px;font-weight:900;text-align:center;text-decoration:underline">Try opening Instagram again</a>
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
  overlay.querySelector("[data-copy]").addEventListener("click", async () => {
    const copied = await copyText(authorizationUrl);
    const status = overlay.querySelector("[data-copy-status]");
    status.hidden = false;
    status.textContent = copied
      ? "Link copied. Paste it into your browser address bar."
      : "Could not copy automatically. Long-press “Try opening Instagram again” and copy the link.";
    status.style.color = copied ? "#166534" : "#b91c1c";
  });
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

async function copyText(value) {
  try {
    await window.navigator.clipboard.writeText(value);
    return true;
  } catch {
    const input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.style.cssText = "position:fixed;left:-9999px;top:0";
    document.body.appendChild(input);
    input.select();
    input.setSelectionRange(0, input.value.length);
    const copied = document.execCommand("copy");
    input.remove();
    return copied;
  }
}

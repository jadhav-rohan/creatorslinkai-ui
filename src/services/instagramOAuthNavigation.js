const OVERLAY_ID = "instagram-mobile-oauth-handoff";

export function isMobileDevice() {
  const ua = window.navigator.userAgent || "";
  return window.navigator.userAgentData?.mobile === true
    || /Android|iPad|iPhone|iPod|Mobile/i.test(ua)
    || (window.navigator.platform === "MacIntel"
      && window.navigator.maxTouchPoints > 1);
}

export function openInstagramAuthorization(authorizationUrl, { onCancel } = {}) {
  if (!isMobileDevice()) {
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
      <p style="margin:0 0 12px;line-height:1.5">
        To keep Instagram Login in your mobile browser, copy the secure login
        link and paste it into a new Safari or Chrome address bar.
      </p>
      <ol style="margin:0 0 20px;padding-left:20px;font-size:13px;line-height:1.6">
        <li>Tap “Copy secure login link”.</li>
        <li>Open a new browser tab.</li>
        <li>Paste the link into the address bar and continue.</li>
      </ol>
      <button data-copy type="button" style="width:100%;border:2px solid #18181b;background:#fde047;padding:12px 16px;color:#18181b;font-weight:900">Copy secure login link</button>
      <p data-copy-status role="status" hidden style="margin:10px 0 0;font-size:13px;font-weight:700;color:#166534">Link copied. Paste it into your browser address bar.</p>
      <button data-cancel type="button" style="width:100%;margin-top:18px;border:0;background:transparent;padding:8px;color:#52525b;font-weight:700">Cancel</button>
    </div>`;
  document.body.appendChild(overlay);

  overlay.querySelector("[data-copy]").addEventListener("click", async () => {
    const copied = await copyText(authorizationUrl);
    const status = overlay.querySelector("[data-copy-status]");
    status.hidden = false;
    status.textContent = copied
      ? "Link copied. Paste it into your browser address bar."
      : "Could not copy automatically. Please try again or use a desktop browser.";
    status.style.color = copied ? "#166534" : "#b91c1c";
  });
  overlay.querySelector("[data-cancel]").addEventListener("click", () => {
    overlay.remove();
    onCancel?.();
  });
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

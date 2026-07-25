import { useEffect, useState } from "react";
import { Camera, ExternalLink, Unplug } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useThemedDialog } from "../context/ThemedDialogContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { useWorkspaceAuthorization } from "../context/WorkspaceAuthorizationContext";
import {
  connectionService,
  markConnectionInProgress,
} from "../services/connectionService";

export default function InstagramConnectionSettings() {
  const { token, logout } = useAuth();
  const { confirm } = useThemedDialog();
  const { selectedWorkspaceId } = useWorkspace();
  const { hasPermission } = useWorkspaceAuthorization();
  const canManage = hasPermission("CONNECTION_MANAGE");
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadConnections(signal) {
    if (!selectedWorkspaceId) {
      setAccounts([]);
      setSelectedAccount("");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await connectionService.listInstagram(
        selectedWorkspaceId,
        token,
        signal,
      );
      const items = Array.isArray(result) ? result : [];
      setAccounts(items);
      setSelectedAccount((current) =>
        items.some((item) => item.igUserId === current)
          ? current
          : items[0]?.igUserId || "",
      );
    } catch (requestError) {
      if (requestError.name === "AbortError") return;
      if (requestError.status === 401) logout();
      else setError("Instagram connection unavailable.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    setAccounts([]);
    setSelectedAccount("");
    loadConnections(controller.signal);
    return () => controller.abort();
  }, [selectedWorkspaceId, token]);

  async function connect() {
    if (loading || !canManage || !selectedWorkspaceId) return;
    setLoading(true);
    setError("");
    try {
      const result = await connectionService.connectInstagram(
        selectedWorkspaceId,
        token,
      );
      markConnectionInProgress(
        selectedWorkspaceId,
        "INSTAGRAM_LOGIN",
        accounts.map((account) => account.igUserId),
      );
      window.location.assign(result.authorizationUrl);
    } catch (requestError) {
      if (requestError.status === 401) logout();
      else setError(requestError.message || "Instagram connection unavailable.");
      setLoading(false);
    }
  }

  async function disconnect() {
    const account = accounts.find(
      (item) => item.igUserId === selectedAccount,
    );
    if (!account || loading || !canManage) return;
    const username = account.username || account.igUsername || "Instagram account";
    const accepted = await confirm(
      `Disconnect ${username.startsWith("@") ? username : `@${username}`}? Creator insights and automations will be unavailable until an account is connected again.`,
      {
        title: "Disconnect Instagram",
        confirmLabel: "Disconnect",
      },
    );
    if (!accepted) return;
    setLoading(true);
    setError("");
    try {
      await connectionService.disconnectInstagram(
        account.igUserId,
        selectedWorkspaceId,
        token,
      );
      await loadConnections();
    } catch (requestError) {
      if (requestError.status === 401) logout();
      else setError(requestError.message || "Instagram could not be disconnected.");
      setLoading(false);
    }
  }

  return (
    <section className="brutal-card p-5 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Camera size={22} />
            <h2 className="text-2xl font-black">Instagram connection</h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            Manage the Instagram account used for insights and Auto-DM. This is
            separate from your CreatorLinksAI profile.
          </p>
        </div>
        {!loading && !accounts.length && canManage && (
          <button
            type="button"
            onClick={connect}
            disabled={!selectedWorkspaceId}
            className="brutal-button flex shrink-0 gap-2"
          >
            <ExternalLink size={16} />
            Connect Instagram
          </button>
        )}
      </div>

      {loading && !accounts.length ? (
        <div className="mt-6 h-24 animate-pulse border-2 border-zinc-900 bg-zinc-200" />
      ) : accounts.length ? (
        <div className="mt-6 grid gap-4 border-2 border-zinc-900 bg-zinc-50 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <label className="block text-sm font-bold">
            Connected account
            <select
              value={selectedAccount}
              onChange={(event) => setSelectedAccount(event.target.value)}
              className="brutal-field mt-2 w-full"
            >
              {accounts.map((account) => (
                <option key={account.igUserId} value={account.igUserId}>
                  @
                  {account.username ||
                    account.igUsername ||
                    "Instagram account"}
                </option>
              ))}
            </select>
          </label>
          {canManage && (
            <button
              type="button"
              onClick={disconnect}
              disabled={loading}
              className="flex min-h-11 items-center justify-center gap-2 border-2 border-red-600 bg-white px-5 font-black text-red-700 disabled:opacity-50"
            >
              <Unplug size={16} />
              {loading ? "Disconnecting…" : "Disconnect"}
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6 border-2 border-dashed border-zinc-400 p-6 text-sm text-zinc-600">
          No Instagram account is connected to this Creator workspace.
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 border-2 border-red-700 bg-red-50 p-3 text-sm font-bold text-red-800">
          {error}
        </p>
      )}
    </section>
  );
}

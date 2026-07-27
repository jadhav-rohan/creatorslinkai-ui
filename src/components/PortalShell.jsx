import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  Camera,
  FileImage,
  FilePenLine,
  FileText,
  LayoutDashboard,
  List,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Share2,
  ShieldCheck,
  Unplug,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { useWorkspaceAuthorization } from "../context/WorkspaceAuthorizationContext";
import {
  connectionService,
  markConnectionInProgress,
} from "../services/connectionService";
import { useThemedDialog } from "../context/ThemedDialogContext";
import { openInstagramAuthorization } from "../services/instagramOAuthNavigation";

const creatorLinks = [
  ["Dashboard", "/creator/dashboard", LayoutDashboard],
  ["AI Script Writer", "/creator/scripts", FilePenLine],
  ["Media Kit", "/creator/media-kit", FileImage],
  ["Invoices", "/creator/invoices", FileText],
  ["Auto DM", "/creator/auto-dm", MessageCircle],
  // ["Insight Requests", "/creator/insight-requests", ShieldCheck],
];
const brandLinks = [
  ["Discovery", "/brand/discovery", Search],
  ["List", "/brand/lists", List],
  ["Campaign", "/brand/campaigns", FileText],
  ["Analytics", "/brand/analytics", BarChart3],
];

function AccountAvatar({ url, name }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border-2 border-zinc-900 bg-sky-200 text-sm font-black lg:h-9 lg:w-9 lg:text-xs">
      {url && !failed ? (
        <img
          src={url}
          alt=""
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        name.slice(0, 1).toUpperCase()
      )}
    </span>
  );
}

export default function PortalShell({ persona }) {
  const { confirm } = useThemedDialog();
  const { email, workspaceType, logout, loggingOut, token, profile } =
    useAuth();
  const { selectedWorkspaceId } = useWorkspace();
  const { hasPermission } = useWorkspaceAuthorization();
  const creator = persona === "CREATOR";
  const links = creator ? creatorLinks : brandLinks;
  const name =
    profile?.displayName ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    email?.split("@")[0] ||
    "Creator";
  const canManageConnection = hasPermission("CONNECTION_MANAGE");
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const connectionName = creator ? "Instagram" : "Facebook";
  const ConnectionIcon = creator ? Camera : Share2;

  async function loadConnections() {
    if (creator || !selectedWorkspaceId) return;
    setConnectionLoading(true);
    setConnectionError("");
    try {
      const result = creator
        ? await connectionService.listInstagram(selectedWorkspaceId, token)
        : await connectionService.listFacebook(selectedWorkspaceId, token);
      const items = Array.isArray(result) ? result : [];
      setAccounts(items);
      setSelectedAccount((current) =>
        items.some((item) => item.igUserId === current)
          ? current
          : items[0]?.igUserId || ""
      );
    } catch (error) {
      if (error.status === 401) logout();
      else setConnectionError(`${connectionName} connection unavailable.`);
    } finally {
      setConnectionLoading(false);
    }
  }

  useEffect(() => {
    setAccounts([]);
    setSelectedAccount("");
    if (!creator) loadConnections();
  }, [creator, selectedWorkspaceId, token]);

  async function connect() {
    if (connectionLoading || !canManageConnection) return;
    setConnectionLoading(true);
    setConnectionError("");
    try {
      const result = creator
        ? await connectionService.connectInstagram(selectedWorkspaceId, token)
        : await connectionService.connectFacebook(selectedWorkspaceId, token);
      markConnectionInProgress(
        selectedWorkspaceId,
        creator ? "INSTAGRAM_LOGIN" : "FACEBOOK_LOGIN",
        accounts.map((item) => item.igUserId)
      );
      if (creator) {
        openInstagramAuthorization(result.authorizationUrl, {
          onCancel: () => setConnectionLoading(false),
        });
      }
      else window.location.assign(result.authorizationUrl);
    } catch (error) {
      if (error.status === 401) logout();
      else setConnectionError(error.message);
      setConnectionLoading(false);
    }
  }

  async function disconnect() {
    const account = accounts.find((item) => item.igUserId === selectedAccount);
    const handle =
      account?.username ||
      account?.igUsername ||
      account?.pageName ||
      `${connectionName} account`;
    if (
      !account ||
      connectionLoading ||
      !canManageConnection ||
      !(await confirm(
        `Disconnect ${
          handle.startsWith("@") ? handle : `@${handle}`
        }? This removes the ${connectionName} connection from this workspace.`,
        {
          title: `Disconnect ${connectionName}`,
          confirmLabel: "Disconnect",
        }
      ))
    )
      return;
    setConnectionLoading(true);
    setConnectionError("");
    try {
      if (creator)
        await connectionService.disconnectInstagram(
          account.igUserId,
          selectedWorkspaceId,
          token
        );
      else
        await connectionService.disconnectFacebook(
          account.igUserId,
          selectedWorkspaceId,
          token
        );
      await loadConnections();
    } catch (error) {
      if (error.status === 401) logout();
      else setConnectionError(error.message);
      setConnectionLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-deep text-text-primary lg:grid lg:grid-cols-[208px_minmax(0,1fr)]">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(80vw,268px)] flex-col border-r-2 border-zinc-900 bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:w-[208px] lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label={`${persona} portal navigation`}
      >
        <div className="flex min-h-[74px] items-center justify-between border-b-2 border-zinc-900 px-4 lg:min-h-[68px] lg:px-4">
          <div>
            <strong className="text-base font-black tracking-tight lg:text-base">
              CreatorLinksAI
            </strong>
            <span className="mt-1.5 block w-fit rounded-full border border-zinc-900 bg-emerald-200 px-2.5 py-0.5 text-[10px] font-black uppercase lg:px-2.5 lg:py-0.5 lg:text-[9px]">
              {creator
                ? "CREATOR"
                : workspaceType === "AGENCY"
                ? "AGENCY"
                : "BRAND"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="flex h-11 w-11 items-center justify-center lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-3 lg:space-y-1 lg:p-3">
          {links.map(([label, to, Icon, comingSoon]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-2.5 border-2 px-3 py-2.5 text-sm font-black transition-transform lg:min-h-10 lg:gap-2.5 lg:px-3 lg:py-2 lg:text-sm ${
                  isActive
                    ? "border-zinc-900 bg-yellow-300 shadow-[4px_4px_0_#18181b]"
                    : "border-transparent bg-white hover:border-zinc-900 hover:bg-zinc-100"
                }`
              }
            >
              <Icon className="nb-icon" strokeWidth={2.2} />
              <span>{label}</span>
              {comingSoon && (
                <span className="ml-auto rounded-full border border-zinc-900 bg-sky-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide">
                  Soon
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {!creator && (
          <section
            aria-label={`${connectionName} connection`}
            className="border-t-2 border-zinc-900 p-4 lg:p-3"
          >
            <div className="flex items-center gap-2">
              <ConnectionIcon size={16} />
              <p className="text-xs font-black uppercase tracking-wide lg:text-[10px]">
                {connectionName}
              </p>
            </div>
            {connectionLoading && !accounts.length ? (
              <p className="mt-3 text-xs text-zinc-500">Checking connection…</p>
            ) : accounts.length ? (
              <>
                <div className="mt-3 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold">
                    {accounts.length} connected
                  </span>
                </div>
                <select
                  value={selectedAccount}
                  onChange={(event) => setSelectedAccount(event.target.value)}
                  aria-label={`Connected ${connectionName} account`}
                  className="brutal-field mt-2 w-full min-w-0 py-2 text-xs lg:text-[11px]"
                >
                  {accounts.map((account) => (
                    <option key={account.igUserId} value={account.igUserId}>
                      @
                      {account.username ||
                        account.igUsername ||
                        account.pageName ||
                        `${connectionName} account`}
                    </option>
                  ))}
                </select>
                {canManageConnection && (
                  <button
                    type="button"
                    onClick={disconnect}
                    disabled={connectionLoading}
                    className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 border-2 border-red-600 bg-white px-3 py-2 text-xs font-black text-red-700 disabled:opacity-50 lg:min-h-9 lg:py-1.5 lg:text-[11px]"
                  >
                    <Unplug size={15} />
                    {connectionLoading ? "Disconnecting…" : "Disconnect"}
                  </button>
                )}
              </>
            ) : canManageConnection ? (
              <button
                type="button"
                onClick={connect}
                disabled={connectionLoading || !selectedWorkspaceId}
                className="brutal-button mt-3 flex min-h-11 w-full gap-2 px-3 py-2 text-xs"
              >
                <ConnectionIcon size={16} />
                {connectionLoading ? "Opening…" : `Connect ${connectionName}`}
              </button>
            ) : (
              <p className="mt-3 text-xs text-zinc-500">
                No connection available.
              </p>
            )}
            {connectionError && (
              <p role="alert" className="mt-2 text-xs font-bold text-red-700">
                {connectionError}
              </p>
            )}
          </section>
        )}

        <div className="border-t-2 border-zinc-900 p-4 lg:p-3">
          <div className="flex min-w-0 items-center gap-3">
            <AccountAvatar url={profile?.profilePictureUrl} name={name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-black lg:text-xs">{name}</p>
              <p className="truncate text-xs text-zinc-500">{email}</p>
            </div>
          </div>
          <Link
            to={creator ? "/creator/profile" : "/brand/profile"}
            onClick={() => setOpen(false)}
            className="mt-2.5 flex min-h-11 items-center gap-2 border-2 border-zinc-900 bg-white px-3 py-2 text-sm font-black lg:min-h-9 lg:text-xs"
          >
            <UserRound size={16} />
            Account settings
          </Link>
          <button
            onClick={() => logout()}
            disabled={loggingOut}
            className="mt-2.5 flex min-h-11 items-center gap-2 text-sm font-black text-red-600 disabled:cursor-not-allowed disabled:opacity-50 lg:mt-3 lg:min-h-9 lg:text-xs"
          >
            <LogOut size={17} />
            {loggingOut ? "Signing Out…" : "Sign Out"}
          </button>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 min-h-0 bg-black/45 lg:hidden"
        />
      )}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex min-h-[74px] items-center gap-3 border-b-2 border-zinc-900 bg-white px-3 sm:px-5 lg:min-h-[68px] lg:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            aria-expanded={open}
            className="flex h-11 w-11 items-center justify-center border-2 border-zinc-900 bg-yellow-300 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div>
            <p className="text-[11px] text-zinc-500 sm:text-xs">Welcome back,</p>
            <p className="text-sm font-black sm:text-base">{name}</p>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}

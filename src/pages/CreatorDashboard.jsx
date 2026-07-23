import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, instagramInsightsErrorMessage } from "../api";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import {
  connectionService,
  INSTAGRAM_CONNECTION_CHANGED,
} from "../services/connectionService";
import { useCreatorDashboard } from "../hooks/useCreatorDashboard";
import {
  AudienceQualityPanel,
  HistoryPanel,
  ReelsPanel,
} from "../components/CreatorAnalyticsPanels";
const compact = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1,
});
const integer = new Intl.NumberFormat();
const metric = (value) => (value == null ? "—" : compact.format(value));
const percent = (value) =>
  value == null
    ? "—"
    : `${Number(value).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}%`;
function MetricCard({ label, value }) {
  return (
    <article aria-label={`${label}: ${value}`} className="brutal-card p-5">
      <p className="brutal-overline text-zinc-500">{label}</p>
      <p className="mt-4 font-mono text-3xl font-bold">{value}</p>
    </article>
  );
}
function Skeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading creator dashboard"
      className="animate-pulse"
    >
      <div className="h-32 border-2 border-zinc-900 bg-zinc-200" />
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((x) => (
          <div key={x} className="h-32 border-2 border-zinc-900 bg-zinc-200" />
        ))}
      </div>
      <div className="mt-6 h-52 border-2 border-zinc-900 bg-zinc-200" />
    </div>
  );
}
export default function CreatorDashboard() {
  const { token, defaultWorkspaceId, activePersona, logout } = useAuth(),
    { selectedWorkspace } = useWorkspace(),
    allowed = ["CREATOR", "PERSONAL"].includes(selectedWorkspace?.type),
    workspaceId = allowed ? selectedWorkspace.id : defaultWorkspaceId,
    [selectedAccount, setSelectedAccount] = useState(() =>
      workspaceId
        ? sessionStorage.getItem(`creatorDashboardAccount:${workspaceId}`) || ""
        : ""
    ),
    [refreshing, setRefreshing] = useState(false),
    [notice, setNotice] = useState(null),
    [actionError, setActionError] = useState(null),
    [activeTab, setActiveTab] = useState("metrics");
  useEffect(() => {
    setSelectedAccount(
      workspaceId
        ? sessionStorage.getItem(`creatorDashboardAccount:${workspaceId}`) || ""
        : ""
    );
    setNotice(null);
    setActionError(null);
  }, [workspaceId]);
  const { data, loading, error, refetch } = useCreatorDashboard({
    workspaceId,
    igUserId: selectedAccount || null,
    token,
    enabled:
      activePersona === "CREATOR" &&
      Boolean(workspaceId) &&
      (["CREATOR", "PERSONAL"].includes(selectedWorkspace?.type) ||
        workspaceId === defaultWorkspaceId),
    onUnauthorized: logout,
  });
  useEffect(() => {
    function handleConnectionChanged(event) {
      if (event.detail?.workspaceId !== workspaceId) return;
      if (
        !selectedAccount ||
        event.detail?.igUserId === selectedAccount
      ) {
        sessionStorage.removeItem(`creatorDashboardAccount:${workspaceId}`);
        setSelectedAccount("");
      }
      refetch({ clearData: true });
    }
    window.addEventListener(
      INSTAGRAM_CONNECTION_CHANGED,
      handleConnectionChanged
    );
    return () =>
      window.removeEventListener(
        INSTAGRAM_CONNECTION_CHANGED,
        handleConnectionChanged
      );
  }, [workspaceId, selectedAccount, refetch]);
  useEffect(() => {
    if (error?.status === 400 && selectedAccount) {
      sessionStorage.removeItem(`creatorDashboardAccount:${workspaceId}`);
      setSelectedAccount("");
    }
  }, [error, selectedAccount, workspaceId]);
  useEffect(() => {
    if (!data?.accounts?.length) return;
    const valid = data.accounts.some((x) => x.igUserId === selectedAccount);
    if (selectedAccount && !valid) {
      sessionStorage.removeItem(`creatorDashboardAccount:${workspaceId}`);
      setSelectedAccount("");
    }
  }, [data, selectedAccount, workspaceId]);
  const connection = data?.connection,
    metrics = data?.metrics;
  const status = connection?.needsReconnect
    ? "Reconnection required"
    : connection?.connected
    ? "Connected"
    : "Not connected";
  const autoText = useMemo(() => {
    if (!data) return "";
    const a = data.autoDm;
    return a.enabled
      ? `${a.activeRuleCount} active rule${a.activeRuleCount === 1 ? "" : "s"}`
      : a.totalRuleCount
      ? `No active rules · ${a.totalRuleCount} total`
      : "No rules configured";
  }, [data]);
  function choose(value) {
    setSelectedAccount(value);
    if (value)
      sessionStorage.setItem(`creatorDashboardAccount:${workspaceId}`, value);
    else sessionStorage.removeItem(`creatorDashboardAccount:${workspaceId}`);
  }
  async function connect() {
    if (refreshing) return;
    setRefreshing(true);
    setActionError(null);
    try {
      const x = await connectionService.connectInstagram(workspaceId, token);
      window.location.assign(x.authorizationUrl);
    } catch (e) {
      setActionError(e.message);
      setRefreshing(false);
    }
  }
  async function refreshInsights() {
    if (refreshing || !connection?.igUserId) return;
    setRefreshing(true);
    setActionError(null);
    setNotice(null);
    try {
      await api.getInsights(connection.igUserId, token, 10);
      refetch();
      setNotice(
        "Insights refreshed from Instagram. Stored dashboard metrics are updating."
      );
    } catch (e) {
      if (e.status === 401) logout();
      else setActionError(instagramInsightsErrorMessage(e));
    } finally {
      setRefreshing(false);
    }
  }
  if (loading && !data)
    return (
      <main className="brutal-page min-h-[calc(100vh-82px)] p-6 md:p-8">
        <div className="mx-auto max-w-6xl">
          <Skeleton />
        </div>
      </main>
    );
  if (error && !data)
    return (
      <main className="brutal-page min-h-[calc(100vh-82px)] p-6 md:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="brutal-card p-8">
            <p className="brutal-overline">Dashboard unavailable</p>
            <h1 className="mt-3 text-4xl font-black">
              We couldn’t load your creator dashboard.
            </h1>
            <p className="mt-3 text-zinc-600">
              {error.status === 400
                ? "This workspace or Instagram account selection is not valid."
                : error.status === 403
                ? "You do not have access to this creator workspace."
                : error.status === 404
                ? "This creator workspace is no longer available."
                : "A temporary service or network error occurred."}
            </p>
            {error.requestId && (
              <p className="mt-3 font-mono text-xs">
                Support ID: {error.requestId}
              </p>
            )}
            <button onClick={refetch} className="brutal-button mt-6">
              Retry dashboard
            </button>
          </div>
        </div>
      </main>
    );
  if (!data) return null;
  return (
    <main className="brutal-page min-h-[calc(100vh-82px)] p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="brutal-card p-6 md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border-2 border-zinc-900 bg-yellow-300 text-xl font-black">
                {connection.profilePictureUrl ? (
                  <img
                    src={connection.profilePictureUrl}
                    alt={`${connection.username || "Creator"} profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (connection.username || "CR").slice(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <p className="brutal-overline">Creator workspace</p>
                <h1 className="mt-1 text-3xl font-black">
                  {connection.connected
                    ? `@${connection.username}`
                    : "Your creator dashboard"}
                </h1>
                <p className="mt-2 text-sm text-zinc-600">
                  Status: <strong className="text-zinc-900">{status}</strong>
                  {metrics.capturedAt
                    ? ` · Last updated ${new Date(
                        metrics.capturedAt
                      ).toLocaleString()}`
                    : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              {data.accounts.length > 1 && (
                <label className="font-bold">
                  Instagram account
                  <select
                    value={connection.igUserId || selectedAccount}
                    onChange={(e) => choose(e.target.value)}
                    className="brutal-field mt-2 block min-w-56"
                  >
                    {data.accounts.map((x) => (
                      <option key={x.igUserId} value={x.igUserId}>
                        @{x.username}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {connection.connected &&
                (connection.needsReconnect ? (
                  <button
                    onClick={connect}
                    disabled={refreshing}
                    className="brutal-button"
                  >
                    Reconnect Instagram
                  </button>
                ) : (
                  <button
                    onClick={refreshInsights}
                    disabled={refreshing}
                    className="border-2 border-zinc-900 bg-white px-5 py-3 font-bold shadow-[4px_4px_0_#18181b]"
                  >
                    {refreshing
                      ? "Refreshing live insights…"
                      : metrics.available
                      ? "Refresh insights"
                      : "Fetch insights"}
                  </button>
                ))}
            </div>
          </div>
        </header>
        <div aria-live="polite">
          {notice && (
            <p
              role="status"
              className="mt-5 border-2 border-zinc-900 bg-emerald-200 p-3 font-bold"
            >
              {notice}
            </p>
          )}
          {actionError && (
            <p
              role="alert"
              className="mt-5 border-2 border-red-700 bg-red-50 p-3 text-red-800"
            >
              {actionError}
            </p>
          )}
        </div>
        <div
          role="tablist"
          aria-label="Creator dashboard sections"
          className="mt-7 flex gap-2 border-b-2 border-zinc-900 pb-3"
        >
          <button
            role="tab"
            aria-selected="true"
            className="border-2 border-zinc-900 bg-yellow-300 px-5 py-3 font-black"
          >
            Metrics Overview
          </button>
          <Link
            to="/creator/auto-dm"
            className="inline-flex items-center border-2 border-zinc-900 bg-white px-5 py-3 font-black"
          >
            Auto-DM Automations
          </Link>
        </div>
        <div role="tabpanel">
          {!connection.connected ? (
            <section className="brutal-card mt-7 bg-yellow-300 p-8">
              <p className="brutal-overline">Get started</p>
              <h2 className="mt-3 text-3xl font-black">
                Connect your Instagram
              </h2>
              <p className="mt-3 max-w-xl">
                Connecting enables stored insights and Comment Auto-DM.
                CreatorLinksAI uses Instagram Login for creator accounts.
              </p>
              <button
                onClick={connect}
                disabled={refreshing}
                className="mt-6 min-h-13 border-2 border-zinc-900 bg-white px-6 py-3 font-black shadow-[4px_4px_0_#18181b]"
              >
                {refreshing ? "Opening Instagram…" : "Connect Instagram"}
              </button>
            </section>
          ) : (
            <>
              {connection.needsReconnect && (
                <section className="mt-7 border-2 border-zinc-900 bg-rose-200 p-6 shadow-[4px_4px_0_#18181b]">
                  <h2 className="text-2xl font-black">
                    Instagram authorization needs attention
                  </h2>
                  <p className="mt-2">
                    Reconnect to refresh access. Metrics below are historical
                    stored snapshots and may be out of date.
                  </p>
                </section>
              )}
              {!metrics.available ? (
                <section className="brutal-card mt-7 p-8">
                  <h2 className="text-2xl font-black">
                    Instagram is connected, but no insight snapshot is available
                    yet.
                  </h2>
                  <p className="mt-2 text-zinc-600">
                    Fetch insights when you’re ready. This is never called
                    automatically on dashboard load.
                  </p>
                  <button
                    onClick={refreshInsights}
                    disabled={refreshing || connection.needsReconnect}
                    className="brutal-button mt-6"
                  >
                    {refreshing ? "Fetching insights…" : "Fetch insights"}
                  </button>
                </section>
              ) : (
                <>
                  <section
                    aria-label="Primary Instagram metrics"
                    className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4"
                  >
                    <MetricCard
                      label="Followers"
                      value={metric(metrics.followers)}
                    />
                    <MetricCard
                      label="Engagement rate"
                      value={percent(metrics.engagementRate)}
                    />
                    <MetricCard
                      label="Average views"
                      value={metric(metrics.averageViews)}
                    />
                    <MetricCard
                      label="Average likes"
                      value={metric(metrics.averageLikes)}
                    />
                  </section>
                  <section className="brutal-card mt-7 p-6">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="brutal-overline">Stored insights</p>
                        <h2 className="mt-2 text-2xl font-black">
                          Latest Instagram snapshot
                        </h2>
                      </div>
                      <p className="text-sm text-zinc-600">
                        Metrics from the latest stored Instagram snapshot.
                      </p>
                    </div>
                    <dl className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-5">
                      {[
                        ["Media count", integer.format(metrics.mediaCount)],
                        ["Account reach", metric(metrics.accountReach)],
                        ["Profile views", metric(metrics.profileViews)],
                        ["Impressions", metric(metrics.impressions)],
                        [
                          "Captured",
                          metrics.capturedAt
                            ? new Date(metrics.capturedAt).toLocaleString()
                            : "—",
                        ],
                      ].map(([l, v]) => (
                        <div key={l}>
                          <dt className="text-xs uppercase tracking-wider text-zinc-500">
                            {l}
                          </dt>
                          <dd className="mt-1 font-mono font-bold">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                  {data.insights ? (
                    <>
                      <section
                        aria-label="Complete stored Instagram metrics"
                        className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
                      >
                        {[
                          ["Followers", data.insights.followersCount],
                          ["Total posts", data.insights.mediaCount],
                          ["Reel views", data.insights.totalReelViews],
                          ["Reel likes", data.insights.totalReelLikes],
                          ["Reel comments", data.insights.totalReelComments],
                          ["Reel saves", data.insights.totalReelSaves],
                          ["Reel shares", data.insights.totalReelShares],
                          ["Reel reach", data.insights.totalReelReach],
                          [
                            "Total interactions",
                            data.insights.totalReelInteractions,
                          ],
                          ["Account reach", data.insights.accountReach],
                          ["Profile views", data.insights.accountProfileViews],
                          ["Impressions", data.insights.accountImpressions],
                          ["Reels analyzed", data.insights.reelsAnalyzed],
                        ].map(([label, value]) => (
                          <MetricCard
                            key={label}
                            label={label}
                            value={metric(value)}
                          />
                        ))}
                      </section>
                      <ReelsPanel
                        reels={data.insights.reels || []}
                        onRefresh={refreshInsights}
                        refreshing={refreshing}
                      />
                    </>
                  ) : (
                    <div className="mt-7 border-2 border-zinc-900 bg-yellow-100 p-5">
                      <strong>
                        Detailed Reel insights are not available in this
                        snapshot.
                      </strong>
                      <p className="mt-1">Refresh insights to populate them.</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
          {connection.connected && (
            <>
              <AudienceQualityPanel
                igUserId={connection.igUserId}
                token={token}
                enabled={Boolean(connection.igUserId)}
                onUnauthorized={logout}
              />
              <HistoryPanel
                igUserId={connection.igUserId}
                token={token}
                enabled={Boolean(connection.igUserId)}
                onUnauthorized={logout}
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
}

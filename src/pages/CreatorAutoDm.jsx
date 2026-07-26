import { useCallback, useEffect, useMemo, useState } from "react";
import { api, instagramInsightsErrorMessage } from "../api";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { useWorkspaceAuthorization } from "../context/WorkspaceAuthorizationContext";
import { connectionService } from "../services/connectionService";
import { creatorDashboardService } from "../services/creatorDashboardService";
import AutoDmTemplateFields, {
  createTemplateElement,
  serializeTemplate,
  validateTemplate,
} from "../components/AutoDmTemplateFields";
import AutoDmTemplatePreview from "../components/AutoDmTemplatePreview";
import AutoDmMediaPicker from "../components/AutoDmMediaPicker";
import AutoDmRuleCard from "../components/AutoDmRuleCard";
import { useThemedDialog } from "../context/ThemedDialogContext";
import { DEFAULT_FOLLOW_REMINDER_MESSAGE } from "../autoDmFollowerGate";

const accountName = (account) =>
  account?.username ||
  account?.igUsername ||
  account?.handle ||
  "Instagram account";
const support = (error) =>
  `${
    [403, 404, 502].includes(error?.status)
      ? ` ${instagramInsightsErrorMessage(error)}`
      : ""
  }${error?.requestId ? ` Support ID: ${error.requestId}` : ""}`;
const newRuleForm = () => ({
  mediaId: "",
  keyword: "",
  responseType: "TEXT",
  dmMessage: "",
  publicReplyMessage: "",
  requireFollower: false,
  followReminderMessage: "",
  elements: [createTemplateElement()],
});
const ruleDate = (rule) =>
  new Date(rule.updatedAt || rule.createdAt || 0).getTime();

function formFromRule(rule) {
  const requireFollower = rule.requireFollower === true;
  const elements =
    Array.isArray(rule.elements) && rule.elements.length
      ? rule.elements.map((element) => createTemplateElement(element))
      : [createTemplateElement()];
  return {
    mediaId: rule.mediaId || "",
    keyword: rule.keyword || "",
    responseType: rule.responseType || "TEXT",
    dmMessage: rule.dmMessage || "",
    publicReplyMessage: rule.publicReplyMessage || "",
    requireFollower,
    followReminderMessage: requireFollower
      ? rule.followReminderMessage?.trim() || DEFAULT_FOLLOW_REMINDER_MESSAGE
      : "",
    elements,
  };
}

export default function CreatorAutoDm() {
  const { confirm } = useThemedDialog();
  const { token, logout } = useAuth();
  const { selectedWorkspace, loading: workspaceLoading } = useWorkspace();
  const {
    hasPermission,
    isLoading: permissionsLoading,
    error: permissionsError,
  } = useWorkspaceAuthorization();
  const workspaceId = selectedWorkspace?.id || "";
  const workspaceAllowed = ["CREATOR", "PERSONAL"].includes(
    selectedWorkspace?.type
  );
  const canView = hasPermission("AUTO_DM_VIEW");
  const canEdit = hasPermission("AUTO_DM_EDIT");
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountsError, setAccountsError] = useState(null);
  const [selectedId, setSelectedId] = useState("");
  const [rules, setRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesError, setRulesError] = useState(null);
  const [eligibleMedia, setEligibleMedia] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [conflictRule, setConflictRule] = useState(null);
  const [form, setForm] = useState(newRuleForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [notice, setNotice] = useState("");

  const loadAccounts = useCallback(
    async (signal) => {
      if (!workspaceId || !workspaceAllowed || !canView) return;
      setAccountsLoading(true);
      setAccountsError(null);
      try {
        const result = await connectionService.listInstagram(
          workspaceId,
          token,
          signal
        );
        const items = Array.isArray(result) ? result : [];
        setAccounts(items);
        setSelectedId((current) => {
          const candidate =
            current ||
            sessionStorage.getItem(`creatorAutoDmAccount:${workspaceId}`);
          return items.some((account) => account.igUserId === candidate)
            ? candidate
            : items[0]?.igUserId || "";
        });
      } catch (error) {
        if (error.name === "AbortError") return;
        if (error.status === 401) logout();
        else setAccountsError(error);
      } finally {
        if (!signal?.aborted) setAccountsLoading(false);
      }
    },
    [workspaceId, workspaceAllowed, canView, token, logout]
  );

  useEffect(() => {
    setAccounts([]);
    setSelectedId("");
    setRules([]);
    const controller = new AbortController();
    loadAccounts(controller.signal);
    return () => controller.abort();
  }, [loadAccounts]);

  const loadRules = useCallback(async () => {
    if (!selectedId) return;
    setRulesLoading(true);
    setRulesError(null);
    try {
      const result = await api.fetchRules(selectedId, token);
      setRules(Array.isArray(result) ? result : []);
    } catch (error) {
      if (error.status === 401) logout();
      else setRulesError(error);
    } finally {
      setRulesLoading(false);
    }
  }, [selectedId, token, logout]);

  useEffect(() => {
    setRules([]);
    setEligibleMedia([]);
    closeEditor();
    if (selectedId) {
      sessionStorage.setItem(`creatorAutoDmAccount:${workspaceId}`, selectedId);
      loadRules();
    }
  }, [selectedId, workspaceId, loadRules]);

  const activeRuleByMedia = useMemo(() => {
    const map = new Map();
    [...rules]
      .filter((rule) => rule.active !== false && rule.mediaId)
      .sort((left, right) => ruleDate(right) - ruleDate(left))
      .forEach((rule) => {
        if (!map.has(rule.mediaId)) map.set(rule.mediaId, rule);
      });
    return map;
  }, [rules]);
  const mediaById = useMemo(
    () => new Map(eligibleMedia.map((media) => [media.mediaId, media])),
    [eligibleMedia]
  );
  const orderedRules = useMemo(
    () =>
      [...rules].sort((left, right) => {
        if ((left.active === false) !== (right.active === false))
          return left.active === false ? 1 : -1;
        return ruleDate(right) - ruleDate(left);
      }),
    [rules]
  );

  function closeEditor() {
    setShowForm(false);
    setEditingRule(null);
    setConflictRule(null);
    setFormError("");
    setForm(newRuleForm());
  }

  function beginCreate() {
    setEditingRule(null);
    setConflictRule(null);
    setForm(newRuleForm());
    setFormError("");
    setNotice("");
    setShowForm(true);
  }

  function beginEdit(rule) {
    setEditingRule(rule);
    setConflictRule(null);
    setForm(formFromRule(rule));
    setFormError("");
    setNotice("");
    setShowForm(true);
    window.requestAnimationFrame(() =>
      document.getElementById("auto-dm-rule-editor")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    );
  }

  async function connect() {
    if (connecting) return;
    setConnecting(true);
    setAccountsError(null);
    try {
      const result = await connectionService.connectInstagram(
        workspaceId,
        token
      );
      window.location.assign(result.authorizationUrl);
    } catch (error) {
      if (error.status === 401) logout();
      else setAccountsError(error);
      setConnecting(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (!canEdit || saving) return;
    const mediaId = form.mediaId.trim();
    const keyword = form.keyword.trim();
    const dmMessage = form.dmMessage.trim();
    const publicReplyMessage = form.publicReplyMessage.trim();
    const followReminderMessage = form.followReminderMessage.trim();
    if (!mediaId) {
      setFormError("Select a Reel or post for this Auto-DM rule.");
      return;
    }
    const configuredRule = activeRuleByMedia.get(mediaId);
    if (configuredRule && configuredRule.id !== editingRule?.id) {
      setConflictRule(configuredRule);
      setFormError(
        "This Reel or post already has an Auto-DM rule. Edit the existing rule instead."
      );
      return;
    }
    if (!keyword || (form.responseType === "TEXT" && !dmMessage)) {
      setFormError(
        `Keyword${
          form.responseType === "TEXT" ? " and private DM message" : ""
        } are required.`
      );
      return;
    }
    if (form.requireFollower && !followReminderMessage) {
      setFormError(
        "Follow verification reminder is required when follower verification is enabled."
      );
      return;
    }
    if (followReminderMessage.length > 1000) {
      setFormError(
        "Follow verification reminder must be 1,000 characters or fewer."
      );
      return;
    }
    if (form.responseType === "GENERIC_TEMPLATE") {
      const validationError = validateTemplate(form.elements);
      if (validationError) {
        setFormError(validationError);
        return;
      }
    }
    const payload = {
      mediaId,
      keyword,
      responseType: form.responseType,
      requireFollower: Boolean(form.requireFollower),
      followReminderMessage: form.requireFollower
        ? followReminderMessage
        : null,
      publicReplyMessage,
      ...(form.responseType === "GENERIC_TEMPLATE"
        ? {
            dmMessage: null,
            elements: serializeTemplate(form.elements),
          }
        : { dmMessage }),
    };

    setSaving(true);
    setFormError("");
    setConflictRule(null);
    try {
      const result = editingRule
        ? await api.updateRule(selectedId, editingRule.id, payload, token)
        : await api.createRule(selectedId, payload, token);
      if (result?.id) {
        setRules((current) =>
          editingRule
            ? current.map((rule) => (rule.id === result.id ? result : rule))
            : [result, ...current]
        );
      } else {
        await loadRules();
      }
      creatorDashboardService.invalidate(workspaceId);
      closeEditor();
      setNotice(
        editingRule
          ? "Auto-DM rule updated."
          : "Comment Auto-DM rule created successfully."
      );
    } catch (error) {
      if (error.status === 401) logout();
      else if (error.status === 409) {
        let existing = activeRuleByMedia.get(mediaId);
        if (!existing) {
          try {
            const latest = await api.fetchRules(selectedId, token);
            const latestRules = Array.isArray(latest) ? latest : [];
            setRules(latestRules);
            existing = latestRules
              .filter(
                (rule) => rule.active !== false && rule.mediaId === mediaId
              )
              .sort((left, right) => ruleDate(right) - ruleDate(left))[0];
          } catch {
            // The conflict message remains actionable through the visible rule list.
          }
        }
        setConflictRule(existing || null);
        setFormError(
          "This Reel or post already has an Auto-DM rule. Edit the existing rule instead."
        );
      } else if (
        error.message?.includes(
          "Selected Instagram media does not belong to this creator account"
        )
      ) {
        setFormError(
          "This post is no longer available for the connected Instagram account. Refresh your media and select another post."
        );
      } else setFormError(`${error.message}${support(error)}`);
    } finally {
      setSaving(false);
    }
  }

  async function remove(rule) {
    if (
      !canEdit ||
      deleting ||
      !(await confirm(`Delete the keyword rule “${rule.keyword}”?`, {
        title: "Delete Auto-DM rule",
        confirmLabel: "Delete",
      }))
    )
      return;
    setDeleting(rule.id);
    setRulesError(null);
    try {
      await api.deleteRule(selectedId, rule.id, token);
      setRules((current) => current.filter((item) => item.id !== rule.id));
      if (editingRule?.id === rule.id) closeEditor();
      creatorDashboardService.invalidate(workspaceId);
      setNotice("Comment Auto-DM rule deleted.");
    } catch (error) {
      if (error.status === 401) logout();
      else setRulesError(error);
    } finally {
      setDeleting("");
    }
  }

  if (workspaceLoading || permissionsLoading)
    return (
      <main className="brutal-page min-h-[calc(100vh-82px)] p-6 md:p-8">
        <div className="brutal-card mx-auto max-w-6xl animate-pulse p-8">
          Restoring Comment Auto-DM access…
        </div>
      </main>
    );
  if (!workspaceAllowed)
    return (
      <main className="brutal-page min-h-[calc(100vh-82px)] p-6 md:p-8">
        <div className="brutal-card mx-auto max-w-3xl p-8">
          <h1 className="text-3xl font-black">Creator workspace required</h1>
          <p className="mt-3">
            Comment Auto-DM is available only in Creator and legacy Personal
            workspaces.
          </p>
        </div>
      </main>
    );
  if (permissionsError || !canView)
    return (
      <main className="brutal-page min-h-[calc(100vh-82px)] p-6 md:p-8">
        <div className="brutal-card mx-auto max-w-3xl p-8">
          <p className="brutal-overline">Access denied</p>
          <h1 className="mt-3 text-3xl font-black">
            You don’t have permission to view Comment Auto-DM rules.
          </h1>
        </div>
      </main>
    );

  return (
    <main className="brutal-page min-h-[calc(100vh-82px)] p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b-2 border-zinc-900 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="brutal-overline">Creator workspace</p>
            <h1 className="mt-2 text-4xl font-black">Comment Auto-DM</h1>
            <p className="mt-2 max-w-3xl text-zinc-600">
              Send one private-reply attempt when a comment on a selected Reel
              or post contains your keyword. A public reply is posted only when
              configured. This does not reply to incoming Instagram
              conversations.
            </p>
          </div>
          {canEdit && selectedId && (
            <button
              type="button"
              onClick={showForm ? closeEditor : beginCreate}
              className="brutal-button"
            >
              {showForm ? "Close form" : "Create Auto-DM Rule"}
            </button>
          )}
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
        </div>

        {accountsLoading ? (
          <div className="brutal-card mt-7 animate-pulse p-8">
            Loading Instagram Login accounts…
          </div>
        ) : accountsError ? (
          <section className="brutal-card mt-7 p-8">
            <h2 className="text-2xl font-black">
              Instagram accounts couldn’t be loaded.
            </h2>
            <p role="alert" className="mt-3 text-red-700">
              {accountsError.message}
              {support(accountsError)}
            </p>
            <button
              type="button"
              onClick={() => loadAccounts()}
              className="brutal-button mt-5"
            >
              Retry accounts
            </button>
          </section>
        ) : !accounts.length ? (
          <section className="brutal-card mt-7 bg-yellow-200 p-8">
            <h2 className="text-2xl font-black">
              Connect Instagram to create Comment Auto-DM rules.
            </h2>
            <p className="mt-3">
              Connect an Instagram Login account. Insights and analytics
              snapshots are not required.
            </p>
            <button
              type="button"
              onClick={connect}
              disabled={connecting}
              className="mt-6 min-h-13 border-2 border-zinc-900 bg-white px-6 py-3 font-black shadow-[4px_4px_0_#18181b]"
            >
              {connecting ? "Opening Instagram…" : "Connect Instagram"}
            </button>
          </section>
        ) : (
          <>
            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <label className="font-bold">
                Instagram account
                <select
                  value={selectedId}
                  onChange={(event) => setSelectedId(event.target.value)}
                  className="brutal-field mt-2 block min-w-64"
                >
                  {accounts.map((account) => (
                    <option key={account.igUserId} value={account.igUserId}>
                      @{accountName(account)}
                    </option>
                  ))}
                </select>
              </label>
              {!canEdit && (
                <p className="border-2 border-zinc-900 bg-sky-100 p-3 font-bold">
                  Read-only access
                </p>
              )}
            </div>

            {showForm && canEdit && (
              <form
                id="auto-dm-rule-editor"
                onSubmit={submit}
                className="brutal-card mt-7 bg-white p-5 sm:p-7"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black">
                      {editingRule ? "Edit Auto-DM rule" : "New keyword rule"}
                    </h2>
                    <p className="mt-2 text-sm text-zinc-600">
                      The keyword is matched against comments on the target
                      Reel/Post. Each matching comment receives one
                      private-reply attempt.
                    </p>
                  </div>
                  {editingRule && (
                    <button
                      type="button"
                      onClick={closeEditor}
                      className="border-2 border-zinc-900 bg-white px-4 py-2 font-black"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <AutoDmMediaPicker
                    igUserId={selectedId}
                    token={token}
                    value={form.mediaId}
                    onChange={(mediaId) =>
                      setForm((current) => ({ ...current, mediaId }))
                    }
                    logout={logout}
                    activeRuleByMedia={activeRuleByMedia}
                    editingRule={editingRule}
                    onEditRule={beginEdit}
                    onItemsLoaded={setEligibleMedia}
                    support={support}
                  />
                  <div className="border-t-2 border-zinc-900 pt-5 sm:col-span-2">
                    <p className="brutal-overline">Automation settings</p>
                    <h3 className="mt-1 text-xl font-black">
                      Trigger and response
                    </h3>
                  </div>
                  <label className="block font-bold">
                    Response type
                    <select
                      value={form.responseType}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          responseType: event.target.value,
                        }))
                      }
                      className="brutal-field mt-2 w-full"
                    >
                      <option value="TEXT">Text message</option>
                      <option value="GENERIC_TEMPLATE">Product carousel</option>
                    </select>
                  </label>
                  <label className="block font-bold">
                    Keyword *
                    <input
                      value={form.keyword}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          keyword: event.target.value,
                        }))
                      }
                      required
                      className="brutal-field mt-2 w-full"
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.requireFollower}
                      onClick={() =>
                        setForm((current) => {
                          const requireFollower = !current.requireFollower;
                          return {
                            ...current,
                            requireFollower,
                            followReminderMessage: requireFollower
                              ? current.followReminderMessage ||
                                DEFAULT_FOLLOW_REMINDER_MESSAGE
                              : "",
                          };
                        })
                      }
                      className={`flex w-full items-center gap-4 border-2 border-zinc-900 p-4 text-left transition-colors ${
                        form.requireFollower ? "bg-yellow-100" : "bg-zinc-50"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`relative h-7 w-12 shrink-0 border-2 border-zinc-900 ${
                          form.requireFollower ? "bg-yellow-300" : "bg-white"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 border border-zinc-900 bg-zinc-900 transition-transform ${
                            form.requireFollower
                              ? "translate-x-5"
                              : "translate-x-0.5"
                          }`}
                        />
                      </span>
                      <span>
                        <span className="block font-black">
                          Require users to follow me
                        </span>
                        <span className="mt-1 block text-sm font-normal text-zinc-600">
                          Commenters must follow your Instagram account and
                          confirm before receiving the configured content.
                        </span>
                      </span>
                    </button>
                    {form.requireFollower && (
                      <div className="mt-3 space-y-4">
                        <p className="border-l-4 border-zinc-900 bg-sky-100 p-4 text-sm font-bold">
                          The commenter will first receive a message asking them
                          to follow your account. After following, they must tap
                          ‘I've followed’. CreatorLinksAI will verify the follow
                          before sending your configured reply.
                        </p>
                        <div className="border-2 border-zinc-900 bg-zinc-50 p-4">
                          <p className="font-black">
                            Follow me to receive this content
                          </p>
                          <p className="mt-1 text-sm text-zinc-600">
                            {`Follow @${accountName(
                              accounts.find(
                                (account) => account.igUserId === selectedId
                              )
                            ).replace(/^@/, "")}, then tap “I've followed”.`}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="border border-zinc-900 bg-white px-3 py-2 text-xs font-black">
                              Follow on Instagram
                            </span>
                            <span className="border border-zinc-900 bg-yellow-300 px-3 py-2 text-xs font-black">
                              I've followed
                            </span>
                          </div>
                        </div>
                        <label className="block font-bold">
                          Follow verification reminder *
                          <textarea
                            value={form.followReminderMessage}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                followReminderMessage: event.target.value,
                              }))
                            }
                            required
                            maxLength={1000}
                            rows={4}
                            className="brutal-field mt-2 w-full resize-y"
                          />
                          <span className="mt-2 flex items-start justify-between gap-4 text-xs font-normal text-zinc-600">
                            <span>
                              Sent when someone taps ‘I've followed’ but their
                              follow cannot be confirmed.
                            </span>
                            <span className="shrink-0">
                              {form.followReminderMessage.length}/1,000
                            </span>
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                  {form.responseType === "TEXT" ? (
                    <label className="block font-bold">
                      Private DM message *
                      <textarea
                        value={form.dmMessage}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            dmMessage: event.target.value,
                          }))
                        }
                        required
                        rows={5}
                        className="brutal-field mt-2 w-full"
                      />
                    </label>
                  ) : !form.requireFollower ? (
                    <div className="border-2 border-zinc-900 bg-emerald-100 p-4 text-sm font-bold">
                      The carousel is sent immediately as the private reply when
                      the keyword comment is received.
                    </div>
                  ) : null}
                  <label className="block font-bold">
                    Public comment reply (optional)
                    <textarea
                      value={form.publicReplyMessage}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          publicReplyMessage: event.target.value,
                        }))
                      }
                      rows={5}
                      className="brutal-field mt-2 w-full"
                    />
                  </label>
                </div>

                {form.responseType === "GENERIC_TEMPLATE" && (
                  <>
                    <AutoDmTemplateFields
                      elements={form.elements}
                      onChange={(elements) =>
                        setForm((current) => ({ ...current, elements }))
                      }
                    />
                    <AutoDmTemplatePreview elements={form.elements} />
                  </>
                )}
                {formError && (
                  <div
                    role="alert"
                    className="mt-5 border-2 border-red-700 bg-red-50 p-3 text-red-800"
                  >
                    <p>{formError}</p>
                    {conflictRule && (
                      <button
                        type="button"
                        onClick={() => beginEdit(conflictRule)}
                        className="mt-3 border-2 border-zinc-900 bg-white px-4 py-2 font-black text-zinc-900"
                      >
                        Edit existing rule
                      </button>
                    )}
                  </div>
                )}
                <div className="mt-6 flex flex-col-reverse gap-3 border-t-2 border-zinc-900 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeEditor}
                    className="border-2 border-zinc-900 bg-white px-5 py-3 font-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      saving ||
                      (form.requireFollower &&
                        (!form.followReminderMessage.trim() ||
                          form.followReminderMessage.trim().length > 1000))
                    }
                    className="brutal-button min-w-40"
                  >
                    {saving
                      ? form.responseType === "GENERIC_TEMPLATE"
                        ? "Fetching product details and saving…"
                        : editingRule
                        ? "Saving changes…"
                        : "Creating rule…"
                      : editingRule
                      ? "Save changes"
                      : "Create Rule"}
                  </button>
                </div>
              </form>
            )}

            <section className="mt-7">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="brutal-overline">Keyword rules</p>
                  <h2 className="mt-2 text-2xl font-black">
                    Rules for @
                    {accountName(
                      accounts.find(
                        (account) => account.igUserId === selectedId
                      )
                    )}
                  </h2>
                </div>
                {rulesError && (
                  <button
                    type="button"
                    onClick={loadRules}
                    className="font-black underline"
                  >
                    Retry rules
                  </button>
                )}
              </div>
              {rulesLoading ? (
                <div className="brutal-card mt-5 animate-pulse p-8">
                  Loading Comment Auto-DM rules…
                </div>
              ) : rulesError ? (
                <div
                  role="alert"
                  className="brutal-card mt-5 border-red-700 p-6 text-red-800"
                >
                  <h3 className="font-black">Rules couldn’t be loaded.</h3>
                  <p className="mt-2">
                    {rulesError.message}
                    {support(rulesError)}
                  </p>
                </div>
              ) : !rules.length ? (
                <div className="brutal-card mt-5 p-8 text-center">
                  <h3 className="text-2xl font-black">
                    No Comment Auto-DM rules yet.
                  </h3>
                  <p className="mx-auto mt-3 max-w-xl text-zinc-600">
                    Create a rule to send a private reply when someone comments
                    a matching keyword on a selected Reel or post.
                  </p>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={beginCreate}
                      className="brutal-button mt-6"
                    >
                      Create Auto-DM Rule
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-5 grid gap-5 xl:grid-cols-2">
                  {orderedRules.map((rule) => (
                    <AutoDmRuleCard
                      key={rule.id}
                      rule={rule}
                      media={mediaById.get(rule.mediaId)}
                      igUserId={selectedId}
                      token={token}
                      logout={logout}
                      canEdit={canEdit}
                      deleting={deleting}
                      onEdit={beginEdit}
                      onDelete={remove}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

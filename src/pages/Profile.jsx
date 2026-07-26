import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, RefreshCw, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { accountService } from "../services/accountService";
import InstagramConnectionSettings from "../components/InstagramConnectionSettings";
import { api } from "../api";
import { useThemedDialog } from "../context/ThemedDialogContext";

const TEXT_FIELDS = [
  ["firstName", "First name", 120],
  ["lastName", "Last name", 120],
  ["displayName", "Display name", 160],
  ["profilePictureUrl", "Profile picture URL", 2048],
  ["phone", "Phone number", 64],
  ["timezone", "Timezone", 80],
  ["jobTitle", "Job title", 160],
];
const EMPTY = Object.freeze({
  firstName: "",
  lastName: "",
  displayName: "",
  profilePictureUrl: "",
  phone: "",
  timezone: "",
  jobTitle: "",
  notificationPreferences: {},
});
const FALLBACK_TIMEZONES = [
  "UTC",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Australia/Sydney",
];
const TIMEZONES = (() => {
  try {
    const supported = Intl.supportedValuesOf("timeZone");
    return [...new Set(["UTC", ...supported])].sort();
  } catch {
    return FALLBACK_TIMEZONES;
  }
})();
const TIMEZONE_SET = new Set(TIMEZONES);

function normalize(profile = {}) {
  return {
    firstName: String(profile.firstName || "").trim(),
    lastName: String(profile.lastName || "").trim(),
    displayName: String(profile.displayName || "").trim(),
    profilePictureUrl: String(profile.profilePictureUrl || "").trim(),
    phone: String(profile.phone || "").trim(),
    timezone: String(profile.timezone || "").trim(),
    jobTitle: String(profile.jobTitle || "").trim(),
    notificationPreferences:
      profile.notificationPreferences &&
      typeof profile.notificationPreferences === "object"
        ? { ...profile.notificationPreferences }
        : {},
  };
}

function initials(profile, email) {
  const source =
    profile.displayName.trim() ||
    [profile.firstName, profile.lastName].filter((part) => part.trim()).join(" ") ||
    email ||
    "User";
  const parts = source.trim().split(/\s+/);
  return (parts.length > 1 ? `${parts[0][0]}${parts.at(-1)[0]}` : source.slice(0, 2))
    .toUpperCase();
}

function validate(form) {
  const errors = {};
  TEXT_FIELDS.forEach(([key, label, maximum]) => {
    if (form[key].trim().length > maximum)
      errors[key] = `${label} must be ${maximum} characters or fewer.`;
  });
  const picture = form.profilePictureUrl.trim();
  if (picture) {
    try {
      const url = new URL(picture);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    } catch {
      errors.profilePictureUrl =
        "Enter a valid HTTP or HTTPS image URL.";
    }
  }
  const timezone = form.timezone.trim();
  if (timezone && !TIMEZONE_SET.has(timezone))
    errors.timezone = "Select a valid IANA timezone.";
  return errors;
}

function buildChanges(initial, form) {
  const changes = {};
  TEXT_FIELDS.forEach(([key]) => {
    const value = form[key].trim();
    if (value !== initial[key]) changes[key] = value;
  });
  const knownChanged =
    Boolean(form.notificationPreferences.emailNotifications) !==
      Boolean(initial.notificationPreferences.emailNotifications) ||
    Boolean(form.notificationPreferences.autoDmAlerts) !==
      Boolean(initial.notificationPreferences.autoDmAlerts);
  if (knownChanged)
    changes.notificationPreferences = { ...form.notificationPreferences };
  return changes;
}

function Field({ id, label, error, children, supportingText }) {
  return (
    <label htmlFor={id} className="block font-bold">
      {label}
      {children}
      {supportingText && (
        <span className="mt-1 block text-xs font-normal text-zinc-500">
          {supportingText}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} role="alert" className="mt-1 block text-sm text-red-700">
          {error}
        </span>
      )}
    </label>
  );
}

function ProfileSkeleton() {
  return (
    <main className="brutal-page min-h-[calc(100vh-68px)] p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-4xl animate-pulse space-y-6">
        <div className="h-32 border-2 border-zinc-900 bg-zinc-200" />
        <div className="h-[520px] border-2 border-zinc-900 bg-zinc-200" />
      </div>
    </main>
  );
}

export default function Profile() {
  const {
    token,
    email: sessionEmail,
    activePersona,
    updateProfileSummary,
  } = useAuth();
  const [profile, setProfile] = useState(null);
  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [reload, setReload] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [deletingMetaData, setDeletingMetaData] = useState(false);
  const { confirm } = useThemedDialog();
  const savingRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(false);
    accountService
      .getProfile(token, controller.signal)
      .then((result) => {
        const next = normalize(result);
        setProfile(result);
        setInitial(next);
        setForm(next);
        setImageFailed(false);
        updateProfileSummary(result);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setLoadError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token, reload, updateProfileSummary]);

  const changes = useMemo(
    () => (initial ? buildChanges(initial, form) : {}),
    [form, initial],
  );
  const validation = useMemo(() => validate(form), [form]);
  const dirty = Object.keys(changes).length > 0;
  const valid = Object.keys(validation).length === 0;
  const email = profile?.email || sessionEmail || "";

  function set(name, value) {
    setNotice("");
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined, form: undefined }));
    if (name === "profilePictureUrl") setImageFailed(false);
  }

  function setPreference(name, checked) {
    setNotice("");
    setForm((current) => ({
      ...current,
      notificationPreferences: {
        ...current.notificationPreferences,
        [name]: checked,
      },
    }));
  }

  async function save(event) {
    event.preventDefault();
    if (savingRef.current || saving || !dirty) return;
    if (!valid) {
      setErrors(validation);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setErrors({});
    setNotice("");
    try {
      const result = await accountService.updateProfile(changes, token);
      const next = normalize(result);
      setProfile(result);
      setInitial(next);
      setForm(next);
      setImageFailed(false);
      updateProfileSummary(result);
      setNotice("Profile updated.");
    } catch (error) {
      setErrors({
        form:
          error.message ||
          "We couldn’t update your profile. Please try again.",
      });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function deleteMetaData() {
    if (deletingMetaData || !(await confirm(
      "Permanently delete your Instagram connection, cached analytics, Auto-DM data, uploaded Auto-DM PDFs, and all insight snapshots previously shared with agencies?",
      { title: "Delete my Instagram data", confirmLabel: "Delete permanently" },
    ))) return;
    setDeletingMetaData(true);
    setNotice("");
    try {
      const result = await api.deleteCreatorMetaData(token);
      setNotice(`Instagram data deleted. Confirmation code: ${result.confirmationCode}`);
    } catch (error) {
      setErrors({ form: error.message || "Instagram data could not be deleted." });
    } finally {
      setDeletingMetaData(false);
    }
  }

  if (loading) return <ProfileSkeleton />;
  if (loadError)
    return (
      <main className="brutal-page min-h-[calc(100vh-68px)] p-4 sm:p-6 md:p-8">
        <section className="brutal-card mx-auto max-w-xl p-8 text-center">
          <h1 className="text-3xl font-black">We couldn’t load your profile.</h1>
          <p className="mt-3 text-zinc-600">
            Check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => setReload((value) => value + 1)}
            className="brutal-button mt-6 inline-flex gap-2"
          >
            <RefreshCw size={17} />
            Retry
          </button>
        </section>
      </main>
    );

  return (
    <main className="brutal-page min-h-[calc(100vh-68px)] p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="border-b-2 border-zinc-900 pb-6">
          <p className="brutal-overline">Application account</p>
          <h1 className="mt-2 text-4xl font-black">Account settings</h1>
          <p className="mt-2 text-zinc-600">
            Manage your CreatorLinksAI profile and notifications. This does not
            update your Instagram profile.
          </p>
        </header>

        {notice && (
          <p role="status" className="mt-5 border-2 border-zinc-900 bg-emerald-200 p-3 font-bold">
            {notice}
          </p>
        )}
        {errors.form && (
          <p role="alert" className="mt-5 border-2 border-red-700 bg-red-50 p-3 font-bold text-red-800">
            {errors.form}
          </p>
        )}

        <form onSubmit={save} className="mt-6 space-y-6" noValidate>
          <section className="brutal-card p-5 sm:p-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-zinc-900 bg-sky-200 text-2xl font-black">
                {form.profilePictureUrl.trim() && !imageFailed ? (
                  <img
                    src={form.profilePictureUrl.trim()}
                    alt="Profile preview"
                    onError={() => setImageFailed(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials(form, email)
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <UserRound size={22} />
                  <h2 className="text-2xl font-black">Profile</h2>
                </div>
                <p className="mt-2 text-sm text-zinc-600">
                  Your CreatorLinksAI application identity.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <Field
                id="profile-email"
                label="Email"
                supportingText="Email changes are not currently supported."
              >
                <input
                  id="profile-email"
                  readOnly
                  value={email}
                  className="brutal-field mt-2 w-full !bg-zinc-100 !text-zinc-600"
                />
              </Field>
              <Field id="displayName" label="Display name" error={validation.displayName}>
                <input
                  id="displayName"
                  maxLength={160}
                  value={form.displayName}
                  onChange={(event) => set("displayName", event.target.value)}
                  aria-invalid={Boolean(validation.displayName)}
                  className="brutal-field mt-2 w-full"
                />
              </Field>
              <Field id="firstName" label="First name" error={validation.firstName}>
                <input
                  id="firstName"
                  maxLength={120}
                  value={form.firstName}
                  onChange={(event) => set("firstName", event.target.value)}
                  aria-invalid={Boolean(validation.firstName)}
                  className="brutal-field mt-2 w-full"
                />
              </Field>
              <Field id="lastName" label="Last name" error={validation.lastName}>
                <input
                  id="lastName"
                  maxLength={120}
                  value={form.lastName}
                  onChange={(event) => set("lastName", event.target.value)}
                  aria-invalid={Boolean(validation.lastName)}
                  className="brutal-field mt-2 w-full"
                />
              </Field>
              <Field
                id="profilePictureUrl"
                label="Profile picture URL"
                error={validation.profilePictureUrl}
                supportingText="HTTP or HTTPS image URL only. Clear this field to remove the picture."
              >
                <input
                  id="profilePictureUrl"
                  type="url"
                  maxLength={2048}
                  placeholder="https://example.com/profile.jpg"
                  value={form.profilePictureUrl}
                  onChange={(event) => set("profilePictureUrl", event.target.value)}
                  aria-invalid={Boolean(validation.profilePictureUrl)}
                  className="brutal-field mt-2 w-full"
                />
              </Field>
              <Field id="phone" label="Phone number" error={validation.phone}>
                <input
                  id="phone"
                  type="tel"
                  maxLength={64}
                  value={form.phone}
                  onChange={(event) => set("phone", event.target.value)}
                  aria-invalid={Boolean(validation.phone)}
                  className="brutal-field mt-2 w-full"
                />
              </Field>
              <Field
                id="timezone"
                label="Timezone"
                error={validation.timezone}
                supportingText="Search and select a valid IANA timezone."
              >
                <input
                  id="timezone"
                  list="profile-timezones"
                  maxLength={80}
                  placeholder="Asia/Kolkata"
                  value={form.timezone}
                  onChange={(event) => set("timezone", event.target.value)}
                  aria-invalid={Boolean(validation.timezone)}
                  className="brutal-field mt-2 w-full"
                />
                <datalist id="profile-timezones">
                  {TIMEZONES.map((timezone) => (
                    <option key={timezone} value={timezone} />
                  ))}
                </datalist>
              </Field>
              <Field id="jobTitle" label="Job title" error={validation.jobTitle}>
                <input
                  id="jobTitle"
                  maxLength={160}
                  value={form.jobTitle}
                  onChange={(event) => set("jobTitle", event.target.value)}
                  aria-invalid={Boolean(validation.jobTitle)}
                  className="brutal-field mt-2 w-full"
                />
              </Field>
            </div>
          </section>

          {activePersona === "CREATOR" && (
            <section className="brutal-card border-red-700 p-5 sm:p-7">
              <h2 className="text-2xl font-black">Privacy and data deletion</h2>
              <p className="mt-2 text-sm text-zinc-600">
                Disconnecting removes the live connection and cached analytics but
                preserves historical snapshots already shared with agencies. Full
                deletion permanently removes those shared snapshots and all other
                Instagram-derived data.
              </p>
              <button type="button" onClick={deleteMetaData}
                disabled={deletingMetaData}
                className="mt-5 border-2 border-red-700 bg-red-50 px-4 py-3 font-black text-red-800">
                {deletingMetaData ? "Deleting…" : "Delete my Instagram data"}
              </button>
            </section>
          )}

          {activePersona === "CREATOR" && <InstagramConnectionSettings />}

          <section className="brutal-card p-5 sm:p-7">
            <div className="flex items-center gap-2">
              <Bell size={22} />
              <h2 className="text-2xl font-black">Notifications</h2>
            </div>
            <p className="mt-2 text-sm text-zinc-600">
              Choose which CreatorLinksAI updates you want to receive.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["emailNotifications", "Email notifications"],
                ["autoDmAlerts", "Auto-DM alerts"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-3 border-2 border-zinc-900 bg-zinc-50 p-4 font-bold"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(form.notificationPreferences[key])}
                    onChange={(event) => setPreference(key, event.target.checked)}
                    className="h-5 w-5 accent-zinc-900"
                  />
                  {label}
                </label>
              ))}
            </div>
          </section>

          <div className="flex justify-end">
            <button
              disabled={saving || !dirty || !valid}
              className="brutal-button w-full sm:w-auto"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

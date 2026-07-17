import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const FOLLOWER_MIN = [0, 10000, 25000, 50000, 75000, 100000, 250000, 1000000];
const FOLLOWER_MAX = [10000, 25000, 50000, 75000, 100000, 250000, 1000000];
const AGE_BUCKETS = ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
const GENDERS = ["female", "male", "unknown"];
const RECOMMENDATIONS = [
  ["most_relevant_for_me", "Most relevant for me"],
  ["high_ad_performance", "High ad performance"],
  ["most_ads_experience", "Most ads experience"],
  ["similar_brands", "Similar brands"],
  ["similar_audience", "Similar audience"],
];
const ACTIVITIES = [
  ["last_7_days", "Last 7 days"],
  ["last_30_days", "Last 30 days"],
  ["last_90_days", "Last 90 days"],
];
const GROWTH = [
  ["top_10_percent", "Top 10%"],
  ["top_30_percent", "Top 30%"],
  ["top_50_percent", "Top 50%"],
];

const initialFilters = {
  query: "", username: "", creatorCountries: "", creatorStates: "",
  creatorMinFollowers: "", creatorMaxFollowers: "", creatorAgeBucket: "",
  creatorInterests: "", creatorGender: "", majorAudienceAgeBucket: "",
  majorAudienceGender: "", majorAudienceCountries: "", majorAudienceStates: "",
  recommendationType: "most_relevant_for_me", latestPostActivity: "",
  followerGrowth: "", similarToCreators: "", limit: "25",
};

function splitValues(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString() : null;
}

function extractFollowers(insights) {
  if (!insights || typeof insights !== "object") return null;
  const keys = ["followersCount", "followerCount", "followers_count", "totalFollowers"];
  for (const key of keys) {
    if (insights[key] != null) return formatNumber(insights[key]);
  }
  for (const value of Object.values(insights)) {
    if (value && typeof value === "object") {
      const nested = extractFollowers(value);
      if (nested) return nested;
    }
  }
  return null;
}

function marketplaceError(error) {
  if (error.status === 403) return "Creator Marketplace access is unavailable for this brand. Confirm that the Meta permission was granted, the brand is eligible, and Creator Marketplace onboarding and terms have been completed.";
  if (error.status === 400) return "The selected search filters cannot be combined. Review the filters and try again.";
  if (error.status === 404) return "The connected brand account or creator could not be found.";
  if (error.status === 429) return "The Creator Marketplace rate limit was reached. Please wait and try again.";
  if (error.status >= 500) return "Creator Marketplace is temporarily unavailable because of a backend or Meta error. Please try again.";
  if (error.status) return "The Marketplace request was rejected. Review the selected brand and filters, then try again.";
  return error.message || "The request could not be completed.";
}

function buildPayload(filters, brandIgUserId, after) {
  const arrays = {
    creatorCountries: splitValues(filters.creatorCountries).map((v) => v.toUpperCase()),
    creatorStates: splitValues(filters.creatorStates).map((v) => v.toUpperCase()),
    creatorInterests: splitValues(filters.creatorInterests).map((v) => v.toUpperCase()),
    majorAudienceCountries: splitValues(filters.majorAudienceCountries).map((v) => v.toUpperCase()),
    majorAudienceStates: splitValues(filters.majorAudienceStates).map((v) => v.toUpperCase()),
    similarToCreators: splitValues(filters.similarToCreators).map((v) => v.replace(/^@/, "")),
  };
  const payload = { brandIgUserId, limit: Number(filters.limit) };
  if (filters.username.trim()) {
    payload.username = filters.username.trim().replace(/^@/, "");
    if (after) payload.after = after;
    return { payload, arrays };
  }
  for (const key of ["query", "username", "creatorAgeBucket", "creatorGender", "majorAudienceAgeBucket", "majorAudienceGender", "recommendationType", "latestPostActivity", "followerGrowth"]) {
    const value = filters[key].trim();
    if (value) payload[key] = value;
  }
  for (const [key, value] of Object.entries(arrays)) if (value.length) payload[key] = value;
  if (filters.creatorMinFollowers !== "") payload.creatorMinFollowers = Number(filters.creatorMinFollowers);
  if (filters.creatorMaxFollowers !== "") payload.creatorMaxFollowers = Number(filters.creatorMaxFollowers);
  if (after) payload.after = after;
  return { payload, arrays };
}

function validate(filters, arrays) {
  const filterKeys = Object.keys(filters).filter((key) => !["username", "limit", "recommendationType"].includes(key));
  if (filters.username.trim() && filterKeys.some((key) => filters[key] !== "")) return "Username search cannot be combined with discovery filters.";
  if (arrays.similarToCreators.length && filters.query.trim()) return "Similar creators cannot be combined with a free-text query.";
  if (arrays.similarToCreators.length > 5) return "Enter no more than five similar creator usernames.";
  if (arrays.creatorInterests.length > 5) return "Select no more than five creator interests.";
  if (filters.creatorMinFollowers !== "" && filters.creatorMaxFollowers !== "" && Number(filters.creatorMinFollowers) > Number(filters.creatorMaxFollowers)) return "Minimum followers cannot exceed maximum followers.";
  if (arrays.creatorStates.length && !arrays.creatorCountries.includes("US")) return "Creator state filters require US in creator countries.";
  if (arrays.majorAudienceStates.length && !arrays.majorAudienceCountries.includes("US")) return "Major audience state filters require US in major audience countries.";
  if (Number(filters.limit) < 1 || Number(filters.limit) > 100) return "Result limit must be between 1 and 100.";
  return null;
}

function SelectField({ label, name, value, onChange, options, children }) {
  return <label className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-text-secondary">{label}</span><select name={name} value={value} onChange={onChange} className="w-full rounded-xl border border-panel-border bg-bg-deep/70 px-3 py-2.5 text-xs text-text-primary outline-none focus:border-accent-primary"><option value="">Any</option>{children || options.map((option) => <option key={Array.isArray(option) ? option[0] : option} value={Array.isArray(option) ? option[0] : option}>{Array.isArray(option) ? option[1] : option}</option>)}</select></label>;
}

function TextField({ label, name, value, onChange, placeholder, type = "text", min, max }) {
  return <label className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-text-secondary">{label}</span><input type={type} min={min} max={max} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full rounded-xl border border-panel-border bg-bg-deep/70 px-3 py-2.5 text-xs text-text-primary placeholder:text-text-secondary/40 outline-none focus:border-accent-primary" /></label>;
}

function StructuredValue({ value, depth = 0 }) {
  if (value == null || value === "") return <span className="text-text-secondary">Not available</span>;
  if (typeof value !== "object") {
    const text = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
    if (typeof value === "string" && /^https?:\/\//.test(value)) return <a href={value} target="_blank" rel="noreferrer" className="break-all text-accent-primary hover:underline">Open link</a>;
    return <span className="break-words">{text}</span>;
  }
  const entries = (Array.isArray(value) ? value.map((item, index) => [String(index + 1), item]) : Object.entries(value)).slice(0, 20);
  if (!entries.length) return <span className="text-text-secondary">No data available</span>;
  if (depth >= 2) return <span className="text-text-secondary">{entries.length} nested fields available</span>;
  return <dl className="space-y-2">{entries.map(([key, item]) => <div key={key} className="border-b border-panel-border/40 pb-2 last:border-0"><dt className="mb-1 text-[10px] uppercase text-text-secondary">{Array.isArray(value) ? `Item ${key}` : key.replace(/([A-Z])/g, " $1")}</dt><dd className="text-xs text-text-primary"><StructuredValue value={item} depth={depth + 1} /></dd></div>)}</dl>;
}

function DetailSection({ title, value }) {
  if (value == null || value === "" || (Array.isArray(value) && !value.length)) return null;
  return <section className="rounded-2xl border border-panel-border bg-bg-deep/40 p-4"><h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-accent-primary">{title}</h3><StructuredValue value={value} /></section>;
}

export default function CreatorMarketplace() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [creators, setCreators] = useState([]);
  const [after, setAfter] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [permissionError, setPermissionError] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const loadBrands = useCallback(async () => {
    setAccountsLoading(true);
    try {
      const result = await api.listMetaBrandAccounts(token);
      const list = Array.isArray(result) ? result : [];
      setBrands(list);
      setSelectedBrand((current) => current || list[0]?.igUserId || "");
    } catch (err) {
      if (err.status === 401) { logout(); navigate("/login", { replace: true }); return; }
      setError(marketplaceError(err));
    } finally { setAccountsLoading(false); }
  }, [token, logout, navigate]);

  useEffect(() => { loadBrands(); }, [loadBrands]);

  async function connectBrand() {
    if (connecting) return;
    setConnecting(true); setError(null);
    try {
      const response = await api.startMetaBrandConnect(token);
      if (!response?.authorizationUrl) throw new Error("The server did not return a Meta authorization URL.");
      window.location.assign(response.authorizationUrl);
    } catch (err) {
      if (err.status === 401) { logout(); navigate("/login", { replace: true }); return; }
      setError(marketplaceError(err)); setConnecting(false);
    }
  }

  function onChange(event) { setFilters((current) => ({ ...current, [event.target.name]: event.target.value })); }

  async function runSearch({ loadMore = false } = {}) {
    if (searching || !selectedBrand) return;
    const { payload, arrays } = buildPayload(filters, selectedBrand, loadMore ? after : null);
    const validationError = validate(filters, arrays);
    if (validationError) { setError(validationError); return; }
    setSearching(true); setError(null); setPermissionError(false);
    try {
      const result = await api.searchCreatorMarketplace(payload, token);
      const incoming = Array.isArray(result?.creators) ? result.creators : [];
      setCreators((current) => loadMore ? [...current, ...incoming.filter((item) => !current.some((old) => old.id === item.id || old.username === item.username))] : incoming);
      setAfter(result?.after || null);
    } catch (err) {
      if (err.status === 401) { logout(); navigate("/login", { replace: true }); return; }
      setPermissionError(err.status === 403); setError(marketplaceError(err));
    } finally { setSearching(false); }
  }

  async function viewDetails(creator) {
    setSelectedCreator(creator); setDetailsLoading(true); setError(null);
    try {
      const details = await api.getMarketplaceCreator(creator.username, selectedBrand, token);
      setSelectedCreator(details || creator);
    } catch (err) {
      if (err.status === 401) { logout(); navigate("/login", { replace: true }); return; }
      setError(marketplaceError(err));
    } finally { setDetailsLoading(false); }
  }

  const selectedBrandAccount = useMemo(() => brands.find((brand) => brand.igUserId === selectedBrand), [brands, selectedBrand]);

  useEffect(() => {
    setCreators([]);
    setAfter(null);
    setSelectedCreator(null);
  }, [selectedBrand]);

  return <div className="min-h-screen bg-bg-deep px-4 py-8 text-text-primary md:py-12"><div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-col gap-4 rounded-2xl border border-panel-border bg-panel/50 p-6 sm:flex-row sm:items-center sm:justify-between"><div><Link to="/dashboard" className="text-xs text-text-secondary hover:text-accent-primary">← Back to dashboard</Link><h1 className="mt-3 text-2xl font-extrabold">Creator Marketplace</h1><p className="mt-1 text-sm text-text-secondary">Search and evaluate creators as a connected Meta brand.</p></div>{brands.length > 1 && <SelectField label="Search as brand" name="brand" value={selectedBrand} onChange={(event) => setSelectedBrand(event.target.value)} options={brands.map((brand) => [brand.igUserId, `@${brand.igUsername || brand.igUserId} — ${brand.pageName || "Facebook Page"}`])} />}</header>
    {error && <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"><p>{error}</p>{permissionError && <button type="button" onClick={connectBrand} disabled={connecting} className="mt-3 rounded-lg bg-red-500/15 px-3 py-2 text-xs font-semibold hover:bg-red-500/25 disabled:opacity-50">{connecting ? "Opening Meta…" : "Reconnect Meta Brand Account"}</button>}</div>}
    {accountsLoading ? <div className="rounded-3xl border border-panel-border bg-panel/50 p-10 text-center text-sm text-text-secondary">Loading Meta brand connections…</div> : !brands.length ? <div className="rounded-3xl border border-dashed border-panel-border bg-panel/40 p-10 text-center"><h2 className="text-xl font-bold">Connect your Meta brand account</h2><p className="mx-auto mt-2 max-w-xl text-sm text-text-secondary">Creator Marketplace requires a Facebook Page linked to an eligible Instagram business account.</p><button type="button" onClick={connectBrand} disabled={connecting} className="mt-6 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary px-5 py-3 text-sm font-semibold disabled:opacity-50">{connecting ? "Opening Meta…" : "Connect Meta Brand Account"}</button></div> : <>
      <form onSubmit={(event) => { event.preventDefault(); runSearch(); }} className="rounded-3xl border border-panel-border bg-panel/50 p-6 md:p-8"><div className="mb-6"><h2 className="text-lg font-bold">Search creators</h2><p className="mt-1 text-xs text-text-secondary">Searching as @{selectedBrandAccount?.igUsername || selectedBrand}. Use exact API values separated by commas for country codes and interests.</p></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TextField label="Free-text query" name="query" value={filters.query} onChange={onChange} placeholder="travel" /><TextField label="Exact username" name="username" value={filters.username} onChange={onChange} placeholder="@creator" />
        <TextField label="Creator countries" name="creatorCountries" value={filters.creatorCountries} onChange={onChange} placeholder="IN, US" /><TextField label="Creator states" name="creatorStates" value={filters.creatorStates} onChange={onChange} placeholder="CA, NY (requires US)" />
        <SelectField label="Minimum followers" name="creatorMinFollowers" value={filters.creatorMinFollowers} onChange={onChange} options={FOLLOWER_MIN.map((value) => [String(value), value.toLocaleString()])} /><SelectField label="Maximum followers" name="creatorMaxFollowers" value={filters.creatorMaxFollowers} onChange={onChange} options={FOLLOWER_MAX.map((value) => [String(value), value.toLocaleString()])} />
        <SelectField label="Creator age bucket" name="creatorAgeBucket" value={filters.creatorAgeBucket} onChange={onChange} options={AGE_BUCKETS} /><SelectField label="Creator gender" name="creatorGender" value={filters.creatorGender} onChange={onChange} options={GENDERS} />
        <TextField label="Creator interests (max 5)" name="creatorInterests" value={filters.creatorInterests} onChange={onChange} placeholder="TRAVEL_AND_LEISURE_ACTIVITIES" /><SelectField label="Audience age bucket" name="majorAudienceAgeBucket" value={filters.majorAudienceAgeBucket} onChange={onChange} options={AGE_BUCKETS} />
        <SelectField label="Audience gender" name="majorAudienceGender" value={filters.majorAudienceGender} onChange={onChange} options={GENDERS} /><TextField label="Audience countries" name="majorAudienceCountries" value={filters.majorAudienceCountries} onChange={onChange} placeholder="IN, US" />
        <TextField label="Audience states" name="majorAudienceStates" value={filters.majorAudienceStates} onChange={onChange} placeholder="CA, NY (requires US)" /><SelectField label="Recommendation" name="recommendationType" value={filters.recommendationType} onChange={onChange} options={RECOMMENDATIONS} />
        <SelectField label="Latest post activity" name="latestPostActivity" value={filters.latestPostActivity} onChange={onChange} options={ACTIVITIES} /><SelectField label="Follower growth" name="followerGrowth" value={filters.followerGrowth} onChange={onChange} options={GROWTH} />
        <TextField label="Similar creators (max 5)" name="similarToCreators" value={filters.similarToCreators} onChange={onChange} placeholder="creator1, creator2" /><TextField label="Result limit" name="limit" type="number" min="1" max="100" value={filters.limit} onChange={onChange} />
      </div><div className="mt-6 flex flex-wrap gap-3"><button type="submit" disabled={searching} className="rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary px-6 py-3 text-sm font-semibold disabled:opacity-50">{searching ? "Searching…" : "Search Marketplace"}</button><button type="button" onClick={() => { setFilters(initialFilters); setCreators([]); setAfter(null); setError(null); }} className="rounded-xl border border-panel-border bg-panel-light px-5 py-3 text-sm font-semibold">Reset filters</button></div></form>
      {searching && !creators.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((item) => <div key={item} className="h-72 animate-pulse rounded-3xl border border-panel-border bg-panel/50" />)}</div> : creators.length ? <section><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">Creators</h2><span className="text-xs text-text-secondary">{creators.length} loaded</span></div><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{creators.map((creator) => <article key={creator.id || creator.username} className="flex flex-col rounded-3xl border border-panel-border bg-panel/50 p-6 shadow-lg"><div className="flex items-start gap-4"><div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-tr from-accent-primary to-accent-secondary">{creator.profilePictureUrl ? <img src={creator.profilePictureUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xl font-bold">{creator.username?.[0]?.toUpperCase() || "?"}</div>}</div><div className="min-w-0"><h3 className="truncate font-bold">@{creator.username || "Unknown creator"} {creator.accountVerified && <span aria-label="Verified" title="Verified" className="text-sky-400">✓</span>}</h3><p className="mt-1 text-[11px] text-text-secondary">{[creator.country, creator.ageBucket, creator.onboardedStatus].filter(Boolean).join(" • ") || "Marketplace profile"}</p></div></div><p className="mt-4 line-clamp-3 min-h-12 text-xs leading-relaxed text-text-secondary">{creator.biography || "No biography available."}</p><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-bg-deep/50 p-3"><span className="block text-[10px] uppercase text-text-secondary">Followers</span><strong className="mt-1 block text-sm">{extractFollowers(creator.insights) || "—"}</strong></div><div className="rounded-xl bg-bg-deep/50 p-3"><span className="block text-[10px] uppercase text-text-secondary">Partnerships</span><strong className="mt-1 block text-sm">{creator.brandPartnershipExperience ? "Experienced" : "Not listed"}</strong></div></div><button type="button" onClick={() => viewDetails(creator)} className="mt-5 w-full rounded-xl border border-accent-primary/30 bg-accent-primary/10 px-4 py-2.5 text-xs font-semibold text-accent-primary hover:bg-accent-primary/20">View details</button></article>)}</div>{after && <div className="mt-6 text-center"><button type="button" onClick={() => runSearch({ loadMore: true })} disabled={searching} className="rounded-xl border border-panel-border bg-panel-light px-6 py-3 text-sm font-semibold disabled:opacity-50">{searching ? "Loading…" : "Load more"}</button></div>}</section> : <div className="rounded-2xl border border-dashed border-panel-border p-10 text-center text-sm text-text-secondary">Set filters and search to discover creators.</div>}
    </>}
  </div>{selectedCreator && <div className="fixed inset-0 z-50 flex justify-end bg-black/70" role="dialog" aria-modal="true" aria-label={`Creator details for ${selectedCreator.username}`}><div className="h-full w-full max-w-2xl overflow-y-auto border-l border-panel-border bg-panel p-6 md:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs text-accent-primary">Creator profile</p><h2 className="mt-1 text-2xl font-bold">@{selectedCreator.username}</h2></div><button type="button" onClick={() => setSelectedCreator(null)} className="rounded-lg border border-panel-border px-3 py-2 text-xs">Close</button></div>{detailsLoading ? <div className="py-16 text-center text-sm text-text-secondary">Loading creator details…</div> : <div className="mt-6 grid gap-4 sm:grid-cols-2"><DetailSection title="Profile" value={{ biography: selectedCreator.biography, country: selectedCreator.country, gender: selectedCreator.gender, ageBucket: selectedCreator.ageBucket, onboardedStatus: selectedCreator.onboardedStatus }} /><DetailSection title="Contact" value={{ email: selectedCreator.email, portfolioUrl: selectedCreator.portfolioUrl }} /><DetailSection title="Insights" value={selectedCreator.insights} /><DetailSection title="Partnership experience" value={{ brandPartnershipExperience: selectedCreator.brandPartnershipExperience, partners: selectedCreator.pastBrandPartnershipPartners }} /><DetailSection title="Recent media" value={selectedCreator.recentMedia} /><DetailSection title="Branded-content media" value={selectedCreator.brandedContentMedia} /><DetailSection title="Past partnership ads" value={selectedCreator.pastPartnershipAdsMedia} />{selectedCreator.portfolioUrl && <a href={selectedCreator.portfolioUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-accent-primary px-4 py-3 text-center text-sm font-semibold">Open portfolio</a>}</div>}</div></div>}</div>;
}

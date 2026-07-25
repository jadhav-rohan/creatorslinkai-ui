import { useEffect, useMemo, useState } from "react";

const AUDIENCES = [
  ["followers", "Followers"],
  ["reached", "Reached"],
  ["engaged", "Engaged"],
];
const AGE_ORDER = new Map(
  ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"].map(
    (value, index) => [value, index],
  ),
);
const GENDER_LABELS = { F: "Female", M: "Male", U: "Unspecified" };
const GENDER_COLORS = {
  F: "bg-fuchsia-400",
  M: "bg-sky-400",
  U: "bg-zinc-400",
};
const number = new Intl.NumberFormat();
let countryNames = null;
try {
  countryNames = new Intl.DisplayNames(undefined, { type: "region" });
} catch {
  // Older browsers safely retain the raw country value.
}

function entries(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      value: String(item?.value ?? "").trim() || "Unknown",
      count: Number(item?.count),
    }))
    .filter((item) => Number.isFinite(item.count) && item.count > 0);
}

function percentage(count, total) {
  return total > 0 ? `${((count / total) * 100).toFixed(1)}%` : "—";
}

function timeframeLabel(value) {
  const known = {
    last_90_days: "Last 90 days",
    this_month: "This month",
    this_week: "This week",
    last_30_days: "Last 30 days",
  };
  if (!value) return "Timeframe unavailable";
  return (
    known[value] ||
    String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

function countryLabel(value) {
  if (!/^[A-Za-z]{2}$/.test(value)) return value;
  try {
    return countryNames?.of(value.toUpperCase()) || value;
  } catch {
    return value;
  }
}

function EmptyBreakdown({ label }) {
  return (
    <div className="flex min-h-40 items-center justify-center border-2 border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
      {label} data unavailable
    </div>
  );
}

function HorizontalBars({ title, items, labelFor = (value) => value }) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const maximum = Math.max(...items.map((item) => item.count), 0);
  return (
    <article className="border-2 border-zinc-900 bg-white p-5">
      <h3 className="text-lg font-black">{title}</h3>
      {!items.length ? (
        <EmptyBreakdown label={title.replace(" distribution", "")} />
      ) : (
        <ul className="mt-5 space-y-4" aria-label={`${title} values`}>
          {items.map((item) => {
            const label = labelFor(item.value);
            const percent = percentage(item.count, total);
            return (
              <li
                key={item.value}
                aria-label={`${label}: ${number.format(item.count)}, ${percent}`}
              >
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-bold" title={label}>
                    {label}
                  </span>
                  <span className="shrink-0 font-mono text-xs">
                    {number.format(item.count)} · {percent}
                  </span>
                </div>
                <div className="h-3 border border-zinc-900 bg-zinc-100" aria-hidden="true">
                  <div
                    className="h-full bg-yellow-300"
                    style={{
                      width: `${maximum > 0 ? (item.count / maximum) * 100 : 0}%`,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}

function GenderBreakdown({ items }) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  return (
    <article className="border-2 border-zinc-900 bg-white p-5">
      <h3 className="text-lg font-black">Gender distribution</h3>
      {!items.length ? (
        <EmptyBreakdown label="Gender" />
      ) : (
        <>
          <div
            className="mt-5 flex h-5 overflow-hidden border-2 border-zinc-900"
            aria-hidden="true"
          >
            {items.map((item, index) => (
              <span
                key={`${item.value}-${index}`}
                className={GENDER_COLORS[item.value] || "bg-yellow-300"}
                style={{ width: `${(item.count / total) * 100}%` }}
              />
            ))}
          </div>
          <ul className="mt-5 space-y-3" aria-label="Gender distribution values">
            {items.map((item, index) => {
              const label = GENDER_LABELS[item.value] || item.value;
              const percent = percentage(item.count, total);
              return (
                <li
                  key={`${item.value}-${index}`}
                  className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-2 text-sm"
                  aria-label={`${label}: ${number.format(item.count)}, ${percent}`}
                >
                  <span className="flex items-center gap-2 font-bold">
                    <span
                      aria-hidden="true"
                      className={`h-3 w-3 border border-zinc-900 ${
                        GENDER_COLORS[item.value] || "bg-yellow-300"
                      }`}
                    />
                    {label}
                  </span>
                  <span className="font-mono text-xs">
                    {number.format(item.count)} · {percent}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </article>
  );
}

function RankedBreakdown({ title, emptyLabel, items, labelFor }) {
  const [expanded, setExpanded] = useState(false);
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const visible = expanded ? items : items.slice(0, 10);
  return (
    <article className="border-2 border-zinc-900 bg-white p-5">
      <h3 className="text-lg font-black">{title}</h3>
      {!items.length ? (
        <EmptyBreakdown label={emptyLabel} />
      ) : (
        <>
          <ol className="mt-5 space-y-2" aria-label={`${title} ranked values`}>
            {visible.map((item, index) => {
              const label = labelFor(item.value);
              const percent = percentage(item.count, total);
              return (
                <li
                  key={`${item.value}-${index}`}
                  className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 border-b border-zinc-200 py-2 text-sm"
                  aria-label={`${index + 1}. ${label}: ${number.format(item.count)}, ${percent}`}
                >
                  <span className="font-mono text-xs text-zinc-500">
                    {index + 1}
                  </span>
                  <span className="truncate font-bold" title={label}>
                    {label}
                  </span>
                  <span className="font-mono text-xs">
                    {number.format(item.count)} · {percent}
                  </span>
                </li>
              );
            })}
          </ol>
          {items.length > 10 && (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-label={`${expanded ? "Show less" : "Show all"} ${title.toLowerCase()}`}
              className="mt-4 border-2 border-zinc-900 bg-white px-4 py-2 text-sm font-black"
            >
              {expanded ? "Show less" : `Show all (${items.length})`}
            </button>
          )}
        </>
      )}
    </article>
  );
}

export default function AudienceDemographicsPanel({
  demographics,
  refreshing = false,
}) {
  const [selected, setSelected] = useState("followers");
  useEffect(() => setSelected("followers"), [demographics]);
  const audience = demographics?.[selected] || {};
  const age = useMemo(
    () =>
      entries(audience.age).sort((left, right) => {
        const leftOrder = AGE_ORDER.get(left.value);
        const rightOrder = AGE_ORDER.get(right.value);
        if (leftOrder != null && rightOrder != null) return leftOrder - rightOrder;
        if (leftOrder != null) return -1;
        if (rightOrder != null) return 1;
        return left.value.localeCompare(right.value);
      }),
    [audience.age],
  );
  const gender = useMemo(() => entries(audience.gender), [audience.gender]);
  const countries = useMemo(
    () => entries(audience.countries).sort((a, b) => b.count - a.count),
    [audience.countries],
  );
  const cities = useMemo(
    () => entries(audience.cities).sort((a, b) => b.count - a.count),
    [audience.cities],
  );
  const available = audience.available === true;

  return (
    <section
      aria-labelledby="demographics-heading"
      className="brutal-card mt-7 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="brutal-overline">Instagram audience</p>
          <h2 id="demographics-heading" className="mt-2 text-2xl font-black">
            Audience Demographics
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Age, gender and location information provided by Instagram Insights.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {refreshing && (
            <span role="status" className="text-xs font-bold text-zinc-500">
              Refreshing…
            </span>
          )}
          <span className="border-2 border-zinc-900 bg-sky-100 px-3 py-2 text-xs font-black">
            {timeframeLabel(audience.timeframe)}
          </span>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Audience demographic type"
        className="mt-6 flex max-w-full gap-2 overflow-x-auto pb-1"
      >
        {AUDIENCES.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={selected === key}
            aria-controls="audience-demographics-panel"
            onClick={() => setSelected(key)}
            className={`shrink-0 border-2 border-zinc-900 px-4 py-2 text-sm font-black ${
              selected === key ? "bg-yellow-300" : "bg-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div id="audience-demographics-panel" role="tabpanel" className="mt-5">
        {!available ? (
          <div className="border-2 border-dashed border-zinc-400 bg-zinc-50 p-7 text-center">
            <h3 className="text-xl font-black">
              Demographic data is not available yet.
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-600">
              Instagram requires a sufficient audience size before it provides
              demographic information. Try again after your account reaches more
              people or gains more followers.
            </p>
            {selected === "followers" && (
              <p className="mt-2 text-sm font-bold">
                Follower demographics generally require at least 100 followers.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-2">
              <HorizontalBars title="Age distribution" items={age} />
              <GenderBreakdown items={gender} />
              <RankedBreakdown
                title="Countries"
                emptyLabel="Country"
                items={countries}
                labelFor={countryLabel}
              />
              <RankedBreakdown
                title="Cities"
                emptyLabel="City"
                items={cities}
                labelFor={(value) => value}
              />
            </div>
            <p className="mt-5 border-t-2 border-zinc-900 pt-4 text-xs text-zinc-500">
              Percentages are calculated from the demographic entries returned
              by Instagram and may not represent the account’s complete
              audience.
            </p>
          </>
        )}
      </div>
    </section>
  );
}

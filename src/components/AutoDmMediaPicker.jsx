import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ExternalLink,
  Film,
  Image as ImageIcon,
  Images,
} from "lucide-react";
import { api } from "../api";

export const autoDmContentLabels = {
  REEL: "Reel",
  POST: "Post",
  CAROUSEL: "Carousel",
  VIDEO: "Video",
};

export function AutoDmMediaPlaceholder({ contentType }) {
  const Icon =
    contentType === "CAROUSEL"
      ? Images
      : contentType === "POST"
        ? ImageIcon
        : Film;
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-200 text-zinc-600">
      <Icon size={34} />
      <span className="mt-2 text-xs font-black">
        {autoDmContentLabels[contentType] || "Instagram media"}
      </span>
    </div>
  );
}

function MediaPreview({ item, failed, onFail }) {
  const source = item.thumbnailUrl || item.mediaThumbnailUrl || item.mediaUrl;
  if (!source || failed)
    return <AutoDmMediaPlaceholder contentType={item.contentType} />;
  if (!item.thumbnailUrl && !item.mediaThumbnailUrl && item.mediaType === "VIDEO")
    return (
      <video
        src={source}
        muted
        playsInline
        preload="metadata"
        onError={onFail}
        className="h-full w-full object-cover"
      />
    );
  return (
    <img
      src={source}
      alt={`${autoDmContentLabels[item.contentType] || "Instagram media"} preview`}
      loading="lazy"
      onError={onFail}
      className="h-full w-full object-cover"
    />
  );
}

export default function AutoDmMediaPicker({
  igUserId,
  token,
  value,
  onChange,
  logout,
  activeRuleByMedia,
  editingRule,
  onEditRule,
  onItemsLoaded,
  support,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [failed, setFailed] = useState(() => new Set());
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    api
      .getEligibleAutoDmMedia(igUserId, token, 50, {
        signal: controller.signal,
      })
      .then((result) => {
        const media = Array.isArray(result) ? result : [];
        setItems(media);
        onItemsLoaded(media);
        setFailed(new Set());
        if (
          value &&
          !media.some((item) => item.mediaId === value) &&
          editingRule?.mediaId !== value
        )
          onChange("");
      })
      .catch((requestError) => {
        if (requestError.name === "AbortError") return;
        if (requestError.status === 401) logout();
        else setError(requestError);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [igUserId, token, logout, version, editingRule?.id]);

  const displayItems = useMemo(() => {
    if (
      !editingRule?.mediaId ||
      items.some((item) => item.mediaId === editingRule.mediaId)
    )
      return items;
    return [
      {
        mediaId: editingRule.mediaId,
        contentType: editingRule.mediaContentType,
        caption: editingRule.mediaCaption,
        thumbnailUrl: editingRule.mediaThumbnailUrl,
        permalink: editingRule.mediaPermalink,
        publishedAt: editingRule.mediaPublishedAt,
      },
      ...items,
    ];
  }, [items, editingRule]);

  const visible = displayItems.filter((item) => {
    if (filter === "ALL") return true;
    if (filter === "REELS") return item.contentType === "REEL";
    return ["POST", "CAROUSEL", "VIDEO"].includes(item.contentType);
  });
  const refresh = () => {
    if (!editingRule) onChange("");
    setVersion((current) => current + 1);
  };

  if (loading)
    return (
      <div className="border-2 border-zinc-900 bg-zinc-50 p-4 sm:col-span-2 sm:p-5">
        <p className="font-black">Choose Instagram media</p>
        <div className="mt-4 flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-60 w-40 shrink-0 animate-pulse border-2 border-zinc-900 bg-zinc-200 sm:w-48"
            />
          ))}
        </div>
      </div>
    );
  if (error)
    return (
      <div className="border-2 border-red-700 bg-red-50 p-5 sm:col-span-2">
        <p role="alert" className="font-bold text-red-800">
          Eligible Instagram media couldn’t be loaded.{support(error)}
        </p>
        <button
          type="button"
          onClick={refresh}
          className="mt-3 border-2 border-zinc-900 bg-white px-4 py-2 font-black"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="border-2 border-zinc-900 bg-zinc-50 p-4 sm:col-span-2 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="brutal-overline">Step 1</p>
          <h3 className="mt-1 text-xl font-black">
            Choose Instagram media *
          </h3>
          <p className="mt-1 text-sm text-zinc-600">
            Select one Reel or feed post to watch for comments.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="w-fit border-2 border-zinc-900 bg-white px-4 py-2 text-sm font-black"
        >
          Refresh media
        </button>
      </div>
      <div
        className="mt-4 inline-flex border-2 border-zinc-900 bg-white p-1"
        role="group"
        aria-label="Filter Instagram media"
      >
        {[
          ["ALL", "All"],
          ["REELS", "Reels"],
          ["POSTS", "Posts"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 text-sm font-black ${
              filter === key ? "bg-yellow-300" : "bg-white hover:bg-zinc-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {!displayItems.length ? (
        <div className="mt-4 border-2 border-dashed border-zinc-400 bg-white p-8 text-center">
          <p className="font-black">
            No eligible Instagram media found. Publish a Reel or feed post,
            then refresh this page.
          </p>
          <button type="button" onClick={refresh} className="brutal-button mt-5">
            Refresh media
          </button>
        </div>
      ) : !visible.length ? (
        <div className="mt-4 border-2 border-dashed border-zinc-400 bg-white p-7 text-center text-zinc-600">
          No media matches this filter.
        </div>
      ) : (
        <div className="mt-4 flex snap-x gap-4 overflow-x-auto px-1 pb-3 pt-1">
          {visible.map((item) => {
            const selected = value === item.mediaId;
            const configuredRule = activeRuleByMedia.get(item.mediaId);
            const configuredByOther =
              configuredRule && configuredRule.id !== editingRule?.id;
            const caption = item.caption?.trim() || "No caption";
            return (
              <article
                key={item.mediaId}
                className={`relative w-40 shrink-0 snap-start overflow-hidden border-2 border-zinc-900 bg-white transition-transform sm:w-48 ${
                  selected
                    ? "-translate-y-1 bg-yellow-50 shadow-[5px_5px_0_#18181b]"
                    : ""
                } ${configuredByOther ? "bg-zinc-100 opacity-80" : ""}`}
              >
                <button
                  type="button"
                  disabled={Boolean(configuredByOther)}
                  onClick={() => onChange(item.mediaId)}
                  aria-pressed={selected}
                  aria-label={
                    configuredByOther
                      ? `${caption}. Auto-DM configured`
                      : `Select ${caption}`
                  }
                  className="block w-full text-left disabled:cursor-not-allowed"
                >
                  <div className="relative aspect-square border-b-2 border-zinc-900">
                    <MediaPreview
                      item={item}
                      failed={failed.has(item.mediaId)}
                      onFail={() =>
                        setFailed((current) =>
                          new Set(current).add(item.mediaId),
                        )
                      }
                    />
                    {selected && (
                      <span className="absolute bottom-2 left-2 flex items-center gap-1 border-2 border-zinc-900 bg-yellow-300 px-2 py-1 text-[10px] font-black">
                        <Check size={12} /> Selected
                      </span>
                    )}
                    {configuredByOther && (
                      <span className="absolute inset-x-2 bottom-2 border-2 border-zinc-900 bg-amber-200 px-2 py-1 text-center text-[10px] font-black">
                        Auto-DM configured
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <span className="border border-zinc-900 bg-sky-100 px-2 py-1 text-[10px] font-black">
                      {autoDmContentLabels[item.contentType] ||
                        item.contentType ||
                        "Media"}
                    </span>
                    <p className="mt-3 line-clamp-2 min-h-10 text-sm font-bold">
                      {caption}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString()
                        : "Date unavailable"}
                    </p>
                  </div>
                </button>
                {configuredByOther && (
                  <button
                    type="button"
                    onClick={() => onEditRule(configuredRule)}
                    className="m-2 mt-0 w-[calc(100%-1rem)] border-2 border-zinc-900 bg-white px-2 py-2 text-xs font-black"
                  >
                    Edit rule
                  </button>
                )}
                {item.permalink && (
                  <a
                    href={item.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    aria-label={`View ${autoDmContentLabels[item.contentType] || "media"} on Instagram`}
                    className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center border-2 border-zinc-900 bg-white shadow-[2px_2px_0_#18181b]"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

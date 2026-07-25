import { useState } from "react";
import { ExternalLink } from "lucide-react";
import AutoDmActivityModal from "./AutoDmActivityModal";
import AutoDmTemplatePreview from "./AutoDmTemplatePreview";
import {
  AutoDmMediaPlaceholder,
  autoDmContentLabels,
} from "./AutoDmMediaPicker";

function RuleThumbnail({ rule, media }) {
  const [failed, setFailed] = useState(false);
  const source = rule.mediaThumbnailUrl || media?.thumbnailUrl || media?.mediaUrl;
  const contentType = rule.mediaContentType || media?.contentType;
  if (!source || failed)
    return <AutoDmMediaPlaceholder contentType={contentType} />;
  return (
    <img
      src={source}
      alt={`${rule.mediaCaption || media?.caption || autoDmContentLabels[contentType] || "Instagram media"} thumbnail`}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  );
}

export default function AutoDmRuleCard({
  rule,
  media,
  igUserId,
  token,
  logout,
  canEdit,
  deleting,
  onEdit,
  onDelete,
}) {
  const contentType = rule.mediaContentType || media?.contentType;
  const caption = rule.mediaCaption || media?.caption || "Caption unavailable";
  const publishedAt = rule.mediaPublishedAt || media?.publishedAt;
  const permalink = rule.mediaPermalink || media?.permalink;
  const inactive = rule.active === false;
  return (
    <article
      className={`brutal-card min-w-0 overflow-hidden ${
        inactive ? "bg-zinc-100 opacity-75" : "bg-white"
      }`}
    >
      <div className="grid sm:grid-cols-[150px_minmax(0,1fr)]">
        <div className="aspect-video border-b-2 border-zinc-900 sm:aspect-auto sm:min-h-full sm:border-b-0 sm:border-r-2">
          <RuleThumbnail rule={rule} media={media} />
        </div>
        <div className="min-w-0 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <span className="border border-zinc-900 bg-sky-100 px-2 py-1 text-[10px] font-black">
                  {autoDmContentLabels[contentType] || contentType || "Media"}
                </span>
                <span
                  className={`border border-zinc-900 px-2 py-1 text-[10px] font-black ${
                    rule.responseType === "GENERIC_TEMPLATE"
                      ? "bg-violet-200"
                      : "bg-sky-200"
                  }`}
                >
                  {rule.responseType === "GENERIC_TEMPLATE"
                    ? "Generic Template"
                    : "Text"}
                </span>
                {rule.requireFollower === true && (
                  <span className="border border-zinc-900 bg-amber-200 px-2 py-1 text-[10px] font-black">
                    Follow required
                  </span>
                )}
                <span
                  className={`border border-zinc-900 px-2 py-1 text-[10px] font-black ${
                    inactive ? "bg-zinc-300" : "bg-emerald-200"
                  }`}
                >
                  {inactive ? "Inactive" : "Active"}
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm font-bold">{caption}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {publishedAt
                  ? new Date(publishedAt).toLocaleDateString()
                  : "Publication date unavailable"}
              </p>
            </div>
            {permalink && (
              <a
                href={permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-black underline"
              >
                View on Instagram <ExternalLink size={13} />
              </a>
            )}
          </div>

          <div className="mt-5 border-t-2 border-zinc-900 pt-4">
            <p className="brutal-overline">Keyword</p>
            <h3 className="mt-1 break-words text-2xl font-black">
              “{rule.keyword}”
            </h3>
            {inactive && (
              <p className="mt-2 text-sm font-bold text-zinc-600">
                This historical rule will not trigger Auto-DMs.
              </p>
            )}
          </div>
          {rule.responseType !== "GENERIC_TEMPLATE" && (
            <div className="mt-4">
              <p className="text-xs font-bold text-zinc-500">
                Private DM message
              </p>
              <p className="mt-1 whitespace-pre-wrap border-2 border-zinc-900 bg-zinc-50 p-3 text-sm">
                {rule.dmMessage || "No message"}
              </p>
            </div>
          )}
          <div className="mt-4 text-sm">
            <strong className="text-zinc-500">Public reply:</strong>{" "}
            {rule.publicReplyMessage || "Not configured"}
          </div>
        </div>
      </div>

      {rule.responseType === "GENERIC_TEMPLATE" && (
        <div className="border-t-2 border-zinc-900 px-5 pb-5">
          <AutoDmTemplatePreview
            elements={Array.isArray(rule.elements) ? rule.elements : []}
            collapsible
          />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3 border-t-2 border-zinc-900 p-4">
        <AutoDmActivityModal
          igUserId={igUserId}
          rule={rule}
          token={token}
          logout={logout}
        />
        {canEdit && (
          <>
            <button
              type="button"
              onClick={() => onEdit(rule)}
              className="border-2 border-zinc-900 bg-yellow-100 px-4 py-2 text-sm font-black"
            >
              Edit rule
            </button>
            <button
              type="button"
              onClick={() => onDelete(rule)}
              disabled={deleting === rule.id}
              className="border-2 border-red-700 bg-white px-4 py-2 text-sm font-black text-red-800"
            >
              {deleting === rule.id ? "Deleting…" : "Delete rule"}
            </button>
          </>
        )}
      </div>
    </article>
  );
}

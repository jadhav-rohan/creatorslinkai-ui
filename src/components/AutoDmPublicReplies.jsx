import { Plus, Trash2 } from "lucide-react";
import {
  MAX_PUBLIC_REPLIES,
  MAX_PUBLIC_REPLY_LENGTH,
  normalizePublicReplies,
} from "../autoDmPublicReplies";

export default function AutoDmPublicReplies({
  values,
  error,
  disabled,
  onChange,
}) {
  const normalized = normalizePublicReplies(values);
  const update = (index, value) =>
    onChange(
      values.map((current, currentIndex) =>
        currentIndex === index ? value : current,
      ),
    );

  return (
    <fieldset className="min-w-0 border-2 border-zinc-900 bg-zinc-50 p-3 sm:col-span-2 sm:p-5">
      <legend className="px-2 font-black">Public comment replies</legend>
      <p className="text-sm text-zinc-600">
        Add up to 5 variations. One reply will be selected randomly for each
        matching comment.
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        To reduce repetitive replies, CreatorLinksAI randomly selects one
        variation for each matching comment.
      </p>

      <div className="mt-4 space-y-3">
        {values.map((value, index) => (
          <div
            key={index}
            className="border-2 border-zinc-900 bg-white p-3"
          >
            <label className="block text-sm font-bold">
              Reply {index + 1}
              <textarea
                value={value}
                onChange={(event) => update(index, event.target.value)}
                disabled={disabled}
                maxLength={MAX_PUBLIC_REPLY_LENGTH}
                rows={3}
                className="brutal-field mt-2 w-full resize-y"
              />
            </label>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-zinc-500">
                {value.length} / {MAX_PUBLIC_REPLY_LENGTH}
              </span>
              {values.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    onChange(values.filter((_, current) => current !== index))
                  }
                  disabled={disabled}
                  className="inline-flex items-center gap-1 border-2 border-red-700 bg-white px-3 py-2 text-xs font-black text-red-700"
                >
                  <Trash2 size={14} /> Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {normalized.length === 0 && (
        <p className="mt-3 border-l-4 border-zinc-900 bg-sky-50 p-3 text-sm">
          No public reply will be posted. The private Auto-DM can still be sent.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 border-2 border-red-700 bg-red-50 p-3 text-sm font-bold text-red-800"
        >
          {error}
        </p>
      )}

      {values.length < MAX_PUBLIC_REPLIES && (
        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          disabled={disabled}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 border-2 border-zinc-900 bg-yellow-200 px-4 py-2 font-black sm:w-auto"
        >
          <Plus size={16} /> Add another reply
        </button>
      )}
    </fieldset>
  );
}

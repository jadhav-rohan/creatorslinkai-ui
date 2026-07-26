import { FileText, RefreshCw, Upload } from "lucide-react";
import { formatPdfSize } from "../autoDmPdf";

export default function AutoDmPdfFields({
  form,
  upload,
  disabled,
  onFile,
  onRetry,
  onChange,
}) {
  const hasAsset = Boolean(form.pdfAssetId);
  const hasFile = Boolean(form.pdfFileName);
  const busy = upload.status === "uploading" || upload.status === "confirming";

  return (
    <fieldset className="space-y-5 border-2 border-zinc-900 bg-zinc-50 p-4 sm:col-span-2 sm:p-5">
      <legend className="px-2 text-sm font-black">PDF delivery</legend>

      <div>
        <p className="font-bold">PDF upload *</p>
        <p className="mt-1 text-xs text-zinc-600">
          PDF only · Maximum file size 10 MB
        </p>
        <label className="mt-3 inline-flex min-h-11 cursor-pointer items-center gap-2 border-2 border-zinc-900 bg-white px-4 py-2 font-black shadow-[3px_3px_0_#18181b] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
          <Upload size={17} />
          {hasFile ? "Replace PDF" : "Choose PDF"}
          <input
            type="file"
            accept=".pdf,application/pdf"
            disabled={disabled || busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) onFile(file);
            }}
            className="sr-only"
          />
        </label>
      </div>

      {hasFile && (
        <div className="flex flex-wrap items-center gap-3 border-2 border-zinc-900 bg-white p-3">
          <FileText className="shrink-0" size={24} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-black">{form.pdfFileName}</p>
            <p className="text-xs text-zinc-600">
              {formatPdfSize(form.pdfSizeBytes)}
            </p>
          </div>
          {hasAsset && upload.status !== "error" && (
            <span className="border border-zinc-900 bg-emerald-200 px-2 py-1 text-xs font-black">
              Ready
            </span>
          )}
        </div>
      )}

      {busy && (
        <div aria-live="polite">
          <div className="flex items-center justify-between gap-3 text-sm font-bold">
            <span>
              {upload.status === "confirming"
                ? "Confirming upload…"
                : "Uploading PDF…"}
            </span>
            <span>{upload.progress}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={upload.progress}
            className="mt-2 h-4 overflow-hidden border-2 border-zinc-900 bg-white"
          >
            <div
              className="h-full bg-yellow-300 transition-[width]"
              style={{ width: `${upload.progress}%` }}
            />
          </div>
        </div>
      )}

      {upload.error && (
        <div role="alert" className="border-2 border-red-700 bg-red-50 p-3 text-sm text-red-800">
          <p>{upload.error}</p>
          {upload.file && (
            <button
              type="button"
              onClick={onRetry}
              disabled={disabled || busy}
              className="mt-3 inline-flex items-center gap-2 border-2 border-zinc-900 bg-white px-3 py-2 font-black text-zinc-900"
            >
              <RefreshCw size={15} /> Retry upload
            </button>
          )}
        </div>
      )}

      <label className="block font-bold">
        Message *
        <textarea
          value={form.dmMessage}
          onChange={(event) => onChange("dmMessage", event.target.value)}
          disabled={disabled}
          required
          rows={5}
          className="brutal-field mt-2 w-full resize-y"
        />
        <span className="mt-1 block text-xs font-normal text-zinc-600">
          Sent with the secure PDF download button.
        </span>
      </label>

      <label className="block font-bold">
        Button text (optional)
        <input
          value={form.pdfButtonText}
          onChange={(event) => onChange("pdfButtonText", event.target.value)}
          disabled={disabled}
          maxLength={40}
          className="brutal-field mt-2 w-full"
        />
        <span className="mt-1 flex justify-between gap-3 text-xs font-normal text-zinc-600">
          <span>Instagram download-button label.</span>
          <span>{form.pdfButtonText.length}/40</span>
        </span>
      </label>
    </fieldset>
  );
}

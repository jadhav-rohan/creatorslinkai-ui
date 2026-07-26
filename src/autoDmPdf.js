export const AUTO_DM_PDF_MAX_BYTES = 10 * 1024 * 1024;
export const DEFAULT_PDF_BUTTON_TEXT = "Download PDF";

export function formatPdfSize(value) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes < 0) return "Size unavailable";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toLocaleString(undefined, {
      maximumFractionDigits: 1,
    })} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString(undefined, {
    maximumFractionDigits: 1,
  })} MB`;
}

export async function validateAutoDmPdf(file) {
  if (!file) return "Select a PDF file.";
  if (!file.name.toLowerCase().endsWith(".pdf"))
    return "Select a file with a .pdf extension.";
  if (file.type && file.type !== "application/pdf")
    return "The selected file is not a valid PDF.";
  if (file.size > AUTO_DM_PDF_MAX_BYTES)
    return "PDF files must be 10 MB or smaller.";
  if (file.size === 0) return "The selected PDF is empty.";
  const signature = await file.slice(0, 5).text();
  if (signature !== "%PDF-") return "The selected file is not a valid PDF.";
  return "";
}

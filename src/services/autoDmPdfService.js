import { api } from "../api";

function uploadDirectly({ uploadUrl, method, headers }, file, onProgress) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(method || "PUT", uploadUrl);
    request.withCredentials = false;
    Object.entries(headers || {}).forEach(([name, value]) => {
      request.setRequestHeader(name, value);
    });
    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    request.onerror = () =>
      reject(new Error("The PDF upload to storage failed. Please try again."));
    request.onabort = () => reject(new Error("The PDF upload was cancelled."));
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }
      reject(
        new Error(
          request.status === 403
            ? "The PDF upload URL expired. Select Retry upload to request a new one."
            : `The PDF upload to storage failed (${request.status}). Please try again.`,
        ),
      );
    };
    request.send(file);
  });
}

export const autoDmPdfService = {
  async uploadAndConfirm({ igUserId, file, token, onProgress, onPhase }) {
    const session = await api.createAutoDmPdfUploadUrl(
      igUserId,
      {
        fileName: file.name,
        contentType: "application/pdf",
        sizeBytes: file.size,
      },
      token,
    );
    if (!session?.assetId || !session?.uploadUrl) {
      throw new Error("The PDF upload session could not be created.");
    }

    await uploadDirectly(session, file, onProgress);
    onPhase?.("confirming");
    const confirmed = await api.confirmAutoDmPdfUpload(
      igUserId,
      session.assetId,
      token,
    );
    if (confirmed?.status !== "READY") {
      throw new Error("The PDF upload was not confirmed. Please retry the upload.");
    }
    return confirmed;
  },
};

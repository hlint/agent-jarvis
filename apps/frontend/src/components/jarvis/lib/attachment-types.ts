export type UploadedLocalFile = {
  type: "local-file";
  originalName: string;
  uploadName: string;
  uploadPath: string;
  fileType: string;
  fileSize: number;
};

export type AttachmentUploadStatus =
  | "queued"
  | "uploading"
  | "done"
  | "error"
  | "cancelled";

export type AttachmentUploadItem = {
  id: string;
  originalName: string;
  progress: number;
  status: AttachmentUploadStatus;
  error?: string;
  result?: UploadedLocalFile;
};

export function hasPendingAttachmentUploads(
  attachments: AttachmentUploadItem[],
) {
  return attachments.some(
    (a) => a.status === "queued" || a.status === "uploading",
  );
}

export function getCompletedAttachmentPaths(
  attachments: AttachmentUploadItem[],
) {
  return attachments
    .filter((a) => a.status === "done" && a.result?.uploadPath)
    .map((a) => a.result!.uploadPath);
}

export function canSendUserMessage(input: {
  inputText: string;
  attachments: AttachmentUploadItem[];
  isConnected: boolean;
}) {
  if (!input.isConnected) return false;
  if (hasPendingAttachmentUploads(input.attachments)) return false;
  const hasContent = !!input.inputText.trim();
  const hasAttachments =
    getCompletedAttachmentPaths(input.attachments).length > 0;
  return hasContent || hasAttachments;
}

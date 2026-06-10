import useJarvisStore from "../hooks/use-jarvis-store";
import type {
  AttachmentUploadItem,
  UploadedLocalFile,
} from "./attachment-types";

type UploadTask = {
  file: File;
  xhr: XMLHttpRequest;
};

const uploadTasks = new Map<string, UploadTask>();

function isUploadedLocalFile(data: unknown): data is UploadedLocalFile {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as UploadedLocalFile).type === "local-file"
  );
}

function buildUploadUrl(sessionId: string | null) {
  const url = new URL("/jarvis/upload", window.location.origin);
  if (sessionId) url.searchParams.set("sessionId", sessionId);
  return url.toString();
}

function startUpload(id: string, file: File) {
  const { patchAttachment, currentSessionId } = useJarvisStore.getState();
  const xhr = new XMLHttpRequest();
  uploadTasks.set(id, { file, xhr });

  patchAttachment(id, { status: "uploading", progress: 0 });

  xhr.upload.addEventListener("progress", (e) => {
    if (!e.lengthComputable) return;
    const progress = Math.round((e.loaded / e.total) * 100);
    useJarvisStore.getState().patchAttachment(id, { progress });
  });

  xhr.addEventListener("load", () => {
    uploadTasks.delete(id);
    const item = useJarvisStore.getState().attachments.find((a) => a.id === id);
    if (item?.status === "cancelled") return;

    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const data = JSON.parse(xhr.responseText) as unknown;
        if (isUploadedLocalFile(data)) {
          useJarvisStore.getState().patchAttachment(id, {
            status: "done",
            progress: 100,
            result: data,
          });
          return;
        }
      } catch {
        // fall through to error
      }
    }

    let message = "Upload failed";
    try {
      const err = JSON.parse(xhr.responseText) as { error?: string };
      if (err.error) message = err.error;
    } catch {
      // keep default message
    }
    useJarvisStore.getState().patchAttachment(id, {
      status: "error",
      error: message,
    });
  });

  xhr.addEventListener("error", () => {
    uploadTasks.delete(id);
    const item = useJarvisStore.getState().attachments.find((a) => a.id === id);
    if (item?.status === "cancelled") return;
    useJarvisStore.getState().patchAttachment(id, {
      status: "error",
      error: "Network error",
    });
  });

  xhr.addEventListener("abort", () => {
    uploadTasks.delete(id);
  });

  const formData = new FormData();
  formData.append("file", file);
  xhr.open("POST", buildUploadUrl(currentSessionId));
  xhr.send(formData);
}

export function enqueueFiles(files: File[]) {
  if (files.length === 0) return;

  const items: AttachmentUploadItem[] = files.map((file) => ({
    id: crypto.randomUUID(),
    originalName: file.name,
    progress: 0,
    status: "queued",
  }));

  useJarvisStore.setState((state) => ({
    attachments: [...state.attachments, ...items],
  }));

  for (let i = 0; i < files.length; i++) {
    const item = items[i];
    if (item) startUpload(item.id, files[i]!);
  }
}

export function abortUpload(id: string) {
  const task = uploadTasks.get(id);
  if (task) {
    task.xhr.abort();
    uploadTasks.delete(id);
  }
}

export function removeAttachment(id: string) {
  abortUpload(id);
  useJarvisStore.setState((state) => ({
    attachments: state.attachments.filter((a) => a.id !== id),
  }));
}

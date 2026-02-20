export type UploadResult =
  | { success: true; path: string; filename: string }
  | { success: false; error: string };

export async function uploadFile(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${window.location.origin}/jarvis/upload`, {
    method: "POST",
    body: formData,
  });

  const data = (await res.json()) as UploadResult;
  if (!res.ok) {
    return {
      success: false,
      error: (data as { error?: string }).error ?? "Upload failed",
    };
  }
  return data;
}

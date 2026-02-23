import { toast } from "sonner";
import { api } from "@/lib/api";
import useJarvisStore from "../use-jarvis-store";

export default async function uploadFile(file: File) {
  if (useJarvisStore.getState().isUploading) return;
  useJarvisStore.getState().setIsUploading(true);
  const uploadFn = async () => {
    const result = await api.jarvis.upload.post({ file });
    if (!result.data?.success) {
      throw new Error(
        (result.data as { error?: string })?.error ?? "Upload failed",
      );
    }
    return file.name;
  };
  try {
    toast.promise(uploadFn(), {
      loading: "Uploading...",
      success: (name) => `Uploaded: ${name}`,
      error: (err) => err.message,
    });
  } finally {
    useJarvisStore.getState().setIsUploading(false);
  }
}

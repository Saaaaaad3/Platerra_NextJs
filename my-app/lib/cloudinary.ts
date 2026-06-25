const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export type UploadKind = "logo" | "cover" | "item";

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return "Only JPG, PNG, or WebP images are accepted.";
  if (file.size > MAX_SIZE_BYTES) return "Image must be under 10 MB.";
  return null;
}

export async function checkImageDimensions(
  file: File,
  minWidth: number,
  minHeight: number
): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width < minWidth || img.height < minHeight) {
        resolve(
          `Image must be at least ${minWidth}×${minHeight}px (yours: ${img.width}×${img.height}px).`
        );
      } else {
        resolve(null);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("Could not read image.");
    };
    img.src = url;
  });
}

/** Uploads through our auth-gated server route (signed, server-side). */
export async function uploadImage(
  file: File,
  kind: UploadKind
): Promise<{ url: string; publicId: string }> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("kind", kind);

  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Upload failed");
  }
  return res.json();
}

/**
 * Best-effort delete of a Cloudinary asset by its URL. Failures are swallowed —
 * orphan cleanup should never block the user or fail a save.
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    /* ignore */
  }
}

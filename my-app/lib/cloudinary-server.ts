import { v2 as cloudinary } from "cloudinary";

// Server-only Cloudinary config. The api_secret must never reach the browser,
// so this module is only ever imported from API route handlers.
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

/**
 * Extracts the Cloudinary public_id from a delivery URL, e.g.
 *   https://res.cloudinary.com/abc/image/upload/v123/platerra/<id>/logo/xy.jpg
 *   → platerra/<id>/logo/xy
 */
export function publicIdFromUrl(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
}

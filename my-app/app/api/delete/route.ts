import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import cloudinary, { publicIdFromUrl } from "../../../lib/cloudinary-server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!restaurant) return NextResponse.json({ error: "No restaurant." }, { status: 400 });

  const { url } = (await request.json().catch(() => ({ url: null }))) as { url: unknown };
  if (typeof url !== "string") return NextResponse.json({ error: "No url." }, { status: 400 });

  const publicId = publicIdFromUrl(url);
  if (!publicId) return NextResponse.json({ error: "Unrecognised url." }, { status: 400 });

  // Ownership guard: only assets inside this owner's restaurant folder may be deleted.
  if (!publicId.startsWith(`platerra/${restaurant.id}/`))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await cloudinary.uploader.destroy(publicId, { invalidate: true });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || "Delete failed" }, { status: 500 });
  }
}

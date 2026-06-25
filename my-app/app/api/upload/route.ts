import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import cloudinary from "../../../lib/cloudinary-server";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  // 1. Must be a logged-in owner.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Resolve the owner's restaurant server-side — the client never picks the
  //    folder, so nobody can upload into another restaurant's space.
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!restaurant) return NextResponse.json({ error: "No restaurant linked to your account." }, { status: 400 });

  // 3. Parse + validate the file.
  const form = await request.formData();
  const file = form.get("file");
  const kind = form.get("kind");

  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided." }, { status: 400 });
  if (kind !== "logo" && kind !== "cover" && kind !== "item")
    return NextResponse.json({ error: "Invalid upload kind." }, { status: 400 });
  if (!ACCEPTED_TYPES.includes(file.type))
    return NextResponse.json({ error: "Only JPG, PNG, or WebP images are accepted." }, { status: 400 });
  if (file.size > MAX_SIZE_BYTES)
    return NextResponse.json({ error: "Image must be under 10 MB." }, { status: 400 });

  // 4. Upload to a per-restaurant, per-kind folder with a unique id.
  const folder = `platerra/${restaurant.id}/${kind === "item" ? "items" : kind}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: "image",
    });
    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || "Upload failed" }, { status: 500 });
  }
}

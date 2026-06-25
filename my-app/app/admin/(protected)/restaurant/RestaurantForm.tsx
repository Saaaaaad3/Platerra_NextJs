"use client";

import { useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import ImageUploader, { type UploadedImage } from "../menu/ImageUploader";

type SocialHandle = { id: string; platform: string; handle: string };

type Restaurant = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  logo_url: string | null;
  header_tagline: string | null;
};

const PLATFORMS = ["instagram", "facebook", "twitter", "tiktok", "youtube", "website"];

export default function RestaurantForm({
  restaurant,
  initialSocialHandles,
}: {
  restaurant: Restaurant;
  initialSocialHandles: SocialHandle[];
}) {
  const supabase = createClient();

  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description ?? "");
  const [location, setLocation] = useState(restaurant.location ?? "");
  const [logoImages, setLogoImages] = useState<UploadedImage[]>(
    restaurant.logo_url ? [{ url: restaurant.logo_url }] : []
  );
  const [tagline, setTagline] = useState(restaurant.header_tagline ?? "");
  const [handles, setHandles] = useState<SocialHandle[]>(initialSocialHandles);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const logoUrl = logoImages[0]?.url ?? null;

    const { error: restError } = await supabase
      .from("restaurants")
      .update({
        name,
        description: description || null,
        location: location || null,
        logo_url: logoUrl,
        header_tagline: tagline || null,
      })
      .eq("id", restaurant.id);

    if (restError) { setError(restError.message); setSaving(false); return; }

    // Replace all social handles
    await supabase.from("social_handles").delete().eq("restaurant_id", restaurant.id);
    const validHandles = handles.filter((h) => h.platform && h.handle.trim());
    if (validHandles.length > 0) {
      const { error: handleError } = await supabase.from("social_handles").insert(
        validHandles.map(({ platform, handle }) => ({
          restaurant_id: restaurant.id,
          platform,
          handle: handle.trim(),
        }))
      );
      if (handleError) { setError(handleError.message); setSaving(false); return; }
    }

    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const addHandle = () =>
    setHandles((prev) => [...prev, { id: crypto.randomUUID(), platform: "instagram", handle: "" }]);

  const removeHandle = (id: string) => setHandles((prev) => prev.filter((h) => h.id !== id));

  const updateHandle = (id: string, field: "platform" | "handle", value: string) =>
    setHandles((prev) => prev.map((h) => (h.id === id ? { ...h, [field]: value } : h)));

  return (
    <div className="mx-auto max-w-xl px-6 py-8">
      <h1 className="mb-6 text-lg font-semibold text-slate-900">Restaurant Settings</h1>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Basic info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-400">Basic info</p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Restaurant name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Downtown, New York"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of your restaurant…"
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Menu header</p>
          <p className="mb-4 text-xs text-slate-400">Use social handles or a tagline — whichever is set takes priority.</p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Logo</label>
              <p className="mb-3 text-xs text-slate-400">
                Leave empty to show your restaurant name as text. JPG, PNG, or WebP · Max 10 MB.
              </p>
              <ImageUploader
                images={logoImages}
                onChange={setLogoImages}
                maxImages={1}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tagline</label>
              <textarea
                rows={2}
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Shown below logo when no social handles are set…"
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Social handles */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-400">Social handles</p>
          <div className="flex flex-col gap-2">
            {handles.map((h) => (
              <div key={h.id} className="flex gap-2">
                <select
                  value={h.platform}
                  onChange={(e) => updateHandle(h.id, "platform", e.target.value)}
                  className="w-32 shrink-0 rounded-xl border border-slate-200 px-2 py-2 text-sm outline-none focus:border-slate-400"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
                <input
                  value={h.handle}
                  onChange={(e) => updateHandle(h.id, "handle", e.target.value)}
                  placeholder="username or URL"
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
                <button
                  type="button"
                  onClick={() => removeHandle(h.id)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-400 transition hover:border-rose-200 hover:text-rose-600"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addHandle}
              className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
            >
              <span>+</span> Add handle
            </button>
          </div>
        </div>

        {error && <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-600">{error}</p>}
        {success && <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">Saved successfully.</p>}

        <button
          type="submit"
          disabled={saving}
          className="self-start rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}

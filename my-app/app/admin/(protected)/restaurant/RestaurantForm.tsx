"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { deleteImage } from "../../../../lib/cloudinary";
import ImageUploader, { type UploadedImage } from "../menu/ImageUploader";

type SocialHandle = { id: string; platform: string; handle: string };

type Restaurant = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  logo_url: string | null;
  cover_url: string | null;
  show_name: boolean | null;
  header_tagline: string | null;
};

const PLATFORMS = ["instagram", "facebook", "twitter", "tiktok", "youtube", "website"];

// Serialises everything that gets saved, so we can tell whether the form is dirty.
// Social handles are normalised (trimmed, empties dropped) since that's what we persist.
function buildSnapshot(v: {
  name: string;
  description: string;
  location: string;
  tagline: string;
  logo: string | null;
  cover: string | null;
  showName: boolean;
  handles: SocialHandle[];
}) {
  return JSON.stringify({
    name: v.name,
    description: v.description,
    location: v.location,
    tagline: v.tagline,
    logo: v.logo,
    cover: v.cover,
    showName: v.showName,
    handles: v.handles
      .filter((h) => h.platform && h.handle.trim())
      .map((h) => ({ platform: h.platform, handle: h.handle.trim() })),
  });
}

function Toggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
        checked ? "bg-emerald-500" : "bg-slate-200"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
          checked ? "left-4" : "left-0.5"
        }`}
      />
    </button>
  );
}

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
  const [coverImages, setCoverImages] = useState<UploadedImage[]>(
    restaurant.cover_url ? [{ url: restaurant.cover_url }] : []
  );
  const [tagline, setTagline] = useState(restaurant.header_tagline ?? "");
  const [showName, setShowName] = useState(restaurant.show_name ?? true);
  const [handles, setHandles] = useState<SocialHandle[]>(initialSocialHandles);

  const hasLogo = logoImages.length > 0;
  const hasCover = coverImages.length > 0;
  // The name only appears on the menu when there's no logo. It's mandatory (toggle
  // locks on) when there's neither a logo nor a cover, or the header would be empty.
  // When a logo is set, the toggle has no effect, so it's disabled too.
  const nameMandatory = !hasLogo && !hasCover;
  const nameToggleDisabled = nameMandatory || hasLogo;
  const effectiveShowName = nameMandatory ? true : showName;

  // Baseline of the last-saved state; the Save button stays disabled until the
  // form differs from it, and we re-baseline after each successful save.
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    buildSnapshot({
      name: restaurant.name,
      description: restaurant.description ?? "",
      location: restaurant.location ?? "",
      tagline: restaurant.header_tagline ?? "",
      logo: restaurant.logo_url ?? null,
      cover: restaurant.cover_url ?? null,
      showName: !restaurant.logo_url && !restaurant.cover_url ? true : restaurant.show_name ?? true,
      handles: initialSocialHandles,
    })
  );

  const currentSnapshot = buildSnapshot({
    name,
    description,
    location,
    tagline,
    logo: logoImages[0]?.url ?? null,
    cover: coverImages[0]?.url ?? null,
    showName: effectiveShowName,
    handles,
  });
  const isDirty = currentSnapshot !== savedSnapshot;

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Last-persisted logo/cover URLs, so we can delete the old asset when one is
  // replaced or removed. Updated after each successful save.
  const persistedLogo = useRef(restaurant.logo_url);
  const persistedCover = useRef(restaurant.cover_url);

  // Latest image state, read by the unmount cleanup below.
  const liveLogo = useRef(logoImages);
  liveLogo.current = logoImages;
  const liveCover = useRef(coverImages);
  liveCover.current = coverImages;

  // If the owner uploads a logo/cover then leaves without saving, delete the
  // orphaned assets. `isNew` is cleared on save, so saved images survive.
  useEffect(() => {
    return () => {
      [...liveLogo.current, ...liveCover.current].forEach((img) => {
        if (img.isNew && img.url) deleteImage(img.url);
      });
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const logoUrl = logoImages[0]?.url ?? null;
    const coverUrl = coverImages[0]?.url ?? null;

    const { error: restError } = await supabase
      .from("restaurants")
      .update({
        name,
        description: description || null,
        location: location || null,
        logo_url: logoUrl,
        cover_url: coverUrl,
        show_name: effectiveShowName,
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

    // Clean up the old logo/cover assets if they were replaced or removed.
    if (persistedLogo.current && persistedLogo.current !== logoUrl) deleteImage(persistedLogo.current);
    if (persistedCover.current && persistedCover.current !== coverUrl) deleteImage(persistedCover.current);
    persistedLogo.current = logoUrl;
    persistedCover.current = coverUrl;

    // These are now persisted — drop the `isNew` flag so they aren't treated as
    // orphans on removal or unmount.
    setLogoImages((imgs) => imgs.map((i) => ({ ...i, isNew: false })));
    setCoverImages((imgs) => imgs.map((i) => ({ ...i, isNew: false })));

    setSavedSnapshot(currentSnapshot);
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
            <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-700">Show name when logo is disabled</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {nameMandatory
                    ? "Required — with no logo or cover, the name is your only header identity."
                    : hasLogo
                      ? "Your logo is shown instead — this applies only when no logo is set."
                      : "Turn off for a banner-only header with no name text."}
                </p>
              </div>
              <Toggle checked={effectiveShowName} disabled={nameToggleDisabled} onChange={setShowName} />
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
              <label className="mb-1 block text-sm font-medium text-slate-700">Cover banner</label>
              <p className="mb-3 text-xs text-slate-400">
                Shown full-width at the top of your menu. Upload at a <strong>2:1 ratio</strong> so it
                fills without cropping — ideally <strong>1600×800&nbsp;px</strong> · JPG or WebP · under 2&nbsp;MB.
              </p>
              <ImageUploader
                images={coverImages}
                onChange={setCoverImages}
                kind="cover"
                maxImages={1}
                minWidth={1200}
                minHeight={600}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Logo</label>
              <p className="mb-3 text-xs text-slate-400">
                Scaled to fit and <strong>never cropped</strong> — any shape works. Transparent PNG looks
                best · about <strong>300&nbsp;px tall</strong> (width scales) · under 1&nbsp;MB.
              </p>
              <ImageUploader
                images={logoImages}
                onChange={setLogoImages}
                kind="logo"
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
          disabled={saving || !isDirty}
          className="self-start rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : isDirty ? "Save changes" : "Saved"}
        </button>
      </form>
    </div>
  );
}

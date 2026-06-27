"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { deleteImage } from "../../../../lib/cloudinary";
import { parseBranding, resolveTheme, DEFAULT_BRANDING, type Branding } from "../../../../lib/branding";
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
  branding: unknown;
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
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
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
    background: v.background,
    surface: v.surface,
    primary: v.primary,
    secondary: v.secondary,
    accent: v.accent,
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

function ColorField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${label} color picker`}
        className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
      />
      <div className="min-w-0 flex-1">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <p className="text-xs text-slate-400">{hint}</p>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="w-24 shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-sm uppercase outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
    </div>
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

  // Brand Kit colors. parseBranding normalises a missing/invalid `branding` blob
  // to the defaults, so the pickers always start from a valid theme.
  const initialBranding = parseBranding(restaurant.branding);
  const [background, setBackground] = useState(initialBranding.colors.background);
  const [surface, setSurface] = useState(initialBranding.colors.surface);
  const [primary, setPrimary] = useState(initialBranding.colors.primary);
  const [secondary, setSecondary] = useState(initialBranding.colors.secondary);
  const [accent, setAccent] = useState(initialBranding.colors.accent);

  // Live preview of the menu, themed by the current (unsaved) colors.
  const previewTheme = resolveTheme(
    parseBranding({ version: 1, colors: { background, surface, primary, secondary, accent } })
  );

  // "Default" means no custom branding — when the colors match the defaults we
  // persist NULL, clearing the column so the menu falls back to the built-in theme.
  const d = DEFAULT_BRANDING.colors;
  const isDefaultColors =
    background.toLowerCase() === d.background &&
    surface.toLowerCase() === d.surface &&
    primary.toLowerCase() === d.primary &&
    secondary.toLowerCase() === d.secondary &&
    accent.toLowerCase() === d.accent;

  const resetBranding = () => {
    setBackground(d.background);
    setSurface(d.surface);
    setPrimary(d.primary);
    setSecondary(d.secondary);
    setAccent(d.accent);
  };

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
      background: initialBranding.colors.background,
      surface: initialBranding.colors.surface,
      primary: initialBranding.colors.primary,
      secondary: initialBranding.colors.secondary,
      accent: initialBranding.colors.accent,
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
    background,
    surface,
    primary,
    secondary,
    accent,
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

    // Normalise before persisting, so a hand-typed invalid hex can never be saved.
    // When the colors are the defaults, store NULL — "no custom branding" — so the
    // menu falls back to the built-in theme instead of pinning the default values.
    const branding: Branding = parseBranding({
      version: 1,
      colors: { background, surface, primary, secondary, accent },
    });
    const brandingToSave = isDefaultColors ? null : branding;

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
        branding: brandingToSave,
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

    // Reflect the normalised colors back into the form, then baseline off them so
    // the Save button settles even if an invalid hex was coerced to a default.
    const { background: nbg, surface: nsf, primary: np, secondary: ns, accent: na } = branding.colors;
    setBackground(nbg);
    setSurface(nsf);
    setPrimary(np);
    setSecondary(ns);
    setAccent(na);
    setSavedSnapshot(
      buildSnapshot({
        name,
        description,
        location,
        tagline,
        logo: logoUrl,
        cover: coverUrl,
        showName: effectiveShowName,
        background: nbg,
        surface: nsf,
        primary: np,
        secondary: ns,
        accent: na,
        handles,
      })
    );
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

        {/* Branding */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-1 flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Branding</p>
            <button
              type="button"
              onClick={resetBranding}
              disabled={isDefaultColors}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z"
                  clipRule="evenodd"
                />
              </svg>
              Reset to default
            </button>
          </div>
          <p className="mb-4 text-xs text-slate-400">
            Text colors are picked automatically for readability, so any combination stays legible.
          </p>
          <div className="flex flex-col gap-4">
            {/* Live preview — a mini menu using the same tokens the real menu consumes.
                Kept ABOVE the pickers (and sticky) so the native color dialog, which
                opens beside the swatch below, never covers it. */}
            <div
              style={previewTheme}
              className="sticky top-2 z-10 overflow-hidden rounded-2xl border border-slate-200 bg-brand-background p-4 text-brand-on-background shadow-sm"
            >
              <p className="mb-3 text-center text-sm font-semibold">Your Restaurant</p>
              <div className="rounded-xl border border-brand-on-surface/10 bg-brand-surface p-3 text-brand-on-surface">
                <div className="mb-2 flex items-center justify-between border-b border-brand-on-surface/10 pb-2">
                  <span className="text-sm font-semibold">Starters</span>
                  <span className="rounded-full bg-brand-secondary px-2 py-0.5 text-[10px] font-medium text-brand-secondary-foreground">
                    3
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      Seekh Kebab
                      <span className="ml-1.5 inline-flex rounded-full bg-brand-accent px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-brand-accent-foreground align-middle">
                        New
                      </span>
                    </p>
                    <p className="truncate text-xs text-brand-on-surface/60">Chargrilled, house spices</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-foreground">
                    $12
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs font-medium uppercase tracking-wide text-slate-300">Base</p>
            <ColorField
              label="Background"
              hint="The menu page behind everything."
              value={background}
              onChange={setBackground}
            />
            <ColorField
              label="Surface"
              hint="Cards, header, and section panels."
              value={surface}
              onChange={setSurface}
            />

            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-300">Accents</p>
            <ColorField
              label="Primary"
              hint="Main brand color — price tags and key accents."
              value={primary}
              onChange={setPrimary}
            />
            <ColorField
              label="Secondary"
              hint="Supporting brand color — category headers."
              value={secondary}
              onChange={setSecondary}
            />
            <ColorField
              label="Accent"
              hint="Highlights such as the “New” badge."
              value={accent}
              onChange={setAccent}
            />
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

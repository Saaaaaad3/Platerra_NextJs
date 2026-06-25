"use client";

import { useEffect, useRef, useState } from "react";
import { deleteImage } from "../../../../lib/cloudinary";
import ImageUploader, { type UploadedImage } from "./ImageUploader";

export type DbItemImage = { id: string; url: string; display_order: number };

export type DbItem = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  is_veg: boolean;
  is_jain: boolean;
  is_spicy: boolean;
  spice_level: number;
  is_sweet: boolean;
  is_available: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  is_popular_this_week: boolean;
  allergens: string[];
  dietary_tags: string[];
  display_order: number;
  item_images?: DbItemImage[];
};

export type Category = {
  id: string;
  name: string;
  display_order: number;
};

type FormData = {
  name: string;
  description: string;
  price: string;
  category_id: string;
  is_veg: boolean;
  is_jain: boolean;
  is_spicy: boolean;
  spice_level: number;
  is_sweet: boolean;
  is_available: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  is_popular_this_week: boolean;
  allergens: string[];
};

const ALLERGENS = ["dairy", "gluten", "nuts", "eggs", "sesame", "soy", "fish", "shellfish"];

const DEFAULT_FORM: FormData = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  is_veg: true,
  is_jain: false,
  is_spicy: false,
  spice_level: 0,
  is_sweet: false,
  is_available: true,
  is_bestseller: false,
  is_new: false,
  is_popular_this_week: false,
  allergens: [],
};

function toDisplay(slug: string) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-1.5">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-emerald-500" : "bg-slate-200"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? "left-4" : "left-0.5"}`}
        />
      </button>
    </label>
  );
}

type SavePayload = Omit<FormData, "price"> & { price: number; images: UploadedImage[] };

type Props = {
  open: boolean;
  editingItem: DbItem | null;
  categories: Category[];
  defaultCategoryId: string;
  saving: boolean;
  onClose: () => void;
  onSave: (data: SavePayload) => void;
};

export default function ItemFormPanel({
  open,
  editingItem,
  categories,
  defaultCategoryId,
  saving,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<FormData>({ ...DEFAULT_FORM, category_id: defaultCategoryId });
  const [images, setImages] = useState<UploadedImage[]>([]);

  useEffect(() => {
    if (editingItem) {
      setForm({
        name: editingItem.name,
        description: editingItem.description ?? "",
        price: String(editingItem.price),
        category_id: editingItem.category_id ?? "",
        is_veg: editingItem.is_veg,
        is_jain: editingItem.is_jain,
        is_spicy: editingItem.is_spicy,
        spice_level: editingItem.spice_level,
        is_sweet: editingItem.is_sweet,
        is_available: editingItem.is_available,
        is_bestseller: editingItem.is_bestseller,
        is_new: editingItem.is_new,
        is_popular_this_week: editingItem.is_popular_this_week,
        allergens: editingItem.allergens ?? [],
      });
      setImages(
        (editingItem.item_images ?? [])
          .sort((a, b) => a.display_order - b.display_order)
          .map((img) => ({ id: img.id, url: img.url }))
      );
    } else {
      setForm({ ...DEFAULT_FORM, category_id: defaultCategoryId });
      setImages([]);
    }
  }, [editingItem, defaultCategoryId, open]);

  // Latest images, read by the unmount cleanup.
  const liveImages = useRef<UploadedImage[]>([]);
  liveImages.current = images;

  // Cancelling or leaving the page with fresh, unsaved uploads deletes them.
  // Saved images carry a DB `id` (no `isNew`), so they're never touched here.
  useEffect(() => {
    return () => {
      liveImages.current.forEach((img) => {
        if (img.isNew && img.url) deleteImage(img.url);
      });
    };
  }, []);

  const handleCancel = () => {
    images.forEach((img) => {
      if (img.isNew && img.url) deleteImage(img.url);
    });
    onClose();
  };

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, price: parseFloat(form.price) || 0, images });
  };

  const toggleAllergen = (a: string) =>
    set("allergens", form.allergens.includes(a) ? form.allergens.filter((x) => x !== a) : [...form.allergens, a]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={handleCancel}
      />

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">{editingItem ? "Edit item" : "Add item"}</h2>
          <button onClick={handleCancel} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="flex flex-col gap-5">

              {/* Photos */}
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Photos <span className="ml-1 font-normal normal-case text-slate-300">up to 3</span>
                </p>
                <p className="mb-2 text-xs text-slate-400">
                  Shown as a square on the menu, so upload <strong>1:1 (square)</strong> to avoid cropping —
                  ideally <strong>1000×1000&nbsp;px</strong> · JPG or WebP · under 2&nbsp;MB.
                </p>
                <ImageUploader
                  images={images}
                  onChange={setImages}
                  kind="item"
                  maxImages={3}
                  minWidth={600}
                  minHeight={600}
                />
              </div>

              {/* Basic info */}
              <div className="flex flex-col gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Butter Chicken"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">Price *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => set("price", e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">Category</label>
                    <select
                      value={form.category_id}
                      onChange={(e) => set("category_id", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{toDisplay(c.name)}</option>
                      ))}
                      <option value="">Uncategorised</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Short description of the dish…"
                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              {/* Dietary */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Dietary</p>
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 px-3">
                  <Toggle checked={form.is_veg} onChange={(v) => set("is_veg", v)} label="Vegetarian" />
                  <Toggle checked={form.is_jain} onChange={(v) => set("is_jain", v)} label="Jain" />
                  <Toggle checked={form.is_sweet} onChange={(v) => set("is_sweet", v)} label="Sweet" />
                  <Toggle checked={form.is_spicy} onChange={(v) => set("is_spicy", v)} label="Spicy" />
                  {form.is_spicy && (
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-slate-700">Spice level</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => set("spice_level", n)}
                            className={`h-7 w-7 rounded-lg text-xs font-semibold transition ${form.spice_level >= n ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-500"}`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Status</p>
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 px-3">
                  <Toggle checked={form.is_available} onChange={(v) => set("is_available", v)} label="Available" />
                  <Toggle checked={form.is_bestseller} onChange={(v) => set("is_bestseller", v)} label="Bestseller" />
                  <Toggle checked={form.is_new} onChange={(v) => set("is_new", v)} label="New on menu" />
                  <Toggle checked={form.is_popular_this_week} onChange={(v) => set("is_popular_this_week", v)} label="Popular this week" />
                </div>
              </div>

              {/* Allergens */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Contains (allergens)</p>
                <div className="grid grid-cols-2 gap-2">
                  {ALLERGENS.map((a) => (
                    <label key={a} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 transition hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={form.allergens.includes(a)}
                        onChange={() => toggleAllergen(a)}
                        className="h-4 w-4 rounded accent-slate-800"
                      />
                      <span className="text-sm capitalize text-slate-700">{a}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : editingItem ? "Save changes" : "Add item"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import ItemFormPanel, { type Category, type DbItem, type DbItemImage } from "./ItemFormPanel";
import type { UploadedImage } from "./ImageUploader";

function toDisplay(slug: string) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type Props = {
  restaurantId: string;
  initialCategories: Category[];
  initialItems: DbItem[];
};

export default function MenuManager({ restaurantId, initialCategories, initialItems }: Props) {
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [items, setItems] = useState<DbItem[]>(initialItems);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(initialCategories[0]?.id ?? null);
  const [mobileView, setMobileView] = useState<"categories" | "items">("categories");

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);

  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<DbItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedItems = items.filter((i) => i.category_id === selectedCatId);
  const selectedCat = categories.find((c) => c.id === selectedCatId);

  // ── Category CRUD ──────────────────────────────────────────────────────

  const handleAddCategory = async () => {
    const slug = toSlug(newCatName.trim());
    if (!slug) return;
    const { data, error } = await supabase
      .from("categories")
      .insert({ restaurant_id: restaurantId, name: slug, display_order: categories.length })
      .select("id, name, display_order")
      .single();
    if (error) { setError(error.message); return; }
    setCategories((prev) => [...prev, data]);
    setSelectedCatId(data.id);
    setNewCatName("");
    setShowNewCat(false);
  };

  const handleRenameCategory = async (id: string) => {
    const slug = toSlug(editingCatName.trim());
    if (!slug) { setEditingCatId(null); return; }
    const { error } = await supabase.from("categories").update({ name: slug }).eq("id", id);
    if (error) { setError(error.message); return; }
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name: slug } : c)));
    setEditingCatId(null);
  };

  const handleDeleteCategory = async (id: string) => {
    const count = items.filter((i) => i.category_id === id).length;
    const msg = count > 0
      ? `This category has ${count} item(s). Delete anyway? Items will become uncategorised.`
      : "Delete this category?";
    if (!confirm(msg)) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { setError(error.message); return; }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (selectedCatId === id) {
      const next = categories.find((c) => c.id !== id)?.id ?? null;
      setSelectedCatId(next);
    }
  };

  // ── Item CRUD ──────────────────────────────────────────────────────────

  const handleToggleAvailability = async (item: DbItem) => {
    const next = !item.is_available;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_available: next } : i)));
    await supabase.from("menu_items").update({ is_available: next }).eq("id", item.id);
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) { setError(error.message); return; }
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSaveItem = async (formData: {
    name: string; description: string; price: number; category_id: string;
    is_veg: boolean; is_jain: boolean; is_spicy: boolean; spice_level: number;
    is_sweet: boolean; is_available: boolean; is_bestseller: boolean;
    is_new: boolean; is_popular_this_week: boolean; allergens: string[];
    images: UploadedImage[];
  }) => {
    setSaving(true);
    setError(null);

    const payload = {
      restaurant_id: restaurantId,
      category_id: formData.category_id || selectedCatId,
      name: formData.name,
      description: formData.description || null,
      price: formData.price,
      is_veg: formData.is_veg,
      is_jain: formData.is_jain,
      is_spicy: formData.is_spicy,
      spice_level: formData.spice_level,
      is_sweet: formData.is_sweet,
      is_available: formData.is_available,
      is_bestseller: formData.is_bestseller,
      is_new: formData.is_new,
      is_popular_this_week: formData.is_popular_this_week,
      allergens: formData.allergens,
      dietary_tags: [] as string[],
    };

    let savedItemId: string;

    if (editingItem) {
      const { error } = await supabase.from("menu_items").update(payload).eq("id", editingItem.id);
      if (error) { setError(error.message); setSaving(false); return; }
      savedItemId = editingItem.id;
    } else {
      const display_order = items.filter(
        (i) => i.category_id === (formData.category_id || selectedCatId)
      ).length;
      const { data, error } = await supabase
        .from("menu_items")
        .insert({ ...payload, display_order })
        .select()
        .single();
      if (error) { setError(error.message); setSaving(false); return; }
      savedItemId = (data as DbItem).id;
    }

    // ── Image persistence ───────────────────────────────────────────────

    const originalImages = editingItem?.item_images ?? [];
    const imagesWithId = formData.images.filter((img) => img.id);
    const imagesWithIdSet = new Set(imagesWithId.map((img) => img.id!));
    const removedIds = originalImages
      .filter((orig) => !imagesWithIdSet.has(orig.id))
      .map((orig) => orig.id);
    const newImages = formData.images.filter((img) => !img.id);

    if (removedIds.length > 0) {
      const { error } = await supabase.from("item_images").delete().in("id", removedIds);
      if (error) console.error("Error removing images:", error.message);
    }

    let insertedImages: DbItemImage[] = [];
    if (newImages.length > 0) {
      const { data, error } = await supabase
        .from("item_images")
        .insert(
          newImages.map((img, i) => ({
            item_id: savedItemId,
            url: img.url,
            display_order: imagesWithId.length + i,
          }))
        )
        .select("id, url, display_order");
      if (error) console.error("Error saving images:", error.message);
      insertedImages = (data ?? []) as DbItemImage[];
    }

    const updatedImages: DbItemImage[] = [
      ...originalImages.filter((orig) => imagesWithIdSet.has(orig.id)),
      ...insertedImages,
    ];

    // ── Update local state ──────────────────────────────────────────────

    if (editingItem) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === savedItemId ? { ...i, ...payload, item_images: updatedImages } : i
        )
      );
    } else {
      const display_order = items.filter(
        (i) => i.category_id === (formData.category_id || selectedCatId)
      ).length;
      const newItem: DbItem = {
        ...payload,
        id: savedItemId,
        category_id: formData.category_id || selectedCatId,
        display_order,
        dietary_tags: [],
        item_images: updatedImages,
      };
      setItems((prev) => [...prev, newItem]);
    }

    setSaving(false);
    setShowItemForm(false);
    setEditingItem(null);
  };

  const openEdit = (item: DbItem) => { setEditingItem(item); setShowItemForm(true); };
  const openAdd = () => { setEditingItem(null); setShowItemForm(true); };

  // ── Shared icon paths ──────────────────────────────────────────────────

  const PencilIcon = () => (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
      <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z" />
    </svg>
  );

  const TrashIcon = () => (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
      <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z" />
    </svg>
  );

  // ── Category list ──────────────────────────────────────────────────────

  const CategoryList = () => (
    <>
      <div className="flex-1 overflow-y-auto p-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`group flex items-center gap-1 rounded-xl px-3 transition ${
              selectedCatId === cat.id ? "bg-slate-100" : "hover:bg-slate-50 active:bg-slate-50"
            }`}
          >
            {editingCatId === cat.id ? (
              <input
                autoFocus
                value={editingCatName}
                onChange={(e) => setEditingCatName(e.target.value)}
                onBlur={() => handleRenameCategory(cat.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameCategory(cat.id);
                  if (e.key === "Escape") setEditingCatId(null);
                }}
                className="my-2 min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none"
              />
            ) : (
              <button
                className="min-w-0 flex-1 py-4 text-left text-sm font-medium text-slate-700 lg:py-2.5"
                onClick={() => { setSelectedCatId(cat.id); setMobileView("items"); }}
              >
                {toDisplay(cat.name)}
                <span className="ml-1.5 text-xs font-normal text-slate-400">
                  {items.filter((i) => i.category_id === cat.id).length}
                </span>
              </button>
            )}

            <div className="flex shrink-0 gap-0.5 lg:opacity-0 lg:transition lg:group-hover:opacity-100">
              <button
                onClick={(e) => { e.stopPropagation(); setEditingCatId(cat.id); setEditingCatName(toDisplay(cat.name)); }}
                className="rounded p-1.5 text-slate-400 transition hover:text-slate-700 active:text-slate-700"
              >
                <PencilIcon />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                className="rounded p-1.5 text-slate-400 transition hover:text-rose-600 active:text-rose-600"
              >
                <TrashIcon />
              </button>
            </div>

            {/* Chevron — mobile only */}
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-slate-300 lg:hidden">
              <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 p-2">
        {showNewCat ? (
          <div className="flex gap-1.5 px-1">
            <input
              autoFocus
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddCategory(); if (e.key === "Escape") setShowNewCat(false); }}
              placeholder="Category name"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
            <button
              onClick={handleAddCategory}
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
            >
              Add
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewCat(true)}
            className="flex w-full items-center gap-1.5 rounded-xl px-3 py-3 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 lg:py-2"
          >
            <span className="text-base leading-none">+</span> New category
          </button>
        )}
      </div>
    </>
  );

  // ── Item list ──────────────────────────────────────────────────────────

  const ItemList = () => (
    <div className="flex-1 overflow-y-auto">
      {!selectedCatId ? (
        <div className="flex flex-1 items-center justify-center p-12 text-sm text-slate-400">
          Select a category
        </div>
      ) : (
        <div className="px-4 py-2 lg:px-6">
          <p className="py-3 text-xs font-medium uppercase tracking-wide text-slate-400">
            {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""}
          </p>

          {selectedItems.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center text-sm text-slate-400">
              No items yet.{" "}
              <button className="font-medium text-slate-600 underline" onClick={openAdd}>Add one</button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
              {selectedItems.map((item) => {
                const thumb = item.item_images?.[0]?.url;
                return (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-4 lg:py-3">
                    {/* Thumbnail */}
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-slate-300">
                            <path fillRule="evenodd" d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <span className={`mt-0.5 h-3 w-3 shrink-0 rounded-full border-2 ${item.is_veg ? "border-emerald-500" : "border-rose-500"}`} />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-400">${Number(item.price).toFixed(2)}</p>
                    </div>

                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                        item.is_available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.is_available ? "Available" : "Hidden"}
                    </button>

                    <div className="flex shrink-0 gap-0.5">
                      <button
                        onClick={() => openEdit(item)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:bg-slate-100"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 active:bg-rose-50 active:text-rose-600"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col lg:h-screen">

      {/* Page header */}
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 lg:px-6 lg:py-4">
        <button
          onClick={() => setMobileView("categories")}
          className={`-ml-1 rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100 lg:hidden ${mobileView === "items" ? "flex" : "hidden"}`}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
          </svg>
        </button>

        <h1 className="flex-1 text-base font-semibold text-slate-900 lg:text-lg">
          {mobileView === "items" && selectedCat ? toDisplay(selectedCat.name) : "Menu"}
        </h1>

        <button
          onClick={openAdd}
          disabled={!selectedCatId}
          className={`items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-40 ${
            mobileView === "categories" ? "hidden lg:flex" : "flex"
          }`}
        >
          <span>+</span> Add item
        </button>
      </div>

      {error && (
        <div className="mx-4 mt-3 shrink-0 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-600 lg:mx-6">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Category panel */}
        <aside className={`flex-col border-r border-slate-200 bg-white ${
          mobileView === "categories" ? "flex" : "hidden lg:flex"
        } w-full lg:w-56 lg:shrink-0`}>
          <CategoryList />
        </aside>

        {/* Item panel */}
        <div className={`flex-col overflow-hidden flex-1 ${
          mobileView === "items" ? "flex" : "hidden lg:flex"
        }`}>
          <ItemList />
        </div>
      </div>

      <ItemFormPanel
        open={showItemForm}
        editingItem={editingItem}
        categories={categories}
        defaultCategoryId={selectedCatId ?? ""}
        saving={saving}
        onClose={() => { setShowItemForm(false); setEditingItem(null); }}
        onSave={handleSaveItem}
      />
    </div>
  );
}

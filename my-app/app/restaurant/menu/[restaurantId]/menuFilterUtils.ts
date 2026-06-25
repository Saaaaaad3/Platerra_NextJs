import type { MenuItem } from "../../../../lib/demo-menu-items";

/**
 * Sentinel key for the "uncategorised" bucket (items with a null category_id).
 * Chosen so it can never collide with a real kebab-case category slug.
 * Rendered as a headerless card and excluded from the category nav.
 */
export const UNCATEGORISED_KEY = "__uncategorised__";

export type FilterKey =
  | "bestseller"
  | "veg"
  | "vegan"
  | "jain"
  | "spicy"
  | "sweet"
  | "gluten-free"
  | "dairy-free"
  | "nut-free";

export const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "bestseller", label: "Bestseller" },
  { key: "veg", label: "Veg" },
  { key: "vegan", label: "Vegan" },
  { key: "jain", label: "Jain" },
  { key: "spicy", label: "Spicy" },
  { key: "sweet", label: "Sweet" },
  { key: "gluten-free", label: "Gluten-Free" },
  { key: "dairy-free", label: "Dairy-Free" },
  { key: "nut-free", label: "Nut-Free" },
];

export function itemMatchesFilter(item: MenuItem, filter: FilterKey): boolean {
  switch (filter) {
    case "bestseller":
      return item.itemBestSeller;
    case "veg":
      return item.itemIsVeg;
    case "vegan":
      return item.dietaryTags.includes("vegan");
    case "jain":
      return item.itemIsJain;
    case "spicy":
      return item.itemSpicy;
    case "sweet":
      return item.itemSweet;
    case "gluten-free":
      return item.dietaryTags.includes("gluten-free");
    case "dairy-free":
      return item.dietaryTags.includes("dairy-free");
    case "nut-free":
      return item.dietaryTags.includes("nut-free");
  }
}

export function itemMatchesSearch(item: MenuItem, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return (
    item.itemName.toLowerCase().includes(normalized) ||
    item.itemDescription.toLowerCase().includes(normalized) ||
    (item.ingredients ?? []).some((ingredient) => ingredient.toLowerCase().includes(normalized))
  );
}

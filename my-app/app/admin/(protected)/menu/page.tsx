import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import MenuManager from "./MenuManager";

export default async function MenuPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (!restaurant) {
    return (
      <div className="p-8 text-slate-500">
        No restaurant is linked to your account. Contact support.
      </div>
    );
  }

  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, display_order")
      .eq("restaurant_id", restaurant.id)
      .order("display_order"),
    supabase
      .from("menu_items")
      .select("id, category_id, name, description, price, is_veg, is_jain, is_spicy, spice_level, is_sweet, is_available, is_bestseller, is_new, is_popular_this_week, allergens, dietary_tags, display_order, item_images(id, url, display_order)")
      .eq("restaurant_id", restaurant.id)
      .order("display_order"),
  ]);

  return (
    <MenuManager
      restaurantId={restaurant.id}
      initialCategories={categories ?? []}
      initialItems={items ?? []}
    />
  );
}

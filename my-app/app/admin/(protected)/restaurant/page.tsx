import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import RestaurantForm from "./RestaurantForm";

export default async function RestaurantPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, description, location, logo_url, header_tagline")
    .eq("owner_id", user.id)
    .single();

  const { data: socialHandles } = await supabase
    .from("social_handles")
    .select("id, platform, handle")
    .eq("restaurant_id", restaurant?.id ?? "");

  if (!restaurant) {
    return <div className="p-8 text-slate-500">No restaurant linked to your account.</div>;
  }

  return (
    <RestaurantForm
      restaurant={restaurant}
      initialSocialHandles={socialHandles ?? []}
    />
  );
}

import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import AdminSidebar from "./AdminSidebar";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name")
    .eq("owner_id", user.id)
    .single();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar restaurantName={restaurant?.name ?? "My Restaurant"} />
      <main className="flex-1 overflow-auto pt-14 lg:pt-0">{children}</main>
    </div>
  );
}

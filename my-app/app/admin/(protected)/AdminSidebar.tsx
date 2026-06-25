"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

const NAV = [
  { href: "/admin/menu", label: "Menu", mobileLabel: "Menu" },
  { href: "/admin/restaurant", label: "Restaurant", mobileLabel: "Settings" },
];

export default function AdminSidebar({ restaurantName }: { restaurantName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Platerra</p>
          <p className="mt-0.5 truncate font-semibold text-slate-900">{restaurantName}</p>
        </div>
        <nav className="flex-1 p-3">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                pathname.startsWith(href)
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <p className="max-w-[120px] truncate text-sm font-semibold text-slate-900">{restaurantName}</p>
        <nav className="flex items-center gap-1">
          {NAV.map(({ href, mobileLabel }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname.startsWith(href)
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {mobileLabel}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
          >
            Out
          </button>
        </nav>
      </div>
    </>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "../../../../lib/supabase/server";
import type { MenuItem } from "../../../../lib/demo-menu-items";
import type { RestaurantInfo, SocialPlatform } from "../../../../lib/demo-restaurants";
import { UNCATEGORISED_KEY } from "./menuFilterUtils";
import MenuView from "./MenuView";
import SmartImage from "./SmartImage";
import { parseBranding, resolveTheme } from "../../../../lib/branding";

type PageProps = {
  params: Promise<{ restaurantId: string }>;
};

const SOCIAL_CONFIG: Record<
  SocialPlatform,
  { label: string; getHref: (h: string) => string; display: (h: string) => string; path: string }
> = {
  instagram: {
    label: "Instagram",
    getHref: (h) => `https://instagram.com/${h}`,
    display: (h) => `@${h}`,
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  facebook: {
    label: "Facebook",
    getHref: (h) => `https://facebook.com/${h}`,
    display: (h) => `/${h}`,
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  twitter: {
    label: "X / Twitter",
    getHref: (h) => `https://x.com/${h}`,
    display: (h) => `@${h}`,
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  tiktok: {
    label: "TikTok",
    getHref: (h) => `https://tiktok.com/@${h}`,
    display: (h) => `@${h}`,
    path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  },
  youtube: {
    label: "YouTube",
    getHref: (h) => `https://youtube.com/@${h}`,
    display: (h) => `@${h}`,
    path: "M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z",
  },
  website: {
    label: "Website",
    getHref: (h) => (h.startsWith("http") ? h : `https://${h}`),
    display: (h) => h,
    path: "M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.9 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z",
  },
};

export default async function RestaurantMenuPage({ params }: PageProps) {
  const { restaurantId: slug } = await params;
  const supabase = await createClient();

  // Fetch restaurant + social handles
  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("*, social_handles(platform, handle)")
    .eq("slug", slug)
    .single();

  if (restaurantError || !restaurant) notFound();

  // Fetch categories and items in parallel
  const [{ data: categories }, { data: dbItems }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, display_order")
      .eq("restaurant_id", restaurant.id)
      .order("display_order"),
    supabase
      .from("menu_items")
      .select("*, item_images(url, display_order)")
      .eq("restaurant_id", restaurant.id)
      .eq("is_available", true)
      .order("display_order"),
  ]);

  // Build menuByCategory in category display_order
  const categoryMap = new Map((categories ?? []).map((c) => [c.id, c.name]));
  const menuByCategory: Record<string, MenuItem[]> = {};
  for (const cat of categories ?? []) menuByCategory[cat.name] = [];

  for (const row of dbItems ?? []) {
    // Items with no category (or a dangling category_id) fall into the
    // uncategorised bucket, rendered headerless at the bottom of the menu.
    const catName = categoryMap.get(row.category_id) ?? UNCATEGORISED_KEY;
    const images = ((row.item_images ?? []) as { url: string; display_order: number }[])
      .sort((a, b) => a.display_order - b.display_order)
      .map((img) => img.url);

    const item: MenuItem = {
      itemId: row.id,
      itemName: row.name,
      itemPrice: String(row.price),
      itemDescription: row.description ?? "",
      itemSweet: row.is_sweet,
      itemSpicy: row.is_spicy,
      itemSpiceLevel: row.spice_level,
      itemAvailable: row.is_available,
      itemBestSeller: row.is_bestseller,
      itemIsNew: row.is_new,
      itemPopularThisWeek: row.is_popular_this_week,
      itemIsVeg: row.is_veg,
      itemIsJain: row.is_jain,
      itemImages: images,
      category: catName,
      dietaryTags: row.dietary_tags ?? [],
      allergens: row.allergens ?? [],
    };

    if (!menuByCategory[catName]) menuByCategory[catName] = [];
    menuByCategory[catName].push(item);
  }

  const restaurantInfo: RestaurantInfo = {
    id: restaurant.id,
    name: restaurant.name,
    description: restaurant.description ?? "",
    location: restaurant.location ?? "",
    logo: restaurant.logo_url ?? undefined,
    coverUrl: restaurant.cover_url ?? undefined,
    showName: restaurant.show_name ?? true,
    socialHandles: restaurant.social_handles ?? [],
    headerTagline: restaurant.header_tagline ?? undefined,
  };

  const restaurantName = restaurantInfo.name;
  const hasCover = !!restaurantInfo.coverUrl;
  // The logo is the header identity when present, so the name text only shows
  // when there's no logo — and then only if the owner enables it, OR forced on
  // when there's also no cover (the header can never be empty).
  const showName =
    !restaurantInfo.logo && ((restaurantInfo.showName ?? true) || !hasCover);

  // Resolve the Brand Kit server-side and inject it as CSS vars on the root, so
  // the theme is present in the first paint (no flash) and cascades to the
  // client menu components below.
  const themeStyle = resolveTheme(parseBranding(restaurant.branding));

  return (
    <main
      style={themeStyle}
      className="min-h-screen bg-brand-background px-3 py-4 text-brand-on-background sm:px-4 sm:py-8"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-8">
        <div className="overflow-hidden rounded-[2rem] shadow-sm shadow-slate-200">
          {restaurantInfo.coverUrl && (
            <div className="relative aspect-[2/1] w-full">
              <SmartImage
                src={restaurantInfo.coverUrl}
                alt={`${restaurantName} cover`}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 1024px, 100vw"
                priority
              />
            </div>
          )}

          <header className="bg-brand-surface px-4 pb-5 pt-5 text-center text-brand-on-surface sm:px-8 sm:pb-7 sm:pt-7">
            {restaurantInfo.logo && (
              <div className="flex justify-center">
                <Link
                  href={`/restaurant/${slug}`}
                  className={`inline-block rounded-2xl bg-white p-2 shadow-md ring-1 ring-slate-100 transition-opacity hover:opacity-80 ${
                    hasCover ? "-mt-16 mb-2 sm:-mt-20" : "mb-2"
                  }`}
                >
                  <Image
                    src={restaurantInfo.logo}
                    alt={restaurantName}
                    width={320}
                    height={160}
                    className="h-20 w-auto max-w-[60vw] object-contain sm:h-24"
                    priority
                  />
                </Link>
              </div>
            )}

            {showName && (
              <h1 className="text-2xl font-semibold tracking-tight text-brand-on-surface sm:text-5xl">
                <Link href={`/restaurant/${slug}`} className="transition-opacity hover:opacity-70">
                  {restaurantName}
                </Link>
              </h1>
            )}

            {restaurantInfo.socialHandles && restaurantInfo.socialHandles.length > 0 ? (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:mt-4">
              {restaurantInfo.socialHandles.map(({ platform, handle }) => {
                const cfg = SOCIAL_CONFIG[platform as SocialPlatform];
                if (!cfg) return null;
                return (
                  <a
                    key={platform}
                    href={cfg.getHref(handle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${cfg.label}: ${handle}`}
                    className="flex items-center gap-1.5 text-sm text-brand-on-surface/50 transition-colors hover:text-brand-on-surface"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
                      <path d={cfg.path} />
                    </svg>
                    <span>{cfg.display(handle)}</span>
                  </a>
                );
              })}
            </div>
          ) : restaurantInfo.headerTagline ? (
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-brand-on-surface/70 sm:mt-4 sm:text-lg sm:leading-7">
              {restaurantInfo.headerTagline}
            </p>
          ) : null}
          </header>
        </div>

        {Object.keys(menuByCategory).length > 0 ? (
          <MenuView menuByCategory={menuByCategory} />
        ) : (
          <div className="rounded-[2rem] bg-brand-surface p-10 text-center text-brand-on-surface shadow-sm shadow-black/5">
            <p className="text-lg font-medium">No menu items found.</p>
          </div>
        )}

        <footer className="mt-2 flex flex-col items-center gap-1.5 pb-4 text-center sm:mt-4">
          <p className="text-xs text-brand-on-background/50">
            {restaurantInfo.location ? <span>{restaurantInfo.location} · </span> : null}
            © {new Date().getFullYear()} {restaurantName}
          </p>
          <Link
            href="/admin"
            className="text-xs text-brand-on-background/40 transition-colors hover:text-brand-on-background/70"
          >
            Owner login
          </Link>
        </footer>
      </div>
    </main>
  );
}

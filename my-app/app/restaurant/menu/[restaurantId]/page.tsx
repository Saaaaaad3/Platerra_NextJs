import Link from "next/link";
import { demoMenuItems } from "../../../../lib/demo-menu-items";
import MenuView from "./MenuView";

type PageProps = {
  params: Promise<{
    restaurantId: string;
  }>;
};

import { getRestaurantById } from "../../../../lib/demo-restaurants";

export default async function RestaurantMenuPage({ params }: PageProps) {
  const { restaurantId } = await params;
  const restaurantName =
    getRestaurantById(Number(restaurantId))?.name || `Restaurant ${restaurantId}`;
  const menuItems = demoMenuItems.filter((item) => item.restId === Number(restaurantId));

  const menuByCategory = menuItems.reduce<Record<string, typeof menuItems>>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="rounded-[2rem] bg-white/95 p-8 text-center shadow-sm shadow-slate-200 backdrop-blur-xl">
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            <Link href={`/restaurant/${restaurantId}`} className="hover:text-slate-600 transition-colors">
              {restaurantName}
            </Link>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Browse today&apos;s menu with prices and descriptions. Tap any item to plan your meal.
          </p>
        </header>

        {menuItems.length ? (
          <MenuView menuByCategory={menuByCategory} />
        ) : (
          <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm shadow-slate-200">
            <p className="text-lg font-medium text-slate-700">No menu items found for this restaurant.</p>
          </div>
        )}
      </div>
    </main>
  );
}

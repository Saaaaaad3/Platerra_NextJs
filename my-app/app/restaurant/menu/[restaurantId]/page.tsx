import Image from "next/image";
import Link from "next/link";
import { demoMenuItems } from "../../../../lib/demo-menu-items";

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

        <section className="grid gap-4">
          {menuItems.length ? (
            menuItems.map((item) => (
              <article
                key={item.itemId}
                className="overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm shadow-slate-200"
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <div className="relative h-32 w-full overflow-hidden rounded-[1.75rem] bg-slate-100 sm:h-32 sm:w-40 sm:flex-shrink-0">
                    <Image
                      src={item.itemImages?.[0] ?? "/img/DummyDishImage.jpg"}
                      alt={`${item.itemName} thumbnail`}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold text-slate-900">{item.itemName}</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {item.itemDescription}
                        </p>
                      </div>
                      <div className="inline-flex self-start rounded-full bg-slate-900 px-4 py-2 text-md font-semibold text-white">
                        ${item.itemPrice}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                    {item.category}
                  </span>
                  {item.itemIsVeg && (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                      Veg
                    </span>
                  )}
                  {item.itemSpicy && (
                    <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-700">
                      Spicy
                    </span>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm shadow-slate-200">
              <p className="text-lg font-medium text-slate-700">No menu items found for this restaurant.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

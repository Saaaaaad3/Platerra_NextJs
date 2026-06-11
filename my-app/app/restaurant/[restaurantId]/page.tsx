import Link from "next/link";
import { getRestaurantById } from "../../../lib/demo-restaurants";

type PageProps = {
  params: Promise<{
    restaurantId: string;
  }>;
};

export default async function RestaurantPage({ params }: PageProps) {
  const { restaurantId } = await params;
  const id = Number(restaurantId);
  const restaurant = getRestaurantById(id);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <section className="rounded-[2rem] bg-white p-8 shadow-sm shadow-slate-200">
          <p className="text-sm uppercase tracking-[0.35em] text-rose-600">Restaurant overview</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            {restaurant?.name ?? `Restaurant ${restaurantId}`}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            {restaurant?.description ?? "Explore the restaurant and view its menu."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Location</p>
              <p className="text-lg font-medium text-slate-900">
                {restaurant?.location ?? "Unknown"}
              </p>
            </div>
            <Link
              href={`/restaurant/menu/${restaurantId}`}
              className="inline-flex h-12 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              View menu
            </Link>
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-8 shadow-sm shadow-slate-200">
          <h2 className="text-2xl font-semibold text-slate-900">Coming soon</h2>
          <p className="mt-3 text-slate-600">
            This page will later include restaurant photos, videos, and richer information before customers open the menu.
          </p>
        </section>
      </div>
    </main>
  );
}

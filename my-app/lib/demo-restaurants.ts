export type SocialPlatform = "instagram" | "facebook" | "twitter" | "tiktok" | "youtube" | "website";

export type SocialHandle = {
  platform: SocialPlatform;
  handle: string;
};

export type RestaurantInfo = {
  id: number | string;
  name: string;
  description: string;
  location: string;
  logo?: string;
  coverUrl?: string;
  showName?: boolean;
  socialHandles?: SocialHandle[];
  headerTagline?: string;
};

export const demoRestaurants: RestaurantInfo[] = [
  {
    id: 1,
    name: "Spice House",
    description: "Classic Indian favorites with rich flavor and beautiful plating.",
    location: "Downtown",
    logo: "/img/SpiceHouseLogo.png",
    socialHandles: [
      { platform: "instagram", handle: "spicehouseofficial" },
      { platform: "facebook", handle: "SpiceHouseRestaurant" },
    ],
  },
  {
    id: 2,
    name: "Green Bean Café",
    description: "Fresh cafés and healthy breakfasts made for every day.",
    location: "Uptown",
    socialHandles: [
      { platform: "instagram", handle: "greenbeancafe" },
      { platform: "website", handle: "greenbeancafe.com" },
    ],
  },
];

export const getRestaurantById = (id: number) =>
  demoRestaurants.find((restaurant) => restaurant.id === id);

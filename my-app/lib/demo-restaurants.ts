export type RestaurantInfo = {
  id: number;
  name: string;
  description: string;
  location: string;
};

export const demoRestaurants: RestaurantInfo[] = [
  {
    id: 1,
    name: "Spice House",
    description: "Classic Indian favorites with rich flavor and beautiful plating.",
    location: "Downtown",
  },
  {
    id: 2,
    name: "Green Bean Café",
    description: "Fresh cafés and healthy breakfasts made for every day.",
    location: "Uptown",
  },
];

export const getRestaurantById = (id: number) =>
  demoRestaurants.find((restaurant) => restaurant.id === id);

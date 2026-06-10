import { NextResponse } from "next/server";
import { demoMenuItems } from "../../../lib/demo-menu-items";

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const restaurantId = url.searchParams.get("restaurantId");

  if (!restaurantId) {
    return NextResponse.json(
      { error: "Missing restaurantId query parameter" },
      { status: 400 }
    );
  }

  const id = Number(restaurantId);

  if (Number.isNaN(id) || id <= 0) {
    return NextResponse.json(
      { error: "restaurantId must be a positive number" },
      { status: 400 }
    );
  }

  const menuItems = demoMenuItems.filter((item) => item.restId === id);
  return NextResponse.json(menuItems);
};

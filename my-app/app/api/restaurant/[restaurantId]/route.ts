import { NextResponse } from "next/server";
import { demoMenuItems } from "../../../../lib/demo-menu-items";

type Params = {
  params: {
    restaurantId?: string;
  };
};

export const GET = async (request: Request, { params }: Params) => {
  const url = new URL(request.url);
  const restaurantId =
    params?.restaurantId || url.pathname.split("/").filter(Boolean).pop();

  const id = Number(restaurantId);
  if (!restaurantId || Number.isNaN(id) || id <= 0) {
    return NextResponse.json(
      { error: "restaurantId must be a positive number" },
      { status: 400 }
    );
  }

  const menuItems = demoMenuItems.filter((item) => item.restId === id);
  return NextResponse.json(menuItems);
};

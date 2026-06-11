import { NextResponse } from "next/server";
import { demoMenuItems } from "../../../../lib/demo-menu-items";

type Params = {
  params:
    | {
        restaurantId: string;
      }
    | Promise<{
        restaurantId: string;
      }>;
};

export const GET = async (request: Request, { params }: Params) => {
  const resolvedParams = await params;
  const restaurantId = resolvedParams.restaurantId;

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

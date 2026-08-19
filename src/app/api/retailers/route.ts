import { NextRequest, NextResponse } from "next/server";
import { LAPTOPS } from "@/data/laptops";
import { getRetailerOffers } from "@/services/retailers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const country = (searchParams.get("country") as "IN" | "US" | "UK" | "EU") || "IN";

  if (!id) {
    return NextResponse.json({ error: "Missing laptop id" }, { status: 400 });
  }

  const laptop = LAPTOPS.find((l) => l.id === id);
  if (!laptop) {
    return NextResponse.json({ error: "Laptop not found" }, { status: 404 });
  }

  try {
    const offers = await getRetailerOffers(laptop, country);
    return NextResponse.json({ success: true, offers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch offers", offers: [] },
      { status: 500 }
    );
  }
}

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const listings = await prisma.listing.findMany({
    where: {
      isSaved: true,
    },
  });

  return NextResponse.json(listings);
}

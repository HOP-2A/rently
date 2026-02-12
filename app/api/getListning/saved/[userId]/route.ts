import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type SavedPostMini = { listingId: string };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;

  if (!userId || userId === "undefined") {
    return NextResponse.json([], { status: 200 });
  }

  const savedPosts: SavedPostMini[] = await prisma.savedPost.findMany({
    where: { renterId: userId },
    select: { listingId: true },
  });

  const listingIds = savedPosts.map((p: SavedPostMini) => p.listingId);

  if (listingIds.length === 0) {
    return NextResponse.json([], { status: 200 });
  }

  const listings = await prisma.listing.findMany({
    where: { id: { in: listingIds } },
  });

  return NextResponse.json(listings, { status: 200 });
}

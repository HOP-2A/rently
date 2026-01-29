import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: { userId: string } },
) {
  const { userId } = await context.params;
  console.log(userId, "userId");
  if (!userId || userId === "undefined") {
    return NextResponse.json([], { status: 200 });
  }

  const savedPosts = await prisma.savedPost.findMany({
    where: { renterId: userId },
    select: { listingId: true },
  });

  const listingIds = savedPosts.map((p) => p.listingId);

  if (listingIds.length === 0) {
    return NextResponse.json([]);
  }

  const listings = await prisma.listing.findMany({
    where: {
      id: { in: listingIds },
    },
  });

  return NextResponse.json(listings);
}

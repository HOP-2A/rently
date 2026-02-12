import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const safeId = (id ?? "").trim();

    if (!safeId) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const { userId: clerkId } = await auth();
    const viewer = clerkId
      ? await prisma.user.findUnique({
          where: { clerkId },
          select: { id: true },
        })
      : null;

    const listing = await prisma.listing.findUnique({
      where: { id: safeId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
            phone: true,
            email: true,
            role: true,
          },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: { id: true, name: true, username: true, avatar: true },
            },
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    let isSaved = false;
    if (viewer?.id) {
      const saved = await prisma.savedPost.findUnique({
        where: {
          renterId_listingId: { renterId: viewer.id, listingId: listing.id },
        },
        select: { id: true },
      });
      isSaved = Boolean(saved);
    }
    const count = listing.reviews.length;

    const avg =
      count > 0
        ? listing.reviews.reduce((a: number, r) => a + (r.rating ?? 0), 0) /
          count
        : null;

    return NextResponse.json({
      ...listing,
      isSaved,
      reviewsCount: count,
      ratingAvg: avg == null ? null : Math.round(avg * 10) / 10,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

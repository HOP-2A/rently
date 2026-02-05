import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    });

    if (!me)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (me.role !== "RENTER")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const requests = await prisma.rentalRequest.findMany({
      where: { renterId: me.id },
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            price: true,
            photo: true,
            kind: true,
            rooms: true,
            sizeM2: true,
          },
        },
        rent: {
          select: {
            id: true,
            status: true,
            startAt: true,
            endAt: true,
            reviews: {
              where: { userId: me.id },
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    return NextResponse.json({ requests }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

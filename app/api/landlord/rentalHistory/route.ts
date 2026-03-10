import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const me = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    });

    if (!me)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (me.role !== "LANDLORD")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const requests = await prisma.rentalRequest.findMany({
      where: {
        landlordId: me.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        renter: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },

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
          include: {
            reviews: {
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                user: {
                  select: {
                    username: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ requests });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

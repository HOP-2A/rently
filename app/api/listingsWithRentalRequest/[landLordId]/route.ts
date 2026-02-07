import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { landLordId: string };

export async function GET(_req: Request, context: { params: Promise<Params> }) {
  try {
    const { landLordId } = await context.params;
    const cleanId = landLordId?.trim();

    if (!cleanId) {
      return NextResponse.json(
        { error: "Missing landLordId" },
        { status: 400 },
      );
    }

    const listings = await prisma.listing.findMany({
      where: { ownerId: cleanId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        address: true,
        price: true,
        ownerId: true,
        createdAt: true,

        owner: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            phone: true,
          },
        },

        rentalRequests: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            type: true,
            status: true,
            message: true,
            phone: true,
            moveInDate: true,
            durationMonths: true,
            createdAt: true,
            renterId: true,
            renter: {
              select: {
                id: true,
                username: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(listings);
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      {
        error: "Server error",
        message: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

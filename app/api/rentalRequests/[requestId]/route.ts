import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  const { status } = await req.json();

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const request = await prisma.rentalRequest.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (request.status !== "PENDING") {
      return NextResponse.json(
        { error: "Request already handled" },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.rentalRequest.update({
        where: { id },
        data: { status },
      });

      if (status === "APPROVED") {
        await tx.rent.updateMany({
          where: {
            listingId: request.listingId,
            status: "ACTIVE",
          },
          data: {
            status: "ENDED",
            endAt: new Date(),
          },
        });

        const rent = await tx.rent.create({
          data: {
            listingId: request.listingId,
            renterId: request.renterId,
            rentalRequestId: request.id,
            status: "ACTIVE",
          },
        });

        await tx.listing.update({
          where: { id: request.listingId },
          data: {
            isActive: false,
            currentRentId: rent.id,
          },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

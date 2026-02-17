import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { RentalRequestStatus } from "@prisma/client";

const ALLOWED = new Set<RentalRequestStatus>([
  RentalRequestStatus.APPROVED,
  RentalRequestStatus.REJECTED,
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> },
) {
  const { requestId } = await params;

  const body: unknown = await req.json();
  const raw = (body as { status?: unknown }).status;

  if (typeof raw !== "string") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const status = raw.toUpperCase() as RentalRequestStatus;
  if (!ALLOWED.has(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const request = await prisma.rentalRequest.findUnique({
      where: { id: requestId },
      include: { listing: true },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (request.status !== RentalRequestStatus.PENDING) {
      return NextResponse.json(
        { error: "Request already handled" },
        { status: 400 },
      );
    }

    if (status === RentalRequestStatus.APPROVED) {
      const [, , rent] = await prisma.$transaction([
        prisma.rentalRequest.update({
          where: { id: requestId },
          data: { status },
        }),
        prisma.rent.updateMany({
          where: { listingId: request.listingId, status: "ACTIVE" },
          data: { status: "ENDED", endAt: new Date() },
        }),
        prisma.rent.create({
          data: {
            listingId: request.listingId,
            renterId: request.renterId,
            rentalRequestId: request.id,
            status: "ACTIVE",
          },
        }),
      ]);

      await prisma.listing.update({
        where: { id: request.listingId },
        data: { isActive: false, currentRentId: rent.id },
      });
    } else {
      await prisma.rentalRequest.update({
        where: { id: requestId },
        data: { status },
      });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

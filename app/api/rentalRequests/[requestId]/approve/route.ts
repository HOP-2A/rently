import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

type Ctx = { params: Promise<{ requestId: string }> };

export async function POST(_req: Request, context: Ctx) {
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
    if (me.role !== "LANDLORD")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { requestId: raw } = await context.params;
    const requestId = (raw ?? "").trim();

    if (!requestId) {
      return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
    }

    const rr = await prisma.rentalRequest.findUnique({
      where: { id: requestId },
      include: { listing: true },
    });

    if (!rr)
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (rr.landlordId !== me.id)
      return NextResponse.json({ error: "Not your request" }, { status: 403 });
    if (rr.status !== "PENDING") {
      return NextResponse.json(
        { error: `Cannot approve when status=${rr.status}` },
        { status: 400 },
      );
    }

    const out = await prisma.$transaction(async (tx) => {
      await tx.rentalRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED", decidedAt: new Date() },
      });

      await tx.rentalRequest.updateMany({
        where: {
          listingId: rr.listingId,
          status: "PENDING",
          NOT: { id: requestId },
        },
        data: { status: "CANCELED" },
      });

      let rentId: string | null = null;

      if (rr.listing.kind === "RENT") {
        const rent = await tx.rent.create({
          data: {
            listingId: rr.listingId,
            renterId: rr.renterId,
            rentalRequestId: rr.id,
            status: "ACTIVE",
            startAt: rr.moveInDate ?? new Date(),
          },
          select: { id: true },
        });

        rentId = rent.id;

        await tx.listing.update({
          where: { id: rr.listingId },
          data: {
            isActive: false,
            currentRenterId: rr.renterId,
            currentRentId: rent.id,
          },
        });
      } else {
        await tx.listing.update({
          where: { id: rr.listingId },
          data: { isActive: false },
        });
      }

      return { rentId };
    });

    return NextResponse.json({ ok: true, requestId, rentId: out.rentId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Approve failed" }, { status: 500 });
  }
}

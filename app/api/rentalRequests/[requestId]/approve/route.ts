import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  req: Request,
  context: { params: { requestId: string } },
) {
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

    const { requestId } = await context.params;
    if (!requestId)
      return NextResponse.json({ error: "Missing requestId" }, { status: 400 });

    const body = (await req.json().catch(() => null)) as unknown;
    const decisionNote =
      typeof (body as { decisionNote?: unknown })?.decisionNote === "string"
        ? (body as { decisionNote: string }).decisionNote.trim()
        : null;

    const result = await prisma.$transaction(async (tx) => {
      const rr = await tx.rentalRequest.findUnique({
        where: { id: requestId },
        select: {
          id: true,
          status: true,
          listingId: true,
          landlordId: true,
          renterId: true,
        },
      });

      if (!rr) {
        return {
          ok: false as const,
          status: 404 as const,
          error: "Request not found",
        };
      }

      if (rr.landlordId !== me.id) {
        return {
          ok: false as const,
          status: 403 as const,
          error: "Not your request",
        };
      }

      if (rr.status === "CANCELED") {
        return {
          ok: false as const,
          status: 400 as const,
          error: "Request is canceled",
        };
      }
      if (rr.status === "REJECTED") {
        return {
          ok: false as const,
          status: 400 as const,
          error: "Request already rejected",
        };
      }

      const listing = await tx.listing.findUnique({
        where: { id: rr.listingId },
        select: {
          id: true,
          ownerId: true,
          currentRentId: true,
          currentRenterId: true,
        },
      });

      if (!listing) {
        return {
          ok: false as const,
          status: 404 as const,
          error: "Listing not found",
        };
      }

      if (listing.ownerId !== me.id) {
        return {
          ok: false as const,
          status: 403 as const,
          error: "Not your listing",
        };
      }

      if (listing.currentRentId || listing.currentRenterId) {
        return {
          ok: false as const,
          status: 409 as const,
          error: "Listing is already rented",
        };
      }

      const existingRent = await tx.rent.findFirst({
        where: { rentalRequestId: rr.id },
        select: { id: true },
      });

      let rentId = existingRent?.id ?? null;

      if (!rentId) {
        const rent = await tx.rent.create({
          data: {
            listingId: rr.listingId,
            renterId: rr.renterId,
            status: "ACTIVE",
            rentalRequestId: rr.id,
          },
          select: { id: true },
        });
        rentId = rent.id;
      }

      const updatedRequest = await tx.rentalRequest.update({
        where: { id: rr.id },
        data: {
          status: "APPROVED",
          decidedAt: new Date(),
          decisionNote:
            decisionNote && decisionNote.length ? decisionNote : null,
        },
        select: { id: true, status: true },
      });

      await tx.listing.update({
        where: { id: rr.listingId },
        data: {
          currentRenterId: rr.renterId,
          currentRentId: rentId,
        },
        select: { id: true },
      });
      await tx.listing.update({
        where: { id: rr.listingId },
        data: {
          currentRenterId: rr.renterId,
          currentRentId: rentId,
          isActive: false,
        },
      });

      await tx.rentalRequest.updateMany({
        where: {
          listingId: rr.listingId,
          id: { not: rr.id },
          status: "PENDING",
        },
        data: {
          status: "CANCELED",
          decidedAt: new Date(),
          decisionNote: "Auto-canceled: another request approved",
        },
      });

      return { ok: true as const, updatedRequest, rentId };
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json(
      { ok: true, request: result.updatedRequest, rentId: result.rentId },
      { status: 200 },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

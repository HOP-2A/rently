import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Body = {
  listingId: string;
  renterId: string;
  landlordId: string;
  startAt?: string;
  endAt?: string;
};

function isBody(x: unknown): x is Body {
  if (typeof x !== "object" || x === null) return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.listingId === "string" &&
    typeof r.renterId === "string" &&
    typeof r.landlordId === "string"
  );
}

export async function POST(req: Request) {
  try {
    const raw: unknown = await req.json();
    if (!isBody(raw)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: raw.listingId },
      select: { id: true, ownerId: true, isActive: true, status: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.ownerId !== raw.landlordId) {
      return NextResponse.json(
        { error: "Not owner of this listing" },
        { status: 403 },
      );
    }

    if (listing.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Listing is not approved yet" },
        { status: 400 },
      );
    }

    const activeRent = await prisma.rent.findFirst({
      where: { listingId: raw.listingId, status: "ACTIVE" },
      select: { id: true },
    });

    if (activeRent) {
      return NextResponse.json(
        { error: "Listing already has an active rent" },
        { status: 409 },
      );
    }

    const rent = await prisma.rent.create({
      data: {
        listingId: raw.listingId,
        renterId: raw.renterId,
        status: "ACTIVE",
        startAt: raw.startAt ? new Date(raw.startAt) : undefined,
        endAt: raw.endAt ? new Date(raw.endAt) : undefined,
      },
      select: {
        id: true,
        listingId: true,
        renterId: true,
        status: true,
        startAt: true,
        endAt: true,
      },
    });

    await prisma.listing.update({
      where: { id: raw.listingId },
      data: { isActive: false },
    });

    return NextResponse.json({ rent });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}

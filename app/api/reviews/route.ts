import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}
function asStr(x: unknown): string | null {
  if (typeof x !== "string") return null;
  const s = x.trim();
  return s ? s : null;
}
function asRating(x: unknown): number | null {
  if (typeof x !== "number") return null;
  if (!Number.isFinite(x)) return null;
  const r = Math.round(x);
  if (r < 1 || r > 5) return null;
  return r;
}

export async function POST(req: Request) {
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
    if (me.role !== "RENTER")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body: unknown = await req.json().catch(() => null);
    if (!isObj(body))
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });

    const rentId = asStr(body.rentId);
    const listingId = asStr(body.listingId);
    const rating = asRating(body.rating);
    const comment =
      typeof body.comment === "string" && body.comment.trim().length
        ? body.comment.trim()
        : null;

    if (!rentId)
      return NextResponse.json({ error: "Missing rentId" }, { status: 400 });
    if (!listingId)
      return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
    if (rating === null)
      return NextResponse.json(
        { error: "rating must be 1..5" },
        { status: 400 },
      );

    const rent = await prisma.rent.findUnique({
      where: { id: rentId },
      select: { id: true, renterId: true, listingId: true, status: true },
    });

    if (!rent)
      return NextResponse.json({ error: "Rent not found" }, { status: 404 });
    if (rent.renterId !== me.id)
      return NextResponse.json({ error: "Not your rent" }, { status: 403 });
    if (rent.listingId !== listingId)
      return NextResponse.json(
        { error: "listingId mismatch" },
        { status: 400 },
      );

    const review = await prisma.review.upsert({
      where: { userId_rentId: { userId: me.id, rentId } },
      create: {
        userId: me.id,
        rentId,
        listingId,
        rating,
        comment,
      },
      update: {
        rating,
        comment,
      },
    });

    return NextResponse.json({ ok: true, review }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type Body = {
  listingId: string;
  landlordId: string;
  renterId: string;
  message: string;
  moveInDate?: string | null;
  durationMonths?: number | null;
  phone?: string | null;
};

function isBody(x: unknown): x is Body {
  if (typeof x !== "object" || x === null) return false;
  const r = x as Record<string, unknown>;

  return (
    typeof r.listingId === "string" &&
    typeof r.landlordId === "string" &&
    typeof r.renterId === "string" &&
    typeof r.message === "string" &&
    (r.moveInDate === undefined ||
      r.moveInDate === null ||
      typeof r.moveInDate === "string") &&
    (r.durationMonths === undefined ||
      r.durationMonths === null ||
      typeof r.durationMonths === "number") &&
    (r.phone === undefined || r.phone === null || typeof r.phone === "string")
  );
}

function parseDateOnlyToUTC(dateOnly: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return null;

  const d = new Date(`${dateOnly}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return null;

  return d;
}

function digits8(phone: string): string | null {
  const d = phone.replace(/\D/g, "");
  return d.length === 8 ? d : null;
}

export async function POST(req: Request) {
  try {
    const raw: unknown = await req.json();

    if (!isBody(raw)) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload" },
        { status: 400 },
      );
    }

    const message = raw.message.trim();
    if (message.length < 5) {
      return NextResponse.json(
        { ok: false, error: "Message too short" },
        { status: 400 },
      );
    }

    if (raw.landlordId === raw.renterId) {
      return NextResponse.json(
        { ok: false, error: "You cannot request your own listing" },
        { status: 400 },
      );
    }

    let moveIn: Date | null = null;
    if (raw.moveInDate) {
      const parsed = parseDateOnlyToUTC(raw.moveInDate);
      if (!parsed) {
        return NextResponse.json(
          { ok: false, error: "Invalid moveInDate. Use YYYY-MM-DD." },
          { status: 400 },
        );
      }
      moveIn = parsed;
    }

    const duration =
      raw.durationMonths == null ? null : Math.trunc(raw.durationMonths);
    if (duration != null && (!Number.isFinite(duration) || duration <= 0)) {
      return NextResponse.json(
        { ok: false, error: "Invalid durationMonths" },
        { status: 400 },
      );
    }

    const phone = raw.phone == null ? null : (digits8(raw.phone) ?? null);
    if (raw.phone != null && phone == null) {
      return NextResponse.json(
        { ok: false, error: "Invalid phone. Must be 8 digits." },
        { status: 400 },
      );
    }

    const created = await prisma.rentalRequest.create({
      data: {
        listingId: raw.listingId,
        landlordId: raw.landlordId,
        renterId: raw.renterId,
        message,
        moveInDate: moveIn,
        durationMonths: duration,
        phone,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, requestId: created.id });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Body = { renterId?: string; listingId?: string };

export async function POST(req: NextRequest) {
  try {
    const { renterId, listingId } = (await req.json()) as Body;

    if (!renterId || !listingId) {
      return NextResponse.json(
        { error: "Missing renterId/listingId" },
        { status: 400 },
      );
    }

    await prisma.savedPost.upsert({
      where: { renterId_listingId: { renterId, listingId } },
      update: {},
      create: { renterId, listingId },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { renterId, listingId } = (await req.json()) as Body;

    if (!renterId || !listingId) {
      return NextResponse.json(
        { error: "Missing renterId/listingId" },
        { status: 400 },
      );
    }

    await prisma.savedPost.deleteMany({
      where: { renterId, listingId },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

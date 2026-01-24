import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, context: { params: { id: string } }) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        owner: true,
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

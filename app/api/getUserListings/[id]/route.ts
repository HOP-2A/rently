import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const Detail = await prisma.listing.findMany({
      where: { ownerId: id },
    });
    if (!Detail) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ Detail });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "error" });
  }
}

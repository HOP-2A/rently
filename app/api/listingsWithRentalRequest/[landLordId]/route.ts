import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { landLordId: string };

function isPrismaError(e: unknown): e is { code?: string; message: string } {
  return (
    typeof e === "object" &&
    e !== null &&
    "message" in e &&
    typeof (e as { message: unknown }).message === "string"
  );
}

export async function GET(_req: Request, context: { params: Promise<Params> }) {
  try {
    const { landLordId } = await context.params;
    const cleanId = landLordId.trim();

    if (!cleanId) {
      return NextResponse.json(
        { error: "Missing landLordId" },
        { status: 400 },
      );
    }

    const listings = await prisma.listing.findMany({
      where: { ownerId: cleanId },
      include: {
        owner: true,
        rentalRequests: {
          include: { renter: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(listings);
  } catch (e: unknown) {
    console.error(e);

    const message = isPrismaError(e) ? e.message : "Unknown error";
    const code =
      typeof e === "object" && e !== null && "code" in e
        ? String((e as { code?: unknown }).code ?? "")
        : "";

    return NextResponse.json(
      { error: "Server error", message, code },
      { status: 500 },
    );
  }
}

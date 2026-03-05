import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, address, price, photo } = body;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || user.role !== "LANDLORD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        title,
        address,
        price,
        photo,
      },
    });

    return NextResponse.json(updatedListing);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 },
    );
  }
}

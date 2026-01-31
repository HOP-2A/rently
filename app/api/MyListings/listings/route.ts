import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!me) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (me.role !== "LANDLORD") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const listings = await prisma.listing.findMany({
    where: { ownerId: me.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ listings }, { status: 200 });
}

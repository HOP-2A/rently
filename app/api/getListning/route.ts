import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const listing = await prisma.listing.findMany();
  return NextResponse.json(listing);
}

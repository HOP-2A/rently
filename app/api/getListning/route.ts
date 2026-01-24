import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const listings = await prisma.Listing.findMany();
  return NextResponse.json(listings);
}

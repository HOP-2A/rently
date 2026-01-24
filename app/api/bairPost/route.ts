import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { ownerId, title, address, price, rooms, sizeM2, photo } =
    await req.json();

  const newPost = await prisma.listing.create({
    data: {
      photo,
      ownerId,
      title,
      address,
      price,
      rooms,
      sizeM2,
      status: "PENDING",
    },
  });

  return NextResponse.json(newPost);
}

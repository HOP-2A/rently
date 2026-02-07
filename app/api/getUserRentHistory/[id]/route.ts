import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const rents = await prisma.rent.findMany({
    where: { renterId: id },
    orderBy: { startAt: "desc" },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          address: true,
          price: true,
          photo: true,
          kind: true,
          ownerId: true,
        },
      },
    },
  });

  return NextResponse.json({ Detail: rents });
}

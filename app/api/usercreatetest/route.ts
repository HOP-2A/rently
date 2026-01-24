import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const user = await prisma.user.create({
    data: {
      name: body.name,
      phone: body.phone ?? null,
      email: body.email ? String(body.email).toLowerCase() : null,
      about: body.about ?? null,
      avatar: body.avatar ?? null,
      role: body.role ?? "RENTER",
    },
  });

  return NextResponse.json(user, { status: 201 });
}

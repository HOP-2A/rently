import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { username, name, phone, about, avatar } = body ?? {};

  const user = await prisma.user.update({
    where: { clerkId: userId },
    data: {
      ...(username !== undefined && { username: String(username).trim() }),
      ...(name !== undefined && { name: String(name).trim() }),
      ...(phone !== undefined && { phone: String(phone).trim() }),
      ...(about !== undefined && { about: String(about) }),
      ...(avatar !== undefined && { avatar: avatar ? String(avatar) : null }),
    },
  });

  return NextResponse.json(user);
}

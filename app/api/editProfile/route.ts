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

  if (!username || !username.trim()) {
    return NextResponse.json(
      { error: "Username хоосон байж болохгүй" },
      { status: 400 },
    );
  }
  if (!name || !name.trim()) {
    return NextResponse.json(
      { error: "Нэр хоосон байж болохгүй" },
      { status: 400 },
    );
  }
  if (!phone || phone.trim().length !== 8) {
    return NextResponse.json(
      { error: "Утасны дугаар 8 оронтой байх ёстой" },
      { status: 400 },
    );
  }
  if (!about || !about.trim()) {
    return NextResponse.json(
      { error: "About хоосон байж болохгүй" },
      { status: 400 },
    );
  }
  if (!avatar || !avatar.trim()) {
    return NextResponse.json(
      { error: "Profile зураг шаардлагатай" },
      { status: 400 },
    );
  }

  const user = await prisma.user.update({
    where: { clerkId: userId },
    data: {
      username: String(username).trim(),
      name: String(name).trim(),
      phone: String(phone).trim(),
      about: String(about),
      avatar: String(avatar),
    },
  });

  return NextResponse.json(user);
}

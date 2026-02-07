import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (!q) return NextResponse.json({ users: [] });

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { startsWith: q, mode: "insensitive" } },
        { name: { startsWith: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
    take: 30,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const me = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    });
    if (!me)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (me.role !== "LANDLORD")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { requestId } = await params;
    if (!requestId)
      return NextResponse.json({ error: "Missing requestId" }, { status: 400 });

    const body = (await req.json().catch(() => null)) as unknown;
    const decisionNote =
      typeof (body as { decisionNote?: unknown })?.decisionNote === "string"
        ? (body as { decisionNote: string }).decisionNote.trim()
        : null;

    const rr = await prisma.rentalRequest.findUnique({
      where: { id: requestId },
      select: { id: true, landlordId: true, status: true },
    });

    if (!rr)
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (rr.landlordId !== me.id)
      return NextResponse.json({ error: "Not your request" }, { status: 403 });

    if (rr.status !== "PENDING") {
      return NextResponse.json(
        { error: `Cannot reject when status=${rr.status}` },
        { status: 400 },
      );
    }

    const updated = await prisma.rentalRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        decidedAt: new Date(),
        decisionNote: decisionNote && decisionNote.length ? decisionNote : null,
      },
      select: { id: true, status: true },
    });

    return NextResponse.json({ ok: true, request: updated }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

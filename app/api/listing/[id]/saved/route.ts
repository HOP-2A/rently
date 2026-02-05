// import prisma from "@/lib/prisma";
// import { NextResponse } from "next/server";

// export async function PATCH(
//   req: Request,
//   context: { params: Promise<{ id: string }> },
// ) {
//   try {
//     const { id } = await context.params;
//     if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

//     const body = (await req.json().catch(() => null)) as {
//       isSaved?: boolean;
//     } | null;

//     if (!body || typeof body.isSaved !== "boolean") {
//       return NextResponse.json(
//         { error: "Body must be { isSaved: boolean }" },
//         { status: 400 },
//       );
//     }

//     const updated = await prisma.listing.update({
//       where: { id },
//       data: { isSaved: body.isSaved },
//       select: { id: true, isSaved: true },
//     });

//     return NextResponse.json(updated);
//   } catch (e) {
//     console.error(e);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

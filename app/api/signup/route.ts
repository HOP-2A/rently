import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

type ClerkError = { code: string; message: string; longMessage?: string };
type ClerkErrorResponse = { errors: ClerkError[] };

function isClerkErrorResponse(err: unknown): err is ClerkErrorResponse {
  return (
    typeof err === "object" &&
    err !== null &&
    "errors" in err &&
    Array.isArray((err as { errors?: unknown }).errors)
  );
}

function isUserRole(value: unknown): value is UserRole {
  return value === "RENTER" || value === "LANDLORD" || value === "ADMIN";
}

export async function POST(req: Request) {
  try {
    if (!process.env.CLERK_SECRET_KEY) {
      return NextResponse.json(
        { error: "Missing CLERK_SECRET_KEY in .env (must start with sk_)" },
        { status: 500 },
      );
    }

    const body = (await req.json()) as {
      email?: unknown;
      username?: unknown;
      password?: unknown;
      type?: unknown;
      name?: unknown;
      about?: unknown;
      avatar?: unknown;
      phone?: unknown;
    };
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const username =
      typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    const type = body.type;

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const about = typeof body.about === "string" ? body.about.trim() : "";
    const avatar = typeof body.avatar === "string" ? body.avatar.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: "email, username, password are required" },
        { status: 400 },
      );
    }

    if (!isUserRole(type)) {
      return NextResponse.json({ error: "Invalid role type" }, { status: 400 });
    }

    const [existingEmail, existingUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email }, select: { id: true } }),
      prisma.user.findUnique({ where: { username }, select: { id: true } }),
    ]);

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 },
      );
    }

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 },
      );
    }

    const client = await clerkClient();
    const clerkUser = await client.users.createUser({
      emailAddress: [email],
      password,
      skipPasswordChecks: false,
      skipPasswordRequirement: false,
      publicMetadata: { role: type },
    });

    const newUser = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        username,
        name,
        phone,
        about,
        avatar,
        role: type,
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        username: true,
        name: true,
        phone: true,
        about: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 200 },
    );
  } catch (err: unknown) {
    console.error("SIGNUP ERROR 👉", err);

    if (isClerkErrorResponse(err)) {
      const e = err.errors?.[0];
      console.error("CLERK FIRST ERROR 👉", JSON.stringify(e, null, 2));

      if (e?.code === "form_identifier_exists") {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 },
        );
      }

      return NextResponse.json(
        {
          error: e?.longMessage ?? e?.message ?? "Clerk error",
          code: e?.code ?? "unknown",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 },
    );
  }
}

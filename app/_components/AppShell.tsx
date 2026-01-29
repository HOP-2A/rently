"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./sidebar";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/sign-in" ||
    pathname === "/signup" ||
    pathname === "/sign-in/factor-one";

  return (
    <div className="flex min-h-screen">
      <SignedIn>{!isAuthPage && <Sidebar />}</SignedIn>

      <div className="flex-1 flex flex-col">
        <SignedOut>
          {!isAuthPage && (
            <header className="flex justify-end items-center p-4 gap-4 h-16 border-b bg-white">
              <Link href="/signup" className="font-semibold text-teal-600">
                Sign Up
              </Link>
              <Link href="/sign-in" className="font-semibold text-teal-600">
                Sign in
              </Link>
            </header>
          )}
        </SignedOut>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

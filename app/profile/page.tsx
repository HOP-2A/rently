"use client";

import { useMemo, useState } from "react";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  Mail,
  Phone,
  User as UserIcon,
  Shield,
  Calendar,
  Info,
  Bookmark,
  LayoutGrid,
} from "lucide-react";

import { useAuth } from "@/providers/authProvider";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function initials(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "U";
  const parts = n.split(/\s+/);
  return (
    (parts[0]?.[0] ?? "U").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase()
  );
}

function RoleBadge({ role }: { role?: string | null }) {
  const r = (role ?? "RENTER").toUpperCase();
  const cls =
    r === "ADMIN"
      ? "bg-purple-100 text-purple-700 border-purple-200"
      : r === "LANDLORD"
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-teal-100 text-teal-700 border-teal-200";

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${cls}`}
    >
      <Shield className="w-3.5 h-3.5" />
      {r}
    </span>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5 text-gray-400">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-gray-900 break-words">
          {value?.trim() ? value : "—"}
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user: clerkUser, isLoaded } = useUser();
  const auth = useAuth(clerkUser?.id);
  const appUser = auth?.user;

  const [tab, setTab] = useState<"overview" | "saved" | "listings">("overview");

  const displayName = useMemo(() => {
    return (
      appUser?.name ?? clerkUser?.fullName ?? clerkUser?.username ?? "User"
    );
  }, [appUser?.name, clerkUser?.fullName, clerkUser?.username]);

  const avatarUrl = useMemo(() => {
    const a = (appUser?.avatar ?? "").trim();
    if (a) return a;
    return clerkUser?.imageUrl ?? "";
  }, [appUser?.avatar, clerkUser?.imageUrl]);

  const loading = !isLoaded || auth?.loading;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* <Link
            href="/"
            className="flex items-center gap-2 font-bold text-gray-900"
          >
            <span className="w-9 h-9 rounded-2xl bg-teal-600 text-white grid place-items-center">
              R
            </span>
            RENTLY
          </Link> */}

          <div className="flex items-center gap-3">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700"
              >
                Sign in
              </Link>
            </SignedOut>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <aside className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-5 border-b">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="w-14 h-14 rounded-2xl object-cover border"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 border grid place-items-center font-bold text-gray-600">
                      {initials(displayName)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold text-gray-900 truncate">
                    {loading ? "Loading..." : displayName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {loading
                      ? "—"
                      : (appUser?.name ?? clerkUser?.fullName ?? "—")}
                  </p>

                  <div className="mt-3">
                    <RoleBadge role={appUser?.role ?? "RENTER"} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ) : (
                <>
                  <InfoRow
                    icon={<UserIcon className="w-4 h-4" />}
                    label="Name"
                    value={appUser?.name ?? clerkUser?.fullName ?? "—"}
                  />
                  <InfoRow
                    icon={<Mail className="w-4 h-4" />}
                    label="Email"
                    value={
                      appUser?.email ??
                      clerkUser?.primaryEmailAddress?.emailAddress ??
                      "—"
                    }
                  />
                  <InfoRow
                    icon={<Phone className="w-4 h-4" />}
                    label="Phone"
                    value={appUser?.phone ?? "—"}
                  />
                  <InfoRow
                    icon={<Info className="w-4 h-4" />}
                    label="About"
                    value={appUser?.about ?? "—"}
                  />
                  <InfoRow
                    icon={<Calendar className="w-4 h-4" />}
                    label="Joined"
                    value={formatDate(appUser?.createdAt)}
                  />
                </>
              )}
            </div>
          </aside>

          <section className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setTab("overview")}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                    tab === "overview"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    Overview
                  </span>
                </button>

                <button
                  onClick={() => setTab("saved")}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                    tab === "saved"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Bookmark className="w-4 h-4" />
                    Saved
                  </span>
                </button>

                <button
                  onClick={() => setTab("listings")}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                    tab === "listings"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  My listings
                </button>
              </div>
            </div>

            <div className="p-6">
              {tab === "overview" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900">Profile</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border p-4 bg-gray-50">
                      <p className="text-sm text-gray-500">Clerk ID</p>
                      <p className="font-mono text-sm text-gray-900 break-all">
                        {clerkUser?.id ?? "—"}
                      </p>
                    </div>

                    <div className="rounded-2xl border p-4 bg-gray-50">
                      <p className="text-sm text-gray-500">
                        App User ID (Prisma)
                      </p>
                      <p className="font-mono text-sm text-gray-900 break-all">
                        {appUser?.id ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border p-4">
                    <p className="text-sm text-gray-500 mb-2">Quick actions</p>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href="/"
                        className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 font-semibold text-sm"
                      >
                        Go home
                      </Link>
                      <Link
                        href="/create"
                        className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 font-semibold text-sm"
                      >
                        Create listing
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {tab === "saved" && (
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    Saved posts
                  </h2>
                  <p className="text-gray-500">
                    This is where you can render your saved listings grid (same
                    card UI as your home page).
                  </p>
                  <div className="mt-4 rounded-2xl border bg-gray-50 p-6 text-sm text-gray-600">
                    Hook it to:{" "}
                    <span className="font-mono">
                      /api/getListning/saved/{`{userId}`}
                    </span>
                  </div>
                </div>
              )}

              {tab === "listings" && (
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    My listings
                  </h2>
                  <p className="text-gray-500">
                    This is where you show listings where{" "}
                    <span className="font-mono">ownerId === user.id</span>.
                  </p>
                  <div className="mt-4 rounded-2xl border bg-gray-50 p-6 text-sm text-gray-600">
                    Create an endpoint like:{" "}
                    <span className="font-mono">
                      /api/listing/mine/{`{userId}`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

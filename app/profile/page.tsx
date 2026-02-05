"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { SignedOut, useClerk, useUser } from "@clerk/nextjs";
import {
  Home,
  Search,
  Users,
  Bookmark,
  Mail,
  Phone,
  Info,
  User as UserIcon,
  X,
  Plus,
} from "lucide-react";

import { useAuth } from "@/providers/authProvider";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Role = "RENTER" | "LANDLORD";

type ListingKind = "RENT" | "SELL";
type ListingApiKind = ListingKind | "SALE" | "Sale" | "sell" | "rent" | null;

type RentalRequestMini = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
};

export type ListingFromApi = {
  id: string;
  ownerId: string;
  title: string;
  address: string;
  price: number;
  rooms: number | null;
  sizeM2: number | null;
  lat: number | null;
  lng: number | null;

  status: "PENDING" | "APPROVED" | "REJECTED";

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isSaved: boolean;
  kind: ListingApiKind;
  photo?: string | null;
  rating?: number | null;
  image?: string | null;
  type?: string | null;

  rentalRequests?: RentalRequestMini[];
};

type Listing = Omit<ListingFromApi, "kind"> & { kind: ListingKind };

function normalizeKind(kind: ListingApiKind): ListingKind {
  const raw = String(kind ?? "")
    .trim()
    .toUpperCase();
  return raw === "SELL" || raw === "SALE" ? "SELL" : "RENT";
}

type ActiveTab = "all" | "buy" | "rent";

function initials(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "U";
  const parts = n.split(/\s+/);
  return (
    (parts[0]?.[0] ?? "U").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase()
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

function ListingCard({
  listing,
  rightAction,
}: {
  listing: Listing;
  rightAction?: React.ReactNode;
}) {
  const photo = String(listing.photo ?? listing.image ?? "").trim();

  const reqs = listing.rentalRequests ?? [];
  const totalReq = reqs.length;
  const pendingCount = reqs.filter((r) => r.status === "PENDING").length;
  const acceptedCount = reqs.filter((r) => r.status === "ACCEPTED").length;
  const rejectedCount = reqs.filter((r) => r.status === "REJECTED").length;

  return (
    <Link href={`/listing/${listing.id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative overflow-hidden h-56">
          {photo ? (
            <img
              src={photo}
              alt={listing.address}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}

          <div className="absolute top-3 right-3">{rightAction}</div>

          <div className="absolute top-3 left-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur ${
                listing.status === "APPROVED"
                  ? "bg-green-100/90 text-green-700"
                  : listing.status === "PENDING"
                    ? "bg-yellow-100/90 text-yellow-700"
                    : "bg-red-100/90 text-red-700"
              }`}
            >
              {listing.status}
            </span>
          </div>

          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800 backdrop-blur">
              {listing.kind === "RENT" ? "Түрээс" : "Зарах"}
            </span>
          </div>

          {totalReq > 0 && (
            <div className="absolute bottom-3 right-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800 backdrop-blur border">
                Requests {totalReq}
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ₮{listing.price.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {listing.kind === "RENT" ? "сар бүр" : "нийт үнэ"}
              </p>
            </div>
          </div>

          <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1 group-hover:text-teal-600 transition-colors">
            {listing.title}
          </h3>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {listing.address}
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border">
              Requests: {totalReq}
            </span>

            {pendingCount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                Pending {pendingCount}
              </span>
            )}

            {acceptedCount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                Accepted {acceptedCount}
              </span>
            )}

            {rejectedCount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                Rejected {rejectedCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t">
            {listing.rooms != null && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {listing.rooms} өрөө
              </span>
            )}
            {listing.sizeM2 != null && <span>{listing.sizeM2} м²</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

type MyListingsResponse = { listings: ListingFromApi[] };

function isMyListingsResponse(x: unknown): x is MyListingsResponse {
  if (typeof x !== "object" || x === null) return false;
  const obj = x as Record<string, unknown>;
  return Array.isArray(obj.listings);
}

export default function ProfilePage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

  const auth = useAuth(clerkUser?.id);
  const user = auth?.user;

  const role: Role = user?.role === "LANDLORD" ? "LANDLORD" : "RENTER";

  const [searchQuery, setSearchQuery] = useState("");
  const [active, setActive] = useState<ActiveTab>("all");
  const { signOut } = useClerk();
  const router = useRouter();

  const logout = async () => {
    await signOut();
    router.push("/");
  };

  const pillClass = useMemo(() => {
    if (active === "buy") return "translate-x-full";
    if (active === "rent") return "translate-x-[200%]";
    return "translate-x-0";
  }, [active]);

  const [saved, setSaved] = useState<Listing[]>([]);
  const [mine, setMine] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clerkLoaded) return;

    if (!user?.id) {
      setSaved([]);
      setMine([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchSaved = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/getListning/saved/${encodeURIComponent(user.id)}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error(`Fetch saved failed: ${res.status}`);

        const json: unknown = await res.json();
        const arr: ListingFromApi[] = Array.isArray(json)
          ? (json as ListingFromApi[])
          : [];

        const normalized: Listing[] = arr.map((l) => ({
          ...l,
          kind: normalizeKind(l.kind),
          isSaved: true,
        }));

        if (!cancelled) setSaved(normalized);
      } catch (e) {
        console.error(e);
        if (!cancelled) setSaved([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const fetchMine = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/MyListings/listings", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Fetch mine failed: ${res.status}`);

        const json: unknown = await res.json();
        const arr: ListingFromApi[] = isMyListingsResponse(json)
          ? json.listings
          : [];

        const normalized: Listing[] = arr.map((l) => ({
          ...l,
          kind: normalizeKind(l.kind),
          isSaved: false,
        }));

        if (!cancelled) setMine(normalized);
      } catch (e) {
        console.error(e);
        if (!cancelled) setMine([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (role === "RENTER") fetchSaved();
    if (role === "LANDLORD") fetchMine();

    return () => {
      cancelled = true;
    };
  }, [clerkLoaded, user?.id, role]);

  const removeSaved = async (listingId: string) => {
    if (!user?.id) return;

    const snapshot = saved;
    setSaved((prev) => prev.filter((l) => l.id !== listingId));

    try {
      const res = await fetch("/api/bookMark", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, renterId: user.id }),
      });
      if (!res.ok) throw new Error(`Unsave failed: ${res.status}`);
    } catch (e) {
      console.error(e);
      setSaved(snapshot);
    }
  };

  const list = role === "RENTER" ? saved : mine;

  const filtered = useMemo(() => {
    let arr = list;

    if (active === "buy") arr = arr.filter((l) => l.kind === "SELL");
    if (active === "rent") arr = arr.filter((l) => l.kind === "RENT");

    const q = searchQuery.trim().toLowerCase();
    if (!q) return arr;

    return arr.filter(
      (l) =>
        l.address.toLowerCase().includes(q) ||
        l.title.toLowerCase().includes(q),
    );
  }, [list, active, searchQuery]);

  const displayName =
    user?.name ?? clerkUser?.fullName ?? clerkUser?.username ?? "User";
  const avatarUrl = (user?.avatar ?? "").trim() || (clerkUser?.imageUrl ?? "");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-3">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                RENTLY
              </span>
            </Link>

            <div className="flex items-center gap-3">
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
        </div>
      </header>

      {!user?.id ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white border rounded-2xl p-10 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Login хийгээд профайлаа харна
            </h2>
            <p className="text-gray-500">
              Нэвтэрсний дараа таны role-аас хамаараад өөр өөр хэсэг харагдана.
            </p>
          </div>
        </div>
      ) : role === "RENTER" ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            <aside className="relative overflow-hidden rounded-3xl border bg-white shadow-[0_10px_35px_-20px_rgba(0,0,0,0.35)]">
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-500 rounded-b-2xl" />
              <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-white/20 blur-2xl" />
              <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />

              <div className="relative p-5 pt-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="h-16 w-16 rounded-2xl object-cover ring-4 ring-white/70 shadow-md"
                      />
                    ) : (
                      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/90 font-extrabold text-gray-900 ring-4 ring-white/70 shadow-md">
                        {initials(displayName)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-extrabold text-white drop-shadow-sm">
                          {displayName}
                        </p>
                        <p className="truncate text-sm text-white/90">
                          @{user?.username ?? clerkUser?.username ?? "—"}
                        </p>
                      </div>

                      <Button
                        variant="secondary"
                        className="h-9 rounded-xl bg-white/95 text-gray-900 shadow-sm hover:bg-white hover:cursor-pointer"
                        onClick={() => logout()}
                      >
                        Logout
                      </Button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 ">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur">
                        <span className="h-2 w-2 rounded-full bg-emerald-300" />
                        {user?.role ?? "RENTER"}
                      </span>

                      <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur">
                        <span className="h-2 w-2 rounded-full bg-yellow-300" />
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                  <InfoRow
                    icon={<UserIcon className="h-4 w-4" />}
                    label="Name"
                    value={user?.name}
                  />
                  <InfoRow
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    value={
                      user?.email ??
                      clerkUser?.primaryEmailAddress?.emailAddress ??
                      ""
                    }
                  />
                  <InfoRow
                    icon={<Phone className="h-4 w-4" />}
                    label="Phone"
                    value={user?.phone}
                  />
                  <InfoRow
                    icon={<Info className="h-4 w-4" />}
                    label="About"
                    value={user?.about}
                  />
                </div>

                <Link href="/profile/rental-history" className="mt-4 block">
                  <Button className="h-11 hover:cursor-pointer w-full rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-md hover:opacity-95">
                    Rental History →
                  </Button>
                </Link>
              </div>
            </aside>

            <section className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="p-5 border-b flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                    <Bookmark className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      Хадгалсан зарууд
                    </h1>
                    <p className="text-sm text-gray-600">
                      Таны хадгалсан бүх зарууд энд байна
                    </p>
                  </div>
                </div>

                {searchQuery.trim() && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:cursor-pointer rounded-xl bg-blue-100 px-3 py-1.5 hover:bg-blue-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Хайлт цэвэрлэх
                  </button>
                )}
              </div>

              <div className="p-4 border-b">
                <div className="relative flex bg-gray-100 rounded-full p-1 shadow-inner w-full max-w-[360px]">
                  <div
                    className={`absolute top-1 left-1 h-[calc(100%-0.5rem)] w-1/3 rounded-full bg-white shadow transition-transform duration-300 ease-out ${pillClass}`}
                  />
                  <button
                    onClick={() => setActive("all")}
                    className={`relative z-10 flex-1 px-5 py-2 text-sm font-medium transition-colors hover:cursor-pointer ${
                      active === "all"
                        ? "text-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Бүгд
                  </button>
                  <button
                    onClick={() => setActive("buy")}
                    className={`relative z-10 flex-1 px-5 py-2 text-sm font-medium transition-colors hover:cursor-pointer ${
                      active === "buy"
                        ? "text-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Авах
                  </button>
                  <button
                    onClick={() => setActive("rent")}
                    className={`relative z-10 flex-1 px-5 py-2 text-sm font-medium transition-colors hover:cursor-pointer ${
                      active === "rent"
                        ? "text-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Түрээс
                  </button>
                </div>

                <p className="text-sm text-gray-600 mt-4">
                  <span className="font-semibold text-gray-900">
                    {filtered.length}
                  </span>{" "}
                  зар олдлоо
                </p>
              </div>

              <div className="p-5">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse border"
                      >
                        <div className="h-56 bg-gray-200" />
                        <div className="p-4 space-y-3">
                          <div className="h-6 bg-gray-200 rounded w-1/2" />
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-4 bg-gray-200 rounded w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-16">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {searchQuery.trim()
                        ? "Хайлтаар зар олдсонгүй"
                        : "Хадгалсан зар байхгүй байна"}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {searchQuery.trim()
                        ? "Хайлтын үгээ өөрчилж үзнэ үү"
                        : "Та зар хадгалснаар энд харагдана"}
                    </p>
                    {!searchQuery.trim() && (
                      <Link
                        href="/"
                        className="inline-block px-6 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
                      >
                        Зарууд үзэх
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        rightAction={
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeSaved(listing.id);
                            }}
                            className="bg-white/95 backdrop-blur p-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 hover:cursor-pointer"
                            aria-label="Remove saved"
                            title="Хадгалснаас устгах"
                          >
                            <Bookmark className="w-5 h-5 fill-blue-200 text-blue-500" />
                          </button>
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            {/* LANDLORD SIDEBAR - FIRE */}
            <aside className="relative overflow-hidden rounded-3xl border bg-white shadow-[0_10px_35px_-20px_rgba(0,0,0,0.35)]">
              {/* gradient header */}
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-b-2xl" />
              <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-white/20 blur-2xl" />
              <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />

              <div className="relative p-5 pt-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="h-16 w-16 rounded-2xl object-cover ring-4 ring-white/70 shadow-md"
                      />
                    ) : (
                      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/90 font-extrabold text-gray-900 ring-4 ring-white/70 shadow-md">
                        {initials(displayName)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-extrabold text-white drop-shadow-sm">
                          {displayName}
                        </p>
                        <p className="truncate text-sm text-white/90">
                          @{user?.username ?? clerkUser?.username ?? "—"}
                        </p>
                      </div>

                      <Button
                        variant="secondary"
                        className="h-9 rounded-xl bg-white/95 text-gray-900 shadow-sm hover:bg-white hover:cursor-pointer"
                        onClick={() => logout()}
                      >
                        Logout
                      </Button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur">
                        <span className="h-2 w-2 rounded-full bg-amber-300" />
                        LANDLORD
                      </span>

                      <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur">
                        <span className="h-2 w-2 rounded-full bg-emerald-300" />
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                  <InfoRow
                    icon={<UserIcon className="h-4 w-4" />}
                    label="Name"
                    value={user?.name}
                  />
                  <InfoRow
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    value={
                      user?.email ??
                      clerkUser?.primaryEmailAddress?.emailAddress ??
                      ""
                    }
                  />
                  <InfoRow
                    icon={<Phone className="h-4 w-4" />}
                    label="Phone"
                    value={user?.phone}
                  />
                  <InfoRow
                    icon={<Info className="h-4 w-4" />}
                    label="About"
                    value={user?.about}
                  />
                </div>

                <Link href="/LandLord/createListing" className="mt-4 block">
                  <Button className="h-11 hover:cursor-pointer w-full rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-md hover:opacity-95">
                    + Create New Listing
                  </Button>
                </Link>
              </div>
            </aside>

            {/* LANDLORD MAIN - FIRE */}
            <section className="bg-white rounded-3xl border shadow-sm overflow-hidden">
              <div className="p-5 border-b flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-md">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      Миний зарууд
                    </h1>
                    <p className="text-sm text-gray-600">
                      Зөвхөн таны оруулсан зарууд энд харагдана
                    </p>
                  </div>
                </div>

                <Link
                  href="/LandLord/createListing"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-md hover:opacity-95 transition"
                >
                  <Plus className="w-4 h-4" />
                  New listing
                </Link>
              </div>

              {/* toolbar */}
              <div className="p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="relative w-full md:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Зар хайх (title / address)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
                  />
                  {searchQuery.trim() && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-gray-200 transition"
                      aria-label="Clear search"
                      title="Хайлт цэвэрлэх"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">
                      {filtered.length}
                    </span>{" "}
                    зар
                  </p>

                  {searchQuery.trim() && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-sm font-medium flex items-center gap-1 rounded-2xl bg-teal-50 px-3 py-2 text-teal-700 hover:bg-teal-100 transition hover:cursor-pointer border"
                    >
                      <X className="w-4 h-4" />
                      Цэвэрлэх
                    </button>
                  )}
                </div>
              </div>

              {/* content */}
              <div className="p-5">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse border"
                      >
                        <div className="h-56 bg-gray-200" />
                        <div className="p-4 space-y-3">
                          <div className="h-6 bg-gray-200 rounded w-1/2" />
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-4 bg-gray-200 rounded w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-16">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {searchQuery.trim()
                        ? "Хайлтаар зар олдсонгүй"
                        : "Оруулсан зар байхгүй байна"}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {searchQuery.trim()
                        ? "Хайлтын үгээ өөрчилж үзнэ үү"
                        : "New listing дарж зараа оруулаарай"}
                    </p>

                    {!searchQuery.trim() && (
                      <Link
                        href="/LandLord/createListing"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-md hover:opacity-95 transition"
                      >
                        <Plus className="w-4 h-4" />
                        Зар нэмэх
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

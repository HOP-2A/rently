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
  const rating = typeof listing.rating === "number" ? listing.rating : 4.8;

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
            <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg">
              <span className="text-amber-500">⭐</span>
              <span className="font-semibold text-sm">{rating.toFixed(1)}</span>
            </div>
          </div>

          <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1 group-hover:text-teal-600 transition-colors">
            {listing.title}
          </h3>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {listing.address}
          </p>

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
                    <div className="flex gap-7">
                      <p className="text-lg font-bold text-gray-900 truncate">
                        {displayName}
                      </p>
                      <Button
                        variant={"destructive"}
                        className=" hover:cursor-pointer w-15 h-8"
                        onClick={() => logout()}
                      >
                        Logout
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {user?.username ?? clerkUser?.username ?? "—"}
                    </p>

                    <span className="inline-flex mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700 border border-teal-200">
                      RENTER
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <InfoRow
                  icon={<UserIcon className="w-4 h-4" />}
                  label="Name"
                  value={user?.name}
                />
                <InfoRow
                  icon={<Mail className="w-4 h-4" />}
                  label="Email"
                  value={
                    user?.email ??
                    clerkUser?.primaryEmailAddress?.emailAddress ??
                    ""
                  }
                />
                <InfoRow
                  icon={<Phone className="w-4 h-4" />}
                  label="Phone"
                  value={user?.phone}
                />
                <InfoRow
                  icon={<Info className="w-4 h-4" />}
                  label="About"
                  value={user?.about}
                />
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 ">
            <aside className="bg-white rounded-2xl border shadow-sm overflow-hidden h-110">
              <div className="p-5 border-b">
                <div className="flex items-start gap-4 ">
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

                  <div className="min-w-0 flex-1 ">
                    <div className="flex gap-7">
                      <p className="text-lg font-bold text-gray-900 truncate">
                        {displayName}
                      </p>
                      <Button
                        variant={"destructive"}
                        className=" hover:cursor-pointer w-15 h-8"
                        onClick={() => logout()}
                      >
                        Logout
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {user?.username ?? clerkUser?.username ?? "—"}
                    </p>

                    <span className="inline-flex mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700 border border-teal-200">
                      LANDLORD
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 ">
                <InfoRow
                  icon={<UserIcon className="w-4 h-4" />}
                  label="Name"
                  value={user?.name}
                />
                <InfoRow
                  icon={<Mail className="w-4 h-4" />}
                  label="Email"
                  value={
                    user?.email ??
                    clerkUser?.primaryEmailAddress?.emailAddress ??
                    ""
                  }
                />
                <InfoRow
                  icon={<Phone className="w-4 h-4" />}
                  label="Phone"
                  value={user?.phone}
                />
                <InfoRow
                  icon={<Info className="w-4 h-4" />}
                  label="About"
                  value={user?.about}
                />
              </div>
            </aside>

            <section className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="p-5 border-b flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-md">
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
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" />
                  New listing
                </Link>
              </div>

              <div className="p-4 border-b flex items-center justify-between gap-3">
                <div className="hidden md:block relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Хайх..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-xl w-80 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">
                      {filtered.length}
                    </span>{" "}
                    зар
                  </p>

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
                        : "Оруулсан зар байхгүй байна"}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {searchQuery.trim()
                        ? "Хайлтын үгээ өөрчилж үзнэ үү"
                        : "New listing дарж зараа оруулаарай"}
                    </p>

                    {!searchQuery.trim() && (
                      <Link
                        href="/create"
                        className="inline-block px-6 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
                      >
                        Зар нэмэх
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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

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
  Building2,
  TrendingUp,
  Calendar,
  MessageSquare,
  Edit3,
  Clock,
  MapPin,
} from "lucide-react";

import { useAuth } from "@/providers/authProvider";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Role = "RENTER" | "LANDLORD";

type ListingKind = "RENT" | "SELL";
type ListingApiKind = ListingKind | "SALE" | "Sale" | "sell" | "rent" | null;

type RentalRequestMini = {
  id: string;
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
    <div className="group flex items-center gap-4 py-4 px-4 rounded-2xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 transition-all duration-300 border border-transparent hover:border-teal-200">
      <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:shadow-xl group-hover:shadow-teal-500/30 group-hover:scale-110 transition-all duration-300">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-900 break-words">
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

  return (
    <Link href={`/listing/${listing.id}`} className="block group">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-teal-500/10 hover:border-teal-300">
        <div className="relative overflow-hidden h-56">
          {photo ? (
            <img
              src={photo}
              alt={listing.address}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center">
              <Building2 className="w-16 h-16 text-gray-400" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

          <div className="absolute top-3 right-3 z-10">{rightAction}</div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-end justify-between gap-3">
              <div className="flex-1">
                <span className="inline-block px-3 py-1.5 rounded-xl text-xs font-bold bg-white/95 text-gray-900 backdrop-blur-md shadow-lg mb-2">
                  {listing.kind === "RENT" ? "🏠 Түрээс" : "💰 Зарах"}
                </span>
                <h3 className="font-bold text-base text-white mb-1 line-clamp-1 drop-shadow-lg">
                  {listing.title}
                </h3>
                <p className="text-xs text-white/90 line-clamp-1 flex items-center gap-1.5 drop-shadow">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {listing.address}
                </p>
              </div>

              {totalReq > 0 && (
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white backdrop-blur-md shadow-lg flex items-center gap-1.5 flex-shrink-0">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {totalReq}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-4">
            <p className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
              ₮{listing.price.toLocaleString()}
            </p>
            <p className="text-xs font-semibold text-gray-500 mt-0.5 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {listing.kind === "RENT" ? "сар бүр" : "нийт үнэ"}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-gray-600">
            {listing.rooms != null && (
              <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <Users className="w-3.5 h-3.5 text-teal-600" />
                {listing.rooms} өрөө
              </span>
            )}
            {listing.sizeM2 != null && (
              <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                {listing.sizeM2} м²
              </span>
            )}
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

  const EditProfile = () => {
    router.push("/editProfile");
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
    user?.name ?? clerkUser?.fullName ?? clerkUser?.username ?? "Хэрэглэгч";
  const avatarUrl = (user?.avatar ?? "").trim() || (clerkUser?.imageUrl ?? "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/25 group-hover:shadow-xl group-hover:shadow-teal-500/40 transition-all duration-300 group-hover:scale-105">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                RENTLY
              </span>
            </Link>

            <SignedOut>
              <Link
                href="/sign-in"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold hover:from-teal-700 hover:to-teal-600 shadow-lg shadow-teal-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Нэвтрэх
              </Link>
            </SignedOut>
          </div>
        </div>
      </header>

      {!user?.id ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center shadow-xl">
            <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-500/25">
              <UserIcon className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Нэвтрээд профайлаа харна уу
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Нэвтэрсний дараа таны эрхээс хамаараад өөр өөр хэсэг харагдана.
            </p>
            <Link
              href="/sign-in"
              className="inline-block px-10 py-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold hover:from-teal-700 hover:to-teal-600 shadow-xl shadow-teal-500/25 transition-all duration-300 hover:scale-105"
            >
              Нэвтрэх
            </Link>
          </div>
        </div>
      ) : role === "RENTER" ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
            <aside className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
              <div
                className="relative h-28
               bg-white"
              >
                <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              </div>

              <div className="relative px-6 -mt-16 mb-6">
                <div className="flex items-end justify-between gap-4">
                  <div className="flex items-end gap-4">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="h-24 w-24 rounded-3xl object-cover ring-4 ring-white shadow-2xl"
                      />
                    ) : (
                      <div className="grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 text-2xl font-extrabold text-gray-700 ring-4 ring-white shadow-2xl">
                        {initials(displayName)}
                      </div>
                    )}

                    <div className="pb-2">
                      <h2 className="text-xl font-bold text-gray-900 mb-0.5">
                        {displayName}
                      </h2>
                      <p className="text-sm text-gray-600 font-medium">
                        @{user?.username ?? clerkUser?.username ?? "—"}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl hover:bg-gray-100 mb-2"
                    onClick={EditProfile}
                  >
                    <Edit3 className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    ТҮРЭЭСЛЭГЧ
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-amber-500/20">
                    <span className="h-2 w-2 rounded-full bg-white" />
                    Баталгаажсан
                  </span>
                </div>
              </div>

              <div className="px-6 pb-6">
                <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-2 space-y-1">
                  <InfoRow
                    icon={<UserIcon className="h-5 w-5 text-white" />}
                    label="Нэр"
                    value={user?.name}
                  />
                  <InfoRow
                    icon={<Mail className="h-5 w-5 text-white" />}
                    label="Имэйл"
                    value={
                      user?.email ??
                      clerkUser?.primaryEmailAddress?.emailAddress ??
                      ""
                    }
                  />
                  <InfoRow
                    icon={<Phone className="h-5 w-5 text-white" />}
                    label="Утас"
                    value={user?.phone}
                  />
                  <InfoRow
                    icon={<Info className="h-5 w-5 text-white" />}
                    label="Дэлгэрэнгүй"
                    value={user?.about}
                  />
                </div>

                <div className="mt-6 space-y-3">
                  <Link href="/profile/rental-history" className="block">
                    <Button className="h-12 w-full rounded-xl bg-gradient-to-r bg-gradient-to-r from-teal-500 to-teal-600 shadow-md transition-transform font-bold text-base transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer">
                      <Clock className="w-5 h-5" />
                      Түрээсийн түүх
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    className="h-12 w-full rounded-xl border-2 border-gray-200 font-bold text-base hover:bg-gray-50 transition-all duration-300 cursor-pointer"
                    onClick={logout}
                  >
                    Гарах
                  </Button>
                </div>
              </div>
            </aside>

            <section className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-teal-50 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Bookmark className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Хадгалсан зарууд
                    </h1>
                    <p className="text-sm text-gray-600 font-medium">
                      Таны хадгалсан бүх зарууд энд байна
                    </p>
                  </div>
                </div>

                {searchQuery.trim() && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-sm text-blue-700 hover:text-blue-800 font-bold flex items-center gap-2 rounded-xl bg-blue-100 px-4 py-2.5 hover:bg-blue-200 transition-all border border-blue-300 shadow-sm"
                  >
                    <X className="w-4 h-4" />
                    Цэвэрлэх
                  </button>
                )}
              </div>

              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="relative flex bg-white rounded-xl p-1.5 shadow-sm border border-gray-200 w-full max-w-md mb-5">
                  <div
                    className={`absolute top-1.5 left-1.5 h-[calc(100%-0.75rem)] w-1/3 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 shadow-md transition-transform duration-300 ease-out ${pillClass}`}
                  />
                  <button
                    onClick={() => setActive("all")}
                    className={` cursor-pointer relative z-10 flex-1 px-6 py-3 text-sm font-bold transition-colors rounded-lg  ${
                      active === "all"
                        ? "text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Бүгд
                  </button>
                  <button
                    onClick={() => setActive("buy")}
                    className={`cursor-pointer relative z-10 flex-1 px-6 py-3 text-sm font-bold transition-colors rounded-lg ${
                      active === "buy"
                        ? "text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Авах
                  </button>
                  <button
                    onClick={() => setActive("rent")}
                    className={`cursor-pointer relative z-10 flex-1 px-6 py-3 text-sm font-bold transition-colors rounded-lg ${
                      active === "rent"
                        ? "text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Түрээс
                  </button>
                </div>

                <p className="text-sm text-gray-700 font-semibold">
                  <span className="text-lg font-bold text-teal-600">
                    {filtered.length}
                  </span>{" "}
                  зар олдлоо
                </p>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse border border-gray-200"
                      >
                        <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300" />
                        <div className="p-5 space-y-4">
                          <div className="h-6 bg-gray-200 rounded-lg w-2/3" />
                          <div className="h-5 bg-gray-200 rounded-lg w-full" />
                          <div className="h-5 bg-gray-200 rounded-lg w-4/5" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Bookmark className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {searchQuery.trim()
                        ? "Хайлтаар зар олдсонгүй"
                        : "Хадгалсан зар байхгүй байна"}
                    </h3>
                    <p className="text-gray-600 mb-8 text-lg">
                      {searchQuery.trim()
                        ? "Хайлтын үгээ өөрчилж үзнэ үү"
                        : "Та зар хадгалснаар энд харагдана"}
                    </p>
                    {!searchQuery.trim() && (
                      <Link
                        href="/"
                        className="inline-block px-8 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl font-bold hover:from-teal-700 hover:to-teal-600 transition-all shadow-lg shadow-teal-500/25 hover:scale-105 duration-300"
                      >
                        Зарууд үзэх
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
                            className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 border border-white/50"
                            aria-label="Remove saved"
                            title="Хадгалснаас устгах"
                          >
                            <Bookmark className="w-5 h-5 fill-blue-500 text-blue-600" />
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
            <aside className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
              <div className="relative h-23 bg-gradient-to-br bg-white overflow-hidden">
                <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              </div>

              <div className="relative px-6 -mt-16 mb-6">
                <div className="flex items-end justify-between gap-4">
                  <div className="flex items-end gap-4">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="h-24 w-24 rounded-3xl object-cover ring-4 ring-white shadow-2xl"
                      />
                    ) : (
                      <div className="grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 text-2xl font-extrabold text-gray-700 ring-4 ring-white shadow-2xl">
                        {initials(displayName)}
                      </div>
                    )}

                    <div className="pb-2">
                      <h2 className="text-xl font-bold text-gray-900 mb-0.5">
                        {displayName}
                      </h2>
                      <p className="text-sm text-gray-600 font-medium">
                        @{user?.username ?? clerkUser?.username ?? "—"}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl hover:bg-gray-100 mb-2 "
                    onClick={EditProfile}
                  >
                    <Edit3 className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    ТҮРЭЭСЛҮҮЛЭГЧ
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-amber-500/20">
                    <span className="h-2 w-2 rounded-full bg-white" />
                    Баталгаажсан
                  </span>
                </div>
              </div>

              <div className="px-6 pb-6">
                <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-2 space-y-1">
                  <InfoRow
                    icon={<UserIcon className="h-5 w-5 text-white" />}
                    label="Нэр"
                    value={user?.name}
                  />
                  <InfoRow
                    icon={<Mail className="h-5 w-5 text-white" />}
                    label="Имэйл"
                    value={
                      user?.email ??
                      clerkUser?.primaryEmailAddress?.emailAddress ??
                      ""
                    }
                  />
                  <InfoRow
                    icon={<Phone className="h-5 w-5 text-white" />}
                    label="Утас"
                    value={user?.phone}
                  />
                  <InfoRow
                    icon={<Info className="h-5 w-5 text-white" />}
                    label="Дэлгэрэнгүй"
                    value={user?.about}
                  />
                </div>

                <div className="mt-6 space-y-3">
                  <Link href="/LandLord/createListing" className="block">
                    <Button className="h-12 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:opacity-90 font-bold text-base transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer">
                      <Plus className="w-5 h-5" />
                      Шинэ зар нэмэх
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    className="h-12 w-full rounded-xl border-2 border-gray-200 font-bold text-base hover:bg-gray-50 transition-all duration-300 cursor-pointer"
                    onClick={logout}
                  >
                    Гарах
                  </Button>
                </div>
              </div>
            </aside>

            <section className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <Home className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Миний зарууд
                    </h1>
                    <p className="text-sm text-gray-600 font-medium">
                      Зөвхөн таны оруулсан зарууд энд харагдана
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Гарчиг эсвэл хаягаар хайх..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm font-medium transition-all"
                  />
                  {searchQuery.trim() && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 transition"
                      aria-label="Clear search"
                      title="Хайлт цэвэрлэх"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3">
                  <p className="text-sm text-gray-700 font-semibold">
                    <span className="text-lg font-bold text-teal-600">
                      {filtered.length}
                    </span>{" "}
                    зар
                  </p>

                  {searchQuery.trim() && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-sm font-bold flex items-center gap-2 rounded-xl bg-teal-100 px-4 py-2 text-teal-700 hover:bg-teal-200 transition border border-teal-300 shadow-sm"
                    >
                      <X className="w-4 h-4" />
                      Цэвэрлэх
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse border border-gray-200"
                      >
                        <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300" />
                        <div className="p-5 space-y-4">
                          <div className="h-6 bg-gray-200 rounded-lg w-2/3" />
                          <div className="h-5 bg-gray-200 rounded-lg w-full" />
                          <div className="h-5 bg-gray-200 rounded-lg w-4/5" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
                      <Building2 className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {searchQuery.trim()
                        ? "Хайлтаар зар олдсонгүй"
                        : "Оруулсан зар байхгүй байна"}
                    </h3>
                    <p className="text-gray-600 mb-8 text-lg">
                      {searchQuery.trim()
                        ? "Хайлтын үгээ өөрчилж үзнэ үү"
                        : "Шинэ зар дарж өөрийн зараа оруулаарай"}
                    </p>

                    {!searchQuery.trim() && (
                      <Link
                        href="/LandLord/createListing"
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 hover:scale-105"
                      >
                        <Plus className="w-5 h-5" />
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

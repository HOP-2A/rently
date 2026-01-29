"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Home,
  MapPin,
  Users,
  SlidersHorizontal,
  X,
  Bookmark,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/providers/authProvider";

const ALL = "__ALL__";

export type ListingKind = "RENT" | "SELL";
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

function normalizeKind(kind: ListingFromApi["kind"]): ListingKind {
  const raw = String(kind ?? "")
    .trim()
    .toUpperCase();
  return raw === "SELL" || raw === "SALE" ? "SELL" : "RENT";
}

function safeRange(value: string): [number, number] | null {
  const parts = value.split("-").map((x) => Number(x.trim()));
  if (parts.length !== 2) return null;
  const [a, b] = parts;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return [a, b];
}

type Mode = "ALL" | "SAVED";

export default function App() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [active, setActive] = useState<"all" | "buy" | "rent">("all");

  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState<string>(ALL);
  const [priceRange, setPriceRange] = useState<string>(ALL);
  const [roomsRange, setRoomsRange] = useState<string>(ALL);
  const [sizeRange, setSizeRange] = useState<string>(ALL);
  const [approvalStatus, setApprovalStatus] = useState<string>(ALL);
  const [activeOnly, setActiveOnly] = useState<boolean>(true);
  const [showFilters, setShowFilters] = useState(false);

  const [mode, setMode] = useState<Mode>("ALL");

  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const auth = useAuth(clerkUser?.id);
  const user = auth?.user;

  const fetchSavedIds = async (userId: string): Promise<Set<string>> => {
    const res = await fetch(
      `/api/getListning/saved/${encodeURIComponent(userId)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return new Set();

    const data: unknown = await res.json();
    const arr: ListingFromApi[] = Array.isArray(data)
      ? (data as ListingFromApi[])
      : [];
    return new Set(arr.map((l) => l.id));
  };

  const fetchAllListings = async (savedIds?: Set<string>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/getListning", { cache: "no-store" });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

      const data: unknown = await res.json();
      const safeArray: ListingFromApi[] = Array.isArray(data)
        ? (data as ListingFromApi[])
        : [];

      setListings(
        safeArray.map((l) => ({
          ...l,
          kind: normalizeKind(l.kind),
          isSaved: savedIds ? savedIds.has(l.id) : false,
        })),
      );
    } catch (e) {
      console.error(e);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedListings = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/getListning/saved/${encodeURIComponent(userId)}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

      const data: unknown = await res.json();
      const safeArray: ListingFromApi[] = Array.isArray(data)
        ? (data as ListingFromApi[])
        : [];

      setListings(
        safeArray.map((l) => ({
          ...l,
          kind: normalizeKind(l.kind),
          isSaved: true,
        })),
      );
    } catch (e) {
      console.error(e);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode !== "ALL") return;
    if (!clerkLoaded) return;

    let cancelled = false;

    (async () => {
      try {
        if (user?.id) {
          const savedIds = await fetchSavedIds(user.id);
          if (!cancelled) await fetchAllListings(savedIds);
        } else {
          if (!cancelled) await fetchAllListings(undefined);
        }
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, clerkLoaded, user?.id]);

  const toggleSave = async (listingId: string) => {
    if (!user?.id) return;

    const current = listings.find((l) => l.id === listingId);
    if (!current) return;

    const currentSaved = mode === "SAVED" ? true : !!current.isSaved;
    const nextSaved = !currentSaved;

    const snapshot = listings;

    setListings((prev) => {
      if (mode === "SAVED" && nextSaved === false) {
        return prev.filter((l) => l.id !== listingId);
      }
      return prev.map((l) =>
        l.id === listingId ? { ...l, isSaved: nextSaved } : l,
      );
    });

    try {
      const method = nextSaved ? "POST" : "DELETE";

      const res = await fetch("/api/bookMark", {
        method,
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ renterId: user.id, listingId }),
      });

      if (!res.ok) throw new Error(`Toggle save failed: ${res.status}`);
    } catch (e) {
      console.error(e);
      setListings(snapshot);
    }
  };

  const clearFilters = () => {
    setLocation(ALL);
    setPriceRange(ALL);
    setRoomsRange(ALL);
    setSizeRange(ALL);
    setApprovalStatus(ALL);
    setActiveOnly(true);
    setSearchQuery("");
  };

  const hasActiveFilters = useMemo(() => {
    return (
      location !== ALL ||
      priceRange !== ALL ||
      roomsRange !== ALL ||
      sizeRange !== ALL ||
      approvalStatus !== ALL ||
      !activeOnly ||
      searchQuery.trim() !== ""
    );
  }, [
    location,
    priceRange,
    roomsRange,
    sizeRange,
    approvalStatus,
    activeOnly,
    searchQuery,
  ]);

  const filteredListings = useMemo(() => {
    let filtered = [...listings];

    if (active === "rent") filtered = filtered.filter((l) => l.kind === "RENT");
    if (active === "buy") filtered = filtered.filter((l) => l.kind === "SELL");

    if (activeOnly) filtered = filtered.filter((l) => l.isActive === true);

    if (approvalStatus !== ALL) {
      filtered = filtered.filter((l) => l.status === approvalStatus);
    }

    if (priceRange !== ALL) {
      const r = safeRange(priceRange);
      if (r) {
        const [minPrice, maxPrice] = r;
        filtered = filtered.filter(
          (l) => l.price >= minPrice && l.price <= maxPrice,
        );
      }
    }

    if (roomsRange !== ALL) {
      const r = safeRange(roomsRange);
      if (r) {
        const [minR, maxR] = r;
        filtered = filtered.filter((l) => {
          if (l.rooms == null) return false;
          return l.rooms >= minR && l.rooms <= maxR;
        });
      }
    }

    if (sizeRange !== ALL) {
      const r = safeRange(sizeRange);
      if (r) {
        const [minS, maxS] = r;
        filtered = filtered.filter((l) => {
          if (l.sizeM2 == null) return false;
          return l.sizeM2 >= minS && l.sizeM2 <= maxS;
        });
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.address.toLowerCase().includes(q) ||
          l.title.toLowerCase().includes(q),
      );
    }

    if (location !== ALL) {
      const city = location.split(",")[0].toLowerCase();
      filtered = filtered.filter((l) => l.address.toLowerCase().includes(city));
    }

    return filtered;
  }, [
    listings,
    active,
    activeOnly,
    approvalStatus,
    priceRange,
    roomsRange,
    sizeRange,
    searchQuery,
    location,
  ]);

  const pillClass =
    active === "all"
      ? "translate-x-0"
      : active === "buy"
        ? "translate-x-full"
        : "translate-x-[200%]";

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

            <nav className="hidden md:flex">
              <div className="relative flex bg-gray-100 rounded-full p-1 shadow-inner w-[360px]">
                <div
                  className={`absolute top-1 left-1 h-[calc(100%-0.5rem)] w-1/3 rounded-full bg-white shadow transition-all duration-300 ease-out ${pillClass}`}
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
                  Худалдаж авах
                </button>
                <button
                  onClick={() => setActive("rent")}
                  className={`relative z-10 flex-1 px-5 py-2 text-sm font-medium transition-colors hover:cursor-pointer ${
                    active === "rent"
                      ? "text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Түрээслэх
                </button>
              </div>
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden lg:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Хайх..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden p-2 rounded-xl border bg-white hover:bg-gray-50 relative"
              >
                <SlidersHorizontal className="w-5 h-5" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="lg:hidden bg-white border-b px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div
        className={`bg-white border-b ${showFilters ? "block" : "hidden lg:block"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4 h-15">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-600" />
              <span className="font-semibold text-gray-700">Шүүлтүүр</span>
              {hasActiveFilters && (
                <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full">
                  Идэвхитэй
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap gap-3">
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="rounded-xl bg-white border-gray-200">
                <div className="flex items-center gap-2 hover:cursor-pointer">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <SelectValue placeholder="Байршил" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Бүх байршил</SelectItem>
                <SelectItem value="Bayangol">Баянгол</SelectItem>
                <SelectItem value="Bayanzurkh">Баянзүрх</SelectItem>
                <SelectItem value="Chingeltei">Чингэлтэй</SelectItem>
                <SelectItem value="Khan-Uul">Хан-Уул</SelectItem>
                <SelectItem value="Nalaikh">Налайх</SelectItem>
                <SelectItem value="Songinokhairkhan">Сонгинохайрхан</SelectItem>
                <SelectItem value="Sukhbaatar">Сүхбаатар</SelectItem>
                <SelectItem value="Baganuur">Багануур</SelectItem>
                <SelectItem value="Bagakhangai">Багахангай</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="rounded-xl bg-white border-gray-200 hover:cursor-pointer">
                <SelectValue placeholder="Үнэ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Бүх үнэ</SelectItem>
                <SelectItem value="0-1000000">0 - 1,000,000₮</SelectItem>
                <SelectItem value="1000000-2000000">
                  1,000,000 - 2,000,000₮
                </SelectItem>
                <SelectItem value="2000000-4000000">
                  2,000,000 - 4,000,000₮
                </SelectItem>
                <SelectItem value="4000000-999999999">4,000,000₮+</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roomsRange} onValueChange={setRoomsRange}>
              <SelectTrigger className="rounded-xl bg-white border-gray-200 hover:cursor-pointer">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <SelectValue placeholder="Өрөө" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Бүх өрөө</SelectItem>
                <SelectItem value="0-1">Studio / 1</SelectItem>
                <SelectItem value="2-2">2 өрөө</SelectItem>
                <SelectItem value="3-3">3 өрөө</SelectItem>
                <SelectItem value="4-99">4+ өрөө</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sizeRange} onValueChange={setSizeRange}>
              <SelectTrigger className="rounded-xl bg-white border-gray-200 hover:cursor-pointer">
                <SelectValue placeholder="Талбай" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Бүх талбай</SelectItem>
                <SelectItem value="0-30">0 - 30 м²</SelectItem>
                <SelectItem value="30-50">30 - 50 м²</SelectItem>
                <SelectItem value="50-80">50 - 80 м²</SelectItem>
                <SelectItem value="80-9999">80+ м²</SelectItem>
              </SelectContent>
            </Select>

            <button
              onClick={() => setActiveOnly((v) => !v)}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all hover:cursor-pointer ${
                activeOnly
                  ? "bg-teal-50 border-teal-200 text-teal-700"
                  : "bg-red-50 border-red-200 text-red-700 "
              }`}
            >
              {activeOnly ? "Бүх заруудыг харах" : "Идэвхитэй заруудыг харах"}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1 hover:cursor-pointer rounded-2xl bg-blue-200 p-2 pr-3 hover:bg-blue-300"
              >
                <X className="w-4 h-4" />
                Шүүлтүүрийг цэвэрлэх
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">
            {filteredListings.length}
          </span>{" "}
          зар олдлоо
        </p>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse"
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
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Зар олдсонгүй
            </h3>
            <p className="text-gray-500 mb-6">Шүүлтүүрээ өөрчилж үзнэ үү</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 bg-teal-600 hover:cursor-pointer text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
              >
                Шүүлтүүрийг цэвэрлэх
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => {
              const photo = String(listing.photo ?? listing.image ?? "").trim();
              const rating =
                typeof listing.rating === "number" ? listing.rating : 4.8;

              return (
                <Link
                  key={listing.id}
                  href={`/listing/${listing.id}`}
                  className="block group"
                >
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative overflow-hidden h-56">
                      {photo ? (
                        <img
                          src={photo}
                          alt={listing.address}
                          className="w-full h-full object-cover duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}

                      <div className="absolute top-3 right-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSave(listing.id);
                          }}
                          className="bg-white/95 backdrop-blur p-2.5 rounded-full shadow-lg duration-300 hover:scale-110 active:scale-95 hover:cursor-pointer"
                          aria-label="Save listing"
                          title={
                            !user?.id
                              ? "Нэвтэрсний дараа хадгална"
                              : listing.isSaved
                                ? "Saved (click to unsave)"
                                : "Save"
                          }
                          disabled={!user?.id}
                        >
                          <Bookmark
                            className={`w-5 h-5 transition-colors ${
                              listing.isSaved
                                ? "fill-blue-200 text-blue-500"
                                : "text-gray-600"
                            }`}
                          />
                        </button>
                      </div>

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
                          {listing.status === "APPROVED"
                            ? "Түрээслэгдсэн"
                            : listing.status === "PENDING"
                              ? "Идэвхтэй зар"
                              : "Татгалзсан"}
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
                          <span className="font-semibold text-sm">
                            {rating.toFixed(1)}
                          </span>
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
                        {listing.sizeM2 != null && (
                          <span>{listing.sizeM2} м²</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <div className="hidden">
        clerkLoaded: {String(clerkLoaded)} | clerkId: {String(clerkUser?.id)} |
        appUserId: {String(user?.id)} | mode: {mode}
      </div>
    </div>
  );
}

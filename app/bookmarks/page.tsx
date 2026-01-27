"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Home,
  Users,
  Bookmark,
  X,
  SlidersHorizontal,
} from "lucide-react";

type ListingApiKind =
  | "RENT"
  | "SELL"
  | "SALE"
  | "Sale"
  | "sell"
  | "rent"
  | null;

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

type ListingKind = "RENT" | "SELL";
type Listing = Omit<ListingFromApi, "kind"> & { kind: ListingKind };

function normalizeKind(kind: ListingApiKind): ListingKind {
  const raw = String(kind ?? "")
    .trim()
    .toUpperCase();
  return raw === "SELL" || raw === "SALE" ? "SELL" : "RENT";
}

type ActiveTab = "all" | "buy" | "rent";

export default function App() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [active, setActive] = useState<ActiveTab>("all");
  const [showFilters, setShowFilters] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const hasActiveFilters = active !== "all";

  const pillClass = useMemo(() => {
    if (active === "buy") return "translate-x-full";
    if (active === "rent") return "translate-x-[200%]";
    return "translate-x-0";
  }, [active]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/getListning/saved", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

        const data: unknown = await res.json();
        const safeArray: ListingFromApi[] = Array.isArray(data)
          ? (data as ListingFromApi[])
          : [];

        const normalized: Listing[] = safeArray.map((l) => ({
          ...l,
          kind: normalizeKind(l.kind),
        }));

        setListings(normalized);
      } catch (e) {
        console.error(e);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const filteredListings = useMemo(() => {
    let arr = listings;

    if (active === "buy") arr = arr.filter((l) => l.kind === "SELL");
    if (active === "rent") arr = arr.filter((l) => l.kind === "RENT");

    const q = searchQuery.trim().toLowerCase();
    if (!q) return arr;

    return arr.filter(
      (l) =>
        l.address.toLowerCase().includes(q) ||
        l.title.toLowerCase().includes(q),
    );
  }, [listings, searchQuery, active]);

  const toggleSaved = async (id: string) => {
    const current = listings.find((x) => x.id === id);
    const nextSaved = !(current?.isSaved ?? false);

    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isSaved: nextSaved } : l)),
    );

    try {
      const res = await fetch(`/api/listing/${id}/saved`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSaved: nextSaved }),
      });

      if (!res.ok) throw new Error(`PATCH failed: ${res.status}`);

      const data: unknown = await res.json();
      const parsed =
        typeof data === "object" && data !== null
          ? (data as { id?: unknown; isSaved?: unknown })
          : {};

      const returnedId = typeof parsed.id === "string" ? parsed.id : id;
      const returnedSaved =
        typeof parsed.isSaved === "boolean" ? parsed.isSaved : nextSaved;

      setListings((prev) =>
        prev.map((l) =>
          l.id === returnedId ? { ...l, isSaved: returnedSaved } : l,
        ),
      );

      if (!returnedSaved) {
        setListings((prev) => prev.filter((l) => l.id !== returnedId));
      }
    } catch (e) {
      console.error(e);

      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, isSaved: !nextSaved } : l)),
      );
    }
  };

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
                onClick={() => setShowFilters((v) => !v)}
                className="lg:hidden p-2 rounded-xl border bg-white hover:bg-gray-50 relative"
              >
                <SlidersHorizontal className="w-5 h-5" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full" />
                )}
              </button>
            </div>
          </div>


          {showFilters && (
            <div className="lg:hidden pb-4">
              <div className="mt-3 bg-gray-50 border rounded-2xl p-3">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Хайх..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setActive("all")}
                    className={`py-2 rounded-xl text-sm font-medium border ${
                      active === "all"
                        ? "bg-white border-teal-200 text-teal-700"
                        : "bg-gray-100 border-gray-200 text-gray-600"
                    }`}
                  >
                    Бүгд
                  </button>
                  <button
                    onClick={() => setActive("buy")}
                    className={`py-2 rounded-xl text-sm font-medium border ${
                      active === "buy"
                        ? "bg-white border-teal-200 text-teal-700"
                        : "bg-gray-100 border-gray-200 text-gray-600"
                    }`}
                  >
                    Авах
                  </button>
                  <button
                    onClick={() => setActive("rent")}
                    className={`py-2 rounded-xl text-sm font-medium border ${
                      active === "rent"
                        ? "bg-white border-teal-200 text-teal-700"
                        : "bg-gray-100 border-gray-200 text-gray-600"
                    }`}
                  >
                    Түрээс
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
            <Bookmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Хадгалсан зарууд
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Таны хадгалсан бүх зарууд энд байна
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">
              {filteredListings.length}
            </span>{" "}
            зар олдлоо
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
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark
                className={`w-5 h-5 transition-colors 

                          ? "fill-blue-200 text-blue-500"
                          : "text-gray-600"`}
              />
            </div>
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

                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="flex gap-3 absolute top-3 right-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSaved(listing.id);
                          }}
                          className="bg-white/95 backdrop-blur p-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 hover:cursor-pointer"
                          aria-label="Toggle saved"
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
    </div>
  );
}

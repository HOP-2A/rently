"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Role = "RENTER" | "LANDLORD";

type ListingKind = "RENT" | "SELL";
type ListingApiKind = ListingKind | "SALE" | "Sale" | "sell" | "rent" | null;

type UserDetail = {
  id: string;
  username: string;
  name: string;
  phone: string;
  email: string;
  about: string;
  avatar: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
};

type ListingFromApi = {
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

type UserRentHistory = {
  id: string;
  listingId: string;
  renterId: string;
  status: "ACTIVE" | "ENDED";
  startAt: string;
  endAt: string | null;
  listing?: {
    id: string;
    title: string;
    address: string;
    price: number;
    photo: string | null;
    kind: "RENT" | "SALE";
    ownerId: string;
  };
};

function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-CA");
}

export default function Page() {
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [rentHistory, setRentHistory] = useState<UserRentHistory[]>([]);
  const [listing, setListing] = useState<ListingFromApi[]>([]);

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingListing, setLoadingListing] = useState(true);
  const [loadingRentHistory, setLoadingRentHistory] = useState(true);

  const { back } = useRouter();
  const [q, setQ] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(`/api/getUserDetail/${id}`);
      const data = await res.json();
      setUser(data.Detail ?? null);
      setLoadingUser(false);
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    const fetchListing = async () => {
      const res = await fetch(`/api/getUserListings/${id}`);
      const data = await res.json();
      setListing(Array.isArray(data.Detail) ? data.Detail : []);
      setLoadingListing(false);
    };
    fetchListing();
  }, [id]);

  useEffect(() => {
    const fetchUserRentHistory = async () => {
      const res = await fetch(`/api/getUserRentHistory/${id}`);
      const data = await res.json();
      setRentHistory(Array.isArray(data.Detail) ? data.Detail : []);
      setLoadingRentHistory(false);
    };
    fetchUserRentHistory();
  }, [id]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return listing;
    return listing.filter((l) => {
      const t = (l.title ?? "").toLowerCase();
      const a = (l.address ?? "").toLowerCase();
      return t.includes(s) || a.includes(s);
    });
  }, [listing, q]);

  const isRenter = user?.role === "RENTER";
  const isLandlord = user?.role === "LANDLORD";

  if (
    loadingUser ||
    (isLandlord && loadingListing) ||
    (isRenter && loadingRentHistory)
  ) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            <div className="rounded-3xl border bg-white shadow-[0_10px_35px_-20px_rgba(0,0,0,0.35)] overflow-hidden animate-pulse">
              <div className="h-28 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-10 w-10 rounded-2xl bg-gray-200" />
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                <div className="h-24 w-full bg-gray-200 rounded-2xl" />
              </div>
            </div>

            <div className="rounded-3xl border bg-white shadow-sm overflow-hidden animate-pulse">
              <div className="p-5 border-b">
                <div className="h-5 w-40 bg-gray-200 rounded" />
                <div className="h-4 w-64 bg-gray-200 rounded mt-2" />
              </div>

              <div className="p-5">
                <div className="h-11 w-full max-w-sm bg-gray-200 rounded-2xl" />
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm border"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white border rounded-2xl p-10 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              User not found
            </h2>
            <p className="text-gray-500">Хэрэглэгч олдсонгүй.</p>
          </div>
        </div>
      </div>
    );
  }

  const displayName = user.name || "User";
  const avatarUrl = (user.avatar ?? "").trim();

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="inline-flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-50 hover:cursor-pointer mt-10 ml-10 bg-white"
        onClick={() => back()}
      >
        ← Буцах
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <aside className="relative overflow-hidden rounded-3xl border bg-white shadow-[0_10px_35px_-20px_rgba(0,0,0,0.35)]">
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
                      {displayName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-extrabold text-white drop-shadow-sm">
                    {displayName}
                  </p>
                  <p className="truncate text-sm text-white/90">
                    @{user.username || "—"}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur">
                      <span className="h-2 w-2 rounded-full bg-amber-300" />
                      {user.role}
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
                <div className="py-2">
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm text-gray-900 break-words">
                    {user.name?.trim() ? user.name : "—"}
                  </p>
                </div>

                <div className="py-2">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-gray-900 break-words">
                    {user.email?.trim() ? user.email : "—"}
                  </p>
                </div>

                <div className="py-2">
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900 break-words">
                    {user.phone?.trim() ? user.phone : "—"}
                  </p>
                </div>

                <div className="py-2">
                  <p className="text-xs text-gray-500">About</p>
                  <p className="text-sm text-gray-900 break-words">
                    {user.about?.trim() ? user.about : "—"}
                  </p>
                </div>
              </div>
            </div>
          </aside>
          <main className="bg-white rounded-3xl border shadow-sm overflow-hidden">
            {isLandlord && (
              <>
                <div className="p-5 border-b flex items-center justify-between gap-3">
                  <h1 className="text-xl font-bold text-gray-900">
                    User Posts
                  </h1>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">
                      {filtered.length}
                    </span>{" "}
                    зар
                  </div>
                </div>

                <div className="p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="relative w-full md:max-w-sm">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      ⌕
                    </span>
                    <input
                      type="text"
                      placeholder="Зар хайх (title / address)..."
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
                    />
                  </div>

                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">
                      {filtered.length}
                    </span>{" "}
                    зар
                  </p>
                </div>

                <div className="p-5">
                  {filtered.length === 0 ? (
                    <div className="text-center py-16">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Хайлтаар зар олдсонгүй
                      </h3>
                      <p className="text-gray-500">
                        Хайлтын үгээ өөрчилж үзнэ үү
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filtered.map((l) => (
                        <div
                          key={l.id}
                          className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border"
                        >
                          <div className="relative overflow-hidden h-56">
                            <img
                              src={
                                l.photo ||
                                l.image ||
                                "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=60"
                              }
                              alt={l.address}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                            />

                            <div className="absolute top-3 left-3">
                              <span
                                className={cn(
                                  "px-3 py-1 rounded-full text-xs font-semibold backdrop-blur",
                                  l.status === "APPROVED" &&
                                    "bg-green-100/90 text-green-700",
                                  l.status === "PENDING" &&
                                    "bg-yellow-100/90 text-yellow-700",
                                  l.status === "REJECTED" &&
                                    "bg-red-100/90 text-red-700",
                                )}
                              >
                                {l.status}
                              </span>
                            </div>

                            <div className="absolute bottom-3 left-3">
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800 backdrop-blur">
                                {String(l.kind ?? "")
                                  .trim()
                                  .toUpperCase() === "RENT"
                                  ? "Түрээс"
                                  : "Зарах"}
                              </span>
                            </div>
                          </div>

                          <div className="p-5">
                            <p className="text-2xl font-bold text-gray-900">
                              ₮{formatPrice(l.price)}
                            </p>

                            <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
                              {l.title}
                            </h3>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {l.address}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t">
                              {l.rooms != null && <span>{l.rooms} өрөө</span>}
                              {l.sizeM2 != null && <span>{l.sizeM2} м²</span>}
                              {(l.rating ?? null) != null && (
                                <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border">
                                  {Number(l.rating).toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {isRenter && (
              <>
                <div className="p-5 border-b flex items-center justify-between gap-3">
                  <h1 className="text-xl font-bold text-gray-900">
                    Rent History
                  </h1>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">
                      {rentHistory.length}
                    </span>{" "}
                    түрээс
                  </div>
                </div>

                <div className="p-5">
                  {rentHistory.length === 0 ? (
                    <div className="text-center py-16">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Rent history байхгүй
                      </h3>
                      <p className="text-gray-500">
                        Энэ хэрэглэгч одоогоор түрээсийн түүхгүй байна.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {rentHistory.map((r) => {
                        const L = r.listing;
                        return (
                          <div
                            key={r.id}
                            className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border"
                          >
                            <div className="relative overflow-hidden h-56">
                              <img
                                src={
                                  L?.photo ||
                                  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=60"
                                }
                                alt={L?.address || r.listingId}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                              />

                              <div className="absolute top-3 left-3">
                                <span
                                  className={cn(
                                    "px-3 py-1 rounded-full text-xs font-semibold backdrop-blur",
                                    r.status === "ACTIVE" &&
                                      "bg-emerald-100/90 text-emerald-700",
                                    r.status === "ENDED" &&
                                      "bg-gray-100/90 text-gray-700",
                                  )}
                                >
                                  {r.status}
                                </span>
                              </div>

                              <div className="absolute bottom-3 left-3">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800 backdrop-blur">
                                  {L?.kind === "RENT" ? "Түрээс" : "Зарах"}
                                </span>
                              </div>
                            </div>

                            <div className="p-5">
                              <p className="text-2xl font-bold text-gray-900">
                                ₮{formatPrice(L?.price ?? 0)}
                              </p>

                              <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
                                {L?.title ?? "Listing"}
                              </h3>

                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {L?.address ?? "—"}
                              </p>

                              <div className="pt-3 border-t text-xs text-gray-600 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span>Start</span>
                                  <span className="font-semibold text-gray-900">
                                    {fmtDate(r.startAt)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>End</span>
                                  <span className="font-semibold text-gray-900">
                                    {fmtDate(r.endAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

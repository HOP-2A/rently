"use client";

import { useParams } from "next/navigation";
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

function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export default function Page() {
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [listing, setListing] = useState<ListingFromApi[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingListing, setLoadingListing] = useState(true);

  // UI-only search (keeps search in the design)
  const [q, setQ] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(`/api/getUserDetail/${id}`);
      const data = await res.json();
      setUser(data.Detail);
      setLoadingUser(false);
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    const fetchListing = async () => {
      const res = await fetch(`/api/getUserListings/${id}`);
      const data = await res.json();
      setListing(data.Detail);
      setLoadingListing(false);
    };
    fetchListing();
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

  if (loadingUser || loadingListing) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return <div className="p-6">User not found</div>;
  }

  if (!listing) {
    return <div className="p-6">Listing not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT: PROFILE */}
          <aside className="lg:col-span-4">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        user.avatar && user.avatar.length > 0
                          ? user.avatar
                          : "https://api.dicebear.com/7.x/initials/svg?seed=User"
                      }
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-base font-semibold text-slate-900">
                          {user.name}
                        </div>
                        <div className="truncate text-xs text-slate-500">
                          @{user.username}
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                  <div className="grid grid-cols-[70px_1fr] items-center gap-3">
                    <div className="text-xs font-medium text-slate-500">
                      Name
                    </div>
                    <div className="text-sm text-slate-900">{user.name}</div>
                  </div>

                  <div className="grid grid-cols-[70px_1fr] items-center gap-3">
                    <div className="text-xs font-medium text-slate-500">
                      Email
                    </div>
                    <div className="truncate text-sm text-slate-900">
                      {user.email}
                    </div>
                  </div>

                  <div className="grid grid-cols-[70px_1fr] items-center gap-3">
                    <div className="text-xs font-medium text-slate-500">
                      Phone
                    </div>
                    <div className="text-sm text-slate-900">{user.phone}</div>
                  </div>

                  <div className="grid grid-cols-[70px_1fr] items-start gap-3">
                    <div className="text-xs font-medium text-slate-500">
                      About
                    </div>
                    <div className="text-sm leading-relaxed text-slate-900">
                      {user.about?.trim() ? user.about : "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT: LISTINGS */}
          <main className="lg:col-span-8">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5">
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold text-slate-900">
                    Миний зарууд
                  </div>
                  <div className="text-xs text-slate-500">
                    Зөвхөн таны оруулсан зарууд энд харагдана
                  </div>
                </div>
                {/* removed New listing button */}
              </div>

              {/* Search row */}
              <div className="flex items-center justify-between gap-3 p-5">
                <div className="relative w-full max-w-sm">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    ⌕
                  </span>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Хайх..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>

                <div className="text-xs text-slate-500">
                  {filtered.length} зар
                </div>
              </div>

              {/* Grid */}
              <div className="p-5 pt-0">
                {filtered.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                    No listings
                  </div>
                ) : (
                  <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {filtered.map((l) => (
                      <li
                        key={l.id}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                      >
                        {/* Image */}
                        <div className="relative h-36 w-full bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              l.photo ||
                              l.image ||
                              "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=60"
                            }
                            alt={l.title}
                            className="h-full w-full object-cover"
                          />

                          <div
                            className={cn(
                              "absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold",
                              l.status === "PENDING" &&
                                "bg-amber-100 text-amber-700",
                              l.status === "APPROVED" &&
                                "bg-emerald-100 text-emerald-700",
                              l.status === "REJECTED" &&
                                "bg-rose-100 text-rose-700",
                            )}
                          >
                            {l.status}
                          </div>
                        </div>

                        {/* Body */}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-slate-900">
                                {l.title}
                              </div>
                              <div className="mt-1 truncate text-xs text-slate-500">
                                {l.address}
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              <div className="text-lg font-bold text-slate-900">
                                ₮{formatPrice(l.price)}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                нийт үнэ
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                            {l.rooms != null && <span>{l.rooms} өрөө</span>}
                            {l.sizeM2 != null && <span>{l.sizeM2} м²</span>}
                            {(l.rating ?? null) != null && (
                              <span className="ml-auto rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
                                {Number(l.rating).toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

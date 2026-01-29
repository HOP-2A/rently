"use client";

import { Bookmark } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/providers/authProvider";

export type OwnerFromApi = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  about?: string | null;
  avatar?: string | null;
  role?: "RENTER" | "LANDLORD" | "ADMIN" | string;
};

export type ListingStatus = "PENDING" | "ACTIVE" | "INACTIVE";

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
  status: ListingStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  photo?: string | null;
  image?: string | null;
  owner?: OwnerFromApi | null;

  kind: boolean;

  isSaved: boolean;
};

type Tone = "gray" | "green" | "yellow" | "red" | "blue";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function StatusPill({ label, tone = "gray" }: { label: string; tone?: Tone }) {
  const tones: Record<Tone, string> = {
    gray: "bg-gray-100 text-gray-700 border-gray-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    yellow: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-rose-50 text-rose-700 border-rose-200",
    blue: "bg-sky-50 text-sky-700 border-sky-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${tones[tone]}`}
    >
      {label}
    </span>
  );
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return "****";
  const middleStart = Math.floor((digits.length - 4) / 2);
  return digits.slice(0, middleStart) + "****" + digits.slice(middleStart + 4);
}

export default function Page() {
  const params = useParams();
  const rawId = params?.id;
  const id =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId)
        ? rawId[0]
        : undefined;

  const { back } = useRouter();

  const { user: clerkUser } = useUser();
  const auth = useAuth(clerkUser?.id);
  const user = auth?.user;

  const [listing, setListing] = useState<ListingFromApi | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [showPhone, setShowPhone] = useState<boolean>(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);

  const photo = useMemo<string | null>(() => {
    const p = (listing?.photo ?? "").trim();
    const i = (listing?.image ?? "").trim();
    return p || i || null;
  }, [listing]);

  const owner = listing?.owner ?? null;

  const mapsUrl =
    listing?.lat != null && listing?.lng != null
      ? `https://www.google.com/maps?q=${listing.lat},${listing.lng}`
      : null;

  const statusTone: Tone = useMemo(() => {
    if (!listing) return "gray";
    switch (listing.status) {
      case "ACTIVE":
        return "green";
      case "PENDING":
        return "yellow";
      case "INACTIVE":
        return "red";
      default:
        return "gray";
    }
  }, [listing]);

  const displayPhone = useMemo<string>(() => {
    if (!owner?.phone) return "—";
    if (showPhone && agreedToPrivacy) return owner.phone;
    return maskPhone(owner.phone);
  }, [owner?.phone, showPhone, agreedToPrivacy]);

  const fetchIsSaved = async (userId: string, listingId: string) => {
    const res = await fetch(`/api/getListning/saved/${userId}`, {
      cache: "no-store",
    });
    if (!res.ok) return false;

    const data: unknown = await res.json();
    const arr: { id: string }[] = Array.isArray(data)
      ? (data as { id: string }[])
      : [];
    return arr.some((x) => x.id === listingId);
  };

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/getListning/${id}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

        const data = (await res.json()) as ListingFromApi | null;
        if (!data) throw new Error("No listing data");

        if (!cancelled) setListing(data);

        if (user?.id) {
          const saved = await fetchIsSaved(user.id, data.id);
          if (!cancelled) {
            setListing((prev) => (prev ? { ...prev, isSaved: saved } : prev));
          }
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setListing(null);
          setError(e instanceof Error ? e.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [id, user?.id]);

  const handleRevealPhone = () => {
    if (!agreedToPrivacy) setShowPrivacyModal(true);
    else setShowPhone(true);
  };

  const handleAgreePrivacy = () => {
    setAgreedToPrivacy(true);
    setShowPhone(true);
    setShowPrivacyModal(false);
  };

  const toggleSaved = async () => {
    if (!listing || saving) return;
    if (!user?.id) return;

    const prevSaved = Boolean(listing.isSaved);
    const nextSaved = !prevSaved;

    setListing((prev) => (prev ? { ...prev, isSaved: nextSaved } : prev));
    setSaving(true);

    try {
      const method = nextSaved ? "POST" : "DELETE";

      const res = await fetch("/api/bookMark", {
        method,
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ renterId: user.id, listingId: listing.id }),
      });

      if (!res.ok) throw new Error(`${method} failed: ${res.status}`);
    } catch (e) {
      console.error(e);
      setListing((prev) => (prev ? { ...prev, isSaved: prevSaved } : prev));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-12 w-32 bg-white border rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-[500px] bg-white border rounded-3xl" />
              <div className="h-[500px] bg-white border rounded-3xl" />
            </div>
            <div className="h-64 bg-white border rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 border rounded-xl bg-white hover:bg-gray-50"
          >
            ← Back
          </Link>

          <div className="bg-white border rounded-3xl p-6">
            <div className="text-lg font-semibold">Зар олдсонгүй</div>
            <div className="text-sm text-gray-500 mt-1">
              {error ?? "API-аас мэдээлэл ирсэнгүй."}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Нууцлалын бодлого</h3>
              <p className="text-gray-600 text-sm">
                Та дараах нөхцлийг хүлээн зөвшөөрч байна
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3 text-sm text-gray-700">
              <div className="flex gap-3">
                <div className="text-green-600 mt-0.5">✓</div>
                <div>
                  Утасны дугаарыг <strong>зөвхөн энэ зарын талаар</strong>{" "}
                  холбогдох зорилгоор ашиглана
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-red-600 mt-0.5">✗</div>
                <div>
                  Дугаарыг бусдад дамжуулах, худалдах, эсвэл{" "}
                  <strong>бусад зорилгоор ашиглахыг хориглоно</strong>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:cursor-pointer"
              >
                Цуцлах
              </button>
              <button
                onClick={handleAgreePrivacy}
                className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 hover:cursor-pointer"
              >
                Зөвшөөрөх
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-50 hover:cursor-pointer"
              onClick={() => back()}
            >
              ← Буцах
            </div>

            <div className="flex items-center gap-2">
              <StatusPill label={listing.status} tone={statusTone} />
              <StatusPill
                label={listing.isActive ? "ИДЭВХИТЭЙ" : "ИДЭВХГҮЙ"}
                tone={listing.isActive ? "green" : "gray"}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="bg-white border rounded-3xl overflow-hidden shadow-sm h-full">
              <div className="relative h-[500px]">
                {photo ? (
                  <img
                    src={photo}
                    alt={listing.address}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
                    Зураггүй
                  </div>
                )}

                <div className="absolute top-5 right-5">
                  <div className="backdrop-blur bg-transparent text-gray-100 rounded-2xl px-5 py-3 shadow-lg">
                    <div className="text-xs text-gray-200 font-medium">
                      Үнэ:
                    </div>
                    <div className="text-3xl font-bold">
                      ₮{listing.price.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="absolute top-5 left-5">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleSaved();
                    }}
                    disabled={saving || !user?.id}
                    className={`bg-white/95 backdrop-blur p-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 ${
                      saving || !user?.id
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:cursor-pointer"
                    }`}
                    title={!user?.id ? "Нэвтэрсний дараа хадгална" : undefined}
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
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border rounded-3xl p-6 shadow-sm lg:sticky lg:top-20">
              <div className="text-lg font-bold">Холбогдох</div>

              <div className="mt-5 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl border flex items-center justify-center overflow-hidden bg-gray-50">
                  {owner?.avatar ? (
                    <img
                      src={owner.avatar}
                      alt={owner.name ?? "Owner avatar"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-sm">No avatar</div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-lg truncate">
                    {owner?.name ?? "Тодорхойгүй"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {owner?.role ?? "—"}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="border rounded-2xl p-4">
                  <div className="text-xs text-gray-500 mb-2">Утас</div>
                  <div className="font-semibold mb-3">{displayPhone}</div>

                  <div className="flex gap-2">
                    {!showPhone || !agreedToPrivacy ? (
                      <button
                        disabled={!owner?.phone}
                        onClick={handleRevealPhone}
                        className={`flex-1 hover:cursor-pointer px-3 py-2 rounded-xl border text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 ${
                          !owner?.phone ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        Дугаар харах
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={async () => {
                            if (!owner?.phone) return;
                            await copyToClipboard(owner.phone);
                          }}
                          className="flex-1 px-3 py-2 rounded-xl border text-sm font-semibold bg-white hover:bg-gray-50 hover:cursor-pointer"
                        >
                          Хуулах
                        </button>

                        <a
                          href={`tel:${owner?.phone ?? ""}`}
                          className="flex-1 px-3 py-2 rounded-xl border text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 text-center hover:cursor-pointer"
                        >
                          Залгах
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div className="border rounded-2xl p-4">
                  <div className="text-xs text-gray-500 mb-2">Имэйл</div>
                  <div className="font-semibold mb-3 text-sm truncate">
                    {owner?.email ?? "—"}
                  </div>

                  <a
                    href={owner?.email ? `mailto:${owner.email}` : undefined}
                    className={`block w-full px-3 py-2 rounded-xl border text-sm font-semibold bg-white hover:bg-gray-50 text-center ${
                      !owner?.email ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    Имэйл илгээх
                  </a>
                </div>

                {owner?.about && (
                  <div className="border rounded-2xl p-4">
                    <div className="text-xs text-gray-500 mb-2">Тухай</div>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {owner.about}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                {listing.title}
              </h1>
              <p className="text-gray-600 text-lg">{listing.address}</p>
            </div>

            <div className="flex gap-2 sm:flex-shrink-0">
              {mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl border bg-white hover:bg-gray-50 text-sm font-semibold hover:cursor-pointer"
                >
                  Газрын зураг
                </a>
              ) : (
                <button
                  disabled
                  className="px-5 py-2.5 rounded-xl border bg-white text-sm font-semibold opacity-50 cursor-not-allowed "
                >
                  Газрын зураггүй
                </button>
              )}

              <button
                onClick={() => copyToClipboard(window.location.href)}
                className="px-5 py-2.5 rounded-xl border bg-white hover:bg-gray-50 text-sm font-semibold hover:cursor-pointer"
              >
                Линк хуулах
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="border rounded-2xl p-4">
              <div className="text-xs text-gray-500 mb-1">Өрөө</div>
              <div className="text-2xl font-semibold">
                {listing.rooms ?? "—"}
              </div>
            </div>

            <div className="border rounded-2xl p-4">
              <div className="text-xs text-gray-500 mb-1">Талбай</div>
              <div className="text-2xl font-semibold">
                {listing.sizeM2 != null ? `${listing.sizeM2} м²` : "—"}
              </div>
            </div>

            <div className="border rounded-2xl p-4">
              <div className="text-xs text-gray-500 mb-1">Төрөл</div>
              <div className="text-2xl font-semibold">
                {String(listing.kind)}
              </div>
            </div>

            <div className="border rounded-2xl p-4 sm:col-span-2">
              <div className="text-xs text-gray-500 mb-1">Координат</div>
              <div className="text-lg font-semibold">
                {listing.lat != null && listing.lng != null
                  ? `${listing.lat}, ${listing.lng}`
                  : "—"}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t text-xs text-gray-500 flex flex-wrap gap-4">
            <span>Үүсгэсэн: {formatDate(listing.createdAt)}</span>
            <span>•</span>
            <span>Шинэчилсэн: {formatDate(listing.updatedAt)}</span>
          </div>
        </div>

        <div className="bg-white border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-lg font-bold">Өгөгдлийн бүрэн байдал</div>
              <div className="text-sm text-gray-500">Мэдээллийн шалгалт</div>
            </div>

            <div className="flex flex-wrap gap-2">
              {listing.photo || listing.image ? (
                <StatusPill label="Зураг ✓" tone="green" />
              ) : (
                <StatusPill label="Зураггүй" tone="yellow" />
              )}

              {listing.lat != null && listing.lng != null ? (
                <StatusPill label="Координат ✓" tone="green" />
              ) : (
                <StatusPill label="Координатгүй" tone="yellow" />
              )}

              {owner?.phone ? (
                <StatusPill label="Утас ✓" tone="green" />
              ) : (
                <StatusPill label="Утасгүй" tone="yellow" />
              )}

              {owner?.email ? (
                <StatusPill label="Имэйл ✓" tone="green" />
              ) : (
                <StatusPill label="Имэйлгүй" tone="yellow" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

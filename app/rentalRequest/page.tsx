"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/authProvider";

type UserMini = {
  id: string;
  username?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

type RentalRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELED"
  | string;

type RentalRequestType = "RENT_REQUEST" | "BUY_REQUEST" | string;

type RentalRequest = {
  id: string;
  type?: RentalRequestType | null;

  message: string | null;
  moveInDate: string | null;
  durationMonths: number | null;
  phone: string | null;

  status: RentalRequestStatus;
  createdAt: string;

  renter?: UserMini | null;
  renterId?: string | null;
};

type Listing = {
  id: string;
  title: string;
  address: string | null;
  price: number | string | null;
  ownerId: string;
  createdAt?: string;
  owner?: UserMini | null;
  rentalRequests?: RentalRequest[];
};

type ApiError = { error: string; message?: string; code?: string };

function isApiError(x: unknown): x is ApiError {
  return (
    typeof x === "object" &&
    x !== null &&
    "error" in x &&
    typeof (x as { error: unknown }).error === "string"
  );
}

function APPROVE_ENDPOINT(requestId: string) {
  return `/api/rentalRequests/${requestId}/approve`;
}
function REJECT_ENDPOINT(requestId: string) {
  return `/api/rentalRequests/${requestId}/reject`;
}

function typeLabel(t: string | null | undefined) {
  return t === "BUY_REQUEST" ? "ХУДАЛДАХ" : "ТҮРЭЭС";
}
function typeText(t: string | null | undefined) {
  return t === "BUY_REQUEST" ? "Худалдах хүсэлт" : "Түрээслэх хүсэлт";
}

export default function LandlordRequestsPage() {
  const { user: clerkUser, isLoaded } = useUser();
  const auth = useAuth(clerkUser?.id);
  const user = auth?.user;

  const landLordId = useMemo(() => user?.id ?? "", [user?.id]);

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    null,
  );

  const [search, setSearch] = useState("");

  const selectedListing = useMemo(() => {
    if (!selectedListingId) return null;
    return listings.find((l) => l.id === selectedListingId) ?? null;
  }, [listings, selectedListingId]);

  const filteredListings = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return listings;

    return listings.filter((l) => {
      const t = (l.title ?? "").toLowerCase();
      const a = (l.address ?? "").toLowerCase();
      return t.includes(q) || a.includes(q);
    });
  }, [listings, search]);

  async function fetchData() {
    if (!landLordId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/listingsWithRentalRequest/${landLordId}`, {
        method: "GET",
        cache: "no-store",
      });

      const data: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        if (isApiError(data)) setError(data.message ?? data.error);
        else setError("Мэдээлэл татахад алдаа гарлаа");
        setListings([]);
        setSelectedListingId(null);
        return;
      }

      if (!Array.isArray(data)) {
        setError("Серверийн хариу буруу байна");
        setListings([]);
        setSelectedListingId(null);
        return;
      }

      const safe = data as Listing[];
      setListings(safe);

      if (!selectedListingId && safe.length > 0) {
        setSelectedListingId(safe[0].id);
      } else if (selectedListingId) {
        const stillExists = safe.some((x) => x.id === selectedListingId);
        if (!stillExists) setSelectedListingId(safe[0]?.id ?? null);
      }
    } catch (e) {
      console.error(e);
      setError("Сүлжээний алдаа гарлаа");
      setListings([]);
      setSelectedListingId(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoaded) return;
    if (!landLordId) return;
    fetchData();
  }, [isLoaded, landLordId]);

  async function decideRequest(
    listingId: string,
    requestId: string,
    next: "APPROVED" | "REJECTED",
  ) {
    if (!requestId) return;

    setSavingId(requestId);
    setError(null);

    try {
      const endpoint =
        next === "APPROVED"
          ? APPROVE_ENDPOINT(requestId)
          : REJECT_ENDPOINT(requestId);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ decisionNote: "" }),
      });

      const data: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        if (isApiError(data)) setError(data.message ?? data.error);
        else setError("Хүсэлт шинэчлэхэд алдаа гарлаа");
        return;
      }

      setListings((prev) =>
        prev.map((l) => {
          if (l.id !== listingId) return l;

          const nextRequests = (l.rentalRequests ?? []).map((r) => {
            if (r.id === requestId) return { ...r, status: next };

            if (next === "APPROVED" && r.status === "PENDING") {
              return { ...r, status: "CANCELED" };
            }

            return r;
          });

          return { ...l, rentalRequests: nextRequests };
        }),
      );

      await fetchData();
    } catch (e) {
      console.error(e);
      setError("Хүсэлт шинэчлэхэд алдаа гарлаа");
    } finally {
      setSavingId(null);
    }
  }

  const totalPending = useMemo(() => {
    return listings.reduce((acc, l) => {
      const pending = (l.rentalRequests ?? []).filter(
        (r) => r.status === "PENDING",
      ).length;
      return acc + pending;
    }, 0);
  }, [listings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/30 via-white to-blue-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
                Хүсэлтүүд
              </h1>
              <p className="text-gray-600 mt-2 text-base">
                Таны үл хөдлөх хөрөнгийн түрээс, худалдах хүсэлтүүдийг удирдах
              </p>
            </div>

            <div className="flex items-center gap-3">
              {totalPending > 0 && (
                <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl shadow-lg shadow-amber-200/50">
                  <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-lg shadow-amber-500/50" />
                  <span className="text-sm font-bold text-amber-900">
                    {totalPending} хүлээгдэж буй
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                onClick={fetchData}
                disabled={loading}
                className="shadow-lg border-2 hover:border-teal-400 rounded-xl h-12 px-5 font-semibold"
              >
                <svg
                  className={`w-5 h-5 mr-2 ${loading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Шинэчлэх
              </Button>
            </div>
          </div>

          <div className="mt-6 max-w-md">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <Input
                placeholder="Гарчиг эсвэл хаягаар хайх..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 rounded-2xl border-2 focus:border-teal-500 shadow-sm text-base"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-start gap-3 p-5 bg-gradient-to-r from-red-50 to-red-100/50 border-2 border-red-300 rounded-2xl shadow-lg shadow-red-200/50">
              <svg
                className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-medium text-red-900">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-2 border-gray-200 rounded-3xl overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-white text-lg">
                    Таны үл хөдлөх хөрөнгө
                  </h2>
                  <Badge className="bg-white/20 text-white border-white/30 font-bold text-base px-3 py-1">
                    {filteredListings.length}
                  </Badge>
                </div>
              </div>

              <div className="p-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
                {loading && (
                  <div className="flex items-center justify-center py-16">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200" />
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent absolute top-0 left-0" />
                    </div>
                  </div>
                )}

                {!loading && filteredListings.length === 0 && (
                  <div className="text-center py-16">
                    <div className="p-4 bg-gray-100 rounded-3xl inline-block mb-4">
                      <svg
                        className="w-12 h-12 text-gray-400 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                      Зар олдсонгүй
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {!loading &&
                    filteredListings.map((l) => {
                      const isActive = l.id === selectedListingId;

                      const pendingCount = (l.rentalRequests ?? []).filter(
                        (r) => r.status === "PENDING",
                      ).length;

                      const pendingRent = (l.rentalRequests ?? []).filter(
                        (r) =>
                          r.status === "PENDING" &&
                          (r.type ?? "RENT_REQUEST") !== "BUY_REQUEST",
                      ).length;

                      const pendingBuy = (l.rentalRequests ?? []).filter(
                        (r) =>
                          r.status === "PENDING" &&
                          (r.type ?? "RENT_REQUEST") === "BUY_REQUEST",
                      ).length;

                      return (
                        <button
                          key={l.id}
                          onClick={() => setSelectedListingId(l.id)}
                          className={`
                            w-full text-left rounded-2xl border-2 p-5 transition-all duration-200
                            ${
                              isActive
                                ? "border-teal-500 bg-gradient-to-br from-teal-50 to-teal-100/50 shadow-lg shadow-teal-200/50 scale-[1.02]"
                                : "border-gray-200 bg-white hover:bg-gray-50 hover:border-teal-300 hover:shadow-md"
                            }
                          `}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-gray-900 truncate text-base">
                                {l.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-2 truncate flex items-center gap-1.5">
                                <svg
                                  className="w-4 h-4 flex-shrink-0 text-teal-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                {l.address || "Хаяг байхгүй"}
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              {pendingCount > 0 ? (
                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 font-bold">
                                  {pendingCount}
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-gray-500 border-2"
                                >
                                  0
                                </Badge>
                              )}

                              {(pendingRent > 0 || pendingBuy > 0) && (
                                <div className="flex flex-col gap-1">
                                  {pendingRent > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="text-amber-700 border-2 border-amber-300 bg-amber-50 font-bold text-xs"
                                      title="Түрээсийн хүсэлт"
                                    >
                                      ТҮРЭЭС {pendingRent}
                                    </Badge>
                                  )}
                                  {pendingBuy > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="text-blue-700 border-2 border-blue-300 bg-blue-50 font-bold text-xs"
                                      title="Худалдах хүсэлт"
                                    >
                                      ХУДАЛДАХ {pendingBuy}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="shadow-xl border-2 border-gray-200 rounded-3xl overflow-hidden">
              {!selectedListing ? (
                <div className="flex flex-col items-center justify-center py-24 px-4">
                  <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mb-6">
                    <svg
                      className="w-16 h-16 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-center font-medium text-lg">
                    Үл хөдлөх хөрөнгө сонгоно уу
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-6 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-bold text-white truncate">
                          {selectedListing.title}
                        </h2>
                        <p className="text-sm text-teal-50 mt-2 flex items-center gap-1.5">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {selectedListing.address || "Хаяг байхгүй"}
                        </p>
                      </div>

                      <Badge className="bg-white/20 text-white border-white/30 font-bold text-base px-4 py-2">
                        {(selectedListing.rentalRequests ?? []).length} хүсэлт
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
                    {(selectedListing.rentalRequests ?? []).length === 0 ? (
                      <div className="text-center py-20">
                        <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl inline-block mb-4">
                          <svg
                            className="w-16 h-16 text-gray-400 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                          </svg>
                        </div>
                        <p className="text-gray-600 font-medium">
                          Одоогоор хүсэлт байхгүй байна
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(selectedListing.rentalRequests ?? []).map((r) => {
                          const renterName =
                            r.renter?.username ??
                            r.renter?.name ??
                            r.renter?.email ??
                            r.renterId ??
                            "Мэдэгдэхгүй";

                          const isPending = r.status === "PENDING";
                          const isBusy = savingId === r.id;

                          const reqType = r.type ?? "RENT_REQUEST";
                          const isBuy = reqType === "BUY_REQUEST";

                          const date =
                            !isBuy && r.moveInDate
                              ? new Date(r.moveInDate).toLocaleDateString(
                                  "en-CA",
                                )
                              : "—";

                          return (
                            <Card
                              key={r.id}
                              className={`
                                p-6 transition-all duration-200 rounded-2xl border-2
                                ${
                                  isPending
                                    ? "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50/30 shadow-lg shadow-amber-200/50"
                                    : "border-gray-200 bg-white"
                                }
                              `}
                            >
                              <div className="flex flex-col gap-5">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/30">
                                      <svg
                                        className="w-6 h-6 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                      </svg>
                                    </div>
                                    <div>
                                      <h3 className="font-bold text-gray-900 text-base">
                                        {renterName}
                                      </h3>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {new Date(
                                          r.createdAt,
                                        ).toLocaleDateString("mn-MN", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className={
                                        reqType === "BUY_REQUEST"
                                          ? "border-2 border-blue-400 text-blue-700 bg-blue-50 font-bold"
                                          : "border-2 border-amber-400 text-amber-700 bg-amber-50 font-bold"
                                      }
                                      title={typeText(reqType)}
                                    >
                                      {typeLabel(reqType)}
                                    </Badge>

                                    <Badge
                                      variant={
                                        r.status === "APPROVED"
                                          ? "default"
                                          : r.status === "REJECTED"
                                            ? "destructive"
                                            : r.status === "CANCELED"
                                              ? "outline"
                                              : "secondary"
                                      }
                                      className={`font-bold ${
                                        r.status === "APPROVED"
                                          ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30"
                                          : ""
                                      }`}
                                    >
                                      {r.status === "APPROVED"
                                        ? "ЗӨВШӨӨРСӨН"
                                        : r.status === "REJECTED"
                                          ? "ТАТГАЛЗСАН"
                                          : r.status === "CANCELED"
                                            ? "ЦУЦЛАСАН"
                                            : "ХҮЛЭЭГДЭЖ БУЙ"}
                                    </Badge>
                                  </div>
                                </div>

                                {r.message && (
                                  <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap font-medium">
                                      {r.message}
                                    </p>
                                  </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-sm">
                                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                                      <svg
                                        className="w-5 h-5 text-teal-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                      </svg>
                                      <span className="text-xs font-bold">
                                        {isBuy
                                          ? "Худалдах огноо"
                                          : "Нүүх огноо"}
                                      </span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">
                                      {date}
                                    </p>
                                  </div>

                                  <div className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-sm">
                                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                                      <svg
                                        className="w-5 h-5 text-teal-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                      <span className="text-xs font-bold">
                                        {isBuy ? "Төсөв" : "Хугацаа"}
                                      </span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">
                                      {isBuy
                                        ? "—"
                                        : r.durationMonths
                                          ? `${r.durationMonths} сар`
                                          : "—"}
                                    </p>
                                  </div>

                                  <div className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-sm">
                                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                                      <svg
                                        className="w-5 h-5 text-teal-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                        />
                                      </svg>
                                      <span className="text-xs font-bold">
                                        Утас
                                      </span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">
                                      {r.phone ?? r.renter?.phone ?? "—"}
                                    </p>
                                  </div>
                                </div>

                                {isPending && (
                                  <div className="flex gap-3 pt-2">
                                    <Button
                                      disabled={isBusy}
                                      onClick={() =>
                                        decideRequest(
                                          selectedListing.id,
                                          r.id,
                                          "APPROVED",
                                        )
                                      }
                                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30 h-12 rounded-xl font-bold"
                                    >
                                      {isBusy ? (
                                        <svg
                                          className="animate-spin h-5 w-5 mr-2"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                        >
                                          <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                          />
                                          <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                          />
                                        </svg>
                                      ) : (
                                        <svg
                                          className="w-5 h-5 mr-2"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                      )}
                                      {isBusy ? "Шалгаж байна..." : "Зөвшөөрөх"}
                                    </Button>

                                    <Button
                                      variant="outline"
                                      disabled={isBusy}
                                      onClick={() =>
                                        decideRequest(
                                          selectedListing.id,
                                          r.id,
                                          "REJECTED",
                                        )
                                      }
                                      className="flex-1 border-2 border-gray-300 hover:bg-red-50 hover:border-red-300 h-12 rounded-xl font-bold"
                                    >
                                      <svg
                                        className="w-5 h-5 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"
                                        />
                                      </svg>
                                      Татгалзах
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

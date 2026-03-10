"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";

type RentalRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELED"
  | string;

type RentStatus = "ACTIVE" | "ENDED" | string;

type ListingMini = {
  id: string;
  title: string;
  address: string;
  price: number;
  photo: string;
};

type RenterMini = {
  id: string;
  name: string | null;
  username: string;
};

type ReviewMini = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

type RentMini = {
  id: string;
  status: RentStatus;
  reviews: ReviewMini[];
};

type HistoryItem = {
  id: string;
  status: RentalRequestStatus;
  message: string;
  createdAt: string;

  renter: RenterMini;
  listing: ListingMini;
  rent: RentMini | null;
};

type ApiResponse = {
  requests: HistoryItem[];
};

function isApiResponse(x: unknown): x is ApiResponse {
  if (typeof x !== "object" || x === null) return false;
  const obj = x as Record<string, unknown>;
  return Array.isArray(obj.requests);
}

function reqBadge(status: RentalRequestStatus) {
  const s = String(status).toUpperCase();

  if (s === "APPROVED") return "bg-green-100 text-green-700 border-green-200";
  if (s === "REJECTED") return "bg-red-100 text-red-700 border-red-200";
  if (s === "CANCELED") return "bg-gray-200 text-gray-700 border-gray-300";

  return "bg-yellow-100 text-yellow-700 border-yellow-200";
}

function rentBadge(status: RentStatus) {
  const s = String(status).toUpperCase();

  if (s === "ENDED") return "bg-gray-100 text-gray-800 border-gray-200";

  return "bg-blue-100 text-blue-700 border-blue-200";
}

export default function RentalHistoryPage() {
  const { isLoaded } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<HistoryItem[]>([]);

  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELED"
  >("ALL");

  const refetch = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/landlord/rentalHistory", {
        cache: "no-store",
      });

      const json: unknown = await res.json();

      if (!res.ok) {
        setError("Түүхийг ачаалах боломжгүй байна");
        return;
      }

      if (!isApiResponse(json)) {
        setError("Серверээс буусан өгөгдөл буруу байна");
        return;
      }

      setRequests(json.requests);
    } catch (e) {
      console.error(e);
      setError("Сүлжээ эсвэл серверийн алдаа");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    void refetch();
  }, [isLoaded]);

  const filtered = useMemo(() => {
    if (filter === "ALL") return requests;

    return requests.filter((r) => String(r.status).toUpperCase() === filter);
  }, [requests, filter]);

  const counts = useMemo(() => {
    const up = (s: RentalRequestStatus) => String(s).toUpperCase();

    return {
      total: requests.length,
      pending: requests.filter((r) => up(r.status) === "PENDING").length,
      approved: requests.filter((r) => up(r.status) === "APPROVED").length,
      rejected: requests.filter((r) => up(r.status) === "REJECTED").length,
      canceled: requests.filter((r) => up(r.status) === "CANCELED").length,
    };
  }, [requests]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Түрээсийн хүсэлтийн түүх
            </h1>

            <p className="text-sm text-gray-600 mt-1">
              Миний явуулсан түрээсийн хүсэлтүүд
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white border">
              Нийт: {counts.total}
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
              Pending {counts.pending}
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
              Approved {counts.approved}
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
              Rejected {counts.rejected}
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 border border-gray-300">
              Canceled {counts.canceled}
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          {(
            ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELED"] as const
          ).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={[
                "px-4 py-2 rounded-xl text-sm font-semibold border transition cursor-pointer",
                filter === t
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white hover:bg-gray-50",
              ].join(" ")}
            >
              {t === "ALL"
                ? "Бүгд"
                : t === "PENDING"
                  ? "Хүлээгдэж байгаа"
                  : t === "APPROVED"
                    ? "Зөвшөөрсөн"
                    : t === "REJECTED"
                      ? "Татгалзсан"
                      : "Цуцлагдсан"}
            </button>
          ))}
        </div>

        {error && (
          <Card className="mt-4 p-4 border-red-200 bg-red-50 text-red-800">
            {error}
          </Card>
        )}

        <div className="mt-5">
          {loading ? (
            <div className="text-sm text-gray-500">Ачааллаж байна...</div>
          ) : filtered.length === 0 ? (
            <Card className="p-10 text-center">
              <div className="text-lg font-bold text-gray-900">
                Хүсэлт байхгүй
              </div>

              <div className="text-sm text-gray-600 mt-2">
                Таны явуулсан хүсэлт одоогоор байхгүй байна
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((r) => {
                const photo = String(r.listing.photo ?? "").trim();
                const review = r.rent?.reviews?.[0];

                return (
                  <Card key={r.id} className="p-4">
                    <div className="flex gap-4">
                      <div className="w-28 h-24 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                        {photo ? (
                          <img
                            src={photo}
                            alt={r.listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link
                              href={`/listing/${r.listing.id}`}
                              className="font-semibold text-gray-900 hover:text-teal-600 line-clamp-1"
                            >
                              {r.listing.title}
                            </Link>

                            <div className="text-xs text-gray-600 mt-1 line-clamp-1">
                              {r.listing.address}
                            </div>

                            <div className="text-xs text-gray-500 mt-1">
                              Түрээслэгч: {r.renter.name ?? r.renter.username}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${reqBadge(
                                r.status,
                              )}`}
                            >
                              {String(r.status).toUpperCase()}
                            </span>

                            {r.rent?.status ? (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${rentBadge(
                                  r.rent.status,
                                )}`}
                              >
                                Түрээс {String(r.rent.status).toUpperCase()}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-2 text-sm font-bold text-gray-900">
                          ₮{Number(r.listing.price).toLocaleString()}
                        </div>

                        {review && (
                          <div className="mt-3 text-xs text-gray-600">
                            Review: ⭐ {review.rating}/5{" "}
                            {review.comment ? `— ${review.comment}` : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

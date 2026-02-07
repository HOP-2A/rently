"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type RentalRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELED"
  | string;
type RentStatus = "ACTIVE" | "ENDED" | string;
type Kind = "RENT" | "SALE" | string;

type ReviewMini = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

type ListingMini = {
  id: string;
  title: string;
  address: string;
  price: number;
  photo: string;
  kind: Kind;
  rooms: number | null;
  sizeM2: number | null;
};

type RentMini = {
  id: string;
  status: RentStatus;
  startAt: string;
  endAt: string | null;
  reviews: ReviewMini[];
};

type HistoryItem = {
  id: string;
  status: RentalRequestStatus;
  message: string;
  phone: string | null;
  moveInDate: string | null;
  durationMonths: number | null;
  createdAt: string;
  listing: ListingMini;
  rent: RentMini | null;
};

type ApiResponse = { requests: HistoryItem[] };

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

type Draft = {
  rentId: string;
  listingId: string;
  rating: number;
  comment: string;
};

export default function RentalHistoryPage() {
  const { isLoaded } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<HistoryItem[]>([]);

  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELED"
  >("ALL");

  // modal
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/renter/rentalHistory", {
        cache: "no-store",
      });
      const json: unknown = await res.json();

      if (!res.ok) {
        const msg =
          typeof json === "object" && json !== null && "error" in json
            ? String((json as { error: unknown }).error)
            : "Failed to load history";
        setError(msg);
        setRequests([]);
        return;
      }

      if (!isApiResponse(json)) {
        setError("Invalid server response");
        setRequests([]);
        return;
      }

      setRequests(json.requests);
    } catch (e) {
      console.error(e);
      setError("Network / server error");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    void refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const openReview = (
    rentId: string,
    listingId: string,
    existing?: ReviewMini,
  ) => {
    setReviewError(null);
    setDraft({
      rentId,
      listingId,
      rating: existing?.rating ?? 5,
      comment: existing?.comment ?? "",
    });
    setOpen(true);
  };

  const submitReview = async () => {
    if (!draft) return;
    setSaving(true);
    setReviewError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });

      const json: unknown = await res.json();

      if (!res.ok) {
        const msg =
          typeof json === "object" && json !== null && "error" in json
            ? String((json as { error: unknown }).error)
            : "Failed to submit review";
        setReviewError(msg);
        return;
      }

      setOpen(false);
      setDraft(null);
      await refetch();
    } catch (e) {
      console.error(e);
      setReviewError("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rental History</h1>
            <p className="text-sm text-gray-600 mt-1">
              Миний түрээсийн хүсэлтүүд + Rent + Review
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white border">
              Total: {counts.total}
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
                "px-4 py-2 rounded-xl text-sm font-semibold border transition",
                filter === t
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white hover:bg-gray-50",
              ].join(" ")}
            >
              {t}
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
            <div className="text-sm text-gray-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <Card className="p-10 text-center">
              <div className="text-lg font-bold text-gray-900">No history</div>
              <div className="text-sm text-gray-600 mt-2">
                Та одоогоор хүсэлт явуулаагүй байна.
              </div>
              <div className="mt-4">
                <Link href="/" className="inline-block">
                  <Button>Browse listings</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((r) => {
                const photo = String(r.listing.photo ?? "").trim();
                const myReview = r.rent?.reviews?.[0];

                // ✅ review allowed only if rent exists
                const canReview = Boolean(r.rent?.id);

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
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${reqBadge(r.status)}`}
                            >
                              {String(r.status).toUpperCase()}
                            </span>

                            {r.rent?.status ? (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${rentBadge(r.rent.status)}`}
                              >
                                RENT {String(r.rent.status).toUpperCase()}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-2 text-sm font-bold text-gray-900">
                          ₮{Number(r.listing.price).toLocaleString()}
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="text-xs text-gray-600">
                            {myReview ? (
                              <>
                                <span className="font-semibold text-gray-900">
                                  Your review:
                                </span>{" "}
                                ⭐ {myReview.rating}/5{" "}
                                {myReview.comment?.trim()
                                  ? `— ${myReview.comment}`
                                  : ""}
                              </>
                            ) : (
                              <span>No review yet</span>
                            )}
                          </div>

                          <Button
                            variant="secondary"
                            disabled={!canReview}
                            onClick={() => {
                              if (!r.rent?.id) return;
                              openReview(r.rent.id, r.listing.id, myReview);
                            }}
                          >
                            {myReview ? "Edit review" : "Leave review"}
                          </Button>
                        </div>

                        {!canReview && (
                          <div className="mt-2 text-xs text-gray-500">
                            Review is available only after Rent is created (when
                            landlord approves and rent starts).
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

      {open && draft && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Үнэлгээ өгөх
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  1-5 оноо, сэтгэгдэл заавал биш
                </p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
                onClick={() => {
                  setOpen(false);
                  setDraft(null);
                  setReviewError(null);
                }}
              >
                <svg
                  className="w-5 h-5"
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
              </button>
            </div>

            {/* Rating */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700 mb-3 block">
                Үнэлгээ
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() =>
                      setDraft((p) => (p ? { ...p, rating: n } : p))
                    }
                    className={[
                      "flex-1 py-3 rounded-2xl border-2 text-base font-bold transition-all duration-200",
                      draft.rating === n
                        ? "bg-gradient-to-br from-teal-500 to-teal-600 text-white border-teal-600 shadow-lg shadow-teal-500/30 scale-105"
                        : "bg-white hover:bg-gray-50 border-gray-200 hover:border-teal-300 text-gray-700",
                    ].join(" ")}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {draft.rating && (
                <div className="mt-3 flex items-center gap-1 text-amber-500">
                  {[...Array(draft.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              )}
            </div>

            {/* Comment */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700 mb-3 block">
                Сэтгэгдэл
              </label>
              <textarea
                value={draft.comment}
                onChange={(e) =>
                  setDraft((p) => (p ? { ...p, comment: e.target.value } : p))
                }
                className="w-full min-h-[120px] rounded-2xl border-2 border-gray-200 p-4 text-sm focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all resize-none"
                placeholder="Өөрийн сэтгэгдлээ бичнэ үү..."
              />
              <div className="mt-2 text-xs text-gray-400">
                {draft.comment.length} тэмдэгт
              </div>
            </div>

            {/* Error */}
            {reviewError && (
              <div className="mb-5 text-sm text-red-700 bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2 duration-200">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{reviewError}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setOpen(false);
                  setDraft(null);
                  setReviewError(null);
                }}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl font-semibold"
              >
                Болих
              </Button>
              <Button
                onClick={submitReview}
                disabled={saving || !draft.rating}
                className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/30"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Хадгалж байна...
                  </span>
                ) : (
                  "Хадгалах"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

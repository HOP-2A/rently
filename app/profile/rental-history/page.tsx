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

      {/* modal */}
      {open && draft && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border shadow-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Your review</h2>
                <p className="text-sm text-gray-600">
                  Rating 1–5, comment optional
                </p>
              </div>
              <button
                className="text-gray-500 hover:text-gray-800"
                onClick={() => {
                  setOpen(false);
                  setDraft(null);
                  setReviewError(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-800">
                Rating
              </label>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() =>
                      setDraft((p) => (p ? { ...p, rating: n } : p))
                    }
                    className={[
                      "px-3 py-2 rounded-xl border text-sm font-semibold",
                      draft.rating === n
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-800">
                Comment
              </label>
              <textarea
                value={draft.comment}
                onChange={(e) =>
                  setDraft((p) => (p ? { ...p, comment: e.target.value } : p))
                }
                className="mt-2 w-full min-h-[110px] rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Write your comment..."
              />
            </div>

            {reviewError && (
              <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                {reviewError}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setOpen(false);
                  setDraft(null);
                  setReviewError(null);
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={submitReview} disabled={saving}>
                {saving ? "Saving..." : "Save review"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type RequestType = "RENT_REQUEST" | "BUY_REQUEST";

type RentalRequestPayload = {
  listingId: string;
  landlordId: string;
  renterId: string;

  type: RequestType;
  message: string;

  moveInDate?: string | null;
  durationMonths?: number | null;

  phone?: string | null;
};

type Props = {
  listingId: string;
  landlordId: string;
  renterId: string;
  disabled?: boolean;

  listingTitle?: string;
  defaultPhone?: string | null;

  requestType: RequestType;
  buttonLabel?: string;
  modalTitle?: string;

  redirectTo?: string;
};

type ApiOk = { ok: true; requestId: string };
type ApiErr = { ok: false; error: string };

function isApiOk(x: unknown): x is ApiOk {
  if (typeof x !== "object" || x === null) return false;
  const rec = x as Record<string, unknown>;
  return rec.ok === true && typeof rec.requestId === "string";
}

function isApiErr(x: unknown): x is ApiErr {
  if (typeof x !== "object" || x === null) return false;
  const rec = x as Record<string, unknown>;
  return rec.ok === false && typeof rec.error === "string";
}

export default function RentalRequestButton({
  listingId,
  landlordId,
  renterId,
  disabled,
  listingTitle,
  defaultPhone,
  requestType,
  buttonLabel,
  modalTitle,
  redirectTo = "/",
}: Props) {
  const router = useRouter();

  const isRent = requestType === "RENT_REQUEST";

  const title =
    modalTitle ?? (isRent ? "Түрээслэх хүсэлт" : "Худалдаж авах хүсэлт");

  const btnText =
    buttonLabel ??
    (isRent ? "Түрээслэх хүсэлт илгээх" : "Худалдаж авах хүсэлт илгээх");

  const placeholderMsg = isRent
    ? "Сайн байна уу? Байрыг хэдэн сараар түрээслэх боломжтой вэ? ..."
    : "Сайн байна уу? Байрыг худалдаж авах талаар ярилцъя. Үнэ хэлэлцэх боломжтой юу? ...";

  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [moveInDate, setMoveInDate] = useState<string>("");
  const [durationMonths, setDurationMonths] = useState<string>("");
  const [phone, setPhone] = useState<string>(defaultPhone ?? "");

  const canSend = useMemo(() => {
    if (disabled) return false;
    if (!listingId || !landlordId || !renterId) return false;

    const okMessage = message.trim().length >= 5;

    const digitsOnly = phone.replace(/\D/g, "");
    const okPhone = digitsOnly.length === 8;

    if (!isRent) return okMessage && okPhone;

    const okDate = moveInDate.trim().length > 0;

    const durationNum = Number(durationMonths);
    const okDuration =
      Number.isFinite(durationNum) &&
      durationNum > 0 &&
      Number.isInteger(durationNum);

    return okMessage && okDate && okDuration && okPhone;
  }, [
    disabled,
    listingId,
    landlordId,
    renterId,
    message,
    phone,
    isRent,
    moveInDate,
    durationMonths,
  ]);

  const close = () => {
    setOpen(false);
    setError(null);
    setSuccess(null);
  };

  const resetForm = () => {
    setMessage("");
    setMoveInDate("");
    setDurationMonths("");
    setPhone(defaultPhone ?? "");
  };

  const submit = async () => {
    if (!canSend || sending) return;

    setSending(true);
    setError(null);
    setSuccess(null);

    const digitsOnly = phone.replace(/\D/g, "");

    const payload: RentalRequestPayload = {
      listingId,
      landlordId,
      renterId,
      type: requestType,

      message: message.trim(),
      phone: digitsOnly || null,

      moveInDate: isRent ? moveInDate || null : null,
      durationMonths: isRent
        ? durationMonths
          ? Number(durationMonths)
          : null
        : null,
    };

    try {
      const res = await fetch("/api/rental-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(payload),
      });

      const data: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = isApiErr(data)
          ? data.error
          : `Request failed (${res.status})`;
        throw new Error(msg);
      }

      setSuccess("✅ Хүсэлт амжилттай илгээгдлээ!");

      toast.success("Хүсэлт илгээгдлээ", {
        description: listingTitle ? `Зар: ${listingTitle}` : undefined,
      });

      close();
      resetForm();

      router.push(redirectTo);
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      toast.error("Алдаа гарлаа", { description: msg });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl font-semibold border transition hover:cursor-pointer
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}
        `}
        title={disabled ? "Нэвтэрсний дараа хүсэлт илгээнэ" : undefined}
      >
        {btnText}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border">
            <div className="p-6 border-b flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-xl font-bold leading-tight">{title}</h3>
                <p className="mt-1 text-sm text-gray-600 truncate">
                  Зар:{" "}
                  <span className="font-semibold">{listingTitle ?? "—"}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="h-10 w-10 shrink-0 rounded-full border flex items-center justify-center hover:bg-gray-50"
              >
                <span className="text-xl leading-none hover:cursor-pointer">
                  ×
                </span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {success && (
                <div className="rounded-2xl border bg-emerald-50 text-emerald-800 px-4 py-3 text-sm">
                  {success}
                </div>
              )}
              {error && (
                <div className="rounded-2xl border bg-rose-50 text-rose-800 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="text-sm font-semibold">Мессеж *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={placeholderMsg}
                  className="mt-2 w-full min-h-[120px] rounded-2xl border px-4 py-3 outline-none focus:ring-2 focus:ring-gray-200"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Доод тал нь 5 тэмдэгт.
                </div>
              </div>

              {isRent && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold">Нүүж орох *</label>
                    <input
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none focus:ring-2 focus:ring-gray-200"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold">
                      Хугацаа (сар) *
                    </label>
                    <input
                      inputMode="numeric"
                      value={durationMonths}
                      onChange={(e) => {
                        const next = e.target.value.replace(/[^\d]/g, "");
                        setDurationMonths(next);
                      }}
                      placeholder="6"
                      className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none focus:ring-2 focus:ring-gray-200"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold">
                  Холбогдох утас *
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9911xxxx"
                  className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none focus:ring-2 focus:ring-gray-200"
                />
                <div className="text-xs text-gray-500 mt-1">
                  8 оронтой дугаар.
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={close}
                className="flex-1 px-4 py-3 rounded-xl border font-semibold hover:bg-gray-50 hover:cursor-pointer"
              >
                Болих
              </button>

              <button
                onClick={submit}
                disabled={!canSend || sending}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white hover:cursor-pointer
                  ${
                    !canSend || sending
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }
                `}
              >
                {sending ? "Илгээж байна..." : "Илгээх"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

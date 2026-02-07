"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Search as SearchIcon,
  Users as UsersIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  BadgeCheck,
  Home,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Role = "RENTER" | "LANDLORD" | "ADMIN";

type UserDetail = {
  id: string;
  username: string;
  name: string;
  phone: string;
  email: string;
  about: string;
  avatar: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
};

type SearchUsersResponse = {
  users: UserDetail[];
};

function SkeletonRow() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-slate-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-44 rounded bg-slate-200 animate-pulse" />
          <div className="h-3 w-64 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="h-7 w-20 rounded-full bg-slate-200 animate-pulse" />
      </div>

      <div className="mt-4 space-y-2">
        <div className="h-3 w-56 rounded bg-slate-200 animate-pulse" />
        <div className="h-3 w-40 rounded bg-slate-200 animate-pulse" />
      </div>
    </div>
  );
}

function rolePill(role: Role) {
  const base =
    "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium";
  if (role === "LANDLORD")
    return (
      <span
        className={`${base} border-emerald-200 bg-emerald-50 text-emerald-700`}
      >
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        LANDLORD
      </span>
    );
  if (role === "ADMIN")
    return (
      <span className={`${base} border-slate-200 bg-slate-50 text-slate-700`}>
        <span className="h-2 w-2 rounded-full bg-slate-500" />
        ADMIN
      </span>
    );
  return (
    <span className={`${base} border-sky-200 bg-sky-50 text-sky-700`}>
      <span className="h-2 w-2 rounded-full bg-sky-500" />
      RENTER
    </span>
  );
}

export default function Page() {
  const [q, setQ] = useState<string>("");
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const typing = useMemo(() => q.trim().length > 0 && !loading, [q, loading]);
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(async () => {
      const term = q.trim();

      if (!term) {
        setUsers([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const res = await fetch(
        `/api/searchUsers?q=${encodeURIComponent(term)}`,
        {
          cache: "no-store",
        },
      );

      if (!res.ok) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const data: SearchUsersResponse = await res.json();
      setUsers(data.users ?? []);
      setLoading(false);
    }, 350);

    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="min-h-screen bg-slate-50">
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
          </div>
        </div>
      </header>
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 ring-1 ring-teal-100">
              <UsersIcon className="h-5 w-5 text-teal-600" />
            </div>
            <div className="leading-tight">
              <div className="text-base font-semibold text-slate-900">
                Хэрэглэгч хайх
              </div>
              <div className="text-xs text-slate-500">
                1 үсэг бичмэгц тухайн үсгээр эхэлсэн хэрэглэгчид гарна
              </div>
            </div>
          </div>

          <div className="w-[420px] max-w-full">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-full border border-slate-200 bg-white px-10 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-teal-200 focus:ring-4 focus:ring-teal-100"
                placeholder="Хайх..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />

              {typing && !loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:120ms]" />
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:240ms]" />
                </div>
              )}

              {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            {q.trim()
              ? `${users.length} хэрэглэгч олдлоо`
              : "Хайлт хийхийн тулд нэг үсэг бичнэ үү"}
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        )}

        {!loading && q.trim() && users.length === 0 && (
          <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-50 ring-1 ring-slate-200">
              <SearchIcon className="h-5 w-5 text-slate-500" />
            </div>
            <div className="mt-4 text-lg font-semibold text-slate-900">
              Хэрэглэгч олдсонгүй
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Өөр үсэг эсвэл нэрээр дахин хайгаад үзээрэй
            </div>
          </div>
        )}

        {!loading && users.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((u) => (
              <div
                key={u.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/user/${u.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/user/${u.id}`);
                  }
                }}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:cursor-pointer focus:outline-none focus:ring-4 focus:ring-teal-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
                      />
                    ) : (
                      <div className="grid h-11 w-11 place-items-center rounded-full bg-teal-50 text-teal-700 font-semibold ring-1 ring-teal-100">
                        {(u.name?.[0] ?? u.username?.[0] ?? "U").toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {u.name}
                      </div>
                      <div className="truncate text-xs text-slate-500">
                        @{u.username}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">{rolePill(u.role)}</div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <MailIcon className="h-4 w-4 text-slate-400" />
                    <span className="truncate">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <PhoneIcon className="h-4 w-4 text-slate-400" />
                    <span className="truncate">{u.phone}</span>
                  </div>

                  <div className="mt-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 ring-1 ring-slate-100">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <BadgeCheck className="h-4 w-4 text-teal-600" />
                      About
                    </div>
                    <div className="mt-1 line-clamp-2 text-slate-600">
                      {u.about || "—"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !q.trim() && (
          <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 ring-1 ring-teal-100">
              <UsersIcon className="h-5 w-5 text-teal-600" />
            </div>
            <div className="mt-4 text-base font-semibold text-slate-900">
              Хайлт эхлүүлэх
            </div>
            <div className="mt-1 text-sm text-slate-500 max-w-md">
              Дээрх хайлтын талбарт <span className="font-medium">1 үсэг</span>{" "}
              бичмэгц тухайн үсгээр эхэлсэн хэрэглэгчид автоматаар харагдана.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

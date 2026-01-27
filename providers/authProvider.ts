"use client";
import { useEffect, useState } from "react";

export type UserRole = "RENTER" | "LANDLORD" | "ADMIN";

export type AppUser = {
  id: string;
  clerkId: string;
  username: string;
  name: string | null;

  phone: string | null;
  email: string | null;
  about: string | null;
  avatar: string | null;

  role: UserRole;

  createdAt: string;
  updatedAt: string;
};

export function useAuth(clerkId: string | null | undefined) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function fetchUser(id: string) {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/auth/${clerkId}`, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(
            body?.error ?? `Failed to fetch user (${res.status})`,
          );
        }

        const data = (await res.json()) as AppUser;

        if (alive) setUser(data);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (clerkId) fetchUser(clerkId);
    else {
      setUser(null);
      setLoading(false);
      setError(null);
    }

    return () => {
      alive = false;
    };
  }, [clerkId]);

  return { user, loading, error };
}

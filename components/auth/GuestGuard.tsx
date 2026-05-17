"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

/** Redirect authenticated users away from login/register (per-tab session). */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (loading) return;
    if (user) {
      const redirect = searchParams.get("redirect") || "/dashboard";
      router.replace(redirect);
    }
  }, [user, loading, router, searchParams]);

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </section>
    );
  }

  if (user) return null;

  return <>{children}</>;
}

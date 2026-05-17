"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const STAFF_ONLY_PREFIXES = ["/analytics", "/users"];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isStaff } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    const staffOnly = STAFF_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
    if (staffOnly && !isStaff) {
      router.replace("/dashboard");
    }
  }, [user, loading, isStaff, pathname, router]);

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </section>
    );
  }

  if (!user) return null;

  const staffOnly = STAFF_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  if (staffOnly && !isStaff) return null;

  return <>{children}</>;
}

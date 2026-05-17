"use client";

import { Suspense } from "react";
import { GuestGuard } from "@/components/auth/GuestGuard";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <section className="flex min-h-screen items-center justify-center">
          <Skeleton className="h-12 w-48" />
        </section>
      }
    >
      <GuestGuard>{children}</GuestGuard>
    </Suspense>
  );
}

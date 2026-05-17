import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Page auth is enforced client-side via RouteGuard + sessionStorage (per-tab).
 * Middleware no longer reads shared cookies so tabs cannot overwrite each other.
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tickets/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/analytics/:path*",
    "/users/:path*",
    "/login",
    "/register",
  ],
};

// Route protection at the edge, before a page even renders.
//
// This checks for a session cookie and redirects to /login if it's missing.
// It's a SEPARATE, additional layer from the client-side `useAuth` hook:
//   - middleware.ts  -> stops unauthenticated PAGE LOADS (runs on the server)
//   - useAuth()       -> hides/shows UI based on ROLE once logged in (runs in the browser)
//   - the real API    -> must ALSO check permissions on every request; never
//                        trust the frontend alone for security.
//
// NOTE: this demo signs in by writing a plain cookie from the client for
// simplicity. In production, set an HttpOnly cookie from a real server-side
// login endpoint so the token can't be read or forged by client JavaScript.

import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/api"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const session = request.cookies.get("session")?.value;

  if (!session && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on every route except static assets and the API itself.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;
  const session = sessionToken ? await decryptSession(sessionToken) : null;
  const { pathname } = request.nextUrl;

  // Protect /dashboard and its subroutes
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated students away from auth screens
  if (pathname === "/login") {
    if (session) {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};

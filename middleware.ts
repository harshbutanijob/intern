import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const url = req.nextUrl.clone();
  const path = url.pathname;

  // If not logged in → redirect to login
  if (!token) {
    if (
      path.startsWith("/dashboard") ||
      path.startsWith("/admin") ||
      path.startsWith("/users") ||
      path.startsWith("/interns") ||
      path.startsWith("/manager")
    ) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  const role = token?.role;

  // ADMIN ACCESS
  if (role === "admin") {
    return NextResponse.next();
  }

  // MANAGER ACCESS — can only access /dashboard/manager and /manager/*
  if (role === "manager") {
    if (
      path.startsWith("/dashboard/manager") ||
      path.startsWith("/manager")
    ) {
      return NextResponse.next();
    }
    url.pathname = "/dashboard/manager";
    return NextResponse.redirect(url);
  }

  // INTERN ACCESS — can only access /dashboard/user and /interns/*
  if (role === "intern") {
    if (
      path.startsWith("/dashboard/user") ||
      path.startsWith("/interns")
    ) {
      return NextResponse.next();
    }
    url.pathname = "/dashboard/user";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/manager/:path*",
    "/users/:path*",
    "/interns/:path*",
  ],
};
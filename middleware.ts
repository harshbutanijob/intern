import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    // optional: you can set your JWT cookie name here if custom
  });

  const url = req.nextUrl.clone();

  // Protect dashboard
  if (url.pathname.startsWith("/dashboard")) {
    if (!token) {
      // Redirect to login if not logged in
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Apply middleware only to dashboard routes
export const config = {
  matcher: ["/dashboard/:path*"],
};
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Define protected routes that require authentication
const protectedRoutes = ["/data", "/data/Energyinput", "/data/Energyoutput", "/data/option3"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if the path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  if (isProtectedRoute) {
    // Get the session token from the request
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });
    
    // If no token exists, redirect to login
    if (!token) {
      const url = new URL(`/auth/login`, request.url);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }
  }
  
  // For non-protected routes or authenticated users, continue as normal
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all protected routes
    "/data/:path*",
    // Don't match API routes, static files, or images
    "/((?!api|_next/static|_next/image|favicon.ico|assets).*)",
  ],
};
import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnData = req.nextUrl.pathname.startsWith("/data");
  
  if (isOnData && !isLoggedIn) {
    return Response.redirect(new URL("/auth/login", req.nextUrl));
  }
});

// Optionally, configure which routes to run middleware on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
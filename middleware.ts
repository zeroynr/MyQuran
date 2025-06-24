// middleware.ts - Place this in your root directory (same level as app/)
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/admin"];
  const adminOnlyRoutes = ["/admin"];
  const userOnlyRoutes = ["/dashboard"];

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    url.pathname.startsWith(route)
  );

  // If trying to access protected route without authentication
  if (isProtectedRoute && !user) {
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  // If user is authenticated, check role-based access
  if (user && isProtectedRoute) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const userRole = profile?.role || "user";

      // Admin trying to access user dashboard - redirect to admin
      if (
        userRole === "admin" &&
        userOnlyRoutes.some((route) => url.pathname.startsWith(route))
      ) {
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      }

      // Regular user trying to access admin routes - redirect to dashboard
      if (
        userRole === "user" &&
        adminOnlyRoutes.some((route) => url.pathname.startsWith(route))
      ) {
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      // If role check fails, redirect to dashboard for safety
      if (adminOnlyRoutes.some((route) => url.pathname.startsWith(route))) {
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  // If authenticated user visits auth page, redirect based on role
  if (user && url.pathname === "/auth") {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const userRole = profile?.role || "user";

      if (userRole === "admin") {
        url.pathname = "/admin";
      } else {
        url.pathname = "/dashboard";
      }

      return NextResponse.redirect(url);
    } catch (error) {
      console.error("Error checking user role:", error);
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

const ROLE_DASHBOARD: Record<string, string> = {
  PATIENT: "/patient",
  DOCTOR: "/doctor",
  ADMIN: "/admin",
}

const PUBLIC_ROUTES = ["/", "/login", "/register", "/privacy", "/terms", "/articles", "/outbreaks"]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // If user is logged in and visits login/register, send them to dashboard
  if (session && (pathname === "/login" || pathname === "/register")) {
    const dest = ROLE_DASHBOARD[session.user.role] ?? "/patient"
    return NextResponse.redirect(new URL(dest, req.url))
  }

  // Allow public routes without redirecting
  if (
    pathname === "/" ||
    PUBLIC_ROUTES.some((route) => route !== "/" && pathname.startsWith(route))
  ) {
    return NextResponse.next()
  }

  // Require auth for all other routes
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const role = session.user.role

  // Role-based path protection
  if (pathname.startsWith("/patient") && role !== "PATIENT") {
    return NextResponse.redirect(new URL(ROLE_DASHBOARD[role] ?? "/", req.url))
  }
  if (pathname.startsWith("/doctor") && role !== "DOCTOR") {
    return NextResponse.redirect(new URL(ROLE_DASHBOARD[role] ?? "/", req.url))
  }
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL(ROLE_DASHBOARD[role] ?? "/", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

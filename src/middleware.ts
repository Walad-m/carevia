import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

// Ensure NEXTAUTH_URL or AUTH_URL never forces localhost in production or on Vercel
if (typeof process !== "undefined" && process.env) {
  const isVercel = Boolean(
    process.env.VERCEL ||
    process.env.VERCEL_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL
  )
  const isProd = process.env.NODE_ENV === "production"
  const hasLocalhostUrl =
    process.env.NEXTAUTH_URL?.includes("localhost") ||
    process.env.AUTH_URL?.includes("localhost")

  if (isVercel || (isProd && hasLocalhostUrl)) {
    delete process.env.NEXTAUTH_URL
    delete process.env.AUTH_URL

    const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
    if (host) {
      process.env.NEXTAUTH_URL = `https://${host}`
      process.env.AUTH_URL = `https://${host}`
    }
  }
}

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
    return NextResponse.redirect(new URL(dest, req.nextUrl))
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
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  const role = session.user.role

  // Role-based path protection
  if (pathname.startsWith("/patient") && role !== "PATIENT") {
    return NextResponse.redirect(new URL(ROLE_DASHBOARD[role] ?? "/", req.nextUrl))
  }
  if (pathname.startsWith("/doctor") && role !== "DOCTOR") {
    return NextResponse.redirect(new URL(ROLE_DASHBOARD[role] ?? "/", req.nextUrl))
  }
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL(ROLE_DASHBOARD[role] ?? "/", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

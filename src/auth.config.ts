import type { NextAuthConfig } from "next-auth"
import { Role } from "@prisma/client"

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

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as { role: Role }).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // If a relative URL is given, return as-is
      if (url.startsWith("/")) return url

      try {
        const parsedUrl = new URL(url)
        // If it's localhost or mismatch, strip the domain and keep the path
        if (parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1") {
          return parsedUrl.pathname + parsedUrl.search
        }
        const parsedBase = new URL(baseUrl)
        if (parsedUrl.origin === parsedBase.origin) {
          return url
        }
        return parsedUrl.pathname + parsedUrl.search
      } catch {
        return "/login"
      }
    },
  },
  providers: [], // Configured with credentials in src/lib/auth.ts
} satisfies NextAuthConfig

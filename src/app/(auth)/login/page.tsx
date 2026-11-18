"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"

function LoginForm() {
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered")
  const deleted = searchParams.get("deleted")

  const [form, setForm] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email: form.email.toLowerCase().trim(),
      password: form.password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password. Please try again.")
      setLoading(false)
      return
    }

    // Check if there was an explicit protected callbackUrl
    const callbackUrl = searchParams.get("callbackUrl")
    if (
      callbackUrl &&
      !callbackUrl.startsWith("/api") &&
      callbackUrl !== "/" &&
      callbackUrl !== "/login"
    ) {
      window.location.assign(callbackUrl)
      return
    }

    // Determine dashboard from session role and route directly (never to the home page)
    try {
      const res = await fetch("/api/auth/session")
      const session = await res.json()
      const role = session?.user?.role

      if (role === "DOCTOR") {
        window.location.assign("/doctor")
      } else if (role === "ADMIN") {
        window.location.assign("/admin")
      } else {
        window.location.assign("/patient")
      }
    } catch {
      // Fallback: /login is intercepted by middleware and forwarded to the role dashboard
      window.location.assign("/patient")
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Welcome back</h1>
        <p className="text-slate-500 text-sm mt-1">Sign in to your Carevia account</p>
      </div>

      {registered && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <p className="text-emerald-700 text-xs">
            Account created successfully. Please sign in with your credentials.
          </p>
        </div>
      )}

      {deleted && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-amber-800 text-xs">
            Your account and data have been completely erased under Act 843.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Email address
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
          Create one
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-400">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}

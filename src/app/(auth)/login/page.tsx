"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"

function LoginForm() {
  const router = useRouter()
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

    // Check if there was an explicit protected callbackUrl and sanitize to relative path
    const callbackUrl = searchParams.get("callbackUrl")
    if (callbackUrl) {
      let targetPath: string | null = null
      try {
        if (callbackUrl.startsWith("http://") || callbackUrl.startsWith("https://")) {
          const parsed = new URL(callbackUrl)
          targetPath = parsed.pathname + parsed.search
        } else if (callbackUrl.startsWith("/")) {
          targetPath = callbackUrl
        }
      } catch {
        targetPath = null
      }

      if (
        targetPath &&
        !targetPath.startsWith("/api") &&
        targetPath !== "/" &&
        targetPath !== "/login"
      ) {
        router.push(targetPath)
        router.refresh()
        return
      }
    }

    // Determine dashboard from session role and route directly
    try {
      const res = await fetch("/api/auth/session")
      const session = await res.json()
      const role = session?.user?.role

      if (role === "DOCTOR") {
        router.push("/doctor")
      } else if (role === "ADMIN") {
        router.push("/admin")
      } else {
        router.push("/patient")
      }
      router.refresh()
    } catch {
      router.push("/patient")
      router.refresh()
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 font-sans">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Welcome back</h1>
        <p className="text-slate-500 text-sm mt-1">Sign in to your Carevia account</p>
      </div>

      {registered && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <p className="text-emerald-700 text-sm">
            Account created successfully. Please sign in with your credentials.
          </p>
        </div>
      )}

      {deleted && (
        <div className="mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-slate-700 text-sm">
            Your account and personal health data have been completely erased under Act 843.
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
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition bg-white"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-700">Password</label>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition pr-10 bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-950 hover:bg-black disabled:bg-slate-300 text-white font-medium py-3 px-4 rounded-full text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 mt-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-slate-950 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>

      <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">Demo Credentials:</p>
        <p>• Patient: <code className="text-slate-900 bg-white px-1 py-0.5 rounded border border-slate-200">patient@carevia.gh</code> / <code className="text-slate-900 bg-white px-1 py-0.5 rounded border border-slate-200">password123</code></p>
        <p>• Doctor: <code className="text-slate-900 bg-white px-1 py-0.5 rounded border border-slate-200">dr.mensah@carevia.gh</code> / <code className="text-slate-900 bg-white px-1 py-0.5 rounded border border-slate-200">password123</code></p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-400">Loading…</div>}>
      <LoginForm />
    </Suspense>
  )
}

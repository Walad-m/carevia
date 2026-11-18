import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function HomeNavbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-semibold text-lg tracking-tight text-slate-950">
              Carevia
            </span>
            <span className="text-[10px] font-medium text-slate-400 border border-slate-200/80 rounded-full px-2 py-0.5">
              Ghana
            </span>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-normal text-slate-500">
            <a href="#overview" className="hover:text-slate-950 transition">
              Overview
            </a>
            <a href="#features" className="hover:text-slate-950 transition">
              How It Works
            </a>
            <a href="#physicians" className="hover:text-slate-950 transition">
              Physicians
            </a>
            <a href="#pricing" className="hover:text-slate-950 transition">
              Pricing
            </a>
            <a href="#privacy" className="hover:text-slate-950 transition">
              Security
            </a>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-normal text-slate-600 hover:text-slate-950 px-3 py-1.5 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-950 text-white px-4 py-1.5 rounded-full hover:bg-black transition active:scale-95 shadow-xs"
            >
              <span>Book Consult</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

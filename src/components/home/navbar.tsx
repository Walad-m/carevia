import Link from "next/link"
import { Stethoscope, PhoneCall, ArrowRight } from "lucide-react"

export function HomeNavbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & MDC Badge */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-black transition">
                <Stethoscope size={20} className="stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xl tracking-tight text-slate-900">Carevia</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-full">
                    Ghana
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                  MDC Verified Telehealth
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#outbreak-radar" className="hover:text-slate-900 transition flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              Outbreak Radar
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 transition">
              How It Works
            </a>
            <a href="#health-articles" className="hover:text-slate-900 transition">
              Health Articles
            </a>
            <a href="#pricing" className="hover:text-slate-900 transition">
              Pricing (-20%)
            </a>
            <a href="#trust" className="hover:text-slate-900 transition">
              Trust & Safety
            </a>
          </nav>

          {/* Action buttons: Only Sign In and Sign Up */}
          <div className="flex items-center gap-3">
            <a
              href="tel:112"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition"
              title="National Ambulance Service Ghana"
            >
              <PhoneCall size={12} className="animate-pulse" />
              Emergency: 112
            </a>

            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 px-4 py-2 rounded-full hover:bg-slate-100 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-slate-900 text-white px-5 py-2 rounded-full hover:bg-black transition shadow-xs active:scale-95"
            >
              <span>Sign Up</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

"use client"

import Link from "next/link"
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Video,
  Clock,
  Activity,
  User,
  Sparkles,
} from "lucide-react"

export function HomeHeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-16 sm:pt-20 pb-20 sm:pb-28 border-b border-slate-200/80 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Authentic Brand Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-800 px-3.5 py-1 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Accredited Telehealth Platform · MDC Ghana</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.08]">
              Healthcare designed around your life.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Carevia connects families and working professionals across Ghana directly with verified physicians. Experience immediate consultations, digital prescriptions, and transparent flat pricing — accessible anywhere from your phone or laptop.
            </p>

            {/* Apple Style CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-semibold text-sm sm:text-base px-7 py-3.5 rounded-full transition shadow-xs active:scale-95 cursor-pointer"
              >
                <span>Book a Consultation</span>
                <ArrowRight size={17} />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-semibold text-sm sm:text-base px-6 py-3.5 rounded-full transition shadow-xs active:scale-95"
              >
                <span>How It Works</span>
              </a>
            </div>

            {/* Trust Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-100 text-xs">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">&lt; 15m</p>
                <p className="text-slate-500 mt-0.5">Avg. wait for on-duty doctor</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">100%</p>
                <p className="text-slate-500 mt-0.5">MDC Ghana Accredited</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">GH₵ 80</p>
                <p className="text-slate-500 mt-0.5">Flat GP consultation fee</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">Act 843</p>
                <p className="text-slate-500 mt-0.5">Encrypted health privacy</p>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Apple Telehealth Consultation Preview Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-7 space-y-6 relative">
              
              {/* Telehealth Status Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>On-Duty Teleconsultation Session</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  Room HD-2026
                </span>
              </div>

              {/* Attending Doctor Profile Card */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <div className="w-13 h-13 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                  <User size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base truncate">Dr. Kwame Mensah</h3>
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    General Practice / Family Medicine
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    MDC ID: MDC/GP/2019/0421
                  </p>
                </div>
              </div>

              {/* Live Consultation Vitals Preview */}
              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pulse</span>
                  <span className="text-slate-900 font-mono font-bold text-sm">74 bpm</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Blood Press.</span>
                  <span className="text-slate-900 font-mono font-bold text-sm">118/76</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">SpO2</span>
                  <span className="text-slate-900 font-mono font-bold text-sm">99%</span>
                </div>
              </div>

              {/* Consultation Features & Privacy */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Video size={14} className="text-slate-900 shrink-0" />
                  <span>Two-way encrypted HD video with screen sharing</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-slate-900 shrink-0" />
                  <span>Instant digital prescription sent to patient dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-slate-900 shrink-0" />
                  <span>Automatic doctor fallback rerouting if physician is occupied</span>
                </div>
              </div>

              {/* Consultation Booking Action */}
              <Link
                href="/register"
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-semibold text-xs sm:text-sm py-4 rounded-full transition shadow-xs active:scale-95 cursor-pointer"
              >
                <Video size={16} />
                <span>Start Telehealth Consultation (GH₵ 80)</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

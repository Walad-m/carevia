"use client"

import Link from "next/link"
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Video,
  Mic,
  FileText,
  PhoneOff,
} from "lucide-react"

export function HomeHeroSection() {
  return (
    <section id="overview" className="relative overflow-hidden bg-white pt-16 sm:pt-24 pb-20 sm:pb-32 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Subtle Category Eyebrow */}
        <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 tracking-wide uppercase mb-4">
          <span>Telehealth for Ghana</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="text-slate-900 font-semibold">MDC Verified</span>
        </div>

        {/* Apple-style Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-slate-950 max-w-4xl mx-auto leading-[1.05]">
          See a doctor now. <br className="hidden sm:inline" />
          <span className="text-slate-400">Right from your phone.</span>
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto font-normal leading-relaxed">
          Direct, encrypted video consultations with licensed Ghanaian physicians.
          Voice-guided symptom intake, instant digital prescriptions, and flat-rate pricing.
        </p>

        {/* Apple Pill Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-slate-950 hover:bg-black text-white font-medium text-sm sm:text-base px-8 py-3.5 rounded-full transition shadow-xs active:scale-95"
          >
            <span>Book a Consultation</span>
            <ArrowRight size={16} />
          </Link>

          <a
            href="#features"
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-slate-900 font-medium text-sm sm:text-base px-7 py-3.5 rounded-full transition active:scale-95"
          >
            <span>How it works</span>
          </a>
        </div>

        {/* Pricing Subtext */}
        <p className="mt-4 text-xs text-slate-400">
          GH₵ 80 flat per consultation · Pay with MTN MoMo, Telecel Cash, or Card
        </p>

        {/* Grand Apple Device Mockup / Consultation Showpiece */}
        <div className="mt-14 sm:mt-20 max-w-4xl mx-auto">
          <div className="rounded-[2.5rem] bg-[#f5f5f7] p-3 sm:p-4 border border-black/[0.08] shadow-2xl">
            {/* Inner Display Screen */}
            <div className="rounded-[2rem] bg-slate-950 text-white overflow-hidden shadow-inner relative aspect-[16/10] sm:aspect-[16/9] flex flex-col justify-between p-4 sm:p-8">
              
              {/* Screen Top Bar */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm sm:text-base">Dr. Kwame Mensah</span>
                      <CheckCircle2 size={15} className="text-emerald-400" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      General Practice · MDC/GP/2019/0421
                    </span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-slate-300">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>256-Bit Encrypted Call</span>
                </div>
              </div>

              {/* Center Simulation: Clean FaceTime Aesthetics */}
              <div className="my-auto text-center space-y-2 py-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 mx-auto flex items-center justify-center border-2 border-white/20 shadow-xl">
                  <span className="font-semibold text-2xl sm:text-3xl tracking-tight text-white">KM</span>
                </div>
                <div>
                  <p className="text-sm sm:text-base font-medium text-slate-200">
                    Live Video Session Active
                  </p>
                  <p className="text-xs text-slate-400">
                    Kofi Boateng (Patient) & Dr. Kwame Mensah
                  </p>
                </div>
              </div>

              {/* Patient PiP (Picture in Picture) preview in corner */}
              <div className="absolute right-4 bottom-20 sm:right-8 sm:bottom-24 w-24 h-32 sm:w-32 sm:h-44 rounded-2xl bg-slate-800 border-2 border-white/20 shadow-2xl overflow-hidden flex flex-col justify-end p-2.5 text-left">
                <span className="text-[10px] font-medium text-white/90 bg-black/60 px-1.5 py-0.5 rounded-md inline-block w-fit">
                  You
                </span>
              </div>

              {/* Bottom Vitals & Frosted Controls */}
              <div className="z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/10">
                {/* Vitals */}
                <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
                  <span>Pulse: <strong className="text-white">74 bpm</strong></span>
                  <span className="text-slate-600">|</span>
                  <span>BP: <strong className="text-white">118/76</strong></span>
                  <span className="text-slate-600">|</span>
                  <span>SpO2: <strong className="text-white">99%</strong></span>
                </div>

                {/* Apple FaceTime Floating Control Bar */}
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-xl px-4 py-2 rounded-full border border-white/15">
                  <div className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer transition">
                    <Mic size={14} />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer transition">
                    <Video size={14} />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer transition">
                    <FileText size={14} />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center text-white cursor-pointer transition">
                    <PhoneOff size={14} />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Four Subtle Value Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 max-w-4xl mx-auto text-left">
          <div className="border-t border-slate-200/80 pt-4">
            <span className="block text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight">&lt; 15 min</span>
            <span className="text-xs text-slate-500 mt-1 block">Average wait time for an on-duty physician</span>
          </div>
          <div className="border-t border-slate-200/80 pt-4">
            <span className="block text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight">100%</span>
            <span className="text-xs text-slate-500 mt-1 block">Verified MDC Ghana licensed practitioners</span>
          </div>
          <div className="border-t border-slate-200/80 pt-4">
            <span className="block text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight">GH₵ 80</span>
            <span className="text-xs text-slate-500 mt-1 block">Flat transparent fee, 20% below standard clinic rates</span>
          </div>
          <div className="border-t border-slate-200/80 pt-4">
            <span className="block text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight">Act 843</span>
            <span className="text-xs text-slate-500 mt-1 block">Ghana Data Protection Act medical privacy</span>
          </div>
        </div>

      </div>
    </section>
  )
}

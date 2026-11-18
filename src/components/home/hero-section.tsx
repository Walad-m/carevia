"use client"

import Link from "next/link"
import Image from "next/image"
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
        <div className="mt-10 sm:mt-20 max-w-4xl mx-auto">
          <div className="rounded-[2rem] sm:rounded-[2.5rem] bg-[#f5f5f7] p-2.5 sm:p-4 border border-black/[0.08] shadow-2xl">
            {/* Inner Display Screen with Real Consultation Video Simulation */}
            <div className="rounded-[1.6rem] sm:rounded-[2rem] bg-slate-950 text-white overflow-hidden shadow-inner relative min-h-[380px] sm:min-h-[460px] md:min-h-0 md:aspect-[16/9] flex flex-col justify-between p-3.5 sm:p-7">
              {/* Doctor Background Video Still */}
              <Image
                src="/images/doctor-call.jpg"
                alt="Dr. Kwame Mensah Telehealth Consultation"
                fill
                priority
                unoptimized
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/70 pointer-events-none" />

              {/* Screen Top Bar */}
              <div className="flex items-center justify-between z-10 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 bg-black/60 backdrop-blur-md px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full border border-white/15">
                  <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <div className="text-left">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <span className="font-semibold text-xs sm:text-sm">Dr. Kwame Mensah</span>
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-slate-300 font-mono block">
                      General Practice · MDC/GP/2019/0421
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono bg-black/60 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/15 text-slate-200">
                  <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
                  <span className="hidden sm:inline">256-Bit Encrypted Call</span>
                  <span className="sm:hidden">Encrypted</span>
                </div>
              </div>

              {/* Center Overlay: Clean FaceTime Aesthetics */}
              <div className="my-auto text-center z-10 py-2 sm:py-4">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs text-white shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="font-semibold">Live Video Consultation</span>
                  <span className="hidden sm:inline text-white/60">· Kofi Boateng & Dr. Kwame Mensah</span>
                </div>
              </div>

              {/* Patient PiP (Picture in Picture) preview in corner */}
              <div className="absolute right-3 bottom-16 sm:right-6 sm:bottom-20 md:right-8 md:bottom-22 w-20 h-28 sm:w-32 sm:h-44 md:w-36 md:h-48 rounded-xl sm:rounded-2xl border-2 border-white/30 shadow-2xl overflow-hidden z-20">
                <Image
                  src="/images/patient-call.jpg"
                  alt="Patient Kofi Boateng"
                  fill
                  unoptimized
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 text-[8px] sm:text-[10px] font-semibold text-white bg-black/70 backdrop-blur-md px-1.5 py-0.5 sm:px-2 rounded border border-white/10">
                  You (Kofi)
                </span>
              </div>

              {/* Bottom Vitals & Frosted Controls */}
              <div className="z-10 flex items-center justify-between gap-2 pt-2.5 sm:pt-3 border-t border-white/10">
                {/* Vitals */}
                <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-mono text-slate-300">
                  <span>Pulse: <strong className="text-white">74</strong></span>
                  <span className="text-slate-600">|</span>
                  <span>BP: <strong className="text-white">118/76</strong></span>
                  <span className="text-slate-600 hidden sm:inline">|</span>
                  <span className="hidden sm:inline">SpO2: <strong className="text-white">99%</strong></span>
                </div>

                {/* Apple FaceTime Floating Control Bar */}
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/15 backdrop-blur-xl px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/15">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition">
                    <Mic size={13} />
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition">
                    <Video size={13} />
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition">
                    <FileText size={13} />
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center text-white transition">
                    <PhoneOff size={13} />
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

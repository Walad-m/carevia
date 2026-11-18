"use client"

import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 sm:py-32 bg-white font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Eyebrow */}
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-3">
          Transparent Pricing
        </p>

        {/* Title */}
        <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-950 leading-[1.1]">
          One flat rate. <br className="hidden sm:inline" />
          <span className="text-slate-400">No surprises.</span>
        </h2>

        <p className="mt-4 text-base sm:text-lg text-slate-500 max-w-xl mx-auto font-normal">
          Fair, transparent healthcare pricing for every Ghanaian. Pay only when you need care.
        </p>

        {/* Apple Style Focused Pricing Card */}
        <div className="mt-12 sm:mt-16 bg-[#f5f5f7] rounded-[2.5rem] p-8 sm:p-12 border border-black/[0.06] text-left max-w-2xl mx-auto shadow-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-6 border-b border-slate-200/80">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Standard Telehealth Consultation
              </span>
              <h3 className="text-2xl font-semibold text-slate-950 tracking-tight">
                General Practice & Family Medicine
              </h3>
            </div>
            
            <div className="text-left sm:text-right shrink-0">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-950">
                  GH₵ 80
                </span>
                <span className="text-sm text-slate-400 line-through">GH₵ 100</span>
              </div>
              <span className="text-xs text-slate-500 font-medium block mt-0.5">
                Save 20% · Per session
              </span>
            </div>
          </div>

          {/* Features */}
          <div className="py-8 space-y-3.5 text-sm text-slate-700 font-normal">
            <div className="flex items-center gap-3">
              <Check size={16} className="text-slate-950 shrink-0 stroke-[2.5]" />
              <span>Two-way encrypted HD video with an accredited Ghanaian doctor</span>
            </div>
            <div className="flex items-center gap-3">
              <Check size={16} className="text-slate-950 shrink-0 stroke-[2.5]" />
              <span>Voice or text symptom intake for rapid physician preparation</span>
            </div>
            <div className="flex items-center gap-3">
              <Check size={16} className="text-slate-950 shrink-0 stroke-[2.5]" />
              <span>Official MDC-signed digital prescription valid nationwide</span>
            </div>
            <div className="flex items-center gap-3">
              <Check size={16} className="text-slate-950 shrink-0 stroke-[2.5]" />
              <span>Automatic doctor fallback routing if attending doctor is occupied</span>
            </div>
            <div className="flex items-center gap-3">
              <Check size={16} className="text-slate-950 shrink-0 stroke-[2.5]" />
              <span>Pay instantly with MTN Mobile Money, Telecel Cash, or Card</span>
            </div>
          </div>

          {/* Action */}
          <div className="pt-6 border-t border-slate-200/80">
            <Link
              href="/register"
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-black text-white font-medium text-sm sm:text-base py-4 rounded-full transition shadow-xs active:scale-95"
            >
              <span>Book a Consultation (GH₵ 80)</span>
              <ArrowRight size={16} />
            </Link>
            <p className="text-center text-xs text-slate-400 mt-3 font-normal">
              No subscription or recurring charges. Instant receipt upon checkout.
            </p>
          </div>

        </div>

      </div>
    </section>
  )
}

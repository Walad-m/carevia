"use client"

import { MessageSquare, Video, FileText, Smartphone, ArrowRight } from "lucide-react"
import Link from "next/link"

const FEATURES = [
  {
    title: "Intelligent Triage",
    desc: "Speak naturally in English or local Ghanaian languages, or type how you feel. Clinical AI analyzes symptoms so your doctor is prepared before you say hello.",
    badge: "Smart Intake",
    icon: MessageSquare,
  },
  {
    title: "FaceTime-Quality Video",
    desc: "Connect instantly with verified Ghanaian physicians over low-bandwidth WebRTC video engineered to stay stable across MTN, Telecel, and AT networks.",
    badge: "Encrypted HD",
    icon: Video,
  },
  {
    title: "Official Digital Prescriptions",
    desc: "Receive MDC-compliant digital prescriptions and doctor clinical notes saved securely in your portal. Take them to any licensed pharmacy nationwide.",
    badge: "Paperless Care",
    icon: FileText,
  },
  {
    title: "Instant Mobile Money",
    desc: "Simple, transparent GH₵ 80 flat fee. Authorize directly from your phone with MTN MoMo, Telecel Cash, or credit/debit card with zero hidden charges.",
    badge: "Instant Checkout",
    icon: Smartphone,
  },
]

export function HowItWorksSection() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-[#f5f5f7] font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Apple-style Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Care Pathway
          </p>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-950 leading-[1.1]">
            Care designed for simplicity. <br className="hidden sm:inline" />
            <span className="text-slate-400">At every touchpoint.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-500 max-w-xl mx-auto font-normal">
            No crowded waiting rooms, no traffic delays, no guesswork. Immediate access to qualified Ghanaian medical doctors.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="bg-white rounded-3xl p-8 sm:p-10 border border-black/[0.05] shadow-xs flex flex-col justify-between hover:border-black/[0.1] transition group"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-[#f5f5f7] flex items-center justify-center text-slate-900 group-hover:scale-105 transition">
                      <Icon size={22} className="stroke-[1.8]" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 bg-[#f5f5f7] px-3 py-1 rounded-full border border-slate-200/60">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-semibold text-slate-950 tracking-tight mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-8 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Carevia Platform Standard</span>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-900 hover:text-black group-hover:translate-x-0.5 transition"
                  >
                    <span>Get started</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

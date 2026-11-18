"use client"

import { ShieldCheck, Lock, AlertTriangle, UserCheck } from "lucide-react"

const TRUST_PILLARS = [
  {
    title: "MDC Ghana Verified",
    desc: "Every practicing doctor is cross-verified against the Medical and Dental Council (MDC) official practitioner roll with valid pin and active retention certificate.",
    icon: ShieldCheck,
  },
  {
    title: "Act 843 Medical Privacy",
    desc: "Your clinical notes, voice recordings, and consultation records are strictly confidential under Ghana's Data Protection Act, 2012. We never share patient data.",
    icon: Lock,
  },
  {
    title: "Emergency Red Flagging",
    desc: "Intake continuously screens for high-risk cardiac, stroke, and pediatric emergencies, instantly redirecting to the 112 Ghana Emergency dispatch.",
    icon: AlertTriangle,
  },
  {
    title: "Always Human Oversight",
    desc: "AI acts strictly as a clinical intake assistant. Licensed medical doctors make 100% of diagnostic evaluations, prescriptions, and care plans.",
    icon: UserCheck,
  },
]

export function TrustLayerSection() {
  return (
    <section id="privacy" className="py-24 sm:py-32 bg-[#f5f5f7] font-sans border-t border-black/[0.05]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Trust & Compliance
          </p>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-950 leading-[1.1]">
            Privacy is a fundamental right. <br className="hidden sm:inline" />
            <span className="text-slate-400">Especially in healthcare.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-500 font-normal">
            Built from the ground up to respect Ghanaian clinical guidelines and data sovereignty.
          </p>
        </div>

        {/* 4 Clean Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_PILLARS.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.title}
                className="bg-white rounded-3xl p-7 border border-black/[0.05] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-[#f5f5f7] flex items-center justify-center text-slate-950 mb-5">
                    <Icon size={19} className="stroke-[2]" />
                  </div>
                  <h3 className="font-semibold text-base text-slate-950 mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

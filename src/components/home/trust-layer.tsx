import { ShieldCheck, Lock, AlertTriangle, UserCheck } from "lucide-react"

const TRUST_PILLARS = [
  {
    title: "MDC Ghana Verified",
    desc: "Every practicing doctor is cross-verified against the Medical and Dental Council (MDC) official practitioner roll with valid pin and active retention certificate.",
    icon: ShieldCheck,
  },
  {
    title: "Privacy by Design (Act 843)",
    desc: "Your clinical notes, voice recordings, and consult records are strictly confidential under Ghana's Data Protection Act, 2012. We never sell or share patient data.",
    icon: Lock,
  },
  {
    title: "Emergency Red Flagging",
    desc: "Intake continuously screens for high-risk cardiac, stroke, pediatric, and respiratory emergencies, instantly redirecting to 112 Ghana Emergency dispatch.",
    icon: AlertTriangle,
  },
  {
    title: "Always Human Oversight",
    desc: "AI acts strictly as a clinical intake assistant. It never provides speculative medical diagnoses. Licensed medical doctors make all clinical evaluations and prescriptions.",
    icon: UserCheck,
  },
]

export function TrustLayerSection() {
  return (
    <section id="trust" className="py-20 sm:py-24 bg-[#0a0a0c] text-white font-sans border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-white/10 text-white border border-white/15 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            Security & Clinical Rigor
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            The Carevia Trust Layer
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Built to provide Ghanaian patients and families with complete clinical confidence and legal compliance.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_PILLARS.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.title}
                className="bg-white/5 border border-white/10 rounded-3xl p-7 hover:border-white/20 transition flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 text-white flex items-center justify-center mb-5">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-base text-white mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
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

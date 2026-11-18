import { MessageSquare, UserCheck, Video, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"

const STEPS = [
  {
    number: "01",
    title: "Describe Your Symptoms",
    desc: "Speak or write in plain everyday terms. No medical jargon required. Record an audio note or describe how you feel naturally.",
    icon: MessageSquare,
  },
  {
    number: "02",
    title: "Smart Physician Matching",
    desc: "Your intake is organized and instantly paired with an accredited Ghanaian doctor in General Practice or the required specialty.",
    icon: UserCheck,
  },
  {
    number: "03",
    title: "Live Video Consultation",
    desc: "Connect directly with your physician over secure, high-definition two-way video with real-time vitals review and discussion.",
    icon: Video,
  },
  {
    number: "04",
    title: "Digital Rx & Records",
    desc: "Receive official MDC-signed electronic prescriptions and consultation summaries stored securely in your patient portal.",
    icon: FileText,
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-24 bg-slate-50/70 border-b border-slate-200/80 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-800 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            Care Pathway
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            From concern to care in four simple steps.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Carevia eliminates crowded hospital OPD waiting rooms, connecting you with verified doctors from home or work.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.number}
                className="bg-white rounded-3xl p-7 border border-slate-200/80 flex flex-col justify-between shadow-xs hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-black text-slate-300">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-800">
                      <Icon size={18} />
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    {step.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Button */}
        <div className="mt-14 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-semibold text-xs sm:text-sm px-7 py-3.5 rounded-full transition shadow-xs active:scale-95 cursor-pointer"
          >
            <span>Start Your Consultation</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}

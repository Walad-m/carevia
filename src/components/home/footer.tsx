import Link from "next/link"
import { Stethoscope, PhoneCall, Heart, ShieldCheck } from "lucide-react"

export function HomeFooter() {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <Stethoscope size={18} />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">Carevia</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Connecting people to the right healthcare professionals across Ghana without guesswork, confusion, or delays.
            </p>
            <div className="text-[11px] text-slate-500">
              Developed by <strong className="text-slate-400">Team Good Life</strong>
              <div className="text-[10px] text-slate-600 mt-1">
                Kenneth Brakoh · Ibrahim Anwaar Tiyumba · Elizabeth Annan · Salmata Wunnam Amadu · Fazail Osuman
              </div>
            </div>
          </div>

          {/* Col 2: Services & Outbreaks */}
          <div>
            <h4 className="font-bold text-sm text-white mb-3">Healthcare & Surveillance</h4>
            <ul className="space-y-2">
              <li>
                <a href="#outbreak-radar" className="hover:text-teal-400 transition">
                  GHS Outbreak Radar
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-teal-400 transition">
                  AI-Guided Intake & Triage
                </a>
              </li>
              <li>
                <a href="#health-articles" className="hover:text-teal-400 transition">
                  Public Health Articles
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-teal-400 transition">
                  Telemedicine Fees (-20%)
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Compliance */}
          <div>
            <h4 className="font-bold text-sm text-white mb-3">Trust & Governance</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="hover:text-teal-400 transition">
                  Privacy Policy (Act 843)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-teal-400 transition">
                  Terms of Clinical Service
                </Link>
              </li>
              <li>
                <span className="text-slate-500">MDC Ghana Verified Registry</span>
              </li>
              <li>
                <Link href="/login" className="hover:text-teal-400 transition">
                  Doctor & Staff Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Emergency Contacts in Ghana */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-sm text-rose-400 flex items-center gap-1.5">
              <PhoneCall size={14} className="animate-pulse" />
              Ghana Emergency Hotlines
            </h4>
            <div className="space-y-1.5 text-[11px]">
              <p>
                <strong className="text-white">National Ambulance:</strong>{" "}
                <a href="tel:112" className="text-rose-400 font-bold hover:underline">112</a> / <a href="tel:193" className="text-rose-400 font-bold hover:underline">193</a>
              </p>
              <p>
                <strong className="text-white">Ghana Police Service:</strong>{" "}
                <a href="tel:191" className="text-slate-300 hover:underline">191</a>
              </p>
              <p>
                <strong className="text-white">GHS Outbreak Desk:</strong>{" "}
                <span className="text-slate-300">0302 682 709</span>
              </p>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight pt-1 border-t border-slate-800">
              For acute breathlessness, heavy hemorrhaging, or loss of consciousness, seek immediate hospital attention.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-[11px] text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Carevia Health Ghana. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Carevia does not replace in-person emergency medicine · Regulated by MDC Ghana
          </p>
        </div>
      </div>
    </footer>
  )
}

import Link from "next/link"

export function HomeFooter() {
  return (
    <footer className="bg-[#f5f5f7] border-t border-slate-200/80 text-slate-500 text-xs font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Footnote / Disclaimer */}
        <div className="pb-8 mb-8 border-b border-slate-200/80 space-y-2 text-[11px] text-slate-400 leading-relaxed">
          <p>
            1. Carevia is an authorized telehealth software provider connecting patients to registered healthcare practitioners in Ghana. All attending physicians hold valid retention certificates issued by the Medical and Dental Council (MDC) of Ghana.
          </p>
          <p>
            2. In the event of a life-threatening medical emergency (e.g. chest pain, difficulty breathing, acute trauma), dial the National Ambulance Service immediately at <strong>112</strong> or visit the nearest hospital emergency department.
          </p>
          <p>
            3. Patient clinical data is processed in accordance with Ghana&apos;s Data Protection Act, 2012 (Act 843).
          </p>
        </div>

        {/* Directory Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-semibold text-slate-950 text-xs mb-3">Platform</h4>
            <ul className="space-y-2">
              <li>
                <a href="#overview" className="hover:text-slate-950 transition">
                  Overview
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-slate-950 transition">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-slate-950 transition">
                  Consultation Pricing
                </a>
              </li>
              <li>
                <Link href="/register" className="hover:text-slate-950 transition">
                  Book a Doctor
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-950 text-xs mb-3">Physicians</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="hover:text-slate-950 transition">
                  Doctor Portal
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-slate-950 transition">
                  Join as Practitioner
                </Link>
              </li>
              <li>
                <span className="text-slate-400">MDC Ghana Verified</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-950 text-xs mb-3">Compliance</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="hover:text-slate-950 transition">
                  Privacy Policy (Act 843)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-slate-950 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <span className="text-slate-400">256-Bit Data Encryption</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-950 text-xs mb-3">Emergency</h4>
            <ul className="space-y-2">
              <li>
                <a href="tel:112" className="text-rose-600 font-medium hover:text-rose-700 transition">
                  Ambulance Dispatch: 112
                </a>
              </li>
              <li>
                <span className="text-slate-400">Ghana Police: 191</span>
              </li>
              <li>
                <span className="text-slate-400">Ghana Fire Service: 192</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} Carevia Health Ltd. All rights reserved.</p>
          <p>
            Developed by <strong>Team Good Life</strong> · Accra, Ghana
          </p>
        </div>

      </div>
    </footer>
  )
}

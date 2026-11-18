import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-24 bg-white border-b border-slate-200/80 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-800 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            Transparent Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Certified healthcare with zero hidden fees.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Every consultation is discounted 20% below standard private clinic rates and payable securely via Mobile Money or Card.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Plan 1: General Practice */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 flex flex-col justify-between shadow-xs hover:border-slate-300 transition">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Primary Care
                </span>
                <span className="text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded-full">
                  Save 20%
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                General Practice / Family Medicine
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
                Fever, malaria, respiratory coughs, digestive discomfort, tension headaches & routine ailments.
              </p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-extrabold text-slate-900">GH₵ 80</span>
                <span className="text-sm font-semibold text-slate-400 line-through">GH₵ 100</span>
                <span className="text-xs text-slate-500">/ consult</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-slate-900 shrink-0" />
                  <span>Clinical intake distillation for physician</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-slate-900 shrink-0" />
                  <span>MDC Ghana Accredited Family Practitioner</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-slate-900 shrink-0" />
                  <span>Two-way encrypted video consultation</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-slate-900 shrink-0" />
                  <span>Official digital prescription & clinical notes</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="mt-8 w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-semibold text-xs sm:text-sm py-3.5 rounded-full transition shadow-xs active:scale-95 cursor-pointer"
            >
              <span>Book General Practice Consult</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Plan 2: Specialist Care */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 flex flex-col justify-between shadow-xs hover:border-slate-300 transition">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Specialist Care
                </span>
                <span className="text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded-full">
                  Save 20%
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                Specialist Consultation
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
                Paediatrics, Cardiology, Obstetrics & Gynaecology, Internal Medicine & Dermatology.
              </p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-extrabold text-slate-900">GH₵ 120</span>
                <span className="text-sm font-semibold text-slate-400 line-through">GH₵ 150</span>
                <span className="text-xs text-slate-500">/ consult</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-slate-900 shrink-0" />
                  <span>Specialist clinical evaluation & diagnosis</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-slate-900 shrink-0" />
                  <span>MDC Verified Senior Specialist / Consultant</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-slate-900 shrink-0" />
                  <span>Comprehensive teleconsultation session</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-slate-900 shrink-0" />
                  <span>Detailed care plan & electronic prescription</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="mt-8 w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-semibold text-xs sm:text-sm py-3.5 rounded-full transition shadow-xs active:scale-95 cursor-pointer"
            >
              <span>Book Specialist Consult</span>
              <ArrowRight size={14} />
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}

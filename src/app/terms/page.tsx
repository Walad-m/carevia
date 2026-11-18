import Link from "next/link"
import { FileText, ArrowLeft } from "lucide-react"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 mb-8 transition"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Terms of Service</h1>
            <p className="text-sm text-slate-500">Carevia Telemedicine Platform</p>
          </div>
        </div>

        <div className="border-t border-slate-100 my-6" />

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">1. Nature of the Platform</h2>
            <p>
              Carevia provides digital infrastructure connecting verified patients with certified medical professionals licensed by the Medical and Dental Council (MDC) of Ghana. Carevia facilitates teleconsultations, electronic health record management, and appointment bookings.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">2. Emergency Medical Disclaimer</h2>
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium">
              Carevia is NOT an emergency response service. If you or someone you know is experiencing a life-threatening medical emergency, severe bleeding, chest pain, or breathing difficulty, immediately dial 112 (Ghana Emergency Services) or visit the nearest hospital emergency room.
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">3. Medical Professional Obligations</h2>
            <p>
              All practicing doctors on Carevia must provide a valid registration number issued by the Medical and Dental Council (MDC) of Ghana. Doctors undergo administrator verification before being permitted to conduct consultations. Medical practitioners remain solely responsible for the diagnosis, clinical judgment, and prescriptions issued during consultations.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">4. Patient Responsibilities</h2>
            <p>
              Patients agree to provide accurate, truthful, and complete medical history, symptoms, and vital data. Intentionally falsifying health information or misrepresenting identity is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">5. Privacy & Data Protection Compliance</h2>
            <p>
              All operations comply with the Ghana Data Protection Act 2012 (Act 843) and Ghana Health Service Patient&apos;s Charter. By using Carevia, you agree to our processing of your information in accordance with our{" "}
              <Link href="/privacy" className="text-blue-600 underline">Privacy Policy</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

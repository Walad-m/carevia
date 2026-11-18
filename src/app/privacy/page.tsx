import Link from "next/link"
import { ShieldCheck, ArrowLeft, Lock, Database, UserCheck, AlertTriangle } from "lucide-react"

export default function PrivacyPolicyPage() {
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
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Privacy Policy</h1>
            <p className="text-sm text-slate-500">
              Compliant with the Ghana Data Protection Act, 2012 (Act 843)
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 my-6" />

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">1. Statutory Framework</h2>
            <p>
              Carevia operates as a designated Data Controller under the <strong>Data Protection Act, 2012 (Act 843)</strong> of the Republic of Ghana. We are registered with the Data Protection Commission (DPC) and adhere strictly to the eight foundational principles of data protection defined under Section 17 of Act 843.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">2. Special Personal Data (Section 37)</h2>
            <p>
              Health data, symptom logs, medical records, and consultation summaries are classified as <strong>Special Personal Data</strong>. Carevia processes this information solely upon obtaining your explicit, informed consent and exclusively for the provision of telemedicine services and medical care by licensed medical professionals registered with the Medical and Dental Council (MDC) of Ghana.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">3. Artificial Intelligence & Audio Processing</h2>
            <p>
              When you submit a medical problem by text or voice recording, the input is processed using Google Gemini AI to construct a factual, high-signal clinical summary for your assigned doctor.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
              <li>Your audio and health data are <strong>never</strong> used to train public AI models.</li>
              <li>The original audio and verbatim descriptions are preserved and accessible exclusively to you and your authorized treating medical professional.</li>
              <li>AI outputs are clearly flagged as preliminary assistive summaries and do not replace professional medical diagnosis.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">4. Technical & Organizational Safeguards (Section 28)</h2>
            <p>
              We implement comprehensive security measures to prevent unauthorized access, loss, or misuse of your personal information:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2.5">
                <Lock size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700">Encrypted transmission via TLS/SSL and encrypted database storage.</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2.5">
                <Database size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700">Strict role-based isolation: doctors only access their assigned patients.</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2.5">
                <UserCheck size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700">Mandatory verification of medical credentials against MDC Ghana records.</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700">Automated breach notification protocol to DPC and affected subjects within 72 hours.</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">5. Data Subject Rights (Part 5 of Act 843)</h2>
            <p>
              Under Act 843, you possess legally enforceable rights regarding your personal and medical information:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
              <li><strong>Right to Access:</strong> You can download a complete electronic copy of your health and account records at any time from your Account Settings.</li>
              <li><strong>Right to Rectification:</strong> You can update inaccurate or outdated personal details directly in your profile.</li>
              <li><strong>Right to Erasure:</strong> You can request complete deletion of your account and personal identifiers.</li>
              <li><strong>Right to Withdraw Consent:</strong> You may withdraw your consent for future data processing at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">6. Retention Periods (Section 24)</h2>
            <p>
              In alignment with Ghana Health Service clinical standards, medical folders and consultation records are securely retained for statutory clinical audit requirements, while ephemeral audio recordings are slated for deletion after consultation completion.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">7. Contact the Data Protection Commission</h2>
            <p>
              For privacy queries or complaints, you can contact the Carevia Data Protection Officer at{" "}
              <a href="mailto:privacy@carevia.gh" className="text-blue-600 underline">privacy@carevia.gh</a>{" "}
              or file a report directly with the <strong>Data Protection Commission Ghana</strong> at{" "}
              <a href="https://dpc.gov.gh" target="_blank" rel="noreferrer" className="text-blue-600 underline">dpc.gov.gh</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

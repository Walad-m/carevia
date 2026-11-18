import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { FileText, Lock, ArrowLeft } from "lucide-react"
import Link from "next/link"

export const instant = false

export default async function PatientRecordsPage() {
  const session = await auth()
  if (!session || session.user.role !== "PATIENT") {
    redirect("/login")
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl w-full">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/patient"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Medical Records</h1>
        <p className="text-slate-500 text-sm mt-1">
          Your personal health history and clinical documents.
        </p>
      </div>

      {/* Coming soon card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-10 flex flex-col items-center text-center shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
          <FileText size={28} className="text-blue-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">
          Medical Records Vault
        </h2>
        <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
          Your electronic health records, lab results, prescriptions, and clinical summaries will be securely accessible here. 
          This feature is in active development as part of Stage 5 of the Carevia roadmap.
        </p>

        <div className="mt-6 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs font-medium text-amber-800">
          <Lock size={13} />
          End-to-end encrypted · Act 843 Ghana Data Protection compliant
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
          {[
            { label: "Lab Reports", desc: "Blood work, imaging, diagnostics" },
            { label: "Prescriptions", desc: "Doctor-issued medication records" },
            { label: "Visit Summaries", desc: "Post-consultation clinical notes" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-100 bg-slate-50 p-4"
            >
              <p className="font-semibold text-slate-700 text-sm">{item.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              <span className="inline-block mt-2 text-[10px] font-bold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Coming Soon
              </span>
            </div>
          ))}
        </div>

        <Link
          href="/patient/appointments/new"
          className="mt-8 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
        >
          Book a Consultation Instead
        </Link>
      </div>
    </div>
  )
}

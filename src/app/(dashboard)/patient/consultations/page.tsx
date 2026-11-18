import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Video, ArrowLeft, Clock, CheckCircle2, Calendar } from "lucide-react"

export const instant = false

export default async function PatientConsultationsPage() {
  const session = await auth()
  if (!session || session.user.role !== "PATIENT") {
    redirect("/login")
  }

  // Fetch completed consultations
  let completedConsultations: any[] = []
  try {
    completedConsultations = await (db.appointment as any).findMany({
      where: {
        patientId: session.user.id,
        status: "COMPLETED",
      },
      include: {
        doctor: {
          select: {
            name: true,
            doctorProfile: {
              select: { specialty: true },
            },
          },
        },
        payment: true,
      },
      orderBy: { scheduledAt: "desc" },
      take: 20,
    })
  } catch (err) {
    // Fallback if running server process has not reloaded the payment relation yet
    completedConsultations = await db.appointment.findMany({
      where: {
        patientId: session.user.id,
        status: "COMPLETED",
      },
      include: {
        doctor: {
          select: {
            name: true,
            doctorProfile: {
              select: { specialty: true },
            },
          },
        },
      },
      orderBy: { scheduledAt: "desc" },
      take: 20,
    })
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
        <h1 className="text-2xl font-bold text-slate-900">Consultations</h1>
        <p className="text-slate-500 text-sm mt-1">
          Your completed telemedicine consultations.
        </p>
      </div>

      {completedConsultations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 flex flex-col items-center text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
            <Video size={28} className="text-teal-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            No consultations yet
          </h2>
          <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
            Your completed telemedicine consultations will appear here. 
            Start by booking a consultation with our AI-matched physicians.
          </p>
          <Link
            href="/patient/appointments/new"
            className="mt-6 inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold px-5 py-2.5 rounded-full transition shadow-xs cursor-pointer active:scale-98"
          >
            <Calendar size={15} />
            Book a Consultation
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            {completedConsultations.length} Completed Session{completedConsultations.length !== 1 ? "s" : ""}
          </p>
          {completedConsultations.map((appt) => (
            <div
              key={appt.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 text-slate-700">
                    <Video size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">
                      Dr. {appt.doctor.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {appt.doctor.doctorProfile?.specialty ?? "General Practice"}
                    </p>
                    {appt.scheduledAt && (
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(appt.scheduledAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={10} className="text-emerald-600" /> COMPLETED
                  </span>
                  {appt.payment && (
                    <span className="text-xs font-semibold text-slate-600 font-mono">
                      GH₵ {appt.payment.amount.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              {appt.aiSummary && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Clinical Summary
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {appt.aiSummary}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

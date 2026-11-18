import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PatientVideoRoomButton } from "@/components/video/patient-video-room-button"
import {
  Calendar,
  Clock,
  Plus,
  Stethoscope,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
  Volume2,
  CreditCard,
  ShieldCheck,
  RotateCcw,
} from "lucide-react"

export const instant = false

export default async function PatientAppointmentsPage() {
  const session = await auth()
  if (!session || session.user.role !== "PATIENT") {
    redirect("/login")
  }

  let appointments: any[] = []
  try {
    appointments = await (db.appointment as any).findMany({
      where: { patientId: session.user.id },
      include: {
        doctor: {
          select: {
            name: true,
            email: true,
            doctorProfile: {
              select: {
                specialty: true,
                mdcId: true,
                consultFee: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: { scheduledAt: "desc" },
    })
  } catch (err) {
    // Fallback if running server process has not reloaded the payment relation yet
    appointments = await db.appointment.findMany({
      where: { patientId: session.user.id },
      include: {
        doctor: {
          select: {
            name: true,
            email: true,
            doctorProfile: {
              select: {
                specialty: true,
                mdcId: true,
                consultFee: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: "desc" },
    })
  }

  return (
    <div className="p-8 max-w-4xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Consultations</h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm">
            AI-triaged clinical appointments with MDC Ghana accredited physicians
          </p>
        </div>

        <Link
          href="/patient/appointments/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-full text-xs font-semibold transition cursor-pointer shadow-xs w-fit active:scale-98"
        >
          <Plus size={16} />
          Book New Consultation
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <Calendar size={36} className="text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-sm">No Consultations Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Describe how you feel in plain language. Our clinical AI will prepare your intake and match you with the right specialist in under 15 minutes.
          </p>
          <Link
            href="/patient/appointments/new"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl text-xs font-semibold transition"
          >
            <Plus size={14} /> Start Free Symptom Check
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => {
            const isAccepted = apt.status === "ACCEPTED"
            const isPending = apt.status === "PENDING"
            const isDeclined = apt.status === "DECLINED"

            return (
              <div
                key={apt.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center font-bold text-sm shrink-0">
                      <Stethoscope size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {apt.doctor.name || "Attending Physician"}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {apt.matchedSpecialty || apt.doctor.doctorProfile?.specialty} ·{" "}
                        <span className="font-mono text-slate-400">
                          {apt.doctor.doctorProfile?.mdcId}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {apt.urgency && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          apt.urgency === "URGENT"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {apt.urgency}
                      </span>
                    )}

                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock size={12} /> Awaiting Doctor Confirmation
                      </span>
                    )}
                    {isAccepted && (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={12} /> Confirmed
                        </span>
                        <PatientVideoRoomButton appointment={apt} />
                      </div>
                    )}
                    {isDeclined && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        <RotateCcw size={12} /> Rebooking Reserved
                      </span>
                    )}
                  </div>
                </div>

                {/* Date, Time & Payment info */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Calendar size={14} className="text-slate-400" />
                      <span>
                        {new Date(apt.scheduledAt).toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Clock size={14} className="text-slate-400" />
                      <span>
                        {new Date(apt.scheduledAt).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {apt.payment && (
                    <div className="flex items-center gap-1.5 font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                      <CreditCard size={13} className="text-emerald-600" />
                      <span>
                        GH₵ {apt.payment.amount.toFixed(2)} Paid ({apt.payment.network || apt.payment.method})
                      </span>
                    </div>
                  )}
                </div>

                {/* Automated fallback reassurance banner for pending */}
                {isPending && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-700 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-slate-600 shrink-0" />
                    <span>
                      Your clinical intake has been safely routed. If this physician is delayed in clinical duties, Carevia&apos;s automatic fallback engine will instantly hand over your consultation to a standby doctor to ensure zero delays.
                    </span>
                  </div>
                )}

                {/* AI Summary Card */}
                {apt.aiSummary && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                      <Sparkles size={14} className="text-slate-700" />
                      Gemini Clinical Intake Summary (Prepared for Doctor)
                    </div>
                    <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line pl-1 font-sans">
                      {apt.aiSummary}
                    </div>
                  </div>
                )}

                {/* Original problem / audio note details */}
                <div className="pt-2 text-xs space-y-2">
                  {apt.problemText && (
                    <details className="cursor-pointer group">
                      <summary className="text-slate-500 hover:text-slate-700 font-medium list-none flex items-center gap-1">
                        <FileText size={12} />
                        <span>View your original description</span>
                      </summary>
                      <p className="mt-2 p-3 bg-slate-50 rounded-xl text-slate-600 border border-slate-100 text-xs">
                        {apt.problemText}
                      </p>
                    </details>
                  )}

                  {apt.voiceAudioUrl && (
                    <div className="pt-2 flex items-center gap-2">
                      <Volume2 size={14} className="text-teal-600" />
                      <span className="text-xs text-slate-500 font-medium">Recorded Voice Note:</span>
                      <audio controls src={apt.voiceAudioUrl} className="h-8 max-w-xs" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

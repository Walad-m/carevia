"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Clock,
  User,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Volume2,
  FileText,
  CreditCard,
  RotateCcw,
} from "lucide-react"
import { FormattedAiSummary } from "@/components/shared/formatted-ai-summary"

interface AppointmentCardProps {
  appointment: {
    id: string
    scheduledAt: Date
    status: string
    urgency?: string | null
    matchedSpecialty?: string | null
    problemText: string | null
    voiceAudioUrl: string | null
    aiSummary: string | null
    declineReason: string | null
    payment?: {
      amount: number
      method: string
      status: string
      transactionRef: string
    } | null
    patient: {
      name: string | null
      email: string
      patientProfile: {
        dateOfBirth: Date | null
        gender: string | null
        bloodGroup: string | null
        allergies: string | null
        emergencyContact: string | null
        emergencyPhone: string | null
        phone: string | null
      } | null
    }
  }
}

export function DoctorAppointmentCard({ appointment }: AppointmentCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null)
  const [showDeclineInput, setShowDeclineInput] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [customTime, setCustomTime] = useState(
    new Date(appointment.scheduledAt).toISOString().slice(0, 16)
  )
  const [declineReason, setDeclineReason] = useState("")
  const [successNotice, setSuccessNotice] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const profile = appointment.patient.patientProfile
  const isPending = appointment.status === "PENDING"
  const isAccepted = appointment.status === "ACCEPTED"
  const isDeclined = appointment.status === "DECLINED"

  const age = profile?.dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(profile.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null

  async function handleDecision(action: "ACCEPT" | "DECLINE") {
    setLoading(action === "ACCEPT" ? "accept" : "decline")
    setErrorMsg("")
    setSuccessNotice("")

    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          declineReason: action === "DECLINE" ? declineReason : undefined,
          newScheduledAt: action === "ACCEPT" && showTimePicker ? customTime : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || "Action failed")
      } else {
        if (data.rerouted) {
          setSuccessNotice(
            "Consultation declined and automatically rerouted to a standby doctor in the system queue."
          )
        } else {
          setSuccessNotice(
            action === "ACCEPT" ? "Consultation confirmed successfully!" : "Request processed."
          )
        }
        setTimeout(() => router.refresh(), 1500)
      }
    } catch {
      setErrorMsg("Network error communicating with server.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
          {errorMsg}
        </div>
      )}

      {successNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
          {successNotice}
        </div>
      )}

      {/* Patient demographics & Triage urgency */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
            <User size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">
              {appointment.patient.name || "Anonymous Patient"}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
              {age !== null && <span>Age {age}</span>}
              {profile?.gender && <span>· {profile.gender}</span>}
              {profile?.bloodGroup && (
                <span className="font-medium text-slate-700">· Blood {profile.bloodGroup}</span>
              )}
              {profile?.allergies && (
                <span className="text-red-600 font-medium bg-red-50 px-1.5 py-0.5 rounded">
                  Allergies: {profile.allergies}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status & Urgency Badges */}
        <div className="flex items-center gap-2">
          {appointment.urgency && (
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                appointment.urgency === "URGENT"
                  ? "bg-rose-100 text-rose-800 border border-rose-200"
                  : "bg-blue-100 text-blue-800 border border-blue-200"
              }`}
            >
              {appointment.urgency} Priority
            </span>
          )}

          {isPending && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <Clock size={12} /> Awaiting Confirmation
            </span>
          )}
          {isAccepted && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 size={12} /> Confirmed
            </span>
          )}
          {isDeclined && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
              <XCircle size={12} /> Handed Over / Declined
            </span>
          )}
        </div>
      </div>

      {/* Appointment Time & Payment Information */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 text-slate-600">
          <div className="flex items-center gap-1.5 font-medium text-slate-800">
            <Calendar size={14} className="text-slate-400" />
            {new Date(appointment.scheduledAt).toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-800">
            <Clock size={14} className="text-slate-400" />
            {new Date(appointment.scheduledAt).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          {appointment.matchedSpecialty && (
            <span className="text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded">
              {appointment.matchedSpecialty}
            </span>
          )}
        </div>

        {/* Payment info */}
        {appointment.payment && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-mono">
            <CreditCard size={13} className="text-emerald-600" />
            <span>GH₵ {appointment.payment.amount.toFixed(2)} Paid ({appointment.payment.method})</span>
          </div>
        )}
      </div>

      {/* Gemini AI Clinical Summary */}
      {appointment.aiSummary && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <Sparkles size={14} className="text-slate-700" />
              AI Clinical Intake Summary (Gemini 2.5)
            </span>
            <span className="text-[10px] bg-slate-200/60 text-slate-700 font-medium px-2 py-0.5 rounded-full">
              Pre-Consultation Distillation
            </span>
          </div>

          <FormattedAiSummary summary={appointment.aiSummary} />
        </div>
      )}

      {/* Raw verbatim patient input & audio */}
      <div className="pt-1 text-xs space-y-2">
        {appointment.problemText && (
          <details className="cursor-pointer group">
            <summary className="text-slate-500 hover:text-slate-700 font-medium list-none flex items-center gap-1">
              <FileText size={12} />
              <span>Expand patient original description</span>
            </summary>
            <p className="mt-2 p-3 bg-slate-50 rounded-2xl text-slate-600 border border-slate-200/80 text-xs leading-relaxed">
              &quot;{appointment.problemText}&quot;
            </p>
          </details>
        )}

        {appointment.voiceAudioUrl && (
          <div className="pt-2 flex items-center gap-2">
            <Volume2 size={14} className="text-slate-700" />
            <span className="text-xs text-slate-700 font-medium">Patient Voice Recording:</span>
            <audio controls src={appointment.voiceAudioUrl} className="h-8 max-w-xs" />
          </div>
        )}
      </div>

      {/* Doctor Action Buttons (if pending) */}
      {isPending && (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          {/* Scheduling adjustment prompt */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDecision("ACCEPT")}
                disabled={!!loading}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-full text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
              >
                {loading === "accept" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                Confirm Consultation Time
              </button>

              <button
                type="button"
                onClick={() => setShowTimePicker(!showTimePicker)}
                className="px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-full text-xs font-medium transition cursor-pointer"
              >
                Adjust Time Slot
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowDeclineInput(!showDeclineInput)}
              disabled={!!loading}
              className="px-4 py-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-full text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={13} />
              Unavailable (Reroute)
            </button>
          </div>

          {/* Time Picker */}
          {showTimePicker && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <label className="block text-xs font-semibold text-slate-900">
                Set Confirmed Consultation Time Window:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="datetime-local"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={() => handleDecision("ACCEPT")}
                  disabled={!!loading}
                  className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-full hover:bg-black transition cursor-pointer shadow-xs"
                >
                  Confirm This Time
                </button>
              </div>
            </div>
          )}

          {/* Decline / Reroute Explanation */}
          {showDeclineInput && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <p className="font-semibold text-slate-900">
                Decline Consultation (Automated Fallback Trigger):
              </p>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Upon decline, Carevia&apos;s fallback engine will automatically and silently hand this consultation to the next available standby doctor in your specialty pool.
              </p>
              <input
                type="text"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Reason (e.g. In Surgery / Off Duty / Capacity reached)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
              />
              <button
                type="button"
                onClick={() => handleDecision("DECLINE")}
                disabled={!!loading}
                className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white rounded-full text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                {loading === "decline" ? "Rerouting..." : "Confirm & Hand Over"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

type Doctor = {
  id: string
  mdcId: string
  specialty: string
  phone: string | null
  user: { name: string | null; email: string; createdAt: Date }
}

export function DoctorApprovalList({ doctors }: { doctors: Doctor[] }) {
  const router = useRouter()

  if (doctors.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <CheckCircle size={28} className="text-green-400 mx-auto mb-3" />
        <p className="font-medium text-slate-900 text-sm">All caught up!</p>
        <p className="text-xs text-slate-500 mt-1">No pending doctor approvals at this time</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {doctors.map((doctor) => (
        <DoctorCard
          key={doctor.id}
          doctor={doctor}
          onAction={() => router.refresh()}
        />
      ))}
    </div>
  )
}

function DoctorCard({
  doctor,
  onAction,
}: {
  doctor: Doctor
  onAction: () => void
}) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)
  const [showReject, setShowReject] = useState(false)
  const [reason, setReason] = useState("")
  const [done, setDone] = useState(false)

  async function handleAction(action: "APPROVE" | "REJECT") {
    setLoading(action === "APPROVE" ? "approve" : "reject")

    await fetch(`/api/admin/doctors/${doctor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    })

    setLoading(null)
    setDone(true)
    setTimeout(() => onAction(), 600)
  }

  if (done) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 opacity-50 transition-opacity">
        <p className="text-sm text-slate-500 text-center">Processing…</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-4">
        {/* Doctor info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-semibold text-slate-900 text-sm truncate">
              {doctor.user.name ?? "—"}
            </p>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full shrink-0">
              Pending
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">{doctor.user.email}</p>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            <Info label="MDC ID" value={doctor.mdcId} />
            <Info label="Specialty" value={doctor.specialty} />
            {doctor.phone && <Info label="Phone" value={doctor.phone} />}
            <Info
              label="Applied"
              value={new Date(doctor.user.createdAt).toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric",
              })}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={() => handleAction("APPROVE")}
            disabled={!!loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium transition"
          >
            {loading === "approve"
              ? <Loader2 size={14} className="animate-spin" />
              : <CheckCircle size={14} />}
            Approve
          </button>

          <button
            onClick={() => setShowReject(!showReject)}
            disabled={!!loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60 text-sm font-medium transition"
          >
            <XCircle size={14} />
            Reject
          </button>
        </div>
      </div>

      {/* Reject form */}
      {showReject && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Reason for rejection <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. MDC ID could not be verified"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent"
          />
          <button
            onClick={() => handleAction("REJECT")}
            disabled={!!loading || !reason.trim()}
            className="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white text-sm font-medium transition"
          >
            {loading === "reject" && <Loader2 size={14} className="animate-spin" />}
            Confirm Rejection
          </button>
        </div>
      )}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-xs">
      <span className="text-slate-400">{label}: </span>
      <span className="font-medium text-slate-700">{value}</span>
    </p>
  )
}

"use client"

import { useState } from "react"
import { Power, Check, Loader2, Clock, Calendar } from "lucide-react"

interface AvailabilityProps {
  initialAvailable: boolean
  initialDays?: string | null
  initialFrom?: string | null
  initialTo?: string | null
}

export function DoctorAvailabilityToggle({
  initialAvailable,
  initialDays = "MON,TUE,WED,THU,FRI,SAT",
  initialFrom = "08:00",
  initialTo = "18:00",
}: AvailabilityProps) {
  const [isAvailable, setIsAvailable] = useState(initialAvailable)
  const [availableFrom, setAvailableFrom] = useState(initialFrom || "08:00")
  const [availableTo, setAvailableTo] = useState(initialTo || "18:00")
  const [loading, setLoading] = useState(false)
  const [savedNotice, setSavedNotice] = useState(false)

  async function handleToggle(newStatus: boolean) {
    setIsAvailable(newStatus)
    setLoading(true)
    setSavedNotice(false)
    try {
      const res = await fetch("/api/doctor/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isAvailable: newStatus,
          availableFrom,
          availableTo,
          availableDays: initialDays,
        }),
      })

      if (res.ok) {
        setSavedNotice(true)
        setTimeout(() => setSavedNotice(false), 2500)
      }
    } catch {
      console.error("Failed to update availability")
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveHours() {
    setLoading(true)
    setSavedNotice(false)
    try {
      const res = await fetch("/api/doctor/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isAvailable,
          availableFrom,
          availableTo,
          availableDays: initialDays,
        }),
      })

      if (res.ok) {
        setSavedNotice(true)
        setTimeout(() => setSavedNotice(false), 2500)
      }
    } catch {
      console.error("Failed to update hours")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-base text-slate-900 flex items-center gap-2">
            <Power size={18} className={isAvailable ? "text-slate-900" : "text-slate-400"} />
            Teleconsultation Duty Status
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            When On-Duty, Carevia&apos;s AI routing engine assigns incoming patient consults to your queue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedNotice && (
            <span className="text-xs text-slate-900 font-medium flex items-center gap-1 animate-in fade-in">
              <Check size={14} className="text-emerald-600" /> Saved
            </span>
          )}

          <button
            type="button"
            onClick={() => handleToggle(!isAvailable)}
            disabled={loading}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              isAvailable
                ? "bg-slate-900 text-white hover:bg-black shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-emerald-400" : "bg-slate-400"}`} />
            )}
            <span>{isAvailable ? "On-Duty (Accepting Patients)" : "Off-Duty (Paused)"}</span>
          </button>
        </div>
      </div>

      {/* Consultation Hours */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <Clock size={14} className="text-slate-400" />
          <span>Active Consultation Windows:</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="time"
            value={availableFrom}
            onChange={(e) => setAvailableFrom(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
          <span className="text-slate-400">to</span>
          <input
            type="time"
            value={availableTo}
            onChange={(e) => setAvailableTo(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
          <button
            type="button"
            onClick={handleSaveHours}
            disabled={loading}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-semibold hover:bg-black transition cursor-pointer shadow-xs"
          >
            Save Hours
          </button>
        </div>
      </div>
    </div>
  )
}

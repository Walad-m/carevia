"use client"

import Link from "next/link"
import { Calendar, Clock, Video, ArrowRight } from "lucide-react"

interface DoctorScheduleListProps {
  appointments: any[]
}

export function DoctorScheduleList({ appointments }: DoctorScheduleListProps) {
  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <Calendar size={22} />
        </div>
        <h3 className="font-semibold text-slate-900 text-sm">Schedule is Clear</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
          Confirmed consultations will appear here automatically. Check incoming requests to review pending patient intakes.
        </p>
        <Link
          href="/doctor/appointments"
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-full text-xs font-semibold transition shadow-xs active:scale-98"
        >
          <span>View Incoming Requests</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {appointments.map((apt) => {
        const scheduledDate = new Date(apt.scheduledAt)

        return (
          <div
            key={apt.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-slate-300 transition"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-900 flex flex-col items-center justify-center shrink-0 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  {scheduledDate.toLocaleDateString("en-GB", { month: "short" })}
                </span>
                <span className="text-base font-bold text-slate-900 leading-none">
                  {scheduledDate.getDate()}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 text-sm">
                    {apt.patient?.name || "Patient"}
                  </h3>
                  <span className="text-[11px] bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded-full font-medium">
                    Confirmed
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1 text-slate-700 font-medium">
                    <Clock size={12} className="text-slate-400" />
                    {scheduledDate.toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {apt.patient?.patientProfile?.bloodGroup && (
                    <span>· Blood: {apt.patient.patientProfile.bloodGroup}</span>
                  )}
                  {apt.urgency && (
                    <span className="text-slate-600 font-medium">· {apt.urgency} Priority</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/consultation/${apt.id}`}
                className="text-xs text-white bg-slate-900 hover:bg-black font-semibold flex items-center gap-2 px-4 py-2.5 rounded-full transition shadow-xs active:scale-98"
              >
                <Video size={14} />
                <span>Enter Video Consultation Room</span>
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}

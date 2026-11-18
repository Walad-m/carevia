import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { DoctorAppointmentCard } from "./doctor-appointment-card"
import { Calendar, CheckCircle, Clock } from "lucide-react"

export const instant = false

export default async function DoctorAppointmentsPage() {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") {
    redirect("/login")
  }

  const appointments = db.appointment
    ? await db.appointment.findMany({
        where: { doctorId: session.user.id },
        include: {
          patient: {
            select: {
              name: true,
              email: true,
              patientProfile: {
                select: {
                  dateOfBirth: true,
                  gender: true,
                  bloodGroup: true,
                  allergies: true,
                  emergencyContact: true,
                  emergencyPhone: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: { scheduledAt: "asc" },
      })
    : []

  const pendingAppointments = appointments.filter((a) => a.status === "PENDING")
  const acceptedAppointments = appointments.filter((a) => a.status === "ACCEPTED")

  return (
    <div className="p-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Appointment Requests</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Review incoming patient consultation intakes summarized by Gemini AI
        </p>
      </div>

      {/* Pending requests section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Clock size={16} className="text-amber-500" />
          Pending Patient Intakes ({pendingAppointments.length})
        </div>

        {pendingAppointments.length === 0 ? (
          <div className="p-6 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-500">
            No pending appointment requests to review.
          </div>
        ) : (
          pendingAppointments.map((apt) => (
            <DoctorAppointmentCard key={apt.id} appointment={apt} />
          ))
        )}
      </div>

      {/* Accepted appointments section */}
      {acceptedAppointments.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CheckCircle size={16} className="text-emerald-500" />
            Confirmed Consultations ({acceptedAppointments.length})
          </div>

          {acceptedAppointments.map((apt) => (
            <DoctorAppointmentCard key={apt.id} appointment={apt} />
          ))}
        </div>
      )}
    </div>
  )
}

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { DoctorAvailabilityToggle } from "./doctor-availability-toggle"
import { DoctorScheduleList } from "./doctor-schedule-list"

export const instant = false

export default async function DoctorSchedulePage() {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") {
    redirect("/login")
  }

  const [appointments, doctorProfile] = await Promise.all([
    db.appointment.findMany({
      where: {
        doctorId: session.user.id,
        status: "ACCEPTED",
      },
      include: {
        patient: {
          select: {
            name: true,
            email: true,
            patientProfile: {
              select: {
                gender: true,
                bloodGroup: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
    }),
    db.doctorProfile.findUnique({
      where: { userId: session.user.id },
    }),
  ])

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My Consultation Schedule</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Manage your availability for AI smart matching and review upcoming confirmed sessions.
        </p>
      </div>

      {/* Duty Availability Toggle */}
      <DoctorAvailabilityToggle
        initialAvailable={(doctorProfile as any)?.isAvailable ?? true}
        initialDays={(doctorProfile as any)?.availableDays ?? "MON,TUE,WED,THU,FRI,SAT"}
        initialFrom={(doctorProfile as any)?.availableFrom ?? "08:00"}
        initialTo={(doctorProfile as any)?.availableTo ?? "18:00"}
      />

      {/* Interactive Consultation List with Live Video Room Access */}
      <DoctorScheduleList appointments={appointments} />
    </div>
  )
}

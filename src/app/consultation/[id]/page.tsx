import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import { TelehealthVideoRoom } from "@/components/video/telehealth-video-room"

export const instant = false

export default async function ConsultationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const { id } = await params

  const appointment = await db.appointment.findUnique({
    where: { id },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          email: true,
          patientProfile: {
            select: {
              gender: true,
              bloodGroup: true,
              phone: true,
            },
          },
        },
      },
      doctor: {
        select: {
          id: true,
          name: true,
          email: true,
          doctorProfile: {
            select: {
              specialty: true,
              mdcId: true,
            },
          },
        },
      },
    },
  })

  if (!appointment) {
    notFound()
  }

  // Ensure user is either the assigned doctor or the patient
  const isDoctor = session.user.id === appointment.doctorId
  const isPatient = session.user.id === appointment.patientId

  if (!isDoctor && !isPatient && session.user.role !== "ADMIN") {
    redirect(session.user.role === "DOCTOR" ? "/doctor/schedule" : "/patient/appointments")
  }

  return (
    <TelehealthVideoRoom
      appointment={appointment as any}
      currentUserRole={session.user.role === "DOCTOR" ? "DOCTOR" : "PATIENT"}
    />
  )
}

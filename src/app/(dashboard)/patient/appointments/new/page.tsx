import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BookingForm } from "./booking-form"

export const instant = false

export default async function NewAppointmentPage() {
  const session = await auth()
  if (!session || session.user.role !== "PATIENT") {
    redirect("/login")
  }

  // Fetch all APPROVED doctors
  const doctors = await db.user.findMany({
    where: {
      role: "DOCTOR",
      doctorProfile: {
        status: "APPROVED",
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      doctorProfile: {
        select: {
          specialty: true,
          mdcId: true,
          consultFee: true,
          bio: true,
        },
      },
    },
    orderBy: { name: "asc" },
  })

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link
          href="/patient/appointments"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition mb-3"
        >
          <ArrowLeft size={14} /> Back to Appointments
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">Book a Consultation</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Connect with licensed medical professionals verified by the MDC Ghana
        </p>
      </div>

      <BookingForm doctors={doctors} />
    </div>
  )
}

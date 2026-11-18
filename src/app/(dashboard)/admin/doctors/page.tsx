import { db } from "@/lib/db"
import { DoctorApprovalList } from "./doctor-approval-list"

export const instant = false

export default async function AdminDoctorsPage() {
  const doctors = await db.doctorProfile.findMany({
    where: { status: "PENDING" },
    include: {
      user: {
        select: { name: true, email: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Doctor Approvals</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Review MDC Ghana IDs and verify doctor registrations
        </p>
      </div>

      <DoctorApprovalList doctors={doctors} />
    </div>
  )
}

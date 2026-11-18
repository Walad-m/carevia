import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { Calendar, FileText, Video, ArrowRight } from "lucide-react"

export const instant = false

export default async function PatientDashboardPage() {
  const session = await auth()

  const [profile, upcomingCount, completedCount] = await Promise.all([
    db.patientProfile?.findUnique({ where: { userId: session!.user.id } }),
    db.appointment
      ? db.appointment.count({
          where: {
            patientId: session!.user.id,
            status: { in: ["PENDING", "ACCEPTED"] },
          },
        })
      : Promise.resolve(0),
    db.appointment
      ? db.appointment.count({
          where: {
            patientId: session!.user.id,
            status: "COMPLETED",
          },
        })
      : Promise.resolve(0),
  ])

  const firstName = session!.user.name?.split(" ")[0] ?? "there"

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Good day, {firstName} 👋
        </h1>
        <p className="text-slate-500 mt-1 text-sm">How are you feeling today?</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Active Appointments"
          value={upcomingCount.toString()}
          note={upcomingCount > 0 ? "Pending or confirmed" : "No pending appointments"}
        />
        <StatCard
          label="Past Consultations"
          value={completedCount.toString()}
          note={completedCount > 0 ? "Completed sessions" : "No consultations yet"}
        />
        <StatCard label="Medical Records" value="0" note="Managed in Stage 5" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 mb-6 shadow-xs">
        <h2 className="font-semibold text-slate-900 mb-4 text-sm">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ActionCard
            icon={Calendar}
            title="Book a Consultation"
            description="Describe your symptoms and find the right doctor"
            href="/patient/appointments/new"
          />
          <ActionCard
            icon={Calendar}
            title="My Appointments"
            description="Track pending requests and clinical summaries"
            href="/patient/appointments"
          />
          <ActionCard
            icon={FileText}
            title="Medical Records"
            description="Access your health history and reports"
            href="/patient/records"
          />
          <ActionCard
            icon={Video}
            title="Consultations"
            description="Join or review video consultations"
            href="/patient/consultations"
          />
        </div>
      </div>

      {/* Profile completion nudge */}
      {(!profile?.dateOfBirth || !profile?.bloodGroup) && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-900 text-sm">Complete your medical profile</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Adding your blood group, date of birth and allergies helps your doctor provide better care.
            </p>
          </div>
          <Link
            href="/settings"
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-full transition shadow-xs whitespace-nowrap active:scale-98"
          >
            Update <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note: string
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
      <p className="text-xs text-slate-500 mb-1 font-medium">{label}</p>
      <p className="text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{note}</p>
    </div>
  )
}

function ActionCard({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: React.ElementType
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50 transition group cursor-pointer"
    >
      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0 transition text-slate-700 group-hover:text-slate-900">
        <Icon size={17} />
      </div>
      <div>
        <p className="font-semibold text-slate-900 text-sm group-hover:text-slate-900 transition">
          {title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{description}</p>
      </div>
    </Link>
  )
}

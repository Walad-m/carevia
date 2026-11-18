import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { Clock, XCircle, Calendar, Users, CheckCircle, ArrowRight } from "lucide-react"

export const instant = false

export default async function DoctorDashboardPage() {
  const session = await auth()

  const [doctorProfile, pendingCount, acceptedCount, recentAppointments] =
    await Promise.all([
      db.doctorProfile.findUnique({
        where: { userId: session!.user.id },
      }),
      db.appointment
        ? db.appointment.count({
            where: {
              doctorId: session!.user.id,
              status: "PENDING",
            },
          })
        : Promise.resolve(0),
      db.appointment
        ? db.appointment.count({
            where: {
              doctorId: session!.user.id,
              status: "ACCEPTED",
            },
          })
        : Promise.resolve(0),
      db.appointment
        ? db.appointment.findMany({
            where: {
              doctorId: session!.user.id,
              status: "PENDING",
            },
            include: {
              patient: { select: { name: true } },
            },
            take: 3,
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),
    ])

  const firstName = session!.user.name?.split(" ")[0] ?? "Doctor"

  // ── Pending approval ───────────────────────────────────────────────────
  if (!doctorProfile || doctorProfile.status === "PENDING") {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
            <Clock size={28} className="text-amber-600" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Account Under Review</h1>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            Your account is being reviewed by our admin team. We are verifying your MDC Ghana ID{" "}
            <span className="font-medium text-slate-700">
              ({doctorProfile?.mdcId})
            </span>{" "}
            and specialty{" "}
            <span className="font-medium text-slate-700">
              ({doctorProfile?.specialty})
            </span>
            .
          </p>
          <p className="text-xs text-slate-400 mt-4">
            This typically takes 24 to 48 hours.{" "}
            <a href="mailto:support@carevia.gh" className="underline hover:text-slate-600">
              Contact support
            </a>{" "}
            if you need assistance.
          </p>
        </div>
      </div>
    )
  }

  // ── Rejected ─────────────────────────────────────────────────────────
  if (doctorProfile.status === "REJECTED") {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <XCircle size={28} className="text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Account Not Approved</h1>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            {doctorProfile.rejectionReason ?? "Your account could not be approved at this time."}
          </p>
          <p className="text-xs text-slate-400 mt-4">
            Contact{" "}
            <a href="mailto:support@carevia.gh" className="underline hover:text-slate-600">
              support@carevia.gh
            </a>{" "}
            for more information or to appeal.
          </p>
        </div>
      </div>
    )
  }

  // ── Approved doctor dashboard ─────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl w-full space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
            <CheckCircle size={11} />
            Verified by MDC Ghana
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome, Dr. {firstName}
        </h1>
        <p className="text-slate-500 mt-1 text-sm">{doctorProfile.specialty}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Clock}
          label="Pending Requests"
          value={pendingCount.toString()}
          color="amber"
        />
        <StatCard
          icon={Calendar}
          label="Scheduled Consults"
          value={acceptedCount.toString()}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Total Handled"
          value={(pendingCount + acceptedCount).toString()}
          color="green"
        />
      </div>

      {/* Pending appointments banner */}
      {pendingCount > 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full mb-1">
              Action Required
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">
              {pendingCount} Patient Consultation Request{pendingCount !== 1 ? "s" : ""}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review AI clinical summaries and confirm scheduled times.
            </p>
          </div>
          <Link
            href="/doctor/appointments"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-full text-xs font-semibold transition whitespace-nowrap w-fit shadow-xs active:scale-98"
          >
            <span>Review Intakes</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center shadow-xs">
          <Calendar size={28} className="text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-900 text-sm">No pending appointment requests</p>
          <p className="text-xs text-slate-500 mt-1">
            New patient appointment requests will appear here for your review.
          </p>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
  color?: "amber" | "blue" | "green"
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-700">
          <Icon size={15} />
        </div>
      </div>
      <p className="text-3xl font-bold tracking-tight text-slate-900">{value}</p>
    </div>
  )
}

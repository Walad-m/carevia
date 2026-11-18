import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { FALLBACK_OUTBREAK_ALERTS } from "@/lib/fallback-content"
import {
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  CreditCard,
  DollarSign,
  Activity,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react"

export const instant = false

export default async function AdminDashboardPage() {
  const session = await auth()

  const [
    pendingDoctors,
    totalUsers,
    approvedDoctors,
    totalPatients,
    totalAppointments,
    recentPayments,
    outbreakAlerts,
    allPayments,
  ] = await Promise.all([
    db.doctorProfile.count({ where: { status: "PENDING" } }),
    db.user.count(),
    db.doctorProfile.count({ where: { status: "APPROVED" } }),
    db.user.count({ where: { role: "PATIENT" } }),
    db.appointment.count(),
    db.payment
      ? db.payment.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            patient: { select: { name: true, email: true } },
            appointment: {
              include: {
                doctor: { select: { name: true, doctorProfile: { select: { specialty: true } } } },
              },
            },
          },
        })
      : Promise.resolve([]),
    db.outbreakAlert
      ? db.outbreakAlert.findMany({
          where: { isActive: true },
          orderBy: { publishedAt: "desc" },
        })
      : Promise.resolve([]),
    db.payment
      ? db.payment.findMany({
          where: { status: "COMPLETED" },
          select: { amount: true },
        })
      : Promise.resolve([]),
  ])

  // Compute financial metrics
  const totalVolumeGHS = allPayments.reduce((sum, p) => sum + p.amount, 0)
  const platformRevenueGHS = totalVolumeGHS * 0.2 // 20% platform fee
  const doctorPayoutsGHS = totalVolumeGHS * 0.8 // 80% disbursed to doctors
  const displayAlerts = outbreakAlerts.length > 0 ? outbreakAlerts : FALLBACK_OUTBREAK_ALERTS

  return (
    <div className="p-8 max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5">
          Superadmin Oversight
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Platform Command & Financial Ledger
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          Real-time operational intelligence, financial transactions, doctor credentials, and disease surveillance.
        </p>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Total Volume</span>
            <CreditCard size={15} className="text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            GH₵ {totalVolumeGHS.toFixed(2)}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <TrendingUp size={12} />
            <span>-20% Discounted Platform Rates</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Platform Revenue (20%)</span>
            <DollarSign size={15} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-800">
            GH₵ {platformRevenueGHS.toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Maintenance & AI infrastructure</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Doctor Payouts (80%)</span>
            <Users size={15} className="text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            GH₵ {doctorPayoutsGHS.toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Disbursed to practitioner wallets</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Consultations</span>
            <Activity size={15} className="text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {totalAppointments}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">AI-triaged patient bookings</p>
        </div>
      </div>

      {/* Operational Stats & Doctor Approvals */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Pending approvals alert */}
        <div className="sm:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                MDC Ghana Regulatory Gate
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">
                {pendingDoctors} Doctor Application{pendingDoctors === 1 ? "" : "s"} Awaiting Verification
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Review submitted practitioner retention certificates and cross-verify with the official Medical and Dental Council Ghana registry.
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xl shrink-0">
              {pendingDoctors}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Active verified doctors: <strong>{approvedDoctors}</strong>
            </span>
            <Link
              href="/admin/doctors"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800"
            >
              <span>Manage Approvals</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Public Health Alert Hub */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
              Surveillance Radar
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-2">
              {displayAlerts.length} Active GHS Disease Bulletins
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Currently broadcasted on the Carevia home page and patient health hub.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-600">
            {displayAlerts.slice(0, 2).map((a) => (
              <p key={a.id} className="truncate text-[11px] text-slate-700 py-0.5">
                • <strong>{a.disease}</strong> ({a.region})
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Real-Time Financial & Payment Audit Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Live Financial Transaction Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Simulated and confirmed MoMo / Card settlements across Ghana
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Currency: GHS</span>
        </div>

        {recentPayments.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No payments recorded yet. Test a consultation booking in the patient portal to view live ledger updates.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Transaction Ref</th>
                  <th className="pb-3">Patient</th>
                  <th className="pb-3">Attending Physician</th>
                  <th className="pb-3">Channel</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Date & Time</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 font-mono font-bold text-slate-900">
                      {p.transactionRef}
                    </td>
                    <td className="py-3 text-slate-700 font-medium">
                      {p.patient.name || "Patient"}
                    </td>
                    <td className="py-3 text-slate-600">
                      {p.appointment.doctor.name || "Assigned Doctor"}
                      <span className="block text-[10px] text-slate-400">
                        {p.appointment.doctor.doctorProfile?.specialty || "General Practice"}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {p.network || p.method}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-emerald-800 font-mono">
                      GH₵ {p.amount.toFixed(2)}
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">
                      {new Date(p.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

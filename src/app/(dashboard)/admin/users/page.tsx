import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Users, ShieldCheck, CheckCircle2, Clock, XCircle } from "lucide-react"

export const instant = false

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const users = await db.user.findMany({
    include: {
      patientProfile: true,
      doctorProfile: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">User Directory</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Auditing personal data records and consent under Act 843
          </p>
        </div>
        <div className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600 font-medium">
          Total Registered: {users.length}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status / Details</th>
                <th className="py-3 px-4">Act 843 Consent</th>
                <th className="py-3 px-4">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((u) => {
                const isDoctor = u.role === "DOCTOR"
                const isPatient = u.role === "PATIENT"

                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{u.name || "Unnamed"}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : u.role === "DOCTOR"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {isDoctor && u.doctorProfile && (
                        <div className="space-y-0.5">
                          <div>
                            <span className="text-slate-400">MDC ID:</span>{" "}
                            <span className="font-mono text-slate-700 font-medium">{u.doctorProfile.mdcId}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Field:</span> {u.doctorProfile.specialty}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {u.doctorProfile.status === "APPROVED" && (
                              <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                                <CheckCircle2 size={12} /> Approved
                              </span>
                            )}
                            {u.doctorProfile.status === "PENDING" && (
                              <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                                <Clock size={12} /> Pending Review
                              </span>
                            )}
                            {u.doctorProfile.status === "REJECTED" && (
                              <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                                <XCircle size={12} /> Rejected
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {isPatient && (
                        <div className="space-y-0.5 text-slate-500">
                          <div>
                            Blood Group: <span className="font-medium text-slate-700">{u.patientProfile?.bloodGroup || "Not specified"}</span>
                          </div>
                        </div>
                      )}
                      {u.role === "ADMIN" && (
                        <span className="text-slate-400">System Admin</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.consentGivenAt ? (
                        <div className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                          <ShieldCheck size={12} />
                          <span>Recorded</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Legacy / None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { SettingsView } from "./settings-view"

export const instant = false

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      consentGivenAt: true,
      createdAt: true,
      patientProfile: true,
      doctorProfile: true,
    },
  })

  if (!user) redirect("/login")

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Account Settings</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Manage your personal details and privacy controls
        </p>
      </div>

      <SettingsView user={user} />
    </div>
  )
}

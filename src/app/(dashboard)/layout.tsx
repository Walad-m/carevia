import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { IncomingCallAlert } from "@/components/video/incoming-call-alert"

export const instant = false

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) redirect("/login")

  return (
    <>
      <IncomingCallAlert userId={session.user.id} role={session.user.role} />
      <DashboardShell
        role={session.user.role}
        userName={session.user.name ?? "User"}
        userEmail={session.user.email}
      >
        {children}
      </DashboardShell>
    </>
  )
}

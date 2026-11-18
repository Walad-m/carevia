import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/shared/sidebar"
import { DashboardTopbar } from "@/components/shared/topbar"
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
    <div className="flex min-h-screen bg-slate-50">
      <IncomingCallAlert userId={session.user.id} role={session.user.role} />
      <Sidebar
        role={session.user.role}
        userName={session.user.name ?? "User"}
        userEmail={session.user.email}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar
          role={session.user.role}
          userName={session.user.name ?? "User"}
          userEmail={session.user.email}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

import { NotificationBell } from "./notification-bell"
import Link from "next/link"
import { ShieldCheck, HeartPulse } from "lucide-react"

export function DashboardTopbar({
  role,
  userName,
  userEmail,
}: {
  role: string
  userName: string
  userEmail?: string | null
}) {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0 font-sans">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
          {role} Workspace
        </span>
        <span className="hidden sm:inline text-xs text-slate-400">· Carevia Telehealth Ghana</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell (Patient & Doctor only) */}
        <NotificationBell userRole={role} />

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
            {userName.charAt(0)}
          </div>
          <div className="hidden md:block text-left text-xs">
            <p className="font-semibold text-slate-800 leading-tight">{userName}</p>
            <p className="text-[10px] text-slate-400 leading-tight">{userEmail}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

import { NotificationBell } from "./notification-bell"
import { Menu } from "lucide-react"

export function DashboardTopbar({
  role,
  userName,
  userEmail,
  onOpenMobileMenu,
}: {
  role: string
  userName: string
  userEmail?: string | null
  onOpenMobileMenu?: () => void
}) {
  return (
    <header className="h-14 sm:h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 md:px-8 flex items-center justify-between shrink-0 font-sans w-full">
      {/* Left: Mobile Menu Toggle + Workspace Badge */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-950 rounded-lg hover:bg-slate-100 transition"
            aria-label="Open sidebar navigation"
          >
            <Menu size={20} />
          </button>
        )}

        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-800 bg-slate-100 border border-slate-200 px-2.5 sm:px-3 py-1 rounded-full">
          {role} Workspace
        </span>
        <span className="hidden lg:inline text-xs text-slate-400">· Carevia Telehealth Ghana</span>
      </div>

      {/* Right: Notifications & User Avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell */}
        <NotificationBell userRole={role} />

        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-xs shadow-xs shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left text-xs">
            <p className="font-semibold text-slate-900 leading-tight truncate max-w-[120px] md:max-w-none">{userName}</p>
            <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[120px] md:max-w-none">{userEmail}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

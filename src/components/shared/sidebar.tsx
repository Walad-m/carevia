"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Clock,
  Users,
  CheckSquare,
  Video,
} from "lucide-react"
import { Role } from "@prisma/client"

type NavItem = { href: string; icon: React.ElementType; label: string }

const NAV: Record<Role, NavItem[]> = {
  PATIENT: [
    { href: "/patient", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/patient/appointments", icon: Calendar, label: "Appointments" },
    { href: "/patient/records", icon: FileText, label: "Medical Records" },
    { href: "/patient/consultations", icon: Video, label: "Consultations" },
  ],
  DOCTOR: [
    { href: "/doctor", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/doctor/schedule", icon: Clock, label: "My Schedule" },
    { href: "/doctor/appointments", icon: Calendar, label: "Appointments" },
  ],
  ADMIN: [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/doctors", icon: CheckSquare, label: "Doctor Approvals" },
    { href: "/admin/users", icon: Users, label: "All Users" },
  ],
}

export function Sidebar({
  role,
  userName,
  userEmail,
}: {
  role: Role
  userName: string
  userEmail: string
}) {
  const pathname = usePathname()
  const items = NAV[role] ?? []

  const roleBadge: Record<Role, string> = {
    PATIENT: "Patient",
    DOCTOR: "Doctor",
    ADMIN: "Administrator",
  }

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-slate-200/80 flex flex-col shrink-0 font-sans">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center shrink-0 shadow-xs">
            <span className="text-white font-bold text-xs">C</span>
          </div>
          <span className="font-semibold text-slate-900 tracking-tight text-base">Carevia</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-slate-100 pt-3 space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
        >
          <Settings size={16} />
          Account Settings
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
        >
          <LogOut size={16} />
          Sign out
        </button>

        {/* User chip */}
        <div className="mt-2 px-3 py-3 rounded-lg bg-slate-50">
          <p className="text-xs font-medium text-slate-900 truncate">{userName}</p>
          <p className="text-xs text-slate-500 mt-0.5">{roleBadge[role]}</p>
        </div>
      </div>
    </aside>
  )
}

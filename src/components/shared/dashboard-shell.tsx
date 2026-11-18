"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { DashboardTopbar } from "./topbar"
import { Role } from "@prisma/client"

export function DashboardShell({
  role,
  userName,
  userEmail,
  children,
}: {
  role: Role
  userName: string
  userEmail: string
  children: React.ReactNode
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* 1. Desktop Static Sidebar (Hidden on Mobile) */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          role={role}
          userName={userName}
          userEmail={userEmail}
        />
      </div>

      {/* 2. Mobile Drawer Slide-over (Shown on Mobile when toggled) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Drawer sidebar panel */}
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <Sidebar
              role={role}
              userName={userName}
              userEmail={userEmail}
              onNavigate={() => setMobileSidebarOpen(false)}
              isMobile
            />
          </div>
        </div>
      )}

      {/* 3. Main Dashboard Workspace (Full 100% width on Mobile) */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
        <DashboardTopbar
          role={role}
          userName={userName}
          userEmail={userEmail}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}

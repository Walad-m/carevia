import Link from "next/link"
import { AlertTriangle, ChevronRight, Activity } from "lucide-react"

interface OutbreakAlertItem {
  id: string
  title: string
  disease: string
  region: string
  severity: "INFO" | "WATCH" | "WARNING" | "CRITICAL"
}

export function OutbreakBanner({ alerts }: { alerts: OutbreakAlertItem[] }) {
  if (!alerts || alerts.length === 0) return null

  // Pick top critical/warning alert
  const topAlert = alerts[0]

  return (
    <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 text-white text-xs sm:text-sm font-medium py-2.5 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase shrink-0">
            <Activity size={12} className="animate-spin" />
            GHS Outbreak Radar
          </span>
          <span className="font-semibold truncate">
            {topAlert.disease} Alert: {topAlert.region}
          </span>
          <span className="hidden md:inline text-white/80 text-xs">
            — {topAlert.title}
          </span>
        </div>

        <a
          href="#outbreak-radar"
          className="shrink-0 inline-flex items-center gap-1 font-semibold text-white/95 hover:text-white bg-black/20 hover:bg-black/30 px-2.5 py-1 rounded-md text-xs transition"
        >
          <span>View Guidelines</span>
          <ChevronRight size={13} />
        </a>
      </div>
    </div>
  )
}

import { Activity, ArrowRight } from "lucide-react"

interface OutbreakAlertItem {
  id: string
  title: string
  disease: string
  region: string
  severity: "INFO" | "WATCH" | "WARNING" | "CRITICAL"
}

export function OutbreakBanner({ alerts }: { alerts: OutbreakAlertItem[] }) {
  if (!alerts || alerts.length === 0) return null

  const topAlert = alerts[0]

  return (
    <div className="bg-[#f5f5f7] border-b border-slate-200/60 py-2.5 px-4 text-xs font-normal text-slate-600 font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-900" />
        <span className="font-medium text-slate-900">
          Public Health Alert ({topAlert.region}):
        </span>
        <span className="truncate max-w-md text-slate-600">
          {topAlert.title}
        </span>
        <a
          href="#features"
          className="inline-flex items-center gap-0.5 text-slate-900 hover:text-black font-medium underline underline-offset-4 decoration-slate-300 ml-1.5 transition"
        >
          <span>Learn more</span>
          <ArrowRight size={11} />
        </a>
      </div>
    </div>
  )
}

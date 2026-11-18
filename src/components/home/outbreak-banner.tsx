import { ArrowRight } from "lucide-react"

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
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-center flex-wrap">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
        <span className="font-medium text-slate-900">
          Public Health Alert ({topAlert.region}):
        </span>
        <span className="text-slate-600 truncate max-w-xs sm:max-w-md">
          {topAlert.title}
        </span>
        <a
          href="#articles"
          className="inline-flex items-center gap-0.5 text-slate-900 hover:text-black font-semibold underline underline-offset-4 decoration-slate-300 ml-1 transition"
        >
          <span>Learn more</span>
          <ArrowRight size={11} />
        </a>
      </div>
    </div>
  )
}

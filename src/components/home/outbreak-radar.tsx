import Link from "next/link"
import { AlertCircle, ShieldAlert, ArrowRight, Activity, MapPin, CheckCircle, Info } from "lucide-react"

export interface OutbreakAlertData {
  id: string
  title: string
  disease: string
  region: string
  severity: "INFO" | "WATCH" | "WARNING" | "CRITICAL"
  summary: string
  symptoms: string
  preventionTips: string
  casesReported: number | null
  source: string
  publishedAt: Date
}

export function OutbreakRadarSection({ alerts }: { alerts: OutbreakAlertData[] }) {
  return (
    <section id="outbreak-radar" className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Activity size={14} className="animate-pulse" />
              Ghana Public Health Intelligence
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Active Outbreak Surveillance Radar
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-1 max-w-2xl">
              Real-time regional disease advisories and infection prevention protocols from the Ghana Health Service (GHS) and Ministry of Health.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Source: GHS Disease Surveillance</span>
          </div>
        </div>

        {/* Grid of Alerts */}
        <div className="grid md:grid-cols-3 gap-6">
          {alerts.map((alert) => {
            const isCritical = alert.severity === "CRITICAL" || alert.severity === "WARNING"
            const badgeColor =
              alert.severity === "CRITICAL"
                ? "bg-rose-600 text-white"
                : alert.severity === "WARNING"
                ? "bg-amber-600 text-white"
                : alert.severity === "WATCH"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-white"

            return (
              <div
                key={alert.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col overflow-hidden"
              >
                {/* Header Banner */}
                <div className="p-5 pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <MapPin size={12} className="text-rose-500" />
                      {alert.region}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 leading-snug">
                    {alert.title}
                  </h3>
                  <p className="text-xs font-medium text-teal-700 mt-0.5">
                    Pathogen: {alert.disease}
                  </p>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4 flex-1 text-xs">
                  <p className="text-slate-600 leading-relaxed">
                    {alert.summary}
                  </p>

                  {/* Symptoms */}
                  <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-3">
                    <p className="font-bold text-rose-900 mb-1 flex items-center gap-1">
                      <AlertCircle size={13} className="text-rose-600" />
                      Hallmark Symptoms:
                    </p>
                    <p className="text-rose-800 leading-relaxed font-medium">
                      {alert.symptoms}
                    </p>
                  </div>

                  {/* Prevention */}
                  <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3">
                    <p className="font-bold text-emerald-900 mb-1 flex items-center gap-1">
                      <CheckCircle size={13} className="text-emerald-600" />
                      Actionable Prevention:
                    </p>
                    <p className="text-emerald-800 leading-relaxed font-medium">
                      {alert.preventionTips}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    {alert.casesReported && alert.casesReported > 0 ? (
                      <span><strong>{alert.casesReported}</strong> cases monitored</span>
                    ) : (
                      <span>Active surveillance</span>
                    )}
                  </div>

                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline"
                  >
                    <span>Consult a Doctor</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Emergency Footnote */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-amber-700 shrink-0" />
            <span>
              If you or a family member exhibit severe dehydration, continuous vomiting, or unremitting high fever, do not wait for virtual consultation. Proceed to the nearest hospital facility or dial <strong>112</strong> for the National Ambulance Service.
            </span>
          </div>
          <a
            href="tel:112"
            className="shrink-0 bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg transition"
          >
            Call 112
          </a>
        </div>
      </div>
    </section>
  )
}

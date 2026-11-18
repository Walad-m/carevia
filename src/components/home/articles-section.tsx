"use client"

import { useState } from "react"
import { Clock, ArrowRight, AlertCircle, CheckCircle2, MapPin, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { ArticleData, ArticleModal } from "./article-modal"
import { OutbreakAlertData } from "./outbreak-radar"

export function HealthArticlesSection({
  alerts = [],
  articles = [],
}: {
  alerts?: OutbreakAlertData[]
  articles?: ArticleData[]
}) {
  const [selectedArticle, setSelectedArticle] = useState<ArticleData | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const topAlert = alerts[0]

  function openArticle(article: ArticleData) {
    setSelectedArticle(article)
    setModalOpen(true)
  }

  return (
    <section id="articles" className="py-20 sm:py-28 bg-[#f5f5f7] font-sans scroll-mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* 1. Dedicated Public Health Alert Card */}
        {topAlert && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-black/[0.06] shadow-xs space-y-6">
            {/* Alert Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200/80 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  Active {topAlert.severity} Advisory
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
                  <MapPin size={12} className="text-slate-400" />
                  {topAlert.region}
                </span>
              </div>

              <span className="text-xs text-slate-400 font-mono">
                Source: {topAlert.source}
              </span>
            </div>

            {/* Alert Title & Summary */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight">
                {topAlert.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                {topAlert.summary}
              </p>
              {topAlert.casesReported !== null && (
                <p className="text-xs font-medium text-slate-500 pt-1">
                  Surveillance tracking: <strong className="text-slate-900">{topAlert.casesReported} confirmed clinical cases</strong> recorded by regional disease response units.
                </p>
              )}
            </div>

            {/* Symptoms & Prevention Protocols */}
            <div className="grid md:grid-cols-2 gap-4 pt-2">
              {/* Symptoms */}
              <div className="bg-[#f5f5f7] rounded-2xl p-5 border border-slate-200/60 space-y-2">
                <div className="flex items-center gap-2 text-rose-700 text-xs font-semibold uppercase tracking-wider">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>Recognized Symptoms</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {topAlert.symptoms}
                </p>
              </div>

              {/* Prevention */}
              <div className="bg-[#f5f5f7] rounded-2xl p-5 border border-slate-200/60 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>Prevention & Water Sanitation Protocol</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {topAlert.preventionTips}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Experiencing acute gastrointestinal symptoms or fever in these regions?
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-slate-950 hover:bg-black text-white text-xs sm:text-sm font-medium px-6 py-3 rounded-full transition shadow-xs active:scale-95"
              >
                <span>Consult an On-Duty Doctor</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* 2. Medically Verified Clinical Guides Header */}
        <div className="space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Clinical Health Guides
            </p>
            <h3 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-950 leading-[1.1]">
              Evidence-based medicine. <br className="hidden sm:inline" />
              <span className="text-slate-400">Written for everyday life.</span>
            </h3>
            <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto font-normal">
              Guides authored and medically verified by licensed MDC Ghana specialists on cardiovascular wellness, infectious disease prevention, and pediatric care.
            </p>
          </div>

          {/* Articles Bento Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div
                key={article.id}
                onClick={() => openArticle(article)}
                className="bg-white rounded-3xl p-7 sm:p-8 border border-black/[0.05] shadow-xs flex flex-col justify-between hover:border-black/[0.12] transition group cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#f5f5f7] text-slate-800 border border-slate-200/80 px-2.5 py-0.5 rounded-full">
                      {article.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Clock size={12} />
                      {article.readTime}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg sm:text-xl font-semibold text-slate-950 tracking-tight leading-snug group-hover:text-black">
                      {article.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed font-normal line-clamp-3">
                      {article.summary}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{article.authorName}</p>
                    <p className="text-[11px] text-slate-400">{article.authorTitle}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-950 group-hover:translate-x-0.5 transition">
                    <span>Read Guide</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Full Article Reader Modal */}
      <ArticleModal
        article={selectedArticle}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  )
}

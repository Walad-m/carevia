"use client"

import { useState } from "react"
import { BookOpen, Clock, ArrowRight, UserCheck } from "lucide-react"
import { ArticleData, ArticleModal } from "./article-modal"

export function HealthArticlesSection({ articles }: { articles: ArticleData[] }) {
  const [selectedArticle, setSelectedArticle] = useState<ArticleData | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  function openArticle(article: ArticleData) {
    setSelectedArticle(article)
    setModalOpen(true)
  }

  return (
    <section id="health-articles" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <BookOpen size={14} />
              Carevia Health Intelligence
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Evidence-Based Guides for Everyday Ghanaian Health
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-1 max-w-2xl">
              Written and medically verified by licensed MDC Ghana specialists. Practical advice on nutrition, infectious disease prevention, and family health.
            </p>
          </div>
        </div>

        {/* Grid of Articles */}
        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group cursor-pointer"
              onClick={() => openArticle(article)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                    {article.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Clock size={12} />
                    {article.readTime}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-slate-900 leading-snug group-hover:text-teal-700 transition mb-2">
                  {article.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              <div className="p-6 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-[10px]">
                    {article.authorName.charAt(0)}
                  </div>
                  <div className="text-[11px]">
                    <span className="font-semibold text-slate-800 block truncate max-w-[130px]">
                      {article.authorName}
                    </span>
                    <span className="text-slate-400 text-[10px] block">MDC Verified</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    openArticle(article)
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 group-hover:text-teal-800"
                >
                  <span>Read Guide</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Reading Modal */}
      <ArticleModal
        article={selectedArticle}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  )
}

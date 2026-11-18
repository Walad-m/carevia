"use client"

import { useState } from "react"
import { Clock, ArrowRight } from "lucide-react"
import { ArticleData, ArticleModal } from "./article-modal"

export function HealthArticlesSection({ articles }: { articles: ArticleData[] }) {
  const [selectedArticle, setSelectedArticle] = useState<ArticleData | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  function openArticle(article: ArticleData) {
    setSelectedArticle(article)
    setModalOpen(true)
  }

  return (
    <section id="articles" className="py-24 sm:py-32 bg-[#f5f5f7] font-sans scroll-mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Clinical Health Guides
          </p>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-950 leading-[1.1]">
            Evidence-based medicine. <br className="hidden sm:inline" />
            <span className="text-slate-400">Written for everyday life.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-500 max-w-xl mx-auto font-normal">
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
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-950 tracking-tight leading-snug group-hover:text-black">
                    {article.title}
                  </h3>
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

      {/* Reader Modal */}
      <ArticleModal
        article={selectedArticle}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  )
}

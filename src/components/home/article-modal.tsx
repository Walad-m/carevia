"use client"

import { Clock, X, ArrowRight } from "lucide-react"
import Link from "next/link"

export interface ArticleData {
  id: string
  slug: string
  title: string
  category: string
  readTime: string
  summary: string
  content: string
  authorName: string
  authorTitle: string
  featured: boolean
  publishedAt: Date
}

export function ArticleModal({
  article,
  isOpen,
  onClose,
}: {
  article: ArticleData | null
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen || !article) return null

  // Clean formatting: strip any accidental markdown hashes or em dashes
  const cleanContent = article.content
    .replace(/###/g, "")
    .replace(/##/g, "")
    .replace(/#/g, "")
    .replace(/—/g, ", ")
    .replace(/–/g, "-")

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl border border-black/[0.08] animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-7 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200/80 px-2.5 py-0.5 rounded-full">
                {article.category}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Clock size={12} />
                {article.readTime}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-950 tracking-tight leading-snug">
              {article.title}
            </h2>
          </div>
          
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-950 p-2 rounded-full hover:bg-slate-100 transition shrink-0"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Author metadata */}
        <div className="px-5 sm:px-7 py-3 bg-[#f5f5f7] border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center font-semibold text-xs shrink-0">
            {article.authorName.charAt(0)}
          </div>
          <div className="text-xs">
            <p className="font-semibold text-slate-950">{article.authorName}</p>
            <p className="text-slate-500">{article.authorTitle}</p>
          </div>
        </div>

        {/* Content body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-4 text-slate-700 text-sm leading-relaxed whitespace-pre-line font-normal">
          {cleanContent}
        </div>

        {/* Footer CTA */}
        <div className="p-4 sm:p-5 bg-[#f5f5f7] border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            Have questions about this condition?
          </p>
          <Link
            href="/register"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-slate-950 hover:bg-black text-white px-5 py-2.5 rounded-full transition shadow-xs active:scale-95"
          >
            <span>Consult a Doctor (GH₵ 80)</span>
            <ArrowRight size={13} />
          </Link>
        </div>

      </div>
    </div>
  )
}

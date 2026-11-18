"use client"

import { useState } from "react"
import { BookOpen, Clock, User, X, CheckCircle, ArrowRight } from "lucide-react"
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                {article.category}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock size={12} />
                {article.readTime}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {article.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Author metadata */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
            {article.authorName.charAt(0)}
          </div>
          <div className="text-xs">
            <p className="font-semibold text-slate-900">{article.authorName}</p>
            <p className="text-slate-500">{article.authorTitle}</p>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-700 text-sm leading-relaxed whitespace-pre-line">
          {article.content}
        </div>

        {/* Footer CTA */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Need clinical clarification on this condition?
          </p>
          <Link
            href="/register"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-lg transition"
          >
            <span>Ask a Doctor</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  )
}

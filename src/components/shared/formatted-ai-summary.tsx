"use client"

import React from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface FormattedAiSummaryProps {
  summary: string
  className?: string
}

export function FormattedAiSummary({ summary, className = "" }: FormattedAiSummaryProps) {
  if (!summary) return null

  // Clean raw markdown headers like "### Clinical Intake Summary..."
  const lines = summary
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    // Filter out redundant main title if present as markdown header
    .filter((l) => !l.match(/^#{1,4}\s*(clinical\s*intake\s*summary|gemini\s*ai|ai\s*summary)/i))

  // Parse structured items: "- **Key:** Value" or "**Key:** Value"
  const parsedItems: { key?: string; value: string; isRedFlag?: boolean }[] = []

  for (const line of lines) {
    // Match bullet point with bold key: "- **Chief Complaint:** text" or "**Chief Complaint:** text"
    const match = line.match(/^[-*•]?\s*\*\*(.*?)\*\*:?\s*(.*)$/)

    if (match) {
      const rawKey = match[1].replace(/[:*#]/g, "").trim()
      let rawVal = match[2].replace(/\*\*/g, "").replace(/^[:\s-]+/, "").trim()

      const isRedFlag = rawKey.toLowerCase().includes("red flag") || rawKey.toLowerCase().includes("urgent")

      parsedItems.push({
        key: rawKey,
        value: rawVal,
        isRedFlag,
      })
    } else {
      // Regular line, strip any stray asterisks or hashes
      const cleaned = line
        .replace(/^[-*•#]+\s*/, "")
        .replace(/\*\*/g, "")
        .trim()

      if (cleaned.length > 0) {
        parsedItems.push({ value: cleaned })
      }
    }
  }

  return (
    <div className={`space-y-2.5 font-sans ${className}`}>
      {parsedItems.map((item, idx) => {
        if (item.key) {
          const isNoneReported =
            item.value.toLowerCase().startsWith("none") ||
            item.value.toLowerCase().includes("no red flags") ||
            item.value.toLowerCase().includes("no severe")

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border transition ${
                item.isRedFlag
                  ? isNoneReported
                    ? "bg-slate-50 border-slate-200/80"
                    : "bg-rose-50/70 border-rose-200"
                  : "bg-white border-slate-200/70 shadow-2xs"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span
                  className={`text-[11px] font-bold tracking-tight uppercase ${
                    item.isRedFlag
                      ? isNoneReported
                        ? "text-slate-800"
                        : "text-rose-700"
                      : "text-slate-900"
                  }`}
                >
                  {item.key}
                </span>

                {item.isRedFlag && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isNoneReported
                        ? "bg-slate-200/70 text-slate-700"
                        : "bg-rose-100 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {isNoneReported ? (
                      <>
                        <CheckCircle2 size={11} className="text-slate-600" />
                        <span>None Reported</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={11} className="text-rose-600" />
                        <span>Urgent Attention</span>
                      </>
                    )}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                {item.value}
              </p>
            </div>
          )
        }

        return (
          <p key={idx} className="text-xs text-slate-700 leading-relaxed">
            {item.value}
          </p>
        )
      })}
    </div>
  )
}

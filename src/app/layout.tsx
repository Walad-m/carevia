import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Carevia | Telemedicine Platform",
  description:
    "Professional telemedicine platform compliant with Ghana Data Protection Act 2012 (Act 843)",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
        {children}
      </body>
    </html>
  )
}

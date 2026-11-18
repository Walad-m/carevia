import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Brand */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">Carevia</span>
        </div>
        <p className="text-slate-500 text-sm">Healthcare at your fingertips</p>
      </div>

      <div className="w-full max-w-md">{children}</div>

      {/* Act 843 footer notice */}
      <p className="mt-8 text-xs text-slate-400 text-center max-w-sm leading-relaxed">
        Your data is protected under the{" "}
        <span className="text-slate-500 font-medium">
          Ghana Data Protection Act 2012 (Act 843)
        </span>
        .{" "}
        <Link href="/privacy" className="underline hover:text-slate-600">
          Privacy Policy
        </Link>{" "}
        ·{" "}
        <Link href="/terms" className="underline hover:text-slate-600">
          Terms of Service
        </Link>
      </p>
    </div>
  )
}

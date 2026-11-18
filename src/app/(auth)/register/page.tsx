"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Stethoscope, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react"
import { MEDICAL_SPECIALTIES, BLOOD_GROUPS, GENDERS } from "@/lib/constants"

type Step = "role" | "details"
type RoleType = "PATIENT" | "DOCTOR"

interface FormData {
  name: string
  email: string
  password: string
  phone: string
  specialty: string
  mdcId: string
  dateOfBirth: string
  gender: string
  bloodGroup: string
  consentGiven: boolean
  aiConsent: boolean
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"

function Field({
  label,
  children,
  required,
  hint,
}: {
  label: string
  children: React.ReactNode
  required?: boolean
  hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("role")
  const [role, setRole] = useState<RoleType | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState<FormData>({
    name: "", email: "", password: "", phone: "",
    specialty: "", mdcId: "",
    dateOfBirth: "", gender: "", bloodGroup: "",
    consentGiven: false, aiConsent: false,
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.consentGiven) {
      setError("You must accept the data policy to continue")
      return
    }
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.")
        setLoading(false)
        return
      }

      router.push("/login?registered=true")
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  // ── Step 1: Choose role ──────────────────────────────────────────────────
  if (step === "role") {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Create your account</h1>
          <p className="text-slate-500 text-sm mt-1">How will you be using Carevia?</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setRole("PATIENT"); setStep("details") }}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition">
              <User size={22} className="text-slate-500 group-hover:text-blue-600" />
            </div>
            <div className="text-center">
              <p className="font-medium text-slate-900 text-sm">Patient</p>
              <p className="text-xs text-slate-500 mt-0.5">I need medical care</p>
            </div>
          </button>

          <button
            onClick={() => { setRole("DOCTOR"); setStep("details") }}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition">
              <Stethoscope size={22} className="text-slate-500 group-hover:text-blue-600" />
            </div>
            <div className="text-center">
              <p className="font-medium text-slate-900 text-sm">Medical Professional</p>
              <p className="text-xs text-slate-500 mt-0.5">I provide healthcare</p>
            </div>
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    )
  }

  // ── Step 2: Fill in details ──────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <button
        onClick={() => setStep("role")}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm mb-5 transition"
      >
        <ArrowLeft size={15} />
        Back
      </button>

      <div className="mb-6">
        <div className="mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
            {role === "PATIENT" ? <User size={12} /> : <Stethoscope size={12} />}
            {role === "PATIENT" ? "Patient" : "Medical Professional"}
          </span>
        </div>
        <h1 className="text-xl font-semibold text-slate-900">Your details</h1>
        <p className="text-slate-500 text-sm mt-1">Fill in your information to get started</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Common fields */}
        <Field label="Full name" required>
          <input
            name="name" type="text" required value={form.name}
            onChange={handleChange} placeholder="Kwame Mensah"
            className={inputClass}
          />
        </Field>

        <Field label="Email address" required>
          <input
            name="email" type="email" required value={form.email}
            onChange={handleChange} placeholder="you@example.com"
            className={inputClass}
          />
        </Field>

        <Field label="Password" required hint="Minimum 8 characters">
          <div className="relative">
            <input
              name="password" type={showPassword ? "text" : "password"}
              required minLength={8} value={form.password}
              onChange={handleChange} placeholder="••••••••"
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        <Field label="Phone number">
          <input
            name="phone" type="tel" value={form.phone}
            onChange={handleChange} placeholder="+233 24 000 0000"
            className={inputClass}
          />
        </Field>

        {/* ── Doctor fields ── */}
        {role === "DOCTOR" && (
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Professional Information
            </p>

            <Field label="Medical specialty" required>
              <select
                name="specialty" required value={form.specialty}
                onChange={handleChange} className={inputClass}
              >
                <option value="">Select your specialty</option>
                {MEDICAL_SPECIALTIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>

            <Field
              label="MDC Ghana ID"
              required
              hint="Your Medical and Dental Council of Ghana registration number"
            >
              <input
                name="mdcId" type="text" required value={form.mdcId}
                onChange={handleChange} placeholder="e.g. MDC/2024/00001"
                className={inputClass}
              />
            </Field>
          </div>
        )}

        {/* ── Patient fields ── */}
        {role === "PATIENT" && (
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Medical Profile <span className="font-normal normal-case">(optional — can be added later)</span>
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Date of birth">
                <input
                  name="dateOfBirth" type="date" value={form.dateOfBirth}
                  onChange={handleChange} className={inputClass}
                />
              </Field>
              <Field label="Gender">
                <select
                  name="gender" value={form.gender}
                  onChange={handleChange} className={inputClass}
                >
                  <option value="">Select</option>
                  {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Blood group">
              <select
                name="bloodGroup" value={form.bloodGroup}
                onChange={handleChange} className={inputClass}
              >
                <option value="">Select</option>
                {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
          </div>
        )}

        {/* ── Act 843 Consent ── */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Data Privacy Consent
          </p>
          <p className="text-xs text-slate-500">
            Required under the Ghana Data Protection Act 2012 (Act 843)
          </p>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox" name="consentGiven"
              checked={form.consentGiven} onChange={handleChange}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600"
            />
            <span className="text-sm text-slate-600 leading-snug">
              I consent to Carevia collecting and processing my{" "}
              {role === "PATIENT" ? "personal and health" : "professional"} data
              for the purpose of providing telemedicine services, in accordance with the{" "}
              <Link href="/privacy" target="_blank" className="text-blue-600 underline">
                Privacy Policy
              </Link>
              . <span className="text-red-500">*</span>
            </span>
          </label>

          {role === "PATIENT" && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox" name="aiConsent"
                checked={form.aiConsent} onChange={handleChange}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600"
              />
              <span className="text-sm text-slate-600 leading-snug">
                I consent to my problem descriptions and voice notes being processed
                by Google Gemini AI to generate a clinical summary for my assigned doctor.
                The original content is preserved and accessible only to me and my doctor.
              </span>
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !form.consentGiven}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg text-sm transition flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}

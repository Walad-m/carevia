"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { BLOOD_GROUPS, GENDERS } from "@/lib/constants"
import {
  ShieldCheck,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Lock,
} from "lucide-react"

interface SettingsViewProps {
  user: {
    id: string
    name: string | null
    email: string
    role: string
    consentGivenAt: Date | null
    createdAt: Date
    patientProfile?: {
      phone: string | null
      dateOfBirth: Date | null
      gender: string | null
      bloodGroup: string | null
      allergies: string | null
      emergencyContact: string | null
      emergencyPhone: string | null
    } | null
    doctorProfile?: {
      specialty: string
      mdcId: string
      phone: string | null
      bio: string | null
      status: string
    } | null
  }
}

export function SettingsView({ user }: SettingsViewProps) {
  const router = useRouter()
  const isPatient = user.role === "PATIENT"
  const isDoctor = user.role === "DOCTOR"

  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const [form, setForm] = useState({
    name: user.name ?? "",
    phone: isPatient
      ? (user.patientProfile?.phone ?? "")
      : (user.doctorProfile?.phone ?? ""),
    dateOfBirth: user.patientProfile?.dateOfBirth
      ? new Date(user.patientProfile.dateOfBirth).toISOString().split("T")[0]
      : "",
    gender: user.patientProfile?.gender ?? "",
    bloodGroup: user.patientProfile?.bloodGroup ?? "",
    allergies: user.patientProfile?.allergies ?? "",
    emergencyContact: user.patientProfile?.emergencyContact ?? "",
    emergencyPhone: user.patientProfile?.emergencyPhone ?? "",
    bio: user.doctorProfile?.bio ?? "",
  })

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [erasing, setErasing] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg("")
    setErrorMsg("")

    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to update profile.")
      } else {
        setSuccessMsg("Profile updated successfully.")
        router.refresh()
      }
    } catch {
      setErrorMsg("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function handleExportData() {
    window.location.assign("/api/user/export")
  }

  async function handleErasure() {
    setErasing(true)
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" })
      if (res.ok) {
        try {
          await signOut({ redirect: false })
        } finally {
          window.location.href = "/login?deleted=true"
        }
      } else {
        setErrorMsg("Failed to erase account. Please contact support.")
        setErasing(false)
      }
    } catch {
      setErrorMsg("Network error during erasure.")
      setErasing(false)
    }
  }

  return (
    <div className="space-y-8">
      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-sm text-green-700">
          <CheckCircle2 size={18} className="shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700">
          <AlertCircle size={18} className="shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-1">Personal Profile</h2>
        <p className="text-xs text-slate-500 mb-6">Manage your account information and contact records</p>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+233 24 000 0000"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Doctor specific fields */}
          {isDoctor && user.doctorProfile && (
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">MDC Ghana ID</label>
                  <input
                    type="text"
                    disabled
                    value={user.doctorProfile.mdcId}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Specialty</label>
                  <input
                    type="text"
                    disabled
                    value={user.doctorProfile.specialty}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Professional Bio</label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell patients about your clinical focus and qualifications..."
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Patient specific fields */}
          {isPatient && (
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Medical Demographics (Optional)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select gender</option>
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Known Allergies</label>
                <input
                  type="text"
                  value={form.allergies}
                  onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Peanuts, Latex"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={form.emergencyContact}
                    onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                    placeholder="Next of kin / contact person"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={form.emergencyPhone}
                    onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
                    placeholder="+233 24 000 0000"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 cursor-pointer"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Act 843 Privacy & Data Rights Center */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Privacy & Data Rights (Act 843)</h2>
            <p className="text-xs text-slate-500">
              Your statutory rights under the Ghana Data Protection Act 2012
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 mt-6 text-sm">
          {/* Consent Status */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-medium text-slate-800">Processing Consent Record</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Proof of lawful consent for healthcare data processing under Section 20
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 w-fit">
              <CheckCircle2 size={14} />
              <span>
                Granted on{" "}
                {user.consentGivenAt
                  ? new Date(user.consentGivenAt).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                    })
                  : "Account Creation"}
              </span>
            </div>
          </div>

          {/* Right of Access (Data Portability) */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-medium text-slate-800">Right of Access (Download Data)</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Download a machine-readable JSON copy of all personal, medical, and consultation records
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition w-fit cursor-pointer"
            >
              <Download size={14} />
              Export My Data
            </button>
          </div>

          {/* Right to Erasure */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-medium text-red-600">Right to Erasure (Delete Account)</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Permanently purge your account, profile, and identifiers from Carevia
              </p>
            </div>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition w-fit cursor-pointer"
              >
                <Trash2 size={14} />
                Delete Account
              </button>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs space-y-2">
                <p className="font-medium text-red-700">Are you sure? This cannot be undone.</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleErasure}
                    disabled={erasing}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-medium disabled:opacity-50"
                  >
                    {erasing ? "Erasing…" : "Yes, Erase Everything"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

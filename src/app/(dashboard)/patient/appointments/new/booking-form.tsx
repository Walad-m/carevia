"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { VoiceRecorder } from "@/components/appointments/voice-recorder"
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  PhoneCall,
  UserCheck,
  CreditCard,
  Clock,
  ArrowLeft,
  DollarSign,
  Receipt,
  RotateCcw,
} from "lucide-react"

interface DoctorOption {
  id: string
  name: string | null
  email: string
  doctorProfile: {
    specialty: string
    mdcId: string
    consultFee: number
    bio: string | null
  } | null
}

interface TriageResult {
  matchedSpecialty: string
  urgency: "ROUTINE" | "URGENT" | "EMERGENCY"
  isEmergency: boolean
  emergencyAdvice: string | null
  chiefComplaint: string
  triageReasoning: string
  clinicalSummary: string
  suggestedQuestions: string[]
}

interface TriageResponse {
  triage: TriageResult
  consultFee: number
  isSpecialist: boolean
  matchedDoctor: {
    id: string
    name: string | null
    specialty: string
    mdcId?: string
    bio?: string | null
  } | null
  availableDoctorCount: number
}

export function BookingForm({ doctors }: { doctors: DoctorOption[] }) {
  const router = useRouter()

  // Step state: 1: Intake -> 2: Triage Review -> 3: MoMo Payment -> 4: Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Intake inputs
  const [problemText, setProblemText] = useState("")
  const [duration, setDuration] = useState("2-3 days")
  const [severity, setSeverity] = useState("Moderate")
  const [ageGroup, setAgeGroup] = useState("Adult (18-64)")
  const [audioBase64, setAudioBase64] = useState<string | null>(null)
  const [audioMimeType, setAudioMimeType] = useState<string>("audio/webm")

  // Triage state
  const [triageLoading, setTriageLoading] = useState(false)
  const [triageData, setTriageData] = useState<TriageResponse | null>(null)
  const [createdAppointmentId, setCreatedAppointmentId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"MTN_MOMO" | "TELECEL_CASH" | "AT_MONEY" | "CARD">("MTN_MOMO")
  const [phoneNumber, setPhoneNumber] = useState("024 123 4567")
  const [ussdModalOpen, setUssdModalOpen] = useState(false)
  const [pinInput, setPinInput] = useState("")
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    transactionRef: string
    amount: number
    channel: string
    paidAt: string
  } | null>(null)

  // 1. Submit Symptom Intake to AI Triage
  async function handleAnalyzeSymptoms(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg("")

    if (!problemText.trim() && !audioBase64) {
      setErrorMsg("Please describe your symptoms by text or record a voice note")
      return
    }

    setTriageLoading(true)

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemText: problemText.trim(),
          audioBase64: audioBase64 || undefined,
          audioMimeType: audioBase64 ? audioMimeType : undefined,
          severity,
          duration,
          ageGroup,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to analyze symptoms. Please try again.")
        setTriageLoading(false)
        return
      }

      setTriageData(data)
      setTriageLoading(false)
      setStep(2)
    } catch {
      setErrorMsg("Network error during AI triage. Please try again.")
      setTriageLoading(false)
    }
  }

  // 2. Confirm Triage & Create Appointment (Proceed to Payment)
  async function handleConfirmAndProceedToPayment() {
    if (!triageData) return
    setErrorMsg("")
    setTriageLoading(true)

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemText: problemText.trim(),
          audioBase64: audioBase64 || undefined,
          audioMimeType: audioBase64 ? audioMimeType : undefined,
          severity,
          duration,
          ageGroup,
          doctorId: triageData.matchedDoctor?.id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to book appointment")
        setTriageLoading(false)
        return
      }

      setCreatedAppointmentId(data.appointmentId)
      setTriageLoading(false)
      setStep(3)
    } catch {
      setErrorMsg("Network error creating appointment.")
      setTriageLoading(false)
    }
  }

  // 3. Trigger MoMo USSD Prompt Simulation
  function handleInitiatePayment() {
    setUssdModalOpen(true)
    setPinInput("")
  }

  // 4. Simulate USSD PIN Authorization
  async function handleAuthorizePayment() {
    if (!createdAppointmentId || !triageData) return
    setPaymentProcessing(true)

    // Simulate authentic network latency
    await new Promise((resolve) => setTimeout(resolve, 2000))

    try {
      const res = await fetch("/api/payments/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: createdAppointmentId,
          amount: triageData.consultFee,
          method: paymentMethod,
          phoneNumber,
          network: paymentMethod === "MTN_MOMO" ? "MTN" : paymentMethod === "TELECEL_CASH" ? "Telecel" : paymentMethod === "AT_MONEY" ? "AT" : "Card",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || "Payment simulation failed")
        setPaymentProcessing(false)
        setUssdModalOpen(false)
        return
      }

      setPaymentSuccessData(data)
      setPaymentProcessing(false)
      setUssdModalOpen(false)
      setStep(4)
    } catch {
      setErrorMsg("Network error during payment authorization.")
      setPaymentProcessing(false)
      setUssdModalOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-slate-900" : "text-slate-400"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"}`}>
              1
            </span>
            <span className="hidden sm:inline">Describe Symptoms</span>
          </div>
          <div className="h-0.5 flex-1 mx-3 bg-slate-100">
            <div className={`h-full bg-slate-900 transition-all ${step === 1 ? "w-0" : step === 2 ? "w-1/2" : "w-full"}`} />
          </div>
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-slate-900" : "text-slate-400"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"}`}>
              2
            </span>
            <span className="hidden sm:inline">AI Match & Triage</span>
          </div>
          <div className="h-0.5 flex-1 mx-3 bg-slate-100">
            <div className={`h-full bg-slate-900 transition-all ${step >= 3 ? "w-full" : "w-0"}`} />
          </div>
          <div className={`flex items-center gap-2 ${step >= 3 ? "text-slate-900" : "text-slate-400"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"}`}>
              3
            </span>
            <span className="hidden sm:inline">MoMo Checkout</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2">
          <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          STEP 1: CLINICAL DESCRIPTION & VOICE NOTE
         ────────────────────────────────────────────────────────── */}
      {step === 1 && (
        <form onSubmit={handleAnalyzeSymptoms} className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-900 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles size={14} />
                Guided Intake (AI Assisted · No Guesswork)
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Tell us what you are experiencing
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                You do not need to choose a doctor or guess medical specialties. Write in everyday language or record a voice note, and our clinical AI will prepare your intake and match you with the right verified physician.
              </p>
            </div>

            {/* Problem text description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Describe your symptoms & how you feel: <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                rows={4}
                placeholder="e.g. 'My baby has had a burning fever for 2 days and is vomiting' or 'I have a tight band headache and neck pain after work'..."
                className="w-full text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-300 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Voice Note Recorder */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Or Record a Voice Note (Local languages or English):
              </label>
              <VoiceRecorder
                onAudioRecorded={(base64: string, mimeType: string) => {
                  setAudioBase64(base64)
                  setAudioMimeType(mimeType)
                }}
                onClearAudio={() => {
                  setAudioBase64(null)
                  setAudioMimeType("audio/webm")
                }}
              />
            </div>

            {/* Context Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Duration:
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                >
                  <option value="Started today">Started today</option>
                  <option value="2-3 days">2-3 days</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="Over a month (Chronic)">Over a month (Chronic)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Severity:
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                >
                  <option value="Mild (Manageable at home)">Mild (Manageable at home)</option>
                  <option value="Moderate (Impacting daily work)">Moderate (Impacting daily work)</option>
                  <option value="Severe (Bedridden or intense pain)">Severe (Bedridden / intense pain)</option>
                  <option value="Critical (Acute distress)">Critical (Acute distress)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Age Group:
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                >
                  <option value="Infant / Child (<12 yrs)">Infant / Child (&lt;12 yrs)</option>
                  <option value="Teenager (13-17 yrs)">Teenager (13-17 yrs)</option>
                  <option value="Adult (18-64 yrs)">Adult (18-64 yrs)</option>
                  <option value="Elderly (65+ yrs)">Elderly (65+ yrs)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={triageLoading}
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-semibold text-sm py-4 rounded-full transition shadow-xs disabled:opacity-50 cursor-pointer active:scale-98"
          >
            {triageLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Running Clinical Triage & Matching Doctor...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Analyze Symptoms & Match Doctor</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      )}

      {/* ──────────────────────────────────────────────────────────
          STEP 2: AI TRIAGE & MATCHED DOCTOR PREVIEW
         ────────────────────────────────────────────────────────── */}
      {step === 2 && triageData && (
        <div className="space-y-6">
          {/* Emergency Alert Intercept */}
          {triageData.triage.isEmergency ? (
            <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-6 text-rose-950 space-y-4">
              <div className="flex items-center gap-2.5 text-rose-700">
                <AlertTriangle size={24} className="animate-bounce" />
                <h3 className="font-bold text-lg">
                  Critical Warning Signs Detected
                </h3>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed">
                {triageData.triage.emergencyAdvice ||
                  "Our clinical AI detected potential emergency symptoms in your intake. Please do not wait for virtual consultation. Proceed immediately to the nearest hospital emergency room."}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="tel:112"
                  className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition"
                >
                  <PhoneCall size={16} />
                  Call National Ambulance (112)
                </a>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-rose-800 underline font-medium"
                >
                  Edit My Symptom Notes
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                    <UserCheck size={13} />
                    Clinical AI Triage Completed
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Recommended Specialty: {triageData.triage.matchedSpecialty}
                  </h3>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                  {triageData.triage.urgency} Priority
                </span>
              </div>

              {/* Triage Plain Language Reasoning */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1">
                  Why this specialty was selected:
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                  {triageData.triage.triageReasoning}
                </p>
              </div>

              {/* Matched Doctor Card */}
              <div>
                <p className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                  Assigned On-Duty Practitioner:
                </p>
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center text-lg">
                      {triageData.matchedDoctor?.name?.charAt(0) || "D"}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">
                        {triageData.matchedDoctor?.name || "Verified Specialist"}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        {triageData.matchedDoctor?.specialty || triageData.triage.matchedSpecialty}
                      </p>
                      {triageData.matchedDoctor?.mdcId && (
                        <p className="text-[11px] text-slate-400 font-mono">
                          MDC ID: {triageData.matchedDoctor.mdcId}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-800 bg-slate-200/60 border border-slate-300/60 px-3 py-1 rounded-full">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    Available Today
                  </span>
                </div>
              </div>

              {/* Consultation Pricing (-20% Discount) */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Consultation Fee</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full">
                      20% Carevia Discount
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ghana standard: {triageData.isSpecialist ? "GH₵ 150" : "GH₵ 100"} · Mobile Money / Card
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-slate-900">
                    GH₵ {triageData.consultFee.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Doctor Availability Note */}
              <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200/60 p-3 rounded-2xl flex items-center gap-2">
                <Clock size={14} className="text-slate-400 shrink-0" />
                <span>
                  After checkout, your physician will confirm or propose your consultation time window. Our automated fallback engine guarantees prompt care.
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to Symptoms
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAndProceedToPayment}
                  disabled={triageLoading}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-full transition shadow-xs disabled:opacity-50 cursor-pointer active:scale-98"
                >
                  {triageLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Securing Appointment...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to MoMo Checkout (GH₵ {triageData.consultFee.toFixed(2)})</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          STEP 3: AUTHENTIC GHANA MOMO & CARD PAYMENT SIMULATION
         ────────────────────────────────────────────────────────── */}
      {step === 3 && triageData && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-800 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                <CreditCard size={14} />
                Ghanaian Mobile Payment Gateway
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Authorize Consultation Payment
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Select your preferred mobile wallet or bank card to finalize your consultation request.
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("MTN_MOMO")}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  paymentMethod === "MTN_MOMO"
                    ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                    : "border-slate-200 hover:bg-slate-50/50"
                }`}
              >
                <span className="text-[10px] font-bold bg-[#FFCC00] text-black px-1.5 py-0.5 rounded w-fit mb-2">
                  *170#
                </span>
                <span className="text-xs font-bold text-slate-900">MTN MoMo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("TELECEL_CASH")}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  paymentMethod === "TELECEL_CASH"
                    ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                    : "border-slate-200 hover:bg-slate-50/50"
                }`}
              >
                <span className="text-[10px] font-bold bg-[#E60000] text-white px-1.5 py-0.5 rounded w-fit mb-2">
                  *110#
                </span>
                <span className="text-xs font-bold text-slate-900">Telecel Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("AT_MONEY")}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  paymentMethod === "AT_MONEY"
                    ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                    : "border-slate-200 hover:bg-slate-50/50"
                }`}
              >
                <span className="text-[10px] font-bold bg-[#002D72] text-white px-1.5 py-0.5 rounded w-fit mb-2">
                  *110#
                </span>
                <span className="text-xs font-bold text-slate-900">AT Money</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("CARD")}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  paymentMethod === "CARD"
                    ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                    : "border-slate-200 hover:bg-slate-50/50"
                }`}
              >
                <span className="text-[10px] font-bold bg-slate-800 text-white px-1.5 py-0.5 rounded w-fit mb-2">
                  VISA/MC
                </span>
                <span className="text-xs font-bold text-slate-900">Bank Card</span>
              </button>
            </div>

            {/* Mobile number input for MoMo */}
            {paymentMethod !== "CARD" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Enter {paymentMethod === "MTN_MOMO" ? "MTN" : paymentMethod === "TELECEL_CASH" ? "Telecel" : "AT"} Mobile Money Number:
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="024 XXX XXXX"
                  className="w-full text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  A USSD approval prompt will be sent directly to this mobile device.
                </p>
              </div>
            )}

            {/* Invoice summary */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Clinical Teleconsultation:</span>
                <span>{triageData.triage.matchedSpecialty}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Consultation Fee:</span>
                <span className="font-medium text-slate-900">GH₵ {triageData.consultFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Carevia Platform Discount (-20%):</span>
                <span>- GH₵ {triageData.isSpecialist ? "30.00" : "20.00"}</span>
              </div>
              <div className="flex justify-between text-slate-900 border-t border-slate-200 pt-2 font-bold text-sm">
                <span>Total Amount Payable:</span>
                <span>GH₵ {triageData.consultFee.toFixed(2)}</span>
              </div>
            </div>

            {/* Button to trigger USSD prompt modal */}
            <button
              type="button"
              onClick={handleInitiatePayment}
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-semibold text-sm py-4 rounded-full transition shadow-xs active:scale-98 cursor-pointer"
            >
              <span>Pay GH₵ {triageData.consultFee.toFixed(2)} via {paymentMethod === "MTN_MOMO" ? "MTN MoMo" : paymentMethod === "TELECEL_CASH" ? "Telecel Cash" : paymentMethod === "AT_MONEY" ? "AT Money" : "Card"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          STEP 4: PAYMENT CONFIRMED & RECEIPT
         ────────────────────────────────────────────────────────── */}
      {step === 4 && paymentSuccessData && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full">
              Payment Successful & Verified
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-3">
              Consultation Secured!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Your consultation has been routed to your physician. An in-app confirmation has been delivered to your dashboard.
            </p>
          </div>

          {/* Official E-Receipt Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-md mx-auto text-left text-xs space-y-3 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-800 text-sm">Carevia Health Ltd</span>
              <span className="text-[10px] text-slate-500 uppercase">MDC Telehealth</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction Ref:</span>
              <span className="font-bold text-slate-900">{paymentSuccessData.transactionRef}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Channel:</span>
              <span className="text-slate-900 font-semibold">{paymentSuccessData.channel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Paid:</span>
              <span className="font-bold text-emerald-700">GH₵ {paymentSuccessData.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">GRA E-Levy Status:</span>
              <span className="text-emerald-700 font-semibold">Exempt (Healthcare)</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-[10px] text-slate-400">
              <span>Date & Time:</span>
              <span>{new Date().toLocaleString("en-GB")}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/patient/appointments?booked=true")}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-full transition shadow-xs cursor-pointer active:scale-98"
            >
              <span>View Appointment in Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          AUTHENTIC TELECOM USSD PROMPT MODAL (SIMULATION)
         ────────────────────────────────────────────────────────── */}
      {ussdModalOpen && triageData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 text-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            {/* Telecom Branding */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded ${
                    paymentMethod === "MTN_MOMO"
                      ? "bg-[#FFCC00] text-black"
                      : paymentMethod === "TELECEL_CASH"
                      ? "bg-[#E60000] text-white"
                      : paymentMethod === "AT_MONEY"
                      ? "bg-[#002D72] text-white"
                      : "bg-slate-700 text-white"
                  }`}
                >
                  {paymentMethod === "MTN_MOMO"
                    ? "MTN MoMo"
                    : paymentMethod === "TELECEL_CASH"
                    ? "Telecel Cash"
                    : paymentMethod === "AT_MONEY"
                    ? "AT Money"
                    : "Card"}
                </span>
                <span className="text-xs font-semibold text-slate-300">USSD Authorization</span>
              </div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Network Ready
              </span>
            </div>

            {paymentProcessing ? (
              <div className="py-8 text-center space-y-4">
                <Loader2 size={36} className="animate-spin text-teal-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-200">
                  Authorizing on telecom switch...
                </p>
                <p className="text-xs text-slate-400">
                  Please hold while the gateway confirms your payment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1.5 text-xs font-mono">
                  <p className="text-slate-400">
                    Authorize Payment to: <strong className="text-white">Carevia Health Ltd</strong>
                  </p>
                  <p className="text-slate-400">
                    Amount: <strong className="text-emerald-400 font-bold">GH₵ {triageData.consultFee.toFixed(2)}</strong>
                  </p>
                  <p className="text-slate-400">
                    Reference: <strong className="text-slate-200">CRV-{Date.now().toString().slice(-5)}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">
                    Enter 4-digit MM PIN to approve:
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="••••"
                    autoFocus
                    className="w-full text-center tracking-widest text-lg font-bold bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                  <p className="text-[10px] text-slate-500 text-center mt-1">
                    Demo Mode: Enter any 4 digits (e.g. 1234)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setUssdModalOpen(false)}
                    className="w-full py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-400 hover:bg-slate-900 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleAuthorizePayment}
                    className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition shadow-sm"
                  >
                    Authorize
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

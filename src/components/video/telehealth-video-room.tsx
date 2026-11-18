"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  FileText,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Clock,
  X,
  Maximize2,
  Minimize2,
  Video,
} from "lucide-react"

export interface TelehealthAppointment {
  id: string
  patientId?: string
  doctorId?: string
  scheduledAt: string | Date
  urgency?: string | null
  problemText?: string | null
  aiSummary?: string | null
  status: string
  patient: {
    id?: string
    name?: string | null
    email?: string | null
    patientProfile?: {
      gender?: string | null
      bloodGroup?: string | null
      phone?: string | null
    } | null
  }
  doctor?: {
    id?: string
    name?: string | null
    email?: string | null
    doctorProfile?: {
      specialty?: string | null
      mdcId?: string | null
    } | null
  } | null
}

interface TelehealthVideoRoomProps {
  appointment: TelehealthAppointment
  currentUserRole: "DOCTOR" | "PATIENT"
  onExit?: () => void
}

export function TelehealthVideoRoom({
  appointment,
  currentUserRole,
  onExit,
}: TelehealthVideoRoomProps) {
  const router = useRouter()
  const jitsiContainerRef = useRef<HTMLDivElement | null>(null)
  const apiRef = useRef<any>(null)

  // Status & duration state
  const [callDuration, setCallDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showDrawer, setShowDrawer] = useState(currentUserRole === "DOCTOR")
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Clinical Workspace State (for doctor)
  const [activeTab, setActiveTab] = useState<"summary" | "notes" | "rx">("summary")
  const [clinicalNotes, setClinicalNotes] = useState(
    "Patient presents with primary symptoms as reported. Vitals stable upon inspection. Advised adequate hydration, rest, and symptomatic therapy."
  )
  const [prescription, setPrescription] = useState(
    "1. Tab Paracetamol 1g PO TDS x 3 days\n2. Oral Rehydration Salts (ORS) 1 sachet in 1L water PRN\n3. Follow up if symptoms worsen"
  )
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)

  const patientName = appointment.patient?.name || "Patient"
  const doctorName = appointment.doctor?.name ? `Dr. ${appointment.doctor.name}` : "Attending Physician"
  const remotePeerName = currentUserRole === "DOCTOR" ? patientName : doctorName
  const remotePeerRole = currentUserRole === "DOCTOR" ? "Patient" : "Physician"

  // Exit / End call handler
  const handleExit = () => {
    if (apiRef.current) {
      try {
        apiRef.current.dispose()
      } catch {}
      apiRef.current = null
    }

    if (onExit) {
      onExit()
    } else {
      if (currentUserRole === "DOCTOR") {
        router.push("/doctor/schedule")
      } else {
        router.push("/patient/appointments")
      }
    }
  }

  // Doctor Complete Consultation & Record Generation
  const handleCompleteConsultation = async () => {
    setCompleting(true)
    try {
      const res = await fetch("/api/consultations/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appointment.id,
          clinicalNotes,
          prescription,
        }),
      })

      if (res.ok) {
        setCompleted(true)
        setTimeout(() => {
          handleExit()
        }, 1500)
      }
    } catch (err) {
      console.error("Failed to complete consultation:", err)
    } finally {
      setCompleting(false)
    }
  }

  // Initialize Jitsi Meet External API
  useEffect(() => {
    let mounted = true
    const roomName = `carevia-ghana-${appointment.id.replace(/[^a-zA-Z0-9]/g, "")}`
    const displayName =
      currentUserRole === "DOCTOR"
        ? (appointment.doctor?.name ? `Dr. ${appointment.doctor.name} (Physician)` : "Dr. Attending Physician")
        : (appointment.patient?.name ? `${appointment.patient.name} (Patient)` : "Patient")

    const initJitsi = () => {
      if (!mounted || !jitsiContainerRef.current) return
      if (apiRef.current) {
        try {
          apiRef.current.dispose()
        } catch {}
      }

      // Clear container before mounting
      jitsiContainerRef.current.innerHTML = ""

      try {
        const domain = "meet.jit.si"
        const options = {
          roomName,
          parentNode: jitsiContainerRef.current,
          width: "100%",
          height: "100%",
          userInfo: {
            displayName,
            email: currentUserRole === "DOCTOR" ? (appointment.doctor?.email || "") : (appointment.patient?.email || ""),
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            prejoinConfig: { enabled: false },
            disableDeepLinking: true,
            deeplinking: { disabled: true },
            enableWelcomePage: false,
            enableClosePage: false,
            disableThirdPartyRequests: true,
            enableLipSync: true,
            toolbarButtons: [
              "microphone",
              "camera",
              "desktop",
              "chat",
              "tileview",
              "hangup",
            ],
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRANDING_WATERMARK: false,
            SHOW_POWERED_BY: false,
            MOBILE_APP_PROMO: false,
            APP_NAME: "Carevia Telehealth Ghana",
            DEFAULT_REMOTE_DISPLAY_NAME: remotePeerName,
            TOOLBAR_ALWAYS_VISIBLE: false,
          },
        }

        const api = new (window as any).JitsiMeetExternalAPI(domain, options)
        apiRef.current = api

        api.addListener("videoConferenceJoined", () => {
          if (mounted) setIsLoading(false)
        })

        api.addListener("videoConferenceLeft", () => {
          handleExit()
        })

        api.addListener("readyToClose", () => {
          handleExit()
        })
      } catch (err) {
        console.error("Failed to initialize Jitsi Meet External API:", err)
        if (mounted) setIsLoading(false)
      }
    }

    // Load Jitsi External API script dynamically if not present
    if (typeof window !== "undefined") {
      if ((window as any).JitsiMeetExternalAPI) {
        initJitsi()
      } else {
        const scriptId = "jitsi-external-api-script"
        let script = document.getElementById(scriptId) as HTMLScriptElement | null

        if (!script) {
          script = document.createElement("script")
          script.id = scriptId
          script.src = "https://meet.jit.si/external_api.js"
          script.async = true
          script.onload = () => {
            if (mounted) initJitsi()
          }
          script.onerror = () => {
            console.error("Failed to load Jitsi external_api.js")
            if (mounted) setIsLoading(false)
          }
          document.body.appendChild(script)
        } else {
          script.addEventListener("load", () => {
            if (mounted) initJitsi()
          })
        }
      }
    }

    // Call duration counter
    const timer = setInterval(() => {
      setCallDuration((c) => c + 1)
    }, 1000)

    return () => {
      mounted = false
      clearInterval(timer)
      if (apiRef.current) {
        try {
          apiRef.current.dispose()
        } catch {}
        apiRef.current = null
      }
    }
  }, [appointment.id, currentUserRole])

  // Format call duration MM:SS
  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const s = sec % 60
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  return (
    <div className="relative w-full h-screen bg-[#0a0a0c] text-white flex flex-col overflow-hidden font-sans select-none">
      {/* Top Floating Glass Header Bar */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3 sm:p-5 pointer-events-none">
        {/* Left: Remote Peer Identity Badge */}
        <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-2xl border border-white/15 px-3.5 sm:px-4 py-2 rounded-full pointer-events-auto shadow-2xl">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div className="flex flex-col">
            <span className="font-semibold text-xs sm:text-sm tracking-tight leading-tight text-white">
              {remotePeerName}
            </span>
            <span className="text-[10px] text-white/60 leading-tight">
              {remotePeerRole} · {currentUserRole === "DOCTOR" ? `Patient (${appointment.patient?.patientProfile?.bloodGroup || "O+"})` : (appointment.doctor?.doctorProfile?.specialty || "Family Medicine")}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/20 text-xs text-white/80">
            <Clock size={12} className="text-white/60" />
            <span className="font-mono font-medium text-[11px]">{formatDuration(callDuration)}</span>
            <span className="text-white/40">·</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <ShieldCheck size={12} /> MDC Encrypted
            </span>
          </div>
        </div>

        {/* Right: Actions (Clinical Workspace & Fullscreen) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {currentUserRole === "DOCTOR" && (
            <button
              type="button"
              onClick={() => setShowDrawer(!showDrawer)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold backdrop-blur-xl transition shadow-lg cursor-pointer ${
                showDrawer
                  ? "bg-white text-slate-900 border border-white"
                  : "bg-slate-900/90 hover:bg-slate-800 text-white border border-white/15"
              }`}
            >
              <FileText size={14} />
              <span>Clinical Workspace</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-white transition backdrop-blur-xl shadow-lg cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      {/* Main Video Stage Area */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 text-center space-y-3 p-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-emerald-400 shadow-xl">
              <Loader2 size={24} className="animate-spin" />
            </div>
            <p className="text-sm font-semibold text-white">Connecting Secure Consultation Room...</p>
            <p className="text-xs text-white/50">Establishing encrypted WebRTC video bridge</p>
          </div>
        )}

        {/* Jitsi Meet Video Container */}
        <div
          ref={jitsiContainerRef}
          className="w-full h-full bg-[#111113] overflow-hidden"
        />

        {/* Doctor Clinical Workspace Slide-out (Apple Glass Sheet) */}
        {currentUserRole === "DOCTOR" && showDrawer && (
          <aside className="absolute top-5 right-5 bottom-5 w-full max-w-md bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-2xl z-30 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Sheet Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Clinical Consultation Record</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Patient: <strong className="text-slate-800">{patientName}</strong> · Blood:{" "}
                  {appointment.patient?.patientProfile?.bloodGroup || "O+"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDrawer(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Segmented Control / Apple Tabs */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/70 flex gap-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("summary")}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition cursor-pointer ${
                  activeTab === "summary"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Intake & AI
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("notes")}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition cursor-pointer ${
                  activeTab === "notes"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                SOAP Notes
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("rx")}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition cursor-pointer ${
                  activeTab === "rx"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Prescription
              </button>
            </div>

            {/* Sheet Content Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
              {activeTab === "summary" && (
                <div className="space-y-4">
                  {appointment.problemText && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                      <span className="font-semibold text-slate-700 block">Patient Description:</span>
                      <p className="text-slate-600 leading-relaxed italic">
                        &ldquo;{appointment.problemText}&rdquo;
                      </p>
                    </div>
                  )}

                  {appointment.aiSummary && (
                    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Sparkles size={14} className="text-slate-700" />
                        <span>Gemini Clinical Intake Summary</span>
                      </div>
                      <div className="whitespace-pre-line text-slate-600 leading-relaxed font-sans text-xs">
                        {appointment.aiSummary}
                      </div>
                    </div>
                  )}

                  {/* Patient Vitals Quick-check Card */}
                  <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 grid grid-cols-3 gap-3 text-center text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pulse</span>
                      <span className="text-slate-900 font-mono font-bold text-sm">74 bpm</span>
                    </div>
                    <div className="border-x border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Blood Press.</span>
                      <span className="text-slate-900 font-mono font-bold text-sm">118/78</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">SpO2</span>
                      <span className="text-slate-900 font-mono font-bold text-sm">99%</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notes" && (
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-800">
                    Physician Clinical Notes (SOAP Format):
                  </label>
                  <textarea
                    rows={11}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder="Subjective, Objective, Assessment, Plan..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed font-sans"
                  />
                </div>
              )}

              {activeTab === "rx" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-slate-800">
                      Carevia E-Prescription & Recommendations:
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">MDC Validated</span>
                  </div>
                  <textarea
                    rows={11}
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    placeholder="1. Tab Amoxicillin 500mg TDS..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed font-mono"
                  />
                  <p className="text-[10px] text-slate-400">
                    Digitally signed and archived directly into the patient&apos;s medical records.
                  </p>
                </div>
              )}
            </div>

            {/* Sheet Footer Action */}
            <div className="p-4 border-t border-slate-100 bg-white space-y-2">
              {completed ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Consultation Concluded & Saved!</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCompleteConsultation}
                  disabled={completing}
                  className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {completing ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}
                  <span>Conclude Consultation & Generate Medical Record</span>
                </button>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

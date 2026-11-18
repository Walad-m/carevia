"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Video, Phone, PhoneOff, ShieldCheck, User } from "lucide-react"

interface IncomingCallData {
  appointmentId: string
  doctorId: string
  doctorName: string
  specialty: string
  patientId: string
}

export function IncomingCallAlert({
  userId,
  role,
}: {
  userId: string
  role: string
}) {
  const router = useRouter()
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const ringIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Web Audio synthesizer for an authentic incoming phone chime
  const playChime = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioContextRef.current
      if (ctx.state === "suspended") {
        ctx.resume()
      }

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(523.25, ctx.currentTime) // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15) // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3) // G5

      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.65)
    } catch {
      // Audio autoplay policy
    }
  }

  // Start rhythmic ringtone
  useEffect(() => {
    if (incomingCall) {
      playChime()
      ringIntervalRef.current = setInterval(() => {
        playChime()
      }, 2500)
    } else {
      if (ringIntervalRef.current) {
        clearInterval(ringIntervalRef.current)
        ringIntervalRef.current = null
      }
    }

    return () => {
      if (ringIntervalRef.current) {
        clearInterval(ringIntervalRef.current)
      }
    }
  }, [incomingCall])

  // Listen for broadcast call alerts and poll API
  useEffect(() => {
    if (role !== "PATIENT") return

    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel("carevia-call-alerts")
      channel.onmessage = (event) => {
        if (event.data?.type === "CALL_START" && event.data.patientId === userId) {
          setIncomingCall(event.data)
        } else if (event.data?.type === "CALL_END" && event.data.appointmentId === incomingCall?.appointmentId) {
          setIncomingCall(null)
        }
      }
    } catch {
      // BroadcastChannel optional
    }

    // Polling fallback
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/consultations/call")
        if (res.ok) {
          const data = await res.json()
          if (data.incomingCall && data.incomingCall.patientId === userId) {
            setIncomingCall(data.incomingCall)
          } else {
            setIncomingCall(null)
          }
        }
      } catch {
        // Polling silent catch
      }
    }, 3500)

    return () => {
      clearInterval(interval)
      if (channel) channel.close()
    }
  }, [userId, role, incomingCall?.appointmentId])

  const handleAccept = async () => {
    if (!incomingCall) return
    const apptId = incomingCall.appointmentId

    // Notify backend
    try {
      await fetch("/api/consultations/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: apptId, action: "ACCEPT" }),
      })
    } catch {}

    setIncomingCall(null)
    router.push(`/consultation/${apptId}`)
  }

  const handleDecline = () => {
    setIncomingCall(null)
  }

  if (!incomingCall) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl space-y-6">
        
        {/* Calling Ripple Animation */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-emerald-500/20 animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg">
            <Video size={36} className="text-emerald-400 animate-bounce" />
          </div>
        </div>

        {/* Caller Info */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200 inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Incoming Video Consultation
          </span>
          <h3 className="text-xl font-bold text-slate-900 mt-2">
            Dr. {incomingCall.doctorName}
          </h3>
          <p className="text-xs text-slate-500">
            {incomingCall.specialty} · MDC Certified Physician
          </p>
        </div>

        {/* Security badge */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-center gap-1.5 text-xs text-slate-600">
          <ShieldCheck size={14} className="text-slate-900" />
          <span>Act 843 & MDC Encrypted Telehealth Call</span>
        </div>

        {/* Action Buttons: WhatsApp Style [Decline] and [Accept] */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleDecline}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer active:scale-95"
          >
            <PhoneOff size={16} />
            <span>Dismiss</span>
          </button>

          <button
            type="button"
            onClick={handleAccept}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer active:scale-95 animate-pulse"
          >
            <Phone size={16} />
            <span>Accept Call</span>
          </button>
        </div>
      </div>
    </div>
  )
}

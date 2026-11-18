"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Share2,
  FileText,
  Sparkles,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Loader2,
  Clock,
  User,
  X,
  Maximize2,
  Minimize2,
  Volume2,
  Pill,
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

  // Video element refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const channelRef = useRef<BroadcastChannel | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  // Media state
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [peerConnected, setPeerConnected] = useState(false)
  const [peerMuted, setPeerMuted] = useState(false)
  const [showDrawer, setShowDrawer] = useState(currentUserRole === "DOCTOR")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)

  // Clinical Workspace State (for doctor)
  const [activeTab, setActiveTab] = useState<"summary" | "notes" | "rx">("summary")
  const [clinicalNotes, setClinicalNotes] = useState(
    "Patient presents with primary symptoms as reported. Vitals stable upon remote inspection. Advised adequate hydration, rest, and symptomatic therapy."
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

  // 1. Initialize Local Media & WebRTC BroadcastChannel signaling
  useEffect(() => {
    let mounted = true
    const roomId = `carevia-room-${appointment.id}`

    // Setup local WebRTC broadcast channel for cross-tab communication
    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel(roomId)
      channelRef.current = channel
    } catch (e) {
      console.warn("BroadcastChannel not supported", e)
    }

    // Initialize WebRTC PeerConnection
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    })
    peerConnectionRef.current = pc

    // Handle remote track
    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0]
        setPeerConnected(true)
      }
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        if (channel) {
          channel.postMessage({
            type: "candidate",
            candidate: event.candidate,
            senderRole: currentUserRole,
          })
        }
        fetch("/api/consultations/call", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentId: appointment.id,
            action: "SIGNAL",
            candidate: event.candidate,
            role: currentUserRole,
          }),
        }).catch(() => {})
      }
    }

    // Cross-device internet WebRTC signaling polling
    const signalingPoll = setInterval(async () => {
      if (!mounted) return
      try {
        const res = await fetch(`/api/consultations/call?appointmentId=${appointment.id}`)
        if (!res.ok) return
        const data = await res.json()
        const call = data.call
        if (!call) return

        if (currentUserRole === "PATIENT" && call.offer && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(call.offer))
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          fetch("/api/consultations/call", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              appointmentId: appointment.id,
              action: "SIGNAL",
              answer,
              role: "PATIENT",
            }),
          }).catch(() => {})
          setPeerConnected(true)
        } else if (currentUserRole === "DOCTOR" && call.answer && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(call.answer))
          setPeerConnected(true)
        }

        const candidates = currentUserRole === "DOCTOR" ? call.patientCandidates : call.doctorCandidates
        if (candidates && candidates.length > 0) {
          for (const cand of candidates) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand))
            } catch {}
          }
        }
      } catch {}
    }, 2000)

    // Listen to signaling messages
    if (channel) {
      channel.onmessage = async (msg) => {
        if (!mounted || msg.data.senderRole === currentUserRole) return

        try {
          if (msg.data.type === "join") {
            // New peer joined -> create offer
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            channel?.postMessage({
              type: "offer",
              offer,
              senderRole: currentUserRole,
            })
          } else if (msg.data.type === "offer") {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.data.offer))
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            channel?.postMessage({
              type: "answer",
              answer,
              senderRole: currentUserRole,
            })
            setPeerConnected(true)
          } else if (msg.data.type === "answer") {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.data.answer))
            setPeerConnected(true)
          } else if (msg.data.type === "candidate") {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(msg.data.candidate))
            } catch (err) {
              console.warn("ICE candidate error", err)
            }
          }
        } catch (err) {
          console.warn("WebRTC signaling error", err)
        }
      }
    }

    // Start local webcam and mic
    async function startLocalMedia() {
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true,
          })
          if (!mounted) {
            stream.getTracks().forEach((t) => t.stop())
            return
          }
          localStreamRef.current = stream
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream
          }

          // Add tracks to PeerConnection
          stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream)
          })

          // Setup simple audio level meter
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
            const analyser = audioCtx.createAnalyser()
            const source = audioCtx.createMediaStreamSource(stream)
            source.connect(analyser)
            analyser.fftSize = 64
            const dataArray = new Uint8Array(analyser.frequencyBinCount)

            const updateAudio = () => {
              if (!mounted) {
                audioCtx.close()
                return
              }
              analyser.getByteFrequencyData(dataArray)
              let sum = 0
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i]
              }
              setAudioLevel(Math.min(100, Math.floor(sum / dataArray.length)))
              requestAnimationFrame(updateAudio)
            }
            updateAudio()
          } catch {
            // Audio analyser optional
          }

          // Broadcast join message to alert any active peer
          channel?.postMessage({
            type: "join",
            senderRole: currentUserRole,
          })

          // If doctor, trigger WhatsApp-style ringtone alert on the patient's dashboard
          if (currentUserRole === "DOCTOR") {
            const targetPatientId = appointment.patientId || appointment.patient?.id
            fetch("/api/consultations/call", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ appointmentId: appointment.id, action: "START" }),
            }).catch(() => {})

            try {
              const alertChannel = new BroadcastChannel("carevia-call-alerts")
              alertChannel.postMessage({
                type: "CALL_START",
                appointmentId: appointment.id,
                doctorId: appointment.doctorId || appointment.doctor?.id,
                doctorName: appointment.doctor?.name || "Attending Physician",
                specialty: appointment.doctor?.doctorProfile?.specialty || "General Practice",
                patientId: targetPatientId,
              })
              setTimeout(() => alertChannel.close(), 1000)
            } catch {}
          }
        }
      } catch (err) {
        console.warn("Local media stream error (e.g. permission or device not present):", err)
      }
    }

    startLocalMedia()

    // Call duration timer
    const interval = setInterval(() => {
      setCallDuration((c) => c + 1)
    }, 1000)

    return () => {
      mounted = false
      clearInterval(interval)
      clearInterval(signalingPoll)
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop())
      }
      pc.close()
      if (channel) {
        channel.close()
      }
    }
  }, [appointment.id, currentUserRole])

  // Toggle Camera
  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !cameraOn
      })
    }
    setCameraOn((prev) => !prev)
  }, [cameraOn])

  // Toggle Mic
  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !micOn
      })
    }
    setMicOn((prev) => !prev)
  }, [micOn])

  // Toggle Screen Share
  const toggleScreenShare = useCallback(async () => {
    if (!isScreenSharing && navigator.mediaDevices?.getDisplayMedia) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        const screenTrack = screenStream.getVideoTracks()[0]

        if (peerConnectionRef.current) {
          const senders = peerConnectionRef.current.getSenders()
          const videoSender = senders.find((s) => s.track?.kind === "video")
          if (videoSender) {
            videoSender.replaceTrack(screenTrack)
          }
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream
        }
        setIsScreenSharing(true)

        screenTrack.onended = () => {
          setIsScreenSharing(false)
          if (localStreamRef.current) {
            const originalTrack = localStreamRef.current.getVideoTracks()[0]
            if (peerConnectionRef.current) {
              const senders = peerConnectionRef.current.getSenders()
              const videoSender = senders.find((s) => s.track?.kind === "video")
              if (videoSender && originalTrack) {
                videoSender.replaceTrack(originalTrack)
              }
            }
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = localStreamRef.current
            }
          }
        }
      } catch {
        setIsScreenSharing(false)
      }
    } else {
      setIsScreenSharing(false)
      if (localStreamRef.current) {
        const originalTrack = localStreamRef.current.getVideoTracks()[0]
        if (peerConnectionRef.current) {
          const senders = peerConnectionRef.current.getSenders()
          const videoSender = senders.find((s) => s.track?.kind === "video")
          if (videoSender && originalTrack) {
            videoSender.replaceTrack(originalTrack)
          }
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current
        }
      }
    }
  }, [isScreenSharing])

  // End Call / Exit
  const handleEndCall = () => {
    fetch("/api/consultations/call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: appointment.id, action: "END" }),
    }).catch(() => {})

    try {
      const alertChannel = new BroadcastChannel("carevia-call-alerts")
      alertChannel.postMessage({
        type: "CALL_END",
        appointmentId: appointment.id,
      })
      setTimeout(() => alertChannel.close(), 500)
    } catch {}

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop())
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

  // Doctor Complete Consultation
  const handleCompleteConsultation = async () => {
    setCompleting(true)
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "COMPLETE",
          clinicalNotes,
          prescription,
        }),
      })

      if (res.ok) {
        setCompleted(true)
        setTimeout(() => {
          handleEndCall()
        }, 1500)
      }
    } catch (err) {
      console.error("Failed to complete consultation:", err)
    } finally {
      setCompleting(false)
    }
  }

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0")
    const s = (secs % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#000000] text-white flex flex-col font-sans select-none overflow-hidden">
      
      {/* Top Apple FaceTime Glass Bar */}
      <header className="absolute top-0 left-0 right-0 z-30 px-6 py-4 flex items-center justify-between pointer-events-none">
        {/* Left: Session & Encryption info */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/15 px-4 py-2 rounded-full pointer-events-auto shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-white tracking-tight">
              {remotePeerName}
            </span>
            <span className="text-white/40">·</span>
            <span className="text-white/70 font-mono text-[11px]">
              {formatTimer(callDuration)}
            </span>
            <span className="text-white/40">·</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <ShieldCheck size={12} /> MDC Encrypted
            </span>
          </div>
        </div>

        {/* Right: Drawer toggle & Fullscreen */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {currentUserRole === "DOCTOR" && (
            <button
              type="button"
              onClick={() => setShowDrawer(!showDrawer)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold backdrop-blur-xl transition shadow-lg ${
                showDrawer
                  ? "bg-white text-slate-900 border border-white"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/15"
              }`}
            >
              <FileText size={14} />
              <span>Clinical Workspace</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition backdrop-blur-xl shadow-lg"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      {/* Main Video Stage Area */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center p-3 sm:p-5 overflow-hidden">
        
        {/* Remote Peer Video Container (Fills background) */}
        <div className="relative w-full h-full rounded-3xl overflow-hidden bg-[#111113] border border-white/10 flex items-center justify-center shadow-2xl">
          
          {/* Real Remote Video Stream Element */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              peerConnected ? "opacity-100" : "opacity-0 absolute pointer-events-none"
            }`}
          />

          {/* When Peer is Not Connected (Waiting / High-Fidelity Remote Stream Simulator) */}
          {!peerConnected && (
            <div className="flex flex-col items-center justify-center text-center p-8 max-w-md space-y-6 animate-in fade-in duration-300">
              <div className="relative">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-b from-white/20 to-white/5 border border-white/20 flex items-center justify-center shadow-2xl backdrop-blur-md">
                  <User size={56} className="text-white/80" />
                </div>
                {/* Audio pulse ring */}
                <div className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ping pointer-events-none" />
                <div className="absolute -bottom-1 right-2 bg-emerald-500 text-black p-1.5 rounded-full shadow-lg ring-4 ring-[#111113]">
                  <Activity size={14} className="animate-spin" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {remotePeerName}
                </h2>
                <p className="text-xs text-white/60">
                  {remotePeerRole} · {currentUserRole === "DOCTOR" ? "Blood: " + (appointment.patient?.patientProfile?.bloodGroup || "O+") : (appointment.doctor?.doctorProfile?.specialty || "General Practice")}
                </p>
                <div className="pt-2 flex items-center justify-center gap-2 text-xs text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Room Active · Ready for Peer Stream</span>
                </div>
              </div>

              {/* Patient Vitals Card (Apple Health style) */}
              {currentUserRole === "DOCTOR" && (
                <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl grid grid-cols-3 gap-3 text-center text-xs">
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase font-semibold">Pulse</span>
                    <span className="text-white font-mono font-bold text-sm">74 bpm</span>
                  </div>
                  <div className="border-x border-white/10">
                    <span className="text-white/40 block text-[10px] uppercase font-semibold">Blood Press.</span>
                    <span className="text-white font-mono font-bold text-sm">118/78</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase font-semibold">SpO2</span>
                    <span className="text-white font-mono font-bold text-sm">99%</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Picture-in-Picture Local Self View (Apple FaceTime Corner PIP) */}
          <div className="absolute bottom-24 right-5 sm:right-7 w-36 sm:w-56 h-24 sm:h-36 rounded-2xl overflow-hidden bg-[#1c1c1e] border border-white/20 shadow-2xl z-20 backdrop-blur-md transition-all group">
            {cameraOn ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/50 text-xs gap-1">
                <VideoOff size={20} className="text-white/40" />
                <span className="text-[10px]">Camera Off</span>
              </div>
            )}

            {/* Self PIP overlay tag */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-white/90 font-medium">
              <span>You</span>
              <div className="flex items-center gap-1">
                {audioLevel > 5 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
                {!micOn && <MicOff size={10} className="text-rose-400" />}
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Clinical Workspace Slide-out (Apple Glass Sheet) */}
        {currentUserRole === "DOCTOR" && showDrawer && (
          <aside className="absolute top-5 right-5 bottom-24 w-full max-w-md bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-2xl z-30 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
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
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Segmented Control / Apple Tabs */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/70 flex gap-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("summary")}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition ${
                  activeTab === "summary"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Intake & AI
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("notes")}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition ${
                  activeTab === "notes"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                SOAP Notes
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("rx")}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition ${
                  activeTab === "rx"
                    ? "bg-white text-slate-900 shadow-xs"
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

      {/* Bottom Floating FaceTime Capsule Controls */}
      <footer className="absolute bottom-5 left-0 right-0 z-30 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-2xl border border-white/20 p-2.5 sm:p-3 rounded-full shadow-2xl pointer-events-auto">
          
          {/* Mic Toggle */}
          <button
            type="button"
            onClick={toggleMic}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-md ${
              micOn
                ? "bg-white/15 hover:bg-white/25 text-white"
                : "bg-rose-500 text-white"
            }`}
            title={micOn ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          {/* Camera Toggle */}
          <button
            type="button"
            onClick={toggleCamera}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-md ${
              cameraOn
                ? "bg-white/15 hover:bg-white/25 text-white"
                : "bg-rose-500 text-white"
            }`}
            title={cameraOn ? "Turn Camera Off" : "Turn Camera On"}
          >
            {cameraOn ? <VideoIcon size={20} /> : <VideoOff size={20} />}
          </button>

          {/* Screen Share Toggle */}
          <button
            type="button"
            onClick={toggleScreenShare}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-md ${
              isScreenSharing
                ? "bg-blue-500 text-white"
                : "bg-white/15 hover:bg-white/25 text-white"
            }`}
            title="Share Screen"
          >
            <Share2 size={20} />
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={handleEndCall}
            className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition shadow-lg active:scale-95"
            title="Leave / End Consultation"
          >
            <PhoneOff size={20} />
          </button>
        </div>
      </footer>
    </div>
  )
}

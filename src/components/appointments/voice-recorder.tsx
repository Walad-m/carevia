"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Square, Play, Pause, Trash2, Volume2, AlertCircle } from "lucide-react"

interface VoiceRecorderProps {
  onAudioRecorded: (audioBase64: string, mimeType: string) => void
  onClearAudio: () => void
}

export function VoiceRecorder({
  onAudioRecorded,
  onClearAudio,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  async function startRecording() {
    setErrorMsg("")
    audioChunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setHasPermission(true)

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm"

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)

        // Convert blob to base64
        const reader = new FileReader()
        reader.readAsDataURL(audioBlob)
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(",")[1]
          onAudioRecorded(base64String, mimeType)
        }

        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(200)
      setIsRecording(true)
      setRecordingDuration(0)

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } catch (err: any) {
      console.error("[MIC_ACCESS_ERROR]", err)
      setHasPermission(false)
      setErrorMsg("Microphone access denied. Please allow microphone permissions or describe in text.")
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  function handleClear() {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setIsPlaying(false)
    setRecordingDuration(0)
    onClearAudio()
  }

  function togglePlay() {
    if (!audioElementRef.current) return

    if (isPlaying) {
      audioElementRef.current.pause()
      setIsPlaying(false)
    } else {
      audioElementRef.current.play()
      setIsPlaying(true)
    }
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 size={16} className="text-slate-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Voice Symptom Note
          </span>
        </div>
        {isRecording && (
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            Recording: {formatTime(recordingDuration)}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Recording in progress */}
      {!audioUrl && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-medium transition cursor-pointer shadow-sm"
            >
              <Mic size={16} className="text-blue-600" />
              Start Voice Recording
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition cursor-pointer"
            >
              <Square size={14} className="fill-current" />
              Stop & Review Recording
            </button>
          )}

          <p className="text-xs text-slate-400 text-center sm:text-left">
            Describe how you feel naturally — Gemini AI extracts clinical symptoms.
          </p>
        </div>
      )}

      {/* Playback preview */}
      {audioUrl && (
        <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition cursor-pointer"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
            <div>
              <p className="text-xs font-medium text-slate-900">Voice Note Captured</p>
              <p className="text-[11px] text-slate-500 font-mono">
                Duration: {formatTime(recordingDuration)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Delete recording"
          >
            <Trash2 size={16} />
          </button>

          <audio
            ref={audioElementRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>
      )}
    </div>
  )
}

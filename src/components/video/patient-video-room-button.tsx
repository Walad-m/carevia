"use client"

import Link from "next/link"
import { Video } from "lucide-react"

interface PatientVideoRoomButtonProps {
  appointment: {
    id: string
  }
}

export function PatientVideoRoomButton({ appointment }: PatientVideoRoomButtonProps) {
  return (
    <Link
      href={`/consultation/${appointment.id}`}
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-full text-xs font-semibold transition shadow-xs active:scale-95 cursor-pointer"
    >
      <Video size={13} />
      <span>Join Video Call</span>
    </Link>
  )
}

"use client"

import { TelehealthVideoRoom, TelehealthAppointment } from "./telehealth-video-room"

export type VideoAppointment = TelehealthAppointment

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: VideoAppointment
  userRole: "DOCTOR" | "PATIENT"
}

export function VideoConsultationModal({
  isOpen,
  onClose,
  appointment,
  userRole,
}: VideoModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black animate-in fade-in duration-150">
      <TelehealthVideoRoom
        appointment={appointment}
        currentUserRole={userRole}
        onExit={onClose}
      />
    </div>
  )
}

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// In-memory active calls registry for fast real-time WebRTC signalling
const activeCalls = new Map<
  string,
  {
    appointmentId: string
    doctorId: string
    doctorName: string
    specialty: string
    patientId: string
    patientName: string
    status: "CALLING" | "ACCEPTED" | "ENDED"
    startedAt: number
    offer?: any
    answer?: any
    doctorCandidates: any[]
    patientCandidates: any[]
  }
>()

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const appointmentId = searchParams.get("appointmentId")

    // If specific appointment requested
    if (appointmentId) {
      const call = activeCalls.get(appointmentId)
      return NextResponse.json({ call: call || null })
    }

    // Otherwise find any active call where current user is the patient
    let incomingCall = null
    const now = Date.now()
    for (const [_, call] of activeCalls) {
      // Calls expire after 3 minutes if unaccepted
      if (now - call.startedAt > 180000) {
        continue
      }
      if (call.patientId === session.user.id && call.status === "CALLING") {
        incomingCall = call
        break
      }
    }

    return NextResponse.json({ incomingCall })
  } catch (error) {
    console.error("[ACTIVE_CALL_GET]", error)
    return NextResponse.json({ incomingCall: null })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { appointmentId, action, offer, answer, candidate, role } = body

    if (!appointmentId) {
      return NextResponse.json({ error: "Missing appointmentId" }, { status: 400 })
    }

    let existingCall = activeCalls.get(appointmentId)

    if (action === "START") {
      const appointment = await db.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              doctorProfile: { select: { specialty: true } },
            },
          },
          patient: {
            select: { id: true, name: true },
          },
        },
      })

      if (!appointment) {
        return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
      }

      const newCall = {
        appointmentId,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctor.name || "Attending Physician",
        specialty: appointment.doctor.doctorProfile?.specialty || "General Practice",
        patientId: appointment.patientId,
        patientName: appointment.patient.name || "Patient",
        status: "CALLING" as const,
        startedAt: Date.now(),
        offer: offer || null,
        doctorCandidates: [],
        patientCandidates: [],
      }
      activeCalls.set(appointmentId, newCall)

      return NextResponse.json({
        success: true,
        call: newCall,
      })
    }

    if (action === "SIGNAL") {
      if (!existingCall) {
        existingCall = {
          appointmentId,
          doctorId: session.user.id,
          doctorName: session.user.name || "Doctor",
          specialty: "General Practice",
          patientId: "",
          patientName: "",
          status: "ACCEPTED",
          startedAt: Date.now(),
          doctorCandidates: [],
          patientCandidates: [],
        }
        activeCalls.set(appointmentId, existingCall)
      }

      if (offer) {
        existingCall.offer = offer
      }
      if (answer) {
        existingCall.answer = answer
        existingCall.status = "ACCEPTED"
      }
      if (candidate) {
        if (role === "DOCTOR") {
          existingCall.doctorCandidates.push(candidate)
        } else {
          existingCall.patientCandidates.push(candidate)
        }
      }

      return NextResponse.json({ success: true, call: existingCall })
    }

    if (action === "ACCEPT") {
      if (existingCall) {
        existingCall.status = "ACCEPTED"
      }
      return NextResponse.json({ success: true, call: existingCall })
    }

    if (action === "END") {
      activeCalls.delete(appointmentId)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[ACTIVE_CALL_POST]", error)
    return NextResponse.json({ error: "Failed to process call signaling" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export interface CallState {
  __carevia_call__: true
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

// In-memory active calls registry for instant same-instance caching
const activeCalls = new Map<string, CallState>()

async function getCallState(appointmentId: string): Promise<CallState | null> {
  const inMemory = activeCalls.get(appointmentId)
  if (inMemory && Date.now() - inMemory.startedAt < 3600000) {
    return inMemory
  }

  try {
    const appt = await db.appointment.findUnique({
      where: { id: appointmentId },
      select: { declineReason: true },
    })

    if (appt?.declineReason && appt.declineReason.startsWith('{"__carevia_call__":true')) {
      const parsed: CallState = JSON.parse(appt.declineReason)
      activeCalls.set(appointmentId, parsed)
      return parsed
    }
  } catch (err) {
    console.error("[GET_CALL_STATE_ERROR]", err)
  }

  return null
}

async function saveCallState(appointmentId: string, state: CallState | null) {
  if (state) {
    activeCalls.set(appointmentId, state)
    try {
      await db.appointment.update({
        where: { id: appointmentId },
        data: { declineReason: JSON.stringify(state) },
      })
    } catch (err) {
      console.error("[SAVE_CALL_STATE_ERROR]", err)
    }
  } else {
    activeCalls.delete(appointmentId)
    try {
      await db.appointment.update({
        where: { id: appointmentId },
        data: { declineReason: null },
      })
    } catch (err) {
      console.error("[CLEAR_CALL_STATE_ERROR]", err)
    }
  }
}

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
      const call = await getCallState(appointmentId)
      return NextResponse.json({ call: call || null })
    }

    // Otherwise find any active call where current user is the patient
    const now = Date.now()
    for (const [_, call] of activeCalls) {
      if (now - call.startedAt < 180000 && call.patientId === session.user.id && call.status === "CALLING") {
        return NextResponse.json({ incomingCall: call })
      }
    }

    // Check database if not in local lambda memory
    try {
      const appts = await db.appointment.findMany({
        where: {
          patientId: session.user.id,
          declineReason: { startsWith: '{"__carevia_call__":true' },
        },
        select: { declineReason: true },
        take: 3,
      })

      for (const appt of appts) {
        if (!appt.declineReason) continue
        const parsed: CallState = JSON.parse(appt.declineReason)
        if (parsed.status === "CALLING" && now - parsed.startedAt < 180000) {
          activeCalls.set(parsed.appointmentId, parsed)
          return NextResponse.json({ incomingCall: parsed })
        }
      }
    } catch (err) {
      console.error("[INCOMING_CALL_DB_ERROR]", err)
    }

    return NextResponse.json({ incomingCall: null })
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

    let existingCall = await getCallState(appointmentId)

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

      const newCall: CallState = {
        __carevia_call__: true,
        appointmentId,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctor.name || "Attending Physician",
        specialty: appointment.doctor.doctorProfile?.specialty || "General Practice",
        patientId: appointment.patientId,
        patientName: appointment.patient.name || "Patient",
        status: "CALLING",
        startedAt: Date.now(),
        offer: offer || existingCall?.offer || null,
        answer: existingCall?.answer || null,
        doctorCandidates: existingCall?.doctorCandidates || [],
        patientCandidates: existingCall?.patientCandidates || [],
      }

      await saveCallState(appointmentId, newCall)

      return NextResponse.json({
        success: true,
        call: newCall,
      })
    }

    if (action === "SIGNAL") {
      if (!existingCall) {
        existingCall = {
          __carevia_call__: true,
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
          if (!existingCall.doctorCandidates) existingCall.doctorCandidates = []
          existingCall.doctorCandidates.push(candidate)
        } else {
          if (!existingCall.patientCandidates) existingCall.patientCandidates = []
          existingCall.patientCandidates.push(candidate)
        }
      }

      await saveCallState(appointmentId, existingCall)

      return NextResponse.json({ success: true, call: existingCall })
    }

    if (action === "ACCEPT") {
      if (existingCall) {
        existingCall.status = "ACCEPTED"
        await saveCallState(appointmentId, existingCall)
      }
      return NextResponse.json({ success: true, call: existingCall })
    }

    if (action === "END") {
      await saveCallState(appointmentId, null)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[ACTIVE_CALL_POST]", error)
    return NextResponse.json({ error: "Failed to process call signaling" }, { status: 500 })
  }
}

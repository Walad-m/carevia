import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { triagePatientProblem } from "@/lib/gemini"
import { GP_CONSULT_FEE_GHS, SPECIALIST_CONSULT_FEE_GHS } from "@/lib/constants"

const createAppointmentSchema = z.object({
  doctorId: z.string().nullable().optional(),
  scheduledAt: z.string().nullable().optional(),
  problemText: z.string().nullable().optional(),
  voiceAudioUrl: z.string().nullable().optional(),
  audioBase64: z.string().nullable().optional(),
  audioMimeType: z.string().nullable().optional(),
  severity: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
  ageGroup: z.string().nullable().optional(),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, role } = session.user

    if (role === "PATIENT") {
      let appointments: any[] = []
      try {
        appointments = await (db.appointment as any).findMany({
          where: { patientId: id },
          include: {
            doctor: {
              select: {
                name: true,
                email: true,
                doctorProfile: {
                  select: {
                    specialty: true,
                    consultFee: true,
                    mdcId: true,
                  },
                },
              },
            },
            payment: true,
          },
          orderBy: { scheduledAt: "desc" },
        })
      } catch {
        appointments = await (db.appointment as any).findMany({
          where: { patientId: id },
          include: {
            doctor: {
              select: {
                name: true,
                email: true,
                doctorProfile: {
                  select: {
                    specialty: true,
                    consultFee: true,
                    mdcId: true,
                  },
                },
              },
            },
          },
          orderBy: { scheduledAt: "desc" },
        })
      }
      return NextResponse.json(appointments)
    }

    if (role === "DOCTOR") {
      let appointments: any[] = []
      try {
        appointments = await (db.appointment as any).findMany({
          where: { doctorId: id },
          include: {
            patient: {
              select: {
                name: true,
                email: true,
                patientProfile: {
                  select: {
                    dateOfBirth: true,
                    gender: true,
                    bloodGroup: true,
                    allergies: true,
                    emergencyContact: true,
                    emergencyPhone: true,
                    phone: true,
                  },
                },
              },
            },
            payment: true,
          },
          orderBy: { scheduledAt: "asc" },
        })
      } catch {
        appointments = await (db.appointment as any).findMany({
          where: { doctorId: id },
          include: {
            patient: {
              select: {
                name: true,
                email: true,
                patientProfile: {
                  select: {
                    dateOfBirth: true,
                    gender: true,
                    bloodGroup: true,
                    allergies: true,
                    emergencyContact: true,
                    emergencyPhone: true,
                    phone: true,
                  },
                },
              },
            },
          },
          orderBy: { scheduledAt: "asc" },
        })
      }
      return NextResponse.json(appointments)
    }

    if (role === "ADMIN") {
      let appointments: any[] = []
      try {
        appointments = await (db.appointment as any).findMany({
          include: {
            patient: { select: { name: true, email: true } },
            doctor: { select: { name: true, email: true } },
            payment: true,
          },
          orderBy: { scheduledAt: "desc" },
        })
      } catch {
        appointments = await (db.appointment as any).findMany({
          include: {
            patient: { select: { name: true, email: true } },
            doctor: { select: { name: true, email: true } },
          },
          orderBy: { scheduledAt: "desc" },
        })
      }
      return NextResponse.json(appointments)
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  } catch (error) {
    console.error("[APPOINTMENTS_GET]", error)
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "PATIENT") {
      return NextResponse.json(
        { error: "Only registered patients can book appointments" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const data = createAppointmentSchema.parse(body)

    if (!data.problemText?.trim() && !data.audioBase64) {
      return NextResponse.json(
        { error: "Please describe your symptoms by text or record a voice note" },
        { status: 400 }
      )
    }

    // 1. Run AI Triage Engine (Prepare • Flag • Route — Never Diagnoses)
    const triage = await triagePatientProblem({
      problemText: data.problemText || undefined,
      audioBase64: data.audioBase64 || undefined,
      audioMimeType: data.audioMimeType || undefined,
      severity: data.severity || undefined,
      duration: data.duration || undefined,
      ageGroup: data.ageGroup || undefined,
    })

    // If life-threatening emergency flagged, provide emergency response
    if (triage.isEmergency) {
      return NextResponse.json({
        isEmergency: true,
        emergencyAdvice: triage.emergencyAdvice,
        message: "High-risk symptoms detected. Please contact Ghana Emergency Services (112) immediately.",
      })
    }

    // 2. Doctor matching
    let targetDoctorId = data.doctorId

    if (!targetDoctorId) {
      // Find on-duty approved doctor in matched specialty
      let matchedDocs: any[] = await db.user.findMany({
        where: {
          role: "DOCTOR",
          doctorProfile: {
            status: "APPROVED",
            specialty: triage.matchedSpecialty,
          },
        },
        select: { id: true },
      })

      // If no same-specialty doctor on-duty, fallback to approved on-duty doctor pool
      if (matchedDocs.length === 0) {
        matchedDocs = await db.user.findMany({
          where: {
            role: "DOCTOR",
            doctorProfile: {
              status: "APPROVED",
            },
          },
          select: { id: true },
        })
      }

      if (matchedDocs.length === 0) {
        return NextResponse.json(
          { error: "No doctors are currently on-duty. Please try again shortly." },
          { status: 503 }
        )
      }

      targetDoctorId = matchedDocs[0].id
    }

    if (!targetDoctorId) {
      return NextResponse.json(
        { error: "No doctors are currently available. Please try again shortly." },
        { status: 503 }
      )
    }

    // Default scheduled time if not chosen by patient: 30 minutes from now (doctor can confirm/adjust)
    const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : new Date(Date.now() + 30 * 60 * 1000)

    const isSpecialist = triage.matchedSpecialty !== "General Practice / Family Medicine"
    const consultFee = isSpecialist ? SPECIALIST_CONSULT_FEE_GHS : GP_CONSULT_FEE_GHS

    // Create the appointment
    let appointment: any
    try {
      appointment = await (db.appointment as any).create({
        data: {
          patientId: session.user.id,
          doctorId: targetDoctorId,
          scheduledAt,
          problemText: data.problemText?.trim() || null,
          voiceAudioUrl: data.voiceAudioUrl || (data.audioBase64 ? `data:${data.audioMimeType || "audio/webm"};base64,${data.audioBase64}` : null),
          urgency: triage.urgency,
          matchedSpecialty: triage.matchedSpecialty,
          triageReasoning: triage.triageReasoning,
          aiSummary: triage.clinicalSummary,
          status: "PENDING",
        },
        include: {
          doctor: {
            select: {
              name: true,
              doctorProfile: {
                select: {
                  specialty: true,
                  mdcId: true,
                },
              },
            },
          },
        },
      })
    } catch (createErr) {
      console.warn("[APPOINTMENT_CREATE_FALLBACK]", createErr)
      // Fallback if running server process has not reloaded new schema fields
      appointment = await (db.appointment as any).create({
        data: {
          patientId: session.user.id,
          doctorId: targetDoctorId,
          scheduledAt,
          problemText: data.problemText?.trim() || null,
          voiceAudioUrl: data.voiceAudioUrl || (data.audioBase64 ? `data:${data.audioMimeType || "audio/webm"};base64,${data.audioBase64}` : null),
          aiSummary: triage.clinicalSummary,
          status: "PENDING",
        },
        include: {
          doctor: {
            select: {
              name: true,
              doctorProfile: {
                select: {
                  specialty: true,
                  mdcId: true,
                },
              },
            },
          },
        },
      })
    }

    // Privacy-respecting in-app notification for Doctor ONLY
    try {
      await db.notification.create({
        data: {
          userId: targetDoctorId,
          title: "New Consultation Assigned",
          message: `A new consultation has been assigned to your queue (Specialty: ${triage.matchedSpecialty}, Priority: ${triage.urgency}). Please review clinical intake and confirm availability.`,
          type: "APPOINTMENT",
        },
      })
    } catch (notifErr) {
      console.warn("[DOCTOR_NOTIF_WARN]", notifErr)
    }

    // Privacy-respecting in-app notification for Patient ONLY
    try {
      await db.notification.create({
        data: {
          userId: session.user.id,
          title: "Consultation Request Received",
          message: `Your care request has been routed to ${appointment.doctor?.name || "an MDC-verified doctor"} (${triage.matchedSpecialty}). Awaiting scheduling confirmation.`,
          type: "APPOINTMENT",
        },
      })
    } catch (notifErr) {
      console.warn("[PATIENT_NOTIF_WARN]", notifErr)
    }

    return NextResponse.json(
      {
        message: "Consultation booked and triaged successfully",
        appointmentId: appointment.id,
        matchedDoctor: appointment.doctor || null,
        consultFee,
        triage,
      },
      { status: 201 }
    )
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
    }
    console.error("[APPOINTMENT_CREATE]", error)
    return NextResponse.json(
      { error: error?.message || "Failed to book appointment. Please try again." },
      { status: 500 }
    )
  }
}

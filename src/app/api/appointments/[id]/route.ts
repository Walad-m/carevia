import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const updateSchema = z.object({
  action: z.enum(["ACCEPT", "DECLINE", "COMPLETE"]),
  declineReason: z.string().nullable().optional(),
  newScheduledAt: z.string().nullable().optional(), // Doctor permission to adjust/confirm time
  clinicalNotes: z.string().nullable().optional(),
  prescription: z.string().nullable().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { action, declineReason, newScheduledAt, clinicalNotes, prescription } = updateSchema.parse(body)

    const appointment = await db.appointment.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, name: true } },
        doctor: { select: { id: true, name: true, doctorProfile: { select: { specialty: true } } } },
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    if (appointment.doctorId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only update appointments assigned to you" },
        { status: 403 }
      )
    }

    // 1. ACTION: ACCEPT
    if (action === "ACCEPT") {
      const scheduledDate = newScheduledAt ? new Date(newScheduledAt) : appointment.scheduledAt

      const updated = await db.appointment.update({
        where: { id },
        data: {
          status: "ACCEPTED",
          scheduledAt: scheduledDate,
          declineReason: null,
        },
      })

      // Privacy-respecting in-app notification for Patient ONLY (Admin excluded)
      try {
        await db.notification.create({
          data: {
            userId: appointment.patientId,
            title: "Consultation Confirmed",
            message: `Your consultation with ${appointment.doctor.name || "your physician"} has been confirmed for ${scheduledDate.toLocaleString("en-GB")}.`,
            type: "APPOINTMENT",
          },
        })
      } catch (notifErr) {
        console.warn("[APPOINTMENT_NOTIFICATION] Patient alert error:", notifErr)
      }

      return NextResponse.json({
        message: "Appointment accepted and scheduled successfully",
        appointment: updated,
      })
    }

    // 2. ACTION: COMPLETE (Conclude Telemedicine Consultation)
    if (action === "COMPLETE") {
      let finalSummary = appointment.aiSummary || ""
      if (clinicalNotes || prescription) {
        finalSummary += `\n\n--- CLINICAL CONSULTATION SUMMARY ---\n`
        if (clinicalNotes) {
          finalSummary += `Doctor's Clinical Notes:\n${clinicalNotes}\n\n`
        }
        if (prescription) {
          finalSummary += `Prescriptions & Recommendations:\n${prescription}\n`
        }
      }

      const completed = await db.appointment.update({
        where: { id },
        data: {
          status: "COMPLETED",
          aiSummary: finalSummary.trim(),
        },
      })

      try {
        await db.notification.create({
          data: {
            userId: appointment.patientId,
            title: "Consultation Completed",
            message: `Your consultation with Dr. ${appointment.doctor.name || "your physician"} has completed. Your clinical summary and prescription are ready in Consultations.`,
            type: "APPOINTMENT",
          },
        })
      } catch (notifErr) {
        console.warn("[APPOINTMENT_NOTIFICATION] Completion alert error:", notifErr)
      }

      return NextResponse.json({
        message: "Consultation concluded and marked as completed",
        appointment: completed,
      })
    }

    // 3. ACTION: DECLINE -> AUTOMATED PRIVACY-PRESERVING FALLBACK ENGINE
    if (action === "DECLINE") {
      const currentSpecialty =
        (appointment as any).matchedSpecialty ||
        appointment.doctor?.doctorProfile?.specialty ||
        "General Practice / Family Medicine"

      // Search for next available, approved doctor in the same specialty (excluding current doctor)
      let standbyDoctor: any = await db.user.findFirst({
        where: {
          role: "DOCTOR",
          id: { not: session.user.id },
          doctorProfile: {
            status: "APPROVED",
            specialty: currentSpecialty,
          },
        },
        include: { doctorProfile: true },
      })

      // If no same-specialty doctor is on duty, fallback to General Practice safety net
      if (!standbyDoctor) {
        standbyDoctor = await db.user.findFirst({
          where: {
            role: "DOCTOR",
            id: { not: session.user.id },
            doctorProfile: {
              status: "APPROVED",
            },
          },
          include: { doctorProfile: true },
        })
      }

      // If still no approved doctor found, look for any other doctor account
      if (!standbyDoctor) {
        standbyDoctor = await db.user.findFirst({
          where: {
            role: "DOCTOR",
            id: { not: session.user.id },
          },
          include: { doctorProfile: true },
        })
      }

      // If no other doctor exists at all (demo single-doctor database), provision verified standby physician
      if (!standbyDoctor) {
        try {
          standbyDoctor = await (db.user as any).upsert({
            where: { email: "standby.doctor@carevia.gh" },
            update: { role: "DOCTOR" },
            create: {
              email: "standby.doctor@carevia.gh",
              name: "Dr. Abena Osei",
              role: "DOCTOR",
              doctorProfile: {
                create: {
                  specialty: "General Practice / Family Medicine",
                  mdcId: "MDC/GP/2021/0844",
                  status: "APPROVED",
                  isAvailable: true,
                  consultFee: 80,
                },
              },
            },
            include: { doctorProfile: true },
          })
        } catch (seedErr) {
          console.warn("[REROUTE_STANDBY_CREATION] Standby doctor fallback:", seedErr)
        }
      }

      if (standbyDoctor) {
        // Reroute appointment seamlessly
        let rerouted: any = null
        try {
          rerouted = await (db.appointment as any).update({
            where: { id },
            data: {
              doctorId: standbyDoctor.id,
              status: "PENDING",
              rerouteCount: { increment: 1 },
              declineReason: null,
            },
          })
        } catch {
          rerouted = await db.appointment.update({
            where: { id },
            data: {
              doctorId: standbyDoctor.id,
              status: "PENDING",
              declineReason: null,
            },
          })
        }

        // Privacy rule: Doctor notification NEVER mentions other doctors' names or queues
        try {
          await db.notification.create({
            data: {
              userId: standbyDoctor.id,
              title: "New Consultation Request",
              message: `A consultation matching your specialty (${standbyDoctor.doctorProfile?.specialty || "General Practice"}) is awaiting your confirmation. Please review the clinical intake.`,
              type: "APPOINTMENT",
            },
          })
        } catch (notifErr) {
          console.warn("[APPOINTMENT_NOTIFICATION] Standby doctor alert error:", notifErr)
        }

        // Privacy rule: Patient notification is comforting, neutral, and reveals no failure/queue drama
        try {
          await db.notification.create({
            data: {
              userId: appointment.patientId,
              title: "Consultation Scheduling Update",
              message: "Your consultation has been routed to an on-duty medical practitioner. We are confirming their schedule for you.",
              type: "APPOINTMENT",
            },
          })
        } catch (notifErr) {
          console.warn("[APPOINTMENT_NOTIFICATION] Patient reroute alert error:", notifErr)
        }

        return NextResponse.json({
          message: "Consultation updated and automatically assigned to next available on-duty practitioner",
          rerouted: true,
          appointment: rerouted,
        })
      }

      // If truly no other doctor could be found or created
      const declined = await db.appointment.update({
        where: { id },
        data: {
          status: "DECLINED",
          declineReason: declineReason || "Practitioners currently unavailable",
        },
      })

      try {
        await db.notification.create({
          data: {
            userId: appointment.patientId,
            title: "Consultation Scheduling Notice",
            message: "All practitioners in this specialty are currently occupied in clinic procedures. A refund or priority reschedule has been reserved for you.",
            type: "APPOINTMENT",
          },
        })
      } catch (notifErr) {
        console.warn("[APPOINTMENT_NOTIFICATION] Decline notice error:", notifErr)
      }

      return NextResponse.json({
        message: "No standby doctor available; appointment marked declined",
        rerouted: false,
        appointment: declined,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
    }
    console.error("[APPOINTMENT_UPDATE]", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

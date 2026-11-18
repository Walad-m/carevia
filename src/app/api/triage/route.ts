import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { triagePatientProblem } from "@/lib/gemini"
import { GP_CONSULT_FEE_GHS, SPECIALIST_CONSULT_FEE_GHS } from "@/lib/constants"

const triageSchema = z.object({
  problemText: z.string().nullable().optional(),
  audioBase64: z.string().nullable().optional(),
  audioMimeType: z.string().nullable().optional(),
  severity: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
  ageGroup: z.string().nullable().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = triageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
    }

    const { problemText, audioBase64, audioMimeType, severity, duration, ageGroup } = parsed.data

    if (!problemText?.trim() && !audioBase64) {
      return NextResponse.json(
        { error: "Please enter text or record a voice note describing your symptoms" },
        { status: 400 }
      )
    }

    // 1. Run Gemini AI Clinical Triage
    const triage = await triagePatientProblem({
      problemText: problemText || undefined,
      audioBase64: audioBase64 || undefined,
      audioMimeType: audioMimeType || undefined,
      severity: severity || undefined,
      duration: duration || undefined,
      ageGroup: ageGroup || undefined,
    })

    // 2. Query verified doctors matching the specialty (or General Practice fallback)
    let candidateDoctors = await db.user.findMany({
      where: {
        role: "DOCTOR",
        doctorProfile: {
          status: "APPROVED",
          specialty: triage.matchedSpecialty,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        doctorProfile: {
          select: {
            specialty: true,
            mdcId: true,
            consultFee: true,
            bio: true,
          },
        },
      },
    })

    // If no specific specialist found, find approved General Practice doctors as safety net
    if (candidateDoctors.length === 0) {
      candidateDoctors = await db.user.findMany({
        where: {
          role: "DOCTOR",
          doctorProfile: {
            status: "APPROVED",
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          doctorProfile: {
            select: {
              specialty: true,
              mdcId: true,
              consultFee: true,
              bio: true,
            },
          },
        },
      })
    }

    // Determine platform consultation fee (-20% discount)
    const isSpecialist = triage.matchedSpecialty !== "General Practice / Family Medicine"
    const consultFee = isSpecialist ? SPECIALIST_CONSULT_FEE_GHS : GP_CONSULT_FEE_GHS

    // Select the best doctor (e.g. first available)
    const matchedDoctor = candidateDoctors[0] || null

    return NextResponse.json({
      triage,
      consultFee,
      isSpecialist,
      matchedDoctor: matchedDoctor
        ? {
            id: matchedDoctor.id,
            name: matchedDoctor.name,
            specialty: matchedDoctor.doctorProfile?.specialty || triage.matchedSpecialty,
            mdcId: matchedDoctor.doctorProfile?.mdcId,
            bio: matchedDoctor.doctorProfile?.bio,
          }
        : null,
      availableDoctorCount: candidateDoctors.length,
    })
  } catch (error) {
    console.error("[TRIAGE_ROUTE_ERROR]", error)
    return NextResponse.json({ error: "Failed to complete AI triage. Please try again." }, { status: 500 })
  }
}

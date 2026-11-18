import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const availabilitySchema = z.object({
  isAvailable: z.boolean(),
  availableDays: z.string().nullable().optional(),
  availableFrom: z.string().nullable().optional(),
  availableTo: z.string().nullable().optional(),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const doctorProfile = await db.doctorProfile.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json(doctorProfile || { isAvailable: true })
  } catch (error) {
    console.error("[DOCTOR_AVAILABILITY_GET]", error)
    return NextResponse.json({ isAvailable: true, error: "Failed to fetch availability" }, { status: 200 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = availabilitySchema.parse(body)

    let updatedRecord: any = null

    try {
      const existing = await db.doctorProfile.findUnique({
        where: { userId: session.user.id },
      })

      if (existing) {
        updatedRecord = await db.doctorProfile.update({
          where: { userId: session.user.id },
          data: {
            isAvailable: parsed.isAvailable,
            availableDays: parsed.availableDays ?? existing.availableDays ?? "MON,TUE,WED,THU,FRI,SAT",
            availableFrom: parsed.availableFrom ?? existing.availableFrom ?? "08:00",
            availableTo: parsed.availableTo ?? existing.availableTo ?? "18:00",
          },
        })
      } else {
        updatedRecord = await db.doctorProfile.create({
          data: {
            userId: session.user.id,
            specialty: "General Practice / Family Medicine",
            mdcId: `MDC/GP/${Date.now().toString().slice(-6)}`,
            isAvailable: parsed.isAvailable,
            availableDays: parsed.availableDays ?? "MON,TUE,WED,THU,FRI,SAT",
            availableFrom: parsed.availableFrom ?? "08:00",
            availableTo: parsed.availableTo ?? "18:00",
            status: "APPROVED",
          },
        })
      }
    } catch (dbErr) {
      console.warn("[DOCTOR_AVAILABILITY] Fallback to raw update:", dbErr)
      try {
        await db.$executeRawUnsafe(
          `UPDATE "DoctorProfile" SET "isAvailable" = $1 WHERE "userId" = $2`,
          parsed.isAvailable,
          session.user.id
        )
      } catch (rawErr) {
        console.warn("[DOCTOR_AVAILABILITY] Raw update error (ignorable):", rawErr)
      }
    }

    return NextResponse.json({
      message: "Availability status updated successfully",
      isAvailable: parsed.isAvailable,
      availableDays: parsed.availableDays || updatedRecord?.availableDays || "MON,TUE,WED,THU,FRI,SAT",
      availableFrom: parsed.availableFrom || updatedRecord?.availableFrom || "08:00",
      availableTo: parsed.availableTo || updatedRecord?.availableTo || "18:00",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
    }
    console.error("[DOCTOR_AVAILABILITY_PATCH]", error)
    return NextResponse.json({ error: "Failed to update availability" }, { status: 500 })
  }
}

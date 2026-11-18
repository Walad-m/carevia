import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional(),
  // Patient fields
  dateOfBirth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  bloodGroup: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
  emergencyPhone: z.string().optional().nullable(),
  // Doctor fields
  bio: z.string().optional().nullable(),
})

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = schema.parse(body)

    // Update user base fields
    if (data.name) {
      await db.user.update({
        where: { id: session.user.id },
        data: { name: data.name },
      })
    }

    // Update profile based on role
    if (session.user.role === "PATIENT") {
      await db.patientProfile.upsert({
        where: { userId: session.user.id },
        update: {
          phone: data.phone,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          gender: data.gender,
          bloodGroup: data.bloodGroup,
          allergies: data.allergies,
          emergencyContact: data.emergencyContact,
          emergencyPhone: data.emergencyPhone,
        },
        create: {
          userId: session.user.id,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          gender: data.gender,
          bloodGroup: data.bloodGroup,
          allergies: data.allergies,
          emergencyContact: data.emergencyContact,
          emergencyPhone: data.emergencyPhone,
        },
      })
    } else if (session.user.role === "DOCTOR") {
      await db.doctorProfile.update({
        where: { userId: session.user.id },
        data: {
          phone: data.phone,
          bio: data.bio,
        },
      })
    }

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
    }
    console.error("[SETTINGS_UPDATE]", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}

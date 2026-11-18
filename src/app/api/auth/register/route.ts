import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["PATIENT", "DOCTOR"]),
  consentGiven: z.boolean().refine((v) => v === true, {
    message: "You must accept the data policy to continue",
  }),
  phone: z.string().optional(),
  // Doctor fields
  specialty: z.string().optional(),
  mdcId: z.string().optional(),
  // Patient fields
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const normalizedEmail = data.email.toLowerCase().trim()

    // Check existing email
    const existing = await db.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    // Doctor-specific validation
    if (data.role === "DOCTOR") {
      if (!data.specialty || !data.mdcId) {
        return NextResponse.json(
          { error: "Specialty and MDC ID are required for medical professionals" },
          { status: 400 }
        )
      }
      const existingMdc = await db.doctorProfile.findUnique({
        where: { mdcId: data.mdcId.trim() },
      })
      if (existingMdc) {
        return NextResponse.json(
          { error: "This MDC ID is already registered on Carevia" },
          { status: 409 }
        )
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    await db.user.create({
      data: {
        name: data.name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: data.role,
        consentGivenAt: new Date(), // Act 843 — record explicit consent timestamp
        ...(data.role === "DOCTOR"
          ? {
              doctorProfile: {
                create: {
                  specialty: data.specialty!,
                  mdcId: data.mdcId!,
                  phone: data.phone,
                  status: "PENDING",
                  consultFee: Number(process.env.NEXT_PUBLIC_PLATFORM_FEE) || 100,
                },
              },
            }
          : {
              patientProfile: {
                create: {
                  dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
                  gender: data.gender,
                  bloodGroup: data.bloodGroup,
                  phone: data.phone,
                },
              },
            }),
      },
    })

    return NextResponse.json(
      { message: "Account created successfully" },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
    }
    console.error("[REGISTER]", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}

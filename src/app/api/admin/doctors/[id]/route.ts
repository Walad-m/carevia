import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const schema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { action, reason } = schema.parse(body)

    const doctor = await db.doctorProfile.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    await db.doctorProfile.update({
      where: { id },
      data: {
        status: action === "APPROVE" ? "APPROVED" : "REJECTED",
        rejectionReason: action === "REJECT" ? (reason ?? "No reason provided") : null,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
    })

    // Notify the doctor — Act 843: transparency about data decisions
    await db.notification.create({
      data: {
        userId: doctor.userId,
        title:
          action === "APPROVE"
            ? "Account Approved"
            : "Account Not Approved",
        message:
          action === "APPROVE"
            ? "Your Carevia account has been verified. You can now receive patient appointments."
            : `Your account was not approved. Reason: ${reason ?? "No reason provided."}`,
        type: "APPROVAL",
      },
    })

    return NextResponse.json({
      message: `Doctor ${action === "APPROVE" ? "approved" : "rejected"} successfully`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
    }
    console.error("[ADMIN_DOCTOR_ACTION]", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

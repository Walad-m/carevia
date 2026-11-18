import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userData = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        consentGivenAt: true,
        createdAt: true,
        updatedAt: true,
        patientProfile: true,
        doctorProfile: true,
        notifications: true,
      },
    })

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const json = JSON.stringify(
      {
        careviaCompliance: "Ghana Data Protection Act, 2012 (Act 843) - Section 33 Right of Access",
        exportedAt: new Date().toISOString(),
        data: userData,
      },
      null,
      2
    )

    return new NextResponse(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="carevia-data-export-${session.user.id}.json"`,
      },
    })
  } catch (error) {
    console.error("[DATA_EXPORT]", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}

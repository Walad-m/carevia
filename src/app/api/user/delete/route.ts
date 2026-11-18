import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Cascade delete user and associated profiles
    await db.user.delete({
      where: { id: session.user.id },
    })

    return NextResponse.json({
      message: "Account and personal data have been completely erased under Act 843.",
    })
  } catch (error) {
    console.error("[USER_DELETE]", error)
    return NextResponse.json({ error: "Failed to erase account" }, { status: 500 })
  }
}

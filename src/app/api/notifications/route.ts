import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Admin should NOT receive clinical push notifications per user instruction
    if (session.user.role === "ADMIN") {
      return NextResponse.json({ notifications: [], unreadCount: 0 })
    }

    const notifications = await db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    const unreadCount = await db.notification.count({
      where: { userId: session.user.id, isRead: false },
    })

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))

    if (body.notificationId) {
      await db.notification.updateMany({
        where: { id: body.notificationId, userId: session.user.id },
        data: { isRead: true },
      })
    } else {
      // Mark all as read
      await db.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[NOTIFICATIONS_PATCH]", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}

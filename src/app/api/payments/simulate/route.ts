import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const paymentSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
  amount: z.number().positive(),
  method: z.enum(["MTN_MOMO", "TELECEL_CASH", "AT_MONEY", "CARD"]),
  phoneNumber: z.string().nullable().optional(),
  network: z.string().nullable().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = paymentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payment data" }, { status: 400 })
    }

    const { appointmentId, amount, method, phoneNumber, network } = parsed.data

    // Check appointment
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: { select: { name: true, doctorProfile: { select: { specialty: true } } } },
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    if (appointment.patientId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized access to appointment" }, { status: 403 })
    }

    // Generate authentic Ghanaian transaction reference
    const timestamp = Date.now().toString().slice(-6)
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    const transactionRef = `TXN-GH-2026-${timestamp}${randomSuffix}`

    // Create or update Payment record
    let paymentPaidAt = new Date()
    try {
      const client = (db as any).payment ? db : (new (require("@prisma/client").PrismaClient)())
      if (client?.payment) {
        const payment = await (client as any).payment.upsert({
          where: { appointmentId },
          create: {
            appointmentId,
            patientId: session.user.id,
            amount,
            currency: "GHS",
            method,
            phoneNumber: phoneNumber || null,
            network: network || (method === "MTN_MOMO" ? "MTN" : method === "TELECEL_CASH" ? "Telecel" : method === "AT_MONEY" ? "AT" : "Card"),
            transactionRef,
            status: "COMPLETED",
            paidAt: new Date(),
            notes: `Simulated ${method} transaction authorized via USSD prompt`,
          },
          update: {
            amount,
            method,
            phoneNumber: phoneNumber || null,
            network: network || "MTN",
            transactionRef,
            status: "COMPLETED",
            paidAt: new Date(),
          },
        })
        if (payment?.paidAt) paymentPaidAt = payment.paidAt
      }
    } catch (paymentDbError) {
      console.warn("[PAYMENT_DB_WARN]", paymentDbError)
    }

    // In-app notification for Patient ONLY (Admin excluded per instructions)
    const channelName =
      method === "MTN_MOMO"
        ? "MTN Mobile Money"
        : method === "TELECEL_CASH"
        ? "Telecel Cash"
        : method === "AT_MONEY"
        ? "AT Money"
        : "Bank Card"

    try {
      await db.notification.create({
        data: {
          userId: session.user.id,
          title: `Payment Confirmed · GH₵ ${amount.toFixed(2)}`,
          message: `Your payment of GH₵ ${amount.toFixed(2)} via ${channelName} was successfully processed. Ref: ${transactionRef}. Your consultation is confirmed.`,
          type: "BILLING",
        },
      })
    } catch (notifErr) {
      console.warn("[PAYMENT_NOTIF_WARN]", notifErr)
    }

    return NextResponse.json({
      success: true,
      transactionRef,
      amount,
      currency: "GHS",
      channel: channelName,
      status: "COMPLETED",
      paidAt: paymentPaidAt.toISOString(),
      message: `Payment of GH₵ ${amount.toFixed(2)} approved successfully`,
    })
  } catch (error) {
    console.error("[PAYMENT_SIMULATE_ERROR]", error)
    return NextResponse.json({ error: "Failed to process simulated payment" }, { status: 500 })
  }
}

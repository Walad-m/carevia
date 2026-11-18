"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Check, Clock, CreditCard, ShieldAlert, Sparkles, X } from "lucide-react"

interface NotificationItem {
  id: string
  title: string
  message: string
  isRead: boolean
  type: string
  createdAt: string
}

export function NotificationBell({ userRole }: { userRole?: string }) {
  // Never render notification push bell for Admin per strict instruction
  if (userRole === "ADMIN") {
    return null
  }

  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<NotificationItem | null>(null)
  const prevCountRef = useRef<number>(0)

  // Fetch notifications
  async function fetchNotifications(isPoll = false) {
    try {
      const res = await fetch("/api/notifications")
      if (!res.ok) return
      const data = await res.json()
      const newItems: NotificationItem[] = data.notifications || []
      const newCount: number = data.unreadCount || 0

      // If new unread notification arrived while user is active, trigger live toast popup
      if (isPoll && newCount > prevCountRef.current && newItems.length > 0) {
        const newest = newItems[0]
        if (!newest.isRead) {
          setToastMessage(newest)
          setTimeout(() => setToastMessage(null), 5000)
        }
      }

      prevCountRef.current = newCount
      setNotifications(newItems)
      setUnreadCount(newCount)
    } catch {
      // Background poll silently fails
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll every 8 seconds for real-time updates
    const interval = setInterval(() => fetchNotifications(true), 8000)
    return () => clearInterval(interval)
  }, [])

  async function markAllAsRead() {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      setUnreadCount(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch {
      console.error("Failed to mark notifications read")
    }
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
        title="View Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Live Toast Pop-up when a new update arrives */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5 duration-300 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{toastMessage.title}</p>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">{toastMessage.message}</p>
            </div>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Notification Dropdown Drawer */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Notifications</h4>
                <p className="text-[11px] text-slate-500">
                  {unreadCount} unread update{unreadCount === 1 ? "" : "s"}
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                >
                  <Check size={13} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 text-xs transition ${
                      item.isRead ? "bg-white" : "bg-teal-50/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        {!item.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                        )}
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {new Date(item.createdAt).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {item.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

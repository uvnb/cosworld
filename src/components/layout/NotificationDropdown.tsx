'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/app/actions/notifications'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  content: string
  link: string | null
  is_read: boolean
  created_at: string
}

export function NotificationDropdown({ userId }: { userId?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    fetchNotifications()

    // Realtime subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  useEffect(() => {
    // Click outside to close
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function fetchNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.is_read).length)
    }
  }

  async function handleMarkAsRead(id: string) {
    await markNotificationAsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  async function handleMarkAllAsRead() {
    await markAllNotificationsAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return new Intl.RelativeTimeFormat('vi', { numeric: 'auto' }).format(
      Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    ).replace('trước ngày', 'ngày trước')
  }

  if (!userId) {
    return (
      <button className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-full relative transition">
        <Bell className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-full relative transition focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_0_2px_white]"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 z-50 overflow-hidden flex flex-col max-h-[85vh]">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Thông báo</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition"
              >
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Không có thông báo nào.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-4 transition hover:bg-slate-50 ${!notif.is_read ? 'bg-indigo-50/30' : ''}`}
                    onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                  >
                    <div className="flex gap-3 items-start">
                      <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${!notif.is_read ? 'bg-brand-500' : 'bg-transparent'}`} />
                      <div className="flex-1">
                        <h4 className={`text-sm ${!notif.is_read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                          {notif.title}
                        </h4>
                        <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                          {notif.content}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] font-medium text-slate-400">
                            {formatTime(notif.created_at)}
                          </span>
                          {notif.link && notif.link !== '#' && (
                            <Link 
                              href={notif.link}
                              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                              onClick={() => setIsOpen(false)}
                            >
                              Xem chi tiết <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

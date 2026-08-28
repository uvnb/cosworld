'use client'

import { useState } from 'react'
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { vi } from 'date-fns/locale/vi'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  'vi': vi,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export function MyCalendar({ 
  ownerBookings, 
  renterBookings 
}: { 
  ownerBookings: any[], 
  renterBookings: any[] 
}) {
  const [view, setView] = useState<'owner' | 'renter'>('owner')

  const events: Event[] = (view === 'owner' ? ownerBookings : renterBookings).map(b => {
    const isPending = b.status === 'pending'
    return {
      title: `${isPending ? '[Chờ duyệt] ' : ''}${b.listing.title}`,
      start: new Date(b.start_date),
      end: new Date(b.end_date),
      allDay: true,
      resource: b
    }
  })

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => setView('owner')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition ${view === 'owner' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Lịch Cho Thuê (Chủ đồ)
        </button>
        <button 
          onClick={() => setView('renter')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition ${view === 'renter' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Lịch Đi Thuê
        </button>
      </div>

      <div className="h-[600px] w-full custom-calendar">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          culture="vi"
          eventPropGetter={(event) => {
            const b = event.resource
            let backgroundColor = '#db2777' // brand-600
            if (view === 'renter') backgroundColor = '#4f46e5' // indigo-600
            if (b.status === 'pending') backgroundColor = '#f59e0b' // amber-500
            if (b.status === 'cancelled') backgroundColor = '#ef4444' // red-500

            return { style: { backgroundColor, borderRadius: '8px', opacity: 0.9, border: 'none', fontWeight: 'bold', fontSize: '12px' } }
          }}
          messages={{
            next: "Tiếp",
            previous: "Trước",
            today: "Hôm nay",
            month: "Tháng",
            week: "Tuần",
            day: "Ngày"
          }}
        />
      </div>

      <style jsx global>{`
        .custom-calendar .rbc-toolbar button {
          color: #475569;
          font-weight: 600;
          border-radius: 8px;
        }
        .custom-calendar .rbc-toolbar button.rbc-active {
          background-color: #f1f5f9;
          color: #0f172a;
          box-shadow: none;
        }
        .custom-calendar .rbc-event {
          padding: 4px 8px;
        }
      `}</style>
    </div>
  )
}

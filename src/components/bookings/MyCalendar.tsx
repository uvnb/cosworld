'use client'

import { useState } from 'react'
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { vi } from 'date-fns/locale/vi'
import { Calendar as CalendarIcon } from 'lucide-react'
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
  renterBookings,
  savedEvents = []
}: { 
  ownerBookings: any[], 
  renterBookings: any[],
  savedEvents?: any[]
}) {
  const [view, setView] = useState<'owner' | 'renter' | 'events'>('events')

  const events: Event[] = view === 'events' 
    ? savedEvents.map(e => ({
        title: `[Fes] ${e?.title || 'Sự kiện'}`,
        start: e?.start_date ? new Date(e.start_date) : new Date(),
        end: (e?.end_date || e?.start_date) ? new Date(e.end_date || e.start_date) : new Date(),
        allDay: true,
        resource: { type: 'event', ...e }
      }))
    : (view === 'owner' ? ownerBookings : renterBookings).map(b => {
        const isPending = b?.status === 'pending'
        return {
          title: `${isPending ? '[Chờ duyệt] ' : ''}${b?.listing?.title || 'Đơn thuê'}`,
          start: b?.start_date ? new Date(b.start_date) : new Date(),
          end: b?.end_date ? new Date(b.end_date) : new Date(),
          allDay: true,
          resource: { type: 'booking', ...b }
        }
      })

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <button 
          onClick={() => setView('events')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition ${view === 'events' ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Lịch Sự Kiện / Fes
        </button>
        <button 
          onClick={() => setView('owner')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition ${view === 'owner' ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Lịch Cho Thuê (Chủ đồ)
        </button>
        <button 
          onClick={() => setView('renter')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition ${view === 'renter' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
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
          components={{
            event: (props) => (
              <div className="flex items-center gap-1.5 px-1 overflow-hidden h-full">
                {props.event.resource?.type === 'event' && <CalendarIcon className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate">{props.title}</span>
              </div>
            )
          }}
          eventPropGetter={(event) => {
            const b = event.resource
            let backgroundColor = '#db2777' // brand-600
            
            if (b.type === 'event') {
              backgroundColor = '#c026d3' // fuchsia-600
            } else {
              if (view === 'renter') backgroundColor = '#4f46e5' // indigo-600
              if (b.status === 'pending') backgroundColor = '#f59e0b' // amber-500
              if (b.status === 'cancelled') backgroundColor = '#ef4444' // red-500
            }

            return { style: { backgroundColor, borderRadius: '6px', opacity: 1, border: 'none', fontWeight: '600', fontSize: '13px', padding: '2px 4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: 'white' } }
          }}
          messages={{
            next: "Tiếp",
            previous: "Trước",
            today: "Hôm nay",
            month: "Tháng",
            week: "Tuần",
            day: "Ngày",
            agenda: "Lịch trình"
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

'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'

export function HeroCarousel({ events }: { events: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Nếu không có events nào, trả về banner mặc định
  if (!events || events.length === 0) {
    return (
      <div className="relative w-full h-[280px] sm:h-[350px] rounded-3xl overflow-hidden bg-gradient-to-r from-brand-600 to-indigo-600 shadow-lg">
        {/* Background Video (Desktop only) */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover hidden sm:block"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay for Video (Desktop) */}
        <div className="absolute inset-0 bg-black/0 sm:bg-purple-900/50"></div>

        <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-16 text-white z-10">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold w-max mb-3 border border-white/20">MỚI RA MẮT</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 max-w-xl leading-tight drop-shadow-sm">Khám phá vũ trụ Cosplay lớn nhất Việt Nam</h1>
          <p className="text-white/90 font-medium mb-6 max-w-lg text-sm sm:text-base drop-shadow-sm">Thuê đồ, lập team và cập nhật các Festival sự kiện hot nhất đang diễn ra quanh bạn.</p>
          <Link href="/events" className="bg-white text-brand-600 px-6 py-2.5 rounded-full font-bold w-max hover:bg-brand-50 transition shadow-md hover:scale-105">Khám phá Sự kiện</Link>
        </div>
        
        {/* Abstract background graphics (Mobile only) */}
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/4 translate-y-1/4 sm:hidden"></div>
        <div className="absolute left-1/4 top-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl -translate-y-1/2 sm:hidden"></div>
      </div>
    )
  }

  // Tự động chuyển slide
  useEffect(() => {
    if (events.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [events.length])

  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + events.length) % events.length)
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % events.length)

  return (
    <div className="relative w-full h-[280px] sm:h-[350px] rounded-3xl overflow-hidden group shadow-lg bg-slate-900">
      {events.map((evt, idx) => (
        <div 
          key={evt.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src={evt.poster_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80"} 
              alt={evt.name}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-transparent"></div>
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 text-white">
            <div className="max-w-2xl">
              <div className="flex gap-2 mb-3">
                <span className="bg-brand-500 text-white text-xs font-bold px-2.5 py-1 rounded-md">HOT EVENT</span>
                <span className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {new Date(evt.start_date).toLocaleDateString('vi-VN')}
                </span>
              </div>
              
              <h2 className="text-2xl sm:text-4xl font-extrabold mb-2 text-white drop-shadow-md line-clamp-2">{evt.name}</h2>
              
              <div className="flex items-center gap-4 text-sm text-slate-200 mb-6 font-medium">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-brand-400" /> {evt.venue ? `${evt.venue}, ` : ''}{evt.city}</span>
                {evt.interested_count > 0 && <span>🔥 {evt.interested_count} người quan tâm</span>}
              </div>

              <Link href={`/events/${evt.slug}`} className="bg-brand-500 text-white px-6 py-2.5 rounded-full font-bold hover:bg-brand-600 transition shadow-md hover:shadow-brand-500/30">
                Xem chi tiết
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation controls */}
      {events.length > 1 && (
        <>
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition hover:bg-black/50">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition hover:bg-black/50">
            <ChevronRight className="w-6 h-6" />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {events.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-brand-500' : 'bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

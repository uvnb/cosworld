import { ListingsSection } from '@/components/listings/ListingsSection'
import { Shirt, Smile, Sword, Footprints, Gem, Camera, MoreHorizontal, ChevronRight, Users, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams
  const q = resolvedParams?.q || ''



  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 w-full flex-1">
      <div className="space-y-6">

        {/* Category Icon Bar */}
        <section className="grid grid-cols-4 sm:grid-cols-7 gap-3 sm:gap-4">
          {[
            { icon: Shirt, label: 'Trang phục', color: 'text-purple-600', bg: 'bg-purple-50' },
            { icon: Smile, label: 'Tóc giả', color: 'text-pink-500', bg: 'bg-pink-50' },
            { icon: Sword, label: 'Vũ khí', color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: Footprints, label: 'Giày dép', color: 'text-rose-500', bg: 'bg-rose-50' },
            { icon: Gem, label: 'Phụ kiện', color: 'text-amber-600', bg: 'bg-amber-50' },
            { icon: Camera, label: 'Studio', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { icon: MoreHorizontal, label: 'Khác', color: 'text-slate-600', bg: 'bg-slate-100' },
          ].map((cat, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-brand-500 cursor-pointer transition">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-1.5 ${cat.bg} ${cat.color}`}>
                <cat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700">{cat.label}</span>
            </div>
          ))}
        </section>

        <ListingsSection initialQuery={q} />


      </div>
    </main>
  )
}

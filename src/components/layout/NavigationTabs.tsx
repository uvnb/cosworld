'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Users, Calendar } from 'lucide-react'

export function NavigationTabs() {
  const pathname = usePathname()

  const tabs = [
    { href: '/', label: 'Trang chủ', icon: Home, exact: true },
    { href: '/listings', label: 'Thuê & Mua bán', icon: ShoppingBag },
    { href: '/services', label: 'Lập team / Tuyển staff', icon: Users },
    { href: '/events', label: 'Sự kiện & Festival', icon: Calendar },
  ]

  return (
    <div className="border-t border-slate-100 bg-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center gap-2 sm:gap-8 overflow-x-auto hide-scrollbar text-xs font-bold">
        {tabs.map(tab => {
          const isActive = tab.exact ? pathname === tab.href : pathname?.startsWith(tab.href)
          
          return (
            <Link 
              key={tab.href}
              href={tab.href} 
              className={`py-3.5 px-2 border-b-2 flex items-center gap-2 shrink-0 transition ${
                isActive 
                  ? 'border-brand-600 text-brand-600' 
                  : 'border-transparent text-slate-600 hover:text-brand-600'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

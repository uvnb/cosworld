'use client'
import { usePathname } from 'next/navigation'

export function ConditionalTopBar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  if (pathname === '/login' || pathname === '/signup') {
    return null
  }
  
  return <>{children}</>
}

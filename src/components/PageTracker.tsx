'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return
    // admin 페이지는 추적하지 않음
    if (pathname.startsWith('/admin')) return

    const supabase = createClient()
    supabase.from('page_views').insert({
      path: pathname,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
    }).then(() => {})
  }, [pathname])

  return null
}

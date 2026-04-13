'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Region, REGIONS, DEFAULT_REGION, getRegion } from '@/lib/regions'
import { createClient } from '@/lib/supabase-client'

interface AdminRegionContextType {
  selectedRegion: string
  setSelectedRegion: (code: string) => void
  userRole: string
  userRegion: string | null
  allowedRegions: Region[]
  isRegionAllowed: (code: string) => boolean
  loading: boolean
}

const AdminRegionContext = createContext<AdminRegionContextType>({
  selectedRegion: DEFAULT_REGION,
  setSelectedRegion: () => {},
  userRole: 'editor',
  userRegion: null,
  allowedRegions: [],
  isRegionAllowed: () => false,
  loading: true,
})

export function AdminRegionProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const [selectedRegion, setSelectedRegionState] = useState<string>(DEFAULT_REGION)
  const [userRole, setUserRole] = useState<string>('editor')
  const [userRegion, setUserRegion] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserProfile()
  }, [])

  async function loadUserProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: profile } = await supabase
      .from('users')
      .select('role, region')
      .eq('id', user.id)
      .single()

    if (profile) {
      setUserRole(profile.role)
      setUserRegion(profile.region || null)

      if (profile.role === 'super') {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('admin_selected_region') : null
        setSelectedRegionState(saved || DEFAULT_REGION)
      } else {
        setSelectedRegionState(profile.region || DEFAULT_REGION)
      }
    }
    setLoading(false)
  }

  const setSelectedRegion = (code: string) => {
    if (userRole !== 'super' && code !== userRegion) return
    setSelectedRegionState(code)
    if (userRole === 'super' && typeof window !== 'undefined') {
      localStorage.setItem('admin_selected_region', code)
    }
  }

  const allowedRegions = userRole === 'super'
    ? REGIONS
    : REGIONS.filter(r => r.code === userRegion)

  const isRegionAllowed = (code: string) => {
    if (userRole === 'super') return true
    return code === userRegion
  }

  return (
    <AdminRegionContext.Provider value={{
      selectedRegion,
      setSelectedRegion,
      userRole,
      userRegion,
      allowedRegions,
      isRegionAllowed,
      loading,
    }}>
      {children}
    </AdminRegionContext.Provider>
  )
}

export function useAdminRegion() {
  return useContext(AdminRegionContext)
}

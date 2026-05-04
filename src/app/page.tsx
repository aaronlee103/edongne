import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase-server'
import { DEFAULT_REGION, REGION_COOKIE } from '@/lib/regions'
import HomeContentWrapper from './HomeContent'

// Revalidate every 60 seconds (ISR)
export const revalidate = 60

function regionFilter(regionCode: string): string {
  if (regionCode === DEFAULT_REGION) {
    return `region.eq.${regionCode},region.eq.all,region.is.null`
  }
  return `region.eq.${regionCode},region.eq.all`
}

export default async function Home() {
  const cookieStore = cookies()
  const regionCookie = cookieStore.get(REGION_COOKIE)
  const regionCode = regionCookie?.value || DEFAULT_REGION

  const supabase = createServerSupabase()

  // Fetch all initial data in parallel on the server
  const [editorPicksResult, allPostsResult, weeklyPopularResult] = await Promise.all([
    supabase
      .from('posts')
      .select('id, title, thumbnail, category, content, created_at, views, region, type, published, users(nickname)')
      .eq('type', 'magazine')
      .eq('category', 'editor')
      .or('published.is.null,published.eq.true')
      .or(regionFilter(regionCode))
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('posts')
      .select('id, title, thumbnail, category, content, created_at, views, region, type, published, users(nickname)')
      .eq('type', 'magazine')
      .or('published.is.null,published.eq.true')
      .or(regionFilter(regionCode))
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('posts')
      .select('id, title, thumbnail, category, content, created_at, views, region, type, published, users(nickname)')
      .eq('type', 'magazine')
      .or('published.is.null,published.eq.true')
      .or(regionFilter(regionCode))
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('views', { ascending: false })
      .limit(5),
  ])

  return (
    <HomeContentWrapper
      initialEditorPicks={editorPicksResult.data || []}
      initialAllPosts={allPostsResult.data || []}
      initialWeeklyPopular={weeklyPopularResult.data || []}
      initialRegion={regionCode}
    />
  )
}

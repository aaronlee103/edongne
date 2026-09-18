import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase-server'
import { DEFAULT_REGION, REGION_COOKIE } from '@/lib/regions'
import HomeContentWrapper from './HomeContent'

// Revalidate every 60 seconds (ISR)
export const revalidate = 60

function stripMarkdown(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,3}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\n{2,}/g, ' ')
    .trim()
}

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

  // 홈에서는 본문 전체가 필요 없다 (최대 200자 발췌만 표시).
  // 100건 × ~6KB 본문을 그대로 내려보내면 HTML이 700KB를 넘으므로 여기서 잘라 보낸다.
  const trim = <T extends { content?: string | null }>(rows: T[]) =>
    rows.map((p) => ({ ...p, content: stripMarkdown(p.content || '').slice(0, 300) }))

  return (
    <HomeContentWrapper
      initialEditorPicks={trim(editorPicksResult.data || [])}
      initialAllPosts={trim(allPostsResult.data || [])}
      initialWeeklyPopular={trim(weeklyPopularResult.data || [])}
      initialRegion={regionCode}
    />
  )
}

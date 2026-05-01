import { MetadataRoute } from 'next'
import { createServerSupabase } from '@/lib/supabase-server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.edongne.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerSupabase()

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/board`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/realtors`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/builders`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/lawyers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/mortgage`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/movers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  // 게시글 (magazine + community)
  const { data: posts } = await supabase
    .from('posts')
    .select('id, created_at, type')
    .or('published.is.null,published.eq.true')
    .order('created_at', { ascending: false })

  const postPages: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${SITE_URL}/post/${post.id}`,
    lastModified: new Date(post.created_at),
    changeFrequency: 'weekly' as const,
    priority: post.type === 'magazine' ? 0.9 : 0.6,
  }))

  // 업체 페이지
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, created_at')

  const businessPages: MetadataRoute.Sitemap = (businesses || []).map((biz) => ({
    url: `${SITE_URL}/business/${biz.id}`,
    lastModified: new Date(biz.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...postPages, ...businessPages]
}

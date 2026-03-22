import { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase-server'
import PostContent from './PostContent'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.edongne.com'

const CATEGORY_LABELS: Record<string, string> = {
  free: '자유', qna: '질문답변', info: '정보', buysell: '사고팔고',
  jobs: '구인구직', housing: '렌트/룸메', topic: '토픽', editor: '에디터 픽',
  neighborhood: '이동네어때', realestate: '부동산', legal: '부동산 법률',
  living: '생활정보', construction: '건축/인테리어', finance: '주택융자',
}

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

function extractFirstImage(content: string): string | null {
  const match = content.match(/!\[[^\]]*\]\(([^)]+)\)/)
  return match ? match[1] : null
}

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const supabase = createServerSupabase()
  const { data: post } = await supabase
    .from('posts')
    .select('title, content, thumbnail, category, created_at, type')
    .eq('id', params.id)
    .single()

  if (!post) {
    return { title: '게시글을 찾을 수 없습니다' }
  }

  const plainContent = stripMarkdown(post.content || '')
  const description = plainContent.substring(0, 160)
  const ogImage = post.thumbnail || extractFirstImage(post.content || '') || null
  const categoryLabel = CATEGORY_LABELS[post.category] || post.category
  const pageUrl = `${SITE_URL}/post/${params.id}`

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      url: pageUrl,
      type: 'article',
      publishedTime: post.created_at,
      section: categoryLabel,
      siteName: '이동네',
      locale: 'ko_KR',
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }] }),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: post.title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
    alternates: {
      canonical: pageUrl,
    },
  }
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const { data: post } = await supabase
    .from('posts')
    .select('title, content, thumbnail, category, created_at, type, users(nickname)')
    .eq('id', params.id)
    .single()

  // JSON-LD 구조화 데이터 (구글 뉴스/리치 결과)
  const jsonLd = post ? {
    '@context': 'https://schema.org',
    '@type': post.type === 'magazine' ? 'NewsArticle' : 'Article',
    headline: post.title,
    description: stripMarkdown(post.content || '').substring(0, 160),
    datePublished: post.created_at,
    dateModified: post.created_at,
    author: {
      '@type': 'Person',
      name: (post.users as any)?.nickname || '이동네',
    },
    publisher: {
      '@type': 'Organization',
      name: '이동네',
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/post/${params.id}`,
    },
    ...(post.thumbnail && {
      image: {
        '@type': 'ImageObject',
        url: post.thumbnail,
      },
    }),
    ...(!post.thumbnail && post.content && extractFirstImage(post.content) && {
      image: {
        '@type': 'ImageObject',
        url: extractFirstImage(post.content),
      },
    }),
    inLanguage: 'ko',
    isAccessibleForFree: true,
  } : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PostContent />
    </>
  )
}

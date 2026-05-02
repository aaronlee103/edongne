'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import AdBanner from '@/components/AdBanner'

const CATEGORIES: Record<string, string> = {
  free: '자유', qna: '질문답변', info: '정보', buysell: '사고팔고',
  jobs: '구인구직', housing: '렌트/룸메', topic: '토픽', editor: '에디터',
  realestate: '부동산', legal: '부동산 법률', living: '생활정보',
  construction: '건축/인테리어', finance: '주택융자', neighborhood: '이동네어때',
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

function sanitizeUrl(url: string): string {
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('/')) return trimmed
  return '#'
}

function renderInline(text: string): string {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>')
}

function renderMarkdownTable(block: string): string {
  const rows = block.trim().split('\n').filter(r => r.trim())
  if (rows.length < 2) return block
  const sepIdx = rows.findIndex(r => /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(r))
  if (sepIdx < 1) return block
  const parseRow = (row: string) => row.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim())
  const headers = parseRow(rows[sepIdx - 1])
  const bodyRows = rows.slice(sepIdx + 1)
  let html = '<div class="overflow-x-auto my-4"><table class="w-full text-sm border-collapse border border-gray-200">'
  html += '<thead><tr class="bg-gray-50">'
  headers.forEach(h => { html += `<th class="border border-gray-200 px-3 py-2 text-left font-bold">${renderInline(h)}</th>` })
  html += '</tr></thead><tbody>'
  bodyRows.forEach(row => {
    const cells = parseRow(row)
    html += '<tr class="hover:bg-gray-50">'
    cells.forEach(c => { html += `<td class="border border-gray-200 px-3 py-2">${renderInline(c)}</td>` })
    html += '</tr>'
  })
  html += '</tbody></table></div>'
  return html
}

function renderMarkdown(text: string): string {
  const tokens: string[] = []
  let processed = text.replace(
    /((?:^|\n)\|.+\|[ \t]*\n\|[\s:|-]+\|[ \t]*\n(?:\|.+\|[ \t]*\n?)+)/g,
    (_m, tableBlock) => { tokens.push(renderMarkdownTable(tableBlock)); return `\n%%TOKEN_${tokens.length - 1}%%\n` }
  )
  processed = processed
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, url) => {
      tokens.push(`<img src="${sanitizeUrl(url)}" alt="${escapeHtml(alt)}" class="rounded-lg my-4 max-w-full" />`); return `%%TOKEN_${tokens.length - 1}%%`
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) => {
      tokens.push(`<a href="${sanitizeUrl(url)}" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`); return `%%TOKEN_${tokens.length - 1}%%`
    })
  processed = escapeHtml(processed)
  processed = processed.replace(/((?:^|\n)(?:- .+\n?)+)/g, (_m, listBlock) => {
    const items = listBlock.trim().split('\n').filter((l: string) => l.trim().startsWith('- ')).map((l: string) => `<li class="ml-4 mb-1">${l.trim().substring(2)}</li>`).join('')
    return `<ul class="list-disc pl-4 my-3">${items}</ul>`
  })
  let html = processed
    .replace(/^---$/gm, '<hr class="my-6 border-t border-gray-300" />')
    .replace(/^#### (.+)$/gm, '<h4 class="text-base font-bold mt-5 mb-2">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br />')
  html = html.replace(/%%TOKEN_(\d+)%%/g, (_m, i) => tokens[Number(i)])
  return '<p class="mb-4">' + html + '</p>'
}

function insertInlineAd(htmlContent: string): string {
  const parts = htmlContent.split('</p>')
  if (parts.length > 6) {
    const adHtml = '<div class="my-8 border border-border rounded-lg p-5 bg-gray-50 text-center"><p class="text-xs text-muted mb-1">AD</p><p class="text-sm font-bold mb-1">뉴욕·뉴저지 한인에게 업체를 알리세요</p><p class="text-xs text-muted mb-3">이동네 매거진 광고 · 첫 광고 시 프리미엄 할인</p><a href="/contact" class="text-xs bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors inline-block">광고 문의 →</a></div>'
    const midPoint = Math.floor(parts.length / 2)
    parts.splice(midPoint, 0, adHtml)
  }
  return parts.join('</p>')
}

export default function PostContent() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const supabase = createClient()

  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string>('user')
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [likeLoading, setLikeLoading] = useState(false)
  const [relatedPosts, setRelatedPosts] = useState<any[]>([])

  useEffect(() => {
    // 병렬로 모든 초기 데이터 로드
    async function loadAll() {
      const [authResult, postResult, commentsResult, likesResult] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('posts').select('*, users(nickname, avatar_animal), votes(value)').eq('id', postId).single(),
        supabase.from('comments').select('*, users(nickname, avatar_animal)').eq('post_id', postId).order('created_at', { ascending: true }),
        supabase.from('votes').select('id, user_id').eq('post_id', postId).eq('value', 1),
      ])

      // 유저 정보 처리
      const currentUser = authResult.data.user
      setUser(currentUser)
      if (currentUser) {
        const { data: u } = await supabase.from('users').select('role').eq('id', currentUser.id).single()
        if (u?.role) setRole(u.role)
        setLiked(!!likesResult.data?.some((v: any) => v.user_id === currentUser.id))
      }

      // 포스트 처리
      if (postResult.data) {
        const data = postResult.data
        setPost({ ...data, vote_score: data.votes?.reduce((sum: number, v: any) => sum + v.value, 0) || 0 })
        supabase.from('posts').update({ views: (data.views || 0) + 1 }).eq('id', postId)
        // 관련 글은 카테고리를 알아야 하므로 여기서 호출
        const { data: related } = await supabase.from('posts').select('id, title, thumbnail, created_at').eq('category', data.category).neq('id', postId).or('published.is.null,published.eq.true').order('created_at', { ascending: false }).limit(4)
        if (related) setRelatedPosts(related)
      }

      // 댓글 & 좋아요 처리
      if (commentsResult.data) setComments(commentsResult.data)
      setLikeCount(likesResult.data?.length || 0)
      setLoading(false)
    }
    loadAll()
  }, [postId])

  // checkUserLike와 fetchLikeCount는 초기 loadAll()에 통합됨

  async function handleLike() {
    if (!user) return alert('로그인이 필요합니다.')
    if (likeLoading) return
    setLikeLoading(true)
    if (liked) {
      await supabase.from('votes').delete().eq('post_id', postId).eq('user_id', user.id).eq('value', 1)
      setLiked(false)
      setLikeCount(prev => Math.max(0, prev - 1))
    } else {
      await supabase.from('votes').insert({ post_id: postId, user_id: user.id, value: 1 })
      setLiked(true)
      setLikeCount(prev => prev + 1)
    }
    setLikeLoading(false)
  }

  const canEdit = user && post && (user.id === post.user_id || role === 'super' || role === 'editor')

  async function handleDelete() {
    if (!confirm('이 게시글을 삭제하시겠습니까?')) return
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) alert('삭제 실패: ' + error.message)
    else router.push('/board')
  }

  // fetchPost는 초기 loadAll()에 통합됨

  async function fetchComments() {
    const { data } = await supabase.from('comments').select('*, users(nickname, avatar_animal)').eq('post_id', postId).order('created_at', { ascending: true })
    if (data) setComments(data)
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return alert('로그인이 필요합니다.')
    if (!commentText.trim()) return
    const { error } = await supabase.from('comments').insert({ post_id: postId, user_id: user.id, content: commentText.trim() })
    if (error) { alert('댓글 작성 실패: ' + error.message); return }
    setCommentText('')
    fetchComments()
  }

  function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return '방금'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`
    return `${Math.floor(seconds / 86400)}일 전`
  }

  const AVATAR_EMOJI: Record<string, string> = { bear: '🐻', rabbit: '🐰', fox: '🦊', cat: '🐱', dog: '🐶', owl: '🦉', penguin: '🐧', deer: '🦌' }

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-muted text-sm">불러오는 중...</div>
  if (!post) return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-muted text-sm">게시글을 찾을 수 없습니다.</div>

  const authorNickname = post.users?.nickname || '익명'
  const authorAvatar = AVATAR_EMOJI[post.users?.avatar_animal] || '🐻'
  const isMagazine = post.type === 'magazine' || post.type === 'notice'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className={`${isMagazine ? 'grid md:grid-cols-[1fr_240px] gap-8' : ''}`}>
        {/* Main Content */}
        <div className="min-w-0">
          <article className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{CATEGORIES[post.category] || post.category}</span>
            </div>
            <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-sm text-muted">
                <span className="flex items-center gap-1">
                  <span>{authorAvatar}</span>
                  <span className="font-medium text-primary">{authorNickname}</span>
                </span>
                <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                <span>조회 {post.views || 0}</span>
              </div>
              {canEdit && (
                <div className="flex items-center gap-2">
                  <Link href={`/post/${postId}/edit`} className="text-xs px-3 py-1 border border-border rounded hover:bg-gray-50 transition-colors">수정</Link>
                  <button onClick={handleDelete} className="text-xs px-3 py-1 border border-red-200 text-red-500 rounded hover:bg-red-50 transition-colors">삭제</button>
                </div>
              )}
            </div>

            {isMagazine ? (
              <div className="prose prose-sm max-w-none text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: insertInlineAd(renderMarkdown(post.content)) }} />
            ) : (
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">{post.content}</div>
            )}

            {authorNickname === '이동네' && (
                  <div className="mt-8 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-400">© 2026 이동네 edongne.com — 무단 전재 및 재배포 금지</p>
                  </div>
                )}

                {/* 좋아요 + 공유 버튼 */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
              <button onClick={handleLike} disabled={likeLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${liked ? 'bg-red-50 border-red-200 text-red-500' : 'border-border text-muted hover:bg-gray-50'}`}>
                <span className="text-lg">{liked ? '❤️' : '🤍'}</span>
                <span className="text-sm font-medium">좋아요 {likeCount > 0 ? likeCount : ''}</span>
              </button>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted mr-1">공유</span>
                <button onClick={() => { const url = `https://edongne.com/post/${postId}`; window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400') }}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-border hover:bg-gray-50 transition-colors" title="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </button>
                <button onClick={() => { const url = `https://edongne.com/post/${postId}`; window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`, '_blank', 'width=600,height=400') }}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-border hover:bg-gray-50 transition-colors" title="X">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </button>
                <button onClick={() => { const url = `https://edongne.com/post/${postId}`; window.open(`https://threads.net/intent/post?text=${encodeURIComponent(post.title + ' ' + url)}`, '_blank', 'width=600,height=400') }}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-border hover:bg-gray-50 transition-colors" title="Threads">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.083.717 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.187.408-2.264 1.33-3.03.858-.712 2.042-1.122 3.425-1.19.964-.047 1.86.033 2.688.233-.084-.542-.237-1.006-.464-1.375-.353-.573-.947-.915-1.766-.972-1.078.018-2.03.332-2.842.968L9.17 7.453c1.047-.819 2.386-1.272 3.88-1.272h.087c1.34.062 2.388.598 3.108 1.588.476.655.789 1.484.934 2.467.77.2 1.468.49 2.087.876 1.14.709 1.98 1.664 2.476 2.856.728 1.747.776 4.516-1.37 6.616-1.832 1.793-4.072 2.55-7.256 2.571zm-1.248-7.498c-.052.293.003.556.164.768.222.293.621.469 1.13.499 1.036-.056 1.757-.444 2.31-1.132.402-.502.696-1.145.882-1.926-.591-.147-1.228-.225-1.904-.194-.942.046-1.694.285-2.18.693-.366.307-.427.6-.402.292z"/></svg>
                </button>
                <button onClick={() => { const url = `https://edongne.com/post/${postId}`; navigator.clipboard.writeText(url).then(() => alert('링크가 복사되었습니다!')) }}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-border hover:bg-gray-50 transition-colors" title="링크 복사">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                </button>
              </div>
            </div>
          </article>

          {/* 댓글 */}
          <section>
            <h2 className="font-bold mb-4">댓글 {comments.length}개</h2>
            <form onSubmit={handleComment} className="mb-6">
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)}
                placeholder={user ? '댓글을 남겨보세요' : '로그인 후 댓글을 작성할 수 있습니다'} maxLength={2000}
                className="w-full border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-black transition-colors" rows={3} disabled={!user} />
              <div className="flex justify-end mt-2">
                <button type="submit" disabled={!user || !commentText.trim()} className="text-sm bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50">댓글 작성</button>
              </div>
            </form>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="py-4 border-b border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{AVATAR_EMOJI[comment.users?.avatar_animal] || '🐻'}</span>
                    <span className="text-sm font-medium">{comment.users?.nickname || '익명'}</span>
                    <span className="text-xs text-muted">{timeAgo(comment.created_at)}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{comment.content}</p>
                </div>
              ))}
              {comments.length === 0 && <p className="text-sm text-muted text-center py-4">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>}
            </div>
          </section>
        </div>

        {/* Sidebar - magazine only */}
        {isMagazine && (
          <aside className="hidden md:block"><div className="sticky top-20 space-y-6">
            <AdBanner variant="sidebar" />
            {relatedPosts.length > 0 && (
              <div>
                <h3 className="font-bold text-sm mb-3">관련 글</h3>
                <div className="space-y-3">
                  {relatedPosts.map(rp => (
                    <Link key={rp.id} href={`/post/${rp.id}`} className="block group">
                      {rp.thumbnail && <div className="relative w-full h-24 mb-1"><Image src={rp.thumbnail} alt="" fill sizes="240px" className="object-cover rounded-lg" /></div>}
                      <p className="text-xs font-medium line-clamp-2 group-hover:text-secondary">{rp.title}</p>
                      <p className="text-xs text-muted mt-0.5">{timeAgo(rp.created_at)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div></aside>
        )}
      </div>
    </div>
  )
}

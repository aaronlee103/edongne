'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

const CATEGORIES: Record<string, string> = {
  free: '자유', qna: '질문답변', info: '정보', buysell: '사고팔고',
  jobs: '구인구직', housing: '렌트/룸메', topic: '토픽', editor: '에디터',
}

function renderMarkdown(text: string): string {
  let html = text
    // 이미지: ![alt](url)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg my-4 max-w-full" />')
    // 링크: [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // h3: ### text
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-6 mb-2">$1</h3>')
    // h2: ## text
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3">$1</h2>')
    // 굵게: **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // 기울임: *text*
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 줄바꿈
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br />')
  return '<p class="mb-4">' + html + '</p>'
}

export default function PostDetailPage() {
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        supabase.from('users').select('role').eq('id', data.user.id).single()
          .then(({ data: u }) => { if (u?.role) setRole(u.role) })
      }
    })
    fetchPost()
    fetchComments()
  }, [postId])

  const canEdit = user && post && (user.id === post.user_id || role === 'super' || role === 'editor')

  async function handleDelete() {
    if (!confirm('이 게시글을 삭제하시겠습니까?')) return
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) {
      alert('삭제 실패: ' + error.message)
    } else {
      router.push('/board')
    }
  }

  async function fetchPost() {
    const { data } = await supabase
      .from('posts')
      .select('*, votes(value)')
      .eq('id', postId)
      .single()
    if (data) {
      setPost({
        ...data,
        vote_score: data.votes?.reduce((sum: number, v: any) => sum + v.value, 0) || 0,
      })
      // 조회수 증가
      await supabase.from('posts').update({ views: (data.views || 0) + 1 }).eq('id', postId)
    }
    setLoading(false)
  }

  async function fetchComments() {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    if (data) setComments(data)
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return alert('로그인이 필요합니다.')
    if (!commentText.trim()) return

    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      content: commentText.trim(),
    })

    if (error) {
      alert('댓글 작성 실패: ' + error.message)
      return
    }

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

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted text-sm">불러오는 중...</div>
  if (!post) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted text-sm">게시글을 찾을 수 없습니다.</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* 게시글 */}
      <article className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{CATEGORIES[post.category] || post.category}</span>
        </div>
        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 text-sm text-muted">
            <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
            <span>조회 {post.views || 0}</span>
          </div>
          {canEdit && (
            <div className="flex items-center gap-2">
              <Link
                href={`/post/${postId}/edit`}
                className="text-xs px-3 py-1 border border-border rounded hover:bg-gray-50 transition-colors"
              >
                수정
              </Link>
              <button
                onClick={handleDelete}
                className="text-xs px-3 py-1 border border-red-200 text-red-500 rounded hover:bg-red-50 transition-colors"
              >
                삭제
              </button>
            </div>
          )}
        </div>
        {post.type === 'magazine' || post.type === 'notice' ? (
          <div
            className="prose prose-sm max-w-none text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
          />
        ) : (
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">
            {post.content}
          </div>
        )}

        <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border">
          <span className="font-bold">▲ {post.vote_score}</span>
        </div>
      </article>

      {/* 댓글 */}
      <section>
        <h2 className="font-bold mb-4">댓글 {comments.length}개</h2>

        <form onSubmit={handleComment} className="mb-6">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={user ? '댓글을 남겨보세요' : '로그인 후 댓글을 작성할 수 있습니다'}
            className="w-full border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-black transition-colors"
            rows={3}
            disabled={!user}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!user || !commentText.trim()}
              className="text-sm bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              댓글 작성
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="py-4 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted">{timeAgo(comment.created_at)}</span>
              </div>
              <p className="text-sm leading-relaxed">{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-sm text-muted text-center py-4">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
          )}
        </div>
      </section>
    </div>
  )
}

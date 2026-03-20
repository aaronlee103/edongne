'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

const CATEGORIES = [
  { key: 'free', label: '자유' },
  { key: 'qna', label: '질문답변' },
  { key: 'info', label: '정보' },
  { key: 'buysell', label: '사고팔고' },
  { key: 'jobs', label: '구인구직' },
  { key: 'housing', label: '렌트/룸메' },
]

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const supabase = createClient()

  const [category, setCategory] = useState('free')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/auth')
        return
      }
      setUser(data.user)
      fetchPost(data.user.id)
    })
  }, [])

  async function fetchPost(uid: string) {
    const { data: post } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (!post) {
      alert('게시글을 찾을 수 없습니다.')
      router.push('/board')
      return
    }

    // 권한 확인: 본인 or 관리자
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', uid)
      .single()

    const isOwner = post.user_id === uid
    const isAdmin = profile?.role === 'super' || profile?.role === 'editor'

    if (!isOwner && !isAdmin) {
      alert('수정 권한이 없습니다.')
      router.push(`/post/${postId}`)
      return
    }

    setCategory(post.category)
    setTitle(post.title)
    setContent(post.content)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('posts')
      .update({ category, title, content })
      .eq('id', postId)

    if (error) {
      alert('수정 실패: ' + error.message)
      setSaving(false)
      return
    }

    router.push(`/post/${postId}`)
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted text-sm">불러오는 중...</div>
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">글 수정</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">카테고리</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full md:w-48 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-black"
          >
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            className="w-full px-4 py-3 border border-border rounded-lg text-sm min-h-[300px] resize-y focus:outline-none focus:border-black"
            required
          />
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? '저장 중...' : '수정 완료'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/post/${postId}`)}
            className="px-6 py-2.5 border border-border rounded-full text-sm hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}

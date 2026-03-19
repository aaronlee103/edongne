'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

const CATEGORIES = [
  { key: 'free', label: '자유' },
  { key: 'qna', label: '질문답변' },
  { key: 'info', label: '정보' },
  { key: 'buysell', label: '사고팔고' },
  { key: 'jobs', label: '구인구직' },
  { key: 'housing', label: '렌트/룸메' },
]

export default function WritePage() {
  const router = useRouter()
  const supabase = createClient()
  const [category, setCategory] = useState('free')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/auth')
      } else {
        setUser(data.user)
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return router.push('/auth')

    setLoading(true)
    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      type: 'community',
      category,
      title,
      content,
    })

    if (error) {
      alert('글 작성에 실패했습니다: ' + error.message)
      setLoading(false)
      return
    }

    router.push('/board')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">글쓰기</h1>

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
            disabled={loading}
            className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? '게시 중...' : '게시하기'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-border rounded-full text-sm hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}

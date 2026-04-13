'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-client'
import { uploadImage } from '@/lib/upload'

const COMMUNITY_CATEGORIES = [
  { key: 'free', label: '자유' },
  { key: 'qna', label: '질문답변' },
  { key: 'info', label: '정보' },
  { key: 'buysell', label: '사고팔고' },
  { key: 'housing', label: '렌트/룸메' },
]

const MAGAZINE_CATEGORIES = [
  { key: 'editor', label: '에디터 추천' },
  { key: 'neighborhood', label: '이동네어때' },
  { key: 'realestate', label: '부동산 가이드' },
  { key: 'living', label: '생활 정보' },
  { key: 'legal', label: '법률/비자' },
  { key: 'construction', label: '건축/인테리어' },
  { key: 'finance', label: '주택윴자' },
  { key: 'topic', label: '맛집/문화' },
  { key: 'info', label: '뉴스' },
]

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const supabase = createClient()

  const [postType, setPostType] = useState<'community' | 'magazine' | 'notice'>('community')
  const [category, setCategory] = useState('free')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [tags, setTags] = useState('')
  const [region, setRegion] = useState('ny')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [published, setPublished] = useState(true)
  const [publishDate, setPublishDate] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  const isMagazine = postType === 'magazine' || postType === 'notice'

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

    setPostType(post.type || 'community')
    setCategory(post.category)
    setTitle(post.title)
    setContent(post.content)
    setThumbnail(post.thumbnail || '')
    setTags(post.tags?.join(', ') || '')
    setRegion(post.region || 'ny')
    setPublished(post.published !== false)
    // 기존 날짜를 로컬 시간 기준 datetime-local 형식으로 변환
    if (post.created_at) {
      const d = new Date(post.created_at)
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      setPublishDate(local.toISOString().slice(0, 16))
    }
    setLoading(false)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, isThumbnail = false) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const url = await uploadImage(file)
    setUploading(false)

    if (!url) {
      alert('이미지 업로드에 실패했습니다')
      return
    }

    if (isThumbnail) {
      setThumbnail(url)
    } else {
      const textarea = contentRef.current
      if (textarea) {
        const pos = textarea.selectionStart
        const before = content.substring(0, pos)
        const after = content.substring(pos)
        const imgTag = `\n![이미지](${url})\n`
        setContent(before + imgTag + after)
      }
    }
    // 파일 입력 초기화
    e.target.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const updateData: any = { category, title, content, published }

    if (isMagazine) {
      updateData.thumbnail = thumbnail || null
      updateData.region = region
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean)
      updateData.tags = tagArray.length > 0 ? tagArray : null
      if (publishDate) {
        updateData.created_at = new Date(publishDate).toISOString()
      }
    }

    const { error } = await supabase
      .from('posts')
      .update(updateData)
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
      <h1 className="text-2xl font-bold mb-6">{isMagazine ? '매거진 글 수정' : '글 수정'}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 카테고리 */}
        {isMagazine ? (
          <div>
            <label className="block text-sm font-medium mb-1.5">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {MAGAZINE_CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`px-3 py-1 text-xs rounded-full ${category === cat.key ? 'bg-black text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-1.5">카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full md:w-48 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-black"
            >
              {COMMUNITY_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* 공개 지역 (매거진만) */}
        {isMagazine && (
          <div>
            <label className="block text-sm font-medium mb-1.5">공개 지역</label>
            <div className="flex flex-wrap gap-2">
              {[
                { code: 'all', label: '전체' },
                { code: 'ny', label: '뉴욕/뉴저지' },
                { code: 'la', label: '로스앤젤레스' },
                { code: 'dc', label: '워싱턴 DC' },
                { code: 'seattle', label: '시애틀' },
                { code: 'chicago', label: '시카고' },
                { code: 'sf', label: '샌프란시스코' },
                { code: 'atlanta', label: '애틀랜타' },
                { code: 'philly', label: '필라델피아' },
                { code: 'dallas', label: '달라스' },
                { code: 'houston', label: '휴스턴' },
                { code: 'hawaii', label: '하와이' },
                { code: 'boston', label: '보스턴' },
              ].map(r => (
                <button
                  key={r.code}
                  type="button"
                  onClick={() => setRegion(r.code)}
                  className={`px-3 py-1 text-xs rounded-full ${region === r.code ? 'bg-black text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 대표 이미지 (매거진만) */}
        {isMagazine && (
          <div>
            <label className="block text-sm font-medium mb-1.5">대표 이미지</label>
            {thumbnail ? (
              <div className="relative inline-block">
                <Image src={thumbnail} alt="썸네일" width={192} height={128} className="object-cover rounded-lg border border-border" unoptimized />
                <button
                  type="button"
                  onClick={() => setThumbnail('')}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white rounded-full text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="inline-flex w-48 h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-gray-50 items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, true)}
                />
                <span className="text-sm text-muted">{uploading ? '업로드 중...' : '+ 이미지 선택'}</span>
              </label>
            )}
          </div>
        )}

        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium mb-1.5">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            maxLength={200}
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black"
            required
          />
        </div>

        {/* 내용 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium">내용</label>
            {isMagazine && (
              <label className="text-xs text-muted cursor-pointer hover:text-primary">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => handleImageUpload(e, false)}
                />
                📷 이미지 삽입
              </label>
            )}
          </div>
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isMagazine
              ? '본문을 작성하세요. 마크다운 형식을 지원합니다.\n\n## 소제목\n본문 내용...\n\n**굵게**, *기울임*, [링크](url)'
              : '내용을 입력하세요'
            }
            className={`w-full px-4 py-3 border border-border rounded-lg text-sm min-h-[300px] resize-y focus:outline-none focus:border-black ${isMagazine ? 'min-h-[400px] font-mono' : ''}`}
            required
          />
          {isMagazine && (
            <p className="text-xs text-muted mt-1">마크다운 지원: ## 제목, **굵게**, *기울임*, ![이미지](url), [링크](url)</p>
          )}
        </div>

        {/* 태그 (매거진만) */}
        {isMagazine && (
          <div>
            <label className="block text-sm font-medium mb-1.5">태그 (쉼표로 구분)</label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="부동산, 뉴욕, 2025전망"
              className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-black"
            />
          </div>
        )}

        {/* 발행일 (매거진만) */}
        {isMagazine && (
          <div>
            <label className="block text-sm font-medium mb-1.5">발행일</label>
            <input
              type="datetime-local"
              value={publishDate}
              onChange={e => setPublishDate(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-black"
            />
            <p className="text-xs text-muted mt-1">날짜를 변경하메 글 목록에서의 위치가 바뀝니다</p>
          </div>
        )}

        {/* 공개/비공개 */}
        <div className="flex items-center gap-3 pt-2">
          <label className="text-sm font-medium">공개 설정</label>
          <button
            type="button"
            onClick={() => setPublished(!published)}
            className={`relative w-11 h-6 rounded-full transition-colors ${published ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${published ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
          <span className={`text-xs ${published ? 'text-green-600' : 'text-gray-500'}`}>{published ? '공개' : '비공개'}</span>
        </div>

        {/* 버튼 */}
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

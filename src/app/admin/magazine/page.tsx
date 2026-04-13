'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { uploadImage } from '@/lib/upload'
import { useAdminRegion } from '@/context/AdminRegionContext'

const MAGAZINE_CATEGORIES = [
  { key: 'editor', label: '에디터 추천' },
  { key: 'neighborhood', label: '이동네어때' },
  { key: 'realestate', label: '부동산 가이드' },
  { key: 'living', label: '생활 정보' },
  { key: 'legal', label: '법률/비자' },
  { key: 'construction', label: '건축/인테리어' },
  { key: 'finance', label: '주택융자' },
  { key: 'topic', label: '맛집/문화' },
  { key: 'info', label: '뉴스' },
]

function regionFilterStr(selectedRegion: string) {
  if (selectedRegion === 'ny') return `region.eq.${selectedRegion},region.eq.all,region.is.null`
  return `region.eq.${selectedRegion},region.eq.all`
}

export default function AdminMagazinePage() {
  const supabase = createClient()
  const { selectedRegion } = useAdminRegion()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingPost, setEditingPost] = useState<any>(null)
  const [filterCat, setFilterCat] = useState('all')

  useEffect(() => { fetchPosts() }, [filterCat, selectedRegion])

  async function fetchPosts() {
    setLoading(true)
    let query = supabase
      .from('posts')
      .select('*')
      .in('type', ['magazine', 'notice'])
      .or(regionFilterStr(selectedRegion))
      .order('created_at', { ascending: false })
      .limit(50)
    if (filterCat !== 'all') query = query.eq('category', filterCat)
    const { data } = await query
    if (data) setPosts(data)
    setLoading(false)
  }

  async function deletePost(id: string) {
    if (!confirm('삭제하시겠습니까?')) return
    await supabase.from('posts').delete().eq('id', id)
    fetchPosts()
  }

  async function togglePublished(id: string, current: boolean | null) {
    const newVal = !(current === null || current === true)
    const { error } = await supabase.from('posts').update({ published: newVal }).eq('id', id)
    if (error) { alert('변경 실패: ' + error.message); return }
    setPosts(prev => prev.map(p => p.id === id ? { ...p, published: newVal } : p))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">매거진 관리</h1>
        <button
          onClick={() => { setEditingPost(null); setShowEditor(!showEditor) }}
          className="bg-black text-white px-4 py-1.5 rounded-full text-sm hover:bg-gray-800"
        >
          {showEditor ? '목록 보기' : '+ 새 매거진 글'}
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { key: 'all', label: '전체' },
          { key: 'editor', label: '에디터 픽' },
          { key: 'neighborhood', label: '이동네어때' },
          { key: 'realestate', label: '부동산' },
          { key: 'legal', label: '부동산 법률' },
          { key: 'living', label: '생활정보' },
          { key: 'construction', label: '건축/인테리어' },
          { key: 'finance', label: '주택융자' },
        ].map(cat => (
          <button
            key={cat.key}
            onClick={() => setFilterCat(cat.key)}
            className={`px-3 py-1 text-xs rounded-full ${filterCat === cat.key ? 'bg-black text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {showEditor ? (
        <MagazineEditor
          supabase={supabase}
          editingPost={editingPost}
          onPublish={() => { setShowEditor(false); setEditingPost(null); fetchPosts() }}
        />
      ) : (
        <div className="space-y-3">
          {loading ? (
            <p className="text-center py-8 text-muted text-sm">불러오는 중...</p>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <p className="text-muted text-sm mb-2">매거진 콘텐츠가 없습니다</p>
              <button onClick={() => setShowEditor(true)} className="text-sm text-primary hover:underline">
                첫 매거진 글 작성하기
              </button>
            </div>
          ) : posts.map((post) => (
            <div key={post.id} className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-gray-50">
              {post.thumbnail && (
                <img src={post.thumbnail} alt="" className="w-20 h-14 object-cover rounded" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${post.type === 'notice' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {post.type === 'notice' ? '공지' : '매거진'}
                  </span>
                  <span className="text-xs text-muted">{post.category}</span>
                </div>
                <Link href={`/post/${post.id}`} className="text-sm font-medium hover:underline line-clamp-1">
                  {post.title}
                </Link>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                  <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                  <span>조회 {post.views || 0}</span>
                  {post.tags?.length > 0 && post.tags.map((t: string) => (
                    <span key={t} className="bg-gray-100 px-1.5 py-0.5 rounded">#{t}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0 items-end">
                <button
                  onClick={() => togglePublished(post.id, post.published)}
                  className={`text-xs px-2 py-0.5 rounded-full ${post.published === false ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-700'}`}
                >
                  {post.published === false ? '비공개' : '공개'}
                </button>
                <button onClick={() => { setEditingPost(post); setShowEditor(true) }} className="text-xs text-blue-500 hover:underline">수정</button>
                <button onClick={() => deletePost(post.id)} className="text-xs text-red-500 hover:underline">삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MagazineEditor({ supabase, editingPost, onPublish }: { supabase: any; editingPost?: any; onPublish: () => void }) {
  const [type, setType] = useState<'magazine' | 'notice'>(editingPost?.type || 'magazine')
  const [category, setCategory] = useState(editingPost?.category || MAGAZINE_CATEGORIES[0].key)
  const [title, setTitle] = useState(editingPost?.title || '')
  const [content, setContent] = useState(editingPost?.content || '')
  const [thumbnail, setThumbnail] = useState(editingPost?.thumbnail || '')
  const [tags, setTags] = useState(editingPost?.tags?.join(', ') || '')
  const [uploading, setUploading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [region, setRegion] = useState(editingPost?.region || 'ny')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

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
      // 에디터에 이미지 삽입
      const textarea = contentRef.current
      if (textarea) {
        const pos = textarea.selectionStart
        const before = content.substring(0, pos)
        const after = content.substring(pos)
        const imgTag = `\n![이미지](${url})\n`
        setContent(before + imgTag + after)
      }
    }
  }

  async function handlePublish() {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요')
      return
    }

    setPublishing(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { alert('로그인 필요'); setPublishing(false); return }

    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean)

    const postData = {
      type,
      category: type === 'notice' ? 'topic' : category,
      title: title.trim(),
      content: content.trim(),
      thumbnail: thumbnail || null,
      tags: tagArray.length > 0 ? tagArray : null,
      region,
    }

    const { error } = editingPost
      ? await supabase.from('posts').update(postData).eq('id', editingPost.id)
      : await supabase.from('posts').insert({ ...postData, user_id: user.id })

    if (error) {
      alert((editingPost ? '수정' : '게시') + ' 실패: ' + error.message)
    } else {
      onPublish()
    }
    setPublishing(false)
  }

  return (
    <div className="space-y-4">
      {/* 유형 선택 */}
      <div className="flex gap-2">
        {(['magazine', 'notice'] as const).map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-4 py-1.5 text-sm rounded-full ${type === t ? 'bg-black text-white' : 'bg-gray-100 text-secondary'}`}
          >
            {t === 'magazine' ? '매거진' : '공지'}
          </button>
        ))}
      </div>

      {/* 카테고리 */}
      {type === 'magazine' && (
        <div>
          <label className="block text-sm font-medium mb-1.5">카테고리</label>
          <div className="flex flex-wrap gap-2">
            {MAGAZINE_CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`px-3 py-1 text-xs rounded-full ${category === cat.key ? 'bg-black text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 공개 지역 */}
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
              onClick={() => setRegion(r.code)}
              className={`px-3 py-1 text-xs rounded-full ${region === r.code ? 'bg-black text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 대표 이미지 */}
      <div>
        <label className="block text-sm font-medium mb-1.5">대표 이미지</label>
        {thumbnail ? (
          <div className="relative inline-block">
            <img src={thumbnail} alt="썸네일" className="w-48 h-32 object-cover rounded-lg border border-border" />
            <button
              onClick={() => setThumbnail('')}
              className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white rounded-full text-xs flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        ) : (
          <label className="block w-48 h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-gray-50 flex items-center justify-center">
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

      {/* 제목 */}
      <div>
        <label className="block text-sm font-medium mb-1.5">제목</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="매거진 제목을 입력하세요"
          className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-black"
        />
      </div>

      {/* 본문 에디터 */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium">본문</label>
          <div className="flex gap-2">
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
          </div>
        </div>
        <textarea
          ref={contentRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="본문을 작성하세요. 마크다운 형식을 지원합니다.&#10;&#10;## 소제목&#10;본문 내용...&#10;&#10;**굵게**, *기울임*, [링크](url)"
          className="w-full px-4 py-3 border border-border rounded-lg text-sm min-h-[400px] resize-y focus:outline-none focus:border-black font-mono"
        />
        <p className="text-xs text-muted mt-1">마크다운 지원: ## 제목, **굵게**, *기울임*, ![이미지](url), [링크](url)</p>
      </div>

      {/* 태그 */}
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

      {/* 게시 버튼 */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {publishing ? (editingPost ? '수정 중...' : '게시 중...') : (editingPost ? '수정하기' : '게시하기')}
        </button>
        <button
          onClick={onPublish}
          className="px-6 py-2.5 border border-border rounded-full text-sm hover:bg-gray-50"
        >
          취소
        </button>
      </div>
    </div>
  )
}

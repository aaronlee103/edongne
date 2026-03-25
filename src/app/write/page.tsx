'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { uploadImage } from '@/lib/upload'
import { useRegion } from '@/context/RegionContext'

const CATEGORIES = [
  { key: 'free', label: '자유' },
  { key: 'qna', label: '질문답변' },
  { key: 'info', label: '정보' },
  { key: 'buysell', label: '사고팔고' },
  { key: 'housing', label: '렌트/룸메' },
]

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

export default function WritePage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { regionCode } = useRegion()
  const [category, setCategory] = useState('free')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/auth')
      } else {
        setUser(data.user)
      }
    })
  }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      alert('이미지 크기는 2MB 이하만 가능합니다.')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return router.push('/auth')

    setLoading(true)

    let imageUrl: string | null = null
    if (imageFile) {
      setUploadingImage(true)
      imageUrl = await uploadImage(imageFile)
      setUploadingImage(false)
      if (!imageUrl) {
        alert('이미지 업로드에 실패했습니다.')
        setLoading(false)
        return
      }
    }

    const insertData: any = {
      user_id: user.id,
      type: 'community',
      category,
      title,
      content,
      region: regionCode,
    }
    if (imageUrl) insertData.image_url = imageUrl

    const { error } = await supabase.from('posts').insert(insertData)

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
            maxLength={200}
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
            maxLength={10000}
            className="w-full px-4 py-3 border border-border rounded-lg text-sm min-h-[300px] resize-y focus:outline-none focus:border-black"
            required
          />
        </div>

        {/* 이미지 업로드 */}
        <div>
          <label className="block text-sm font-medium mb-1.5">이미지 (선택)</label>
          {imagePreview ? (
            <div className="relative inline-block">
              <img src={imagePreview} alt="미리보기" className="max-h-48 rounded-lg border border-border" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white rounded-full text-xs flex items-center justify-center hover:bg-gray-700"
              >
                ✕
              </button>
              <p className="text-xs text-muted mt-1">{imageFile?.name} ({(imageFile!.size / 1024).toFixed(0)}KB)</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-lg text-sm text-muted hover:border-black hover:text-primary transition-colors w-full justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              이미지 첨부 (최대 2MB)
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {uploadingImage ? '이미지 업로드 중...' : loading ? '게시 중...' : '게시하기'}
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

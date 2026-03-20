'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

type Tab = 'posts' | 'comments' | 'bookmarks' | 'settings'

const AVATAR_OPTIONS: { key: string; emoji: string; label: string }[] = [
  { key: 'bear', emoji: '🐻', label: '곰' },
  { key: 'rabbit', emoji: '🐰', label: '토끼' },
  { key: 'fox', emoji: '🦊', label: '여우' },
  { key: 'cat', emoji: '🐱', label: '고양이' },
  { key: 'dog', emoji: '🐶', label: '강아지' },
  { key: 'owl', emoji: '🦉', label: '부엉이' },
  { key: 'penguin', emoji: '🐧', label: '펭귄' },
  { key: 'deer', emoji: '🦌', label: '사슴' },
]

const AVATAR_EMOJI: Record<string, string> = Object.fromEntries(
  AVATAR_OPTIONS.map((a) => [a.key, a.emoji])
)

const ROLE_LABEL: Record<string, string> = {
  super: '슈퍼관리자', editor: '에디터', business: '업체회원', user: '일반회원',
}

export default function MyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('posts')
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [authUser, setAuthUser] = useState<any>(null)

  // Settings state
  const [nickname, setNickname] = useState('')
  const [avatarAnimal, setAvatarAnimal] = useState('bear')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  // Tab content
  const [myPosts, setMyPosts] = useState<any[]>([])
  const [myComments, setMyComments] = useState<any[]>([])
  const [myBookmarks, setMyBookmarks] = useState<any[]>([])

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth')
      return
    }
    setAuthUser(user)

    const { data: prof } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (prof) {
      setProfile(prof)
      setNickname(prof.nickname)
      setAvatarAnimal(prof.avatar_animal || 'bear')
    }
    setLoading(false)
  }

  async function loadTabData(t: Tab) {
    if (!authUser) return

    if (t === 'posts' && myPosts.length === 0) {
      const { data } = await supabase
        .from('posts')
        .select('id, title, category, created_at, views')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(30)
      if (data) setMyPosts(data)
    }

    if (t === 'comments' && myComments.length === 0) {
      const { data } = await supabase
        .from('comments')
        .select('id, content, created_at, post:posts(id, title)')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(30)
      if (data) setMyComments(data)
    }

    if (t === 'bookmarks' && myBookmarks.length === 0) {
      const { data } = await supabase
        .from('bookmarks')
        .select('id, created_at, post:posts(id, title, category, created_at)')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(30)
      if (data) setMyBookmarks(data)
    }
  }

  function handleTabChange(t: Tab) {
    setTab(t)
    loadTabData(t)
  }

  async function handleSave() {
    if (!authUser || !nickname.trim()) return
    setSaving(true)
    setSaveMsg('')

    const { error } = await supabase
      .from('users')
      .update({
        nickname: nickname.trim(),
        avatar_animal: avatarAnimal,
      })
      .eq('id', authUser.id)

    if (error) {
      setSaveMsg('저장 실패: ' + error.message)
    } else {
      setSaveMsg('저장되었습니다!')
      setProfile((prev: any) => ({ ...prev, nickname: nickname.trim(), avatar_animal: avatarAnimal }))
      setTimeout(() => setSaveMsg(''), 2000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-center text-muted py-12">불러오는 중...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-center text-muted py-12">프로필을 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 프로필 */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
          {AVATAR_EMOJI[profile.avatar_animal] || '🐻'}
        </div>
        <div>
          <h1 className="text-xl font-bold">{profile.nickname}</h1>
          <p className="text-sm text-muted">
            {ROLE_LABEL[profile.role] || profile.role} · {new Date(profile.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })} 가입
          </p>
          <p className="text-xs text-muted mt-0.5">{profile.email}</p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-4 mb-6 border-b border-border">
        {([
          ['posts', '내 글'],
          ['comments', '내 댓글'],
          ['bookmarks', '북마크'],
          ['settings', '설정'],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              tab === key ? 'border-black text-primary' : 'border-transparent text-muted hover:text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 내 글 */}
      {tab === 'posts' && (
        <div className="space-y-3">
          {myPosts.length === 0 ? (
            <p className="text-sm text-muted">아직 작성한 글이 없습니다.</p>
          ) : myPosts.map((p) => (
            <Link key={p.id} href={`/board/${p.id}`} className="block py-3 border-b border-border hover:bg-gray-50 -mx-2 px-2 rounded">
              <p className="text-sm font-medium">{p.title}</p>
              <p className="text-xs text-muted mt-1">
                {new Date(p.created_at).toLocaleDateString('ko-KR')} · 조회 {p.views}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* 내 댓글 */}
      {tab === 'comments' && (
        <div className="space-y-3">
          {myComments.length === 0 ? (
            <p className="text-sm text-muted">아직 작성한 댓글이 없습니다.</p>
          ) : myComments.map((c) => (
            <Link key={c.id} href={`/board/${c.post?.id}`} className="block py-3 border-b border-border hover:bg-gray-50 -mx-2 px-2 rounded">
              <p className="text-sm">{c.content}</p>
              <p className="text-xs text-muted mt-1">
                {c.post?.title && <span className="text-gray-500">"{c.post.title}"에 댓글 · </span>}
                {new Date(c.created_at).toLocaleDateString('ko-KR')}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* 북마크 */}
      {tab === 'bookmarks' && (
        <div className="space-y-3">
          {myBookmarks.length === 0 ? (
            <p className="text-sm text-muted">북마크한 글이 없습니다.</p>
          ) : myBookmarks.map((b) => (
            <Link key={b.id} href={`/board/${b.post?.id}`} className="block py-3 border-b border-border hover:bg-gray-50 -mx-2 px-2 rounded">
              <p className="text-sm font-medium">{b.post?.title}</p>
              <p className="text-xs text-muted mt-1">
                {new Date(b.post?.created_at || b.created_at).toLocaleDateString('ko-KR')}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* 설정 */}
      {tab === 'settings' && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">닉네임 (활동명)</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              className="w-full md:w-64 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-black"
            />
            <p className="text-xs text-muted mt-1">커뮤니티에서 표시될 이름입니다</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">아바타</label>
            <div className="grid grid-cols-4 gap-2 w-64">
              {AVATAR_OPTIONS.map((a) => (
                <button
                  key={a.key}
                  onClick={() => setAvatarAnimal(a.key)}
                  className={`py-2 border rounded-lg transition-colors ${
                    avatarAnimal === a.key
                      ? 'border-black bg-gray-100'
                      : 'border-border hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{a.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !nickname.trim()}
              className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            {saveMsg && (
              <span className={`text-sm ${saveMsg.includes('실패') ? 'text-red-500' : 'text-green-600'}`}>
                {saveMsg}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useState } from 'react'

type Tab = 'posts' | 'comments' | 'bookmarks' | 'settings'

export default function MyPage() {
  const [tab, setTab] = useState<Tab>('posts')

  // TODO: 로그인 체크 → 미로그인 시 /auth로 리다이렉트

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 프로필 */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
          🐻
        </div>
        <div>
          <h1 className="text-xl font-bold">맨하탄곰</h1>
          <p className="text-sm text-muted">일반회원 · 2024.06 가입</p>
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
            onClick={() => setTab(key)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              tab === key ? 'border-black text-primary' : 'border-transparent text-muted hover:text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'posts' && (
        <div className="space-y-3">
          <p className="text-sm text-muted">아직 작성한 글이 없습니다.</p>
        </div>
      )}
      {tab === 'comments' && (
        <div className="space-y-3">
          <p className="text-sm text-muted">아직 작성한 댓글이 없습니다.</p>
        </div>
      )}
      {tab === 'bookmarks' && (
        <div className="space-y-3">
          <p className="text-sm text-muted">북마크한 글이 없습니다.</p>
        </div>
      )}
      {tab === 'settings' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">닉네임</label>
            <input type="text" defaultValue="맨하탄곰" className="w-full md:w-64 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-black" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">아바타</label>
            <div className="grid grid-cols-4 gap-2 w-64">
              {['🐻', '🐰', '🦊', '🐱', '🐶', '🦉', '🐧', '🦌'].map((a) => (
                <button key={a} className="py-2 border border-border rounded-lg hover:bg-gray-50">{a}</button>
              ))}
            </div>
          </div>
          <button className="bg-black text-white px-4 py-2 rounded-full text-sm mt-4 hover:bg-gray-800 transition-colors">저장</button>
        </div>
      )}
    </div>
  )
}

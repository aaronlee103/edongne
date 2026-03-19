'use client'

import Link from 'next/link'
import { useState } from 'react'

const CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'free', label: '자유' },
  { key: 'qna', label: '질문답변' },
  { key: 'info', label: '정보' },
  { key: 'buysell', label: '사고팔고' },
  { key: 'jobs', label: '구인구직' },
  { key: 'housing', label: '렌트/룸메' },
]

// 목업 데이터 (Supabase 연결 전)
const MOCK_POSTS = [
  { id: '1', category: 'qna', title: '플러싱에서 맨하탄 출퇴근 어떤가요?', nickname: '맨하탄곰', comments: 23, votes: 45, date: '3시간 전' },
  { id: '2', category: 'free', title: '뉴저지 포트리 한인 마트 추천', nickname: '저지여우', comments: 15, votes: 32, date: '5시간 전' },
  { id: '3', category: 'qna', title: 'H1B 변호사 추천 부탁드립니다', nickname: '비자토끼', comments: 31, votes: 28, date: '8시간 전' },
  { id: '4', category: 'housing', title: '우드사이드 1BR 월세 얼마가 적당한가요?', nickname: '퀸즈펭귄', comments: 19, votes: 22, date: '12시간 전' },
  { id: '5', category: 'info', title: '핸디맨 vs 건축업체, 어떤 경우에 뭘 써야하나', nickname: '집수리부엉이', comments: 27, votes: 41, date: '1일 전' },
  { id: '6', category: 'buysell', title: '이사 가구 정리합니다 (맨하탄 픽업)', nickname: '이사고양이', comments: 8, votes: 12, date: '1일 전' },
  { id: '7', category: 'jobs', title: '[채용] 포트리 한식당 서버 구합니다', nickname: '사장님사슴', comments: 3, votes: 5, date: '2일 전' },
  { id: '8', category: 'free', title: '뉴욕 벚꽃 시즌 언제부터인가요?', nickname: '봄강아지', comments: 12, votes: 18, date: '2일 전' },
]

export default function BoardPage() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredPosts = activeCategory === 'all'
    ? MOCK_POSTS
    : MOCK_POSTS.filter(p => p.category === activeCategory)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">커뮤니티</h1>
        <Link
          href="/write"
          className="text-sm bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors"
        >
          글쓰기
        </Link>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
              activeCategory === cat.key
                ? 'bg-black text-white'
                : 'bg-gray-100 text-secondary hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 게시글 목록 */}
      <div className="divide-y divide-border">
        {filteredPosts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="block py-4 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* 투표 */}
              <div className="flex flex-col items-center text-xs text-muted pt-0.5 w-8 shrink-0">
                <span>▲</span>
                <span className="font-medium text-primary">{post.votes}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-muted">
                    {CATEGORIES.find(c => c.key === post.category)?.label}
                  </span>
                </div>
                <h3 className="text-sm font-medium truncate">{post.title}</h3>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted">
                  <span>{post.nickname}</span>
                  <span>{post.date}</span>
                  <span>💬 {post.comments}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

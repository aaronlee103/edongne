'use client'

import Link from 'next/link'
import { useState } from 'react'

// 목업 데이터
const MOCK_POST = {
  id: '1',
  title: '플러싱에서 맨하탄 출퇴근 어떤가요?',
  content: `안녕하세요, 올해 봄에 뉴욕으로 이사 계획 중입니다.

현재 플러싱 쪽으로 집을 알아보고 있는데, 맨하탄 미드타운으로 출퇴근하시는 분들 경험이 궁금합니다.

1. 7호선 실제 출퇴근 시간이 어느 정도인가요?
2. LIRR을 이용하시는 분도 계신가요?
3. 플러싱 외에 출퇴근하기 좋은 퀸즈 동네 추천도 부탁드립니다.

감사합니다!`,
  category: '질문답변',
  nickname: '맨하탄곰',
  avatar: 'bear',
  date: '2025.03.15 14:30',
  views: 342,
  votes: 45,
}

const MOCK_COMMENTS = [
  { id: '1', nickname: '퀸즈여우', avatar: 'fox', content: '7호선 러시아워 기준 약 40-50분 정도 걸려요. 플러싱이 시발역이라 자리 앉을 수 있는 게 큰 장점입니다.', date: '3시간 전', votes: 12 },
  { id: '2', nickname: '출퇴근토끼', avatar: 'rabbit', content: 'LIRR 쓰면 20분이면 펜스테이션 도착합니다. 월정액 좀 비싸지만 체감 시간이 확 줄어요.', date: '2시간 전', votes: 8 },
  { id: '3', nickname: '우드사이드펭귄', avatar: 'penguin', content: '우드사이드도 추천합니다. 7호선 + LIRR 둘 다 이용 가능하고, 플러싱보다 맨하탄 가까워요.', date: '1시간 전', votes: 15 },
]

export default function PostDetailPage() {
  const [commentText, setCommentText] = useState('')

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 뒤로가기 */}
      <Link href="/board" className="text-sm text-muted hover:text-primary mb-6 inline-block">
        ← 커뮤니티로 돌아가기
      </Link>

      {/* 게시글 */}
      <article className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{MOCK_POST.category}</span>
        </div>
        <h1 className="text-2xl font-bold mb-4">{MOCK_POST.title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted mb-6">
          <span className="font-medium text-primary">{MOCK_POST.nickname}</span>
          <span>{MOCK_POST.date}</span>
          <span>조회 {MOCK_POST.views}</span>
        </div>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">
          {MOCK_POST.content}
        </div>

        {/* 투표 */}
        <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border">
          <button className="vote-btn text-lg">▲</button>
          <span className="font-bold">{MOCK_POST.votes}</span>
          <button className="vote-btn text-lg">▼</button>
          <button className="ml-auto text-sm text-muted hover:text-primary">🔖 북마크</button>
          <button className="text-sm text-muted hover:text-red-500">🚨 신고</button>
        </div>
      </article>

      {/* 댓글 */}
      <section>
        <h2 className="font-bold mb-4">댓글 {MOCK_COMMENTS.length}개</h2>

        {/* 댓글 입력 */}
        <div className="mb-6">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="댓글을 남겨보세요"
            className="w-full border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-black transition-colors"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button className="text-sm bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors">
              댓글 작성
            </button>
          </div>
        </div>

        {/* 댓글 목록 */}
        <div className="space-y-4">
          {MOCK_COMMENTS.map((comment) => (
            <div key={comment.id} className="py-4 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">{comment.nickname}</span>
                <span className="text-xs text-muted">{comment.date}</span>
              </div>
              <p className="text-sm leading-relaxed">{comment.content}</p>
              <div className="flex items-center gap-3 mt-2">
                <button className="text-xs text-muted hover:text-primary">▲ {comment.votes}</button>
                <button className="text-xs text-muted hover:text-primary">답글</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

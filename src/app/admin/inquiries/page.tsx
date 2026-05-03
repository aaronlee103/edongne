'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'

const TOPIC_LABELS: Record<string, string> = {
  business_register: '업체 등록',
  plan_upgrade: '플랜 업그레이드',
  advertising: '광고/마케팅',
  web_development: '웹사이트 제작',
  partnership: '제휴/협업',
  bug_report: '오류/건의',
  account: '계정 관련',
  other: '기타',
}

export default function AdminInquiriesPage() {
  const supabase = createClient()
  const [inquiries, setInquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null)

  useEffect(() => { fetchInquiries() }, [])

  async function fetchInquiries() {
    setLoading(true)
    const { data } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setInquiries(data)
    setLoading(false)
  }

  async function markAsRead(id: string) {
    await supabase.from('inquiries').update({ status: 'read' }).eq('id', id)
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'read' } : i))
  }

  async function deleteInquiry(id: string) {
    if (!confirm('삭제하시겠습니까?')) return
    await supabase.from('inquiries').delete().eq('id', id)
    setInquiries(prev => prev.filter(i => i.id !== id))
    if (selectedInquiry?.id === id) setSelectedInquiry(null)
  }

  const unreadCount = inquiries.filter(i => i.status !== 'read').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">문의 관리</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}건 미확인</span>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-center py-8 text-muted text-sm">불러오는 중...</p>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <p className="text-muted text-sm">접수된 문의가 없습니다</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* 문의 목록 */}
          <div className="space-y-2">
            {inquiries.map((inquiry) => (
              <button
                key={inquiry.id}
                onClick={() => { setSelectedInquiry(inquiry); markAsRead(inquiry.id) }}
                className={`w-full text-left p-4 border rounded-lg transition-colors ${
                  selectedInquiry?.id === inquiry.id
                    ? 'border-black bg-gray-50'
                    : inquiry.status !== 'read'
                      ? 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                      : 'border-border hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {inquiry.status !== 'read' && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                    <span className="text-xs text-muted">{TOPIC_LABELS[inquiry.topic] || inquiry.topic}</span>
                  </div>
                  <span className="text-xs text-muted">
                    {new Date(inquiry.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm font-medium">{inquiry.name} · {inquiry.email}</p>
                <p className="text-xs text-muted mt-1 line-clamp-1">{inquiry.message}</p>
              </button>
            ))}
          </div>

          {/* 문의 상세 */}
          <div>
            {selectedInquiry ? (
              <div className="border border-border rounded-lg p-6 sticky top-20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{TOPIC_LABELS[selectedInquiry.topic] || selectedInquiry.topic}</span>
                  <button onClick={() => deleteInquiry(selectedInquiry.id)} className="text-xs text-red-500 hover:underline">삭제</button>
                </div>
                <h2 className="font-bold text-lg mb-4">{selectedInquiry.name}</h2>
                <div className="space-y-2 text-sm mb-6">
                  <p><span className="text-muted">이메일:</span> <a href={`mailto:${selectedInquiry.email}`} className="text-blue-600 hover:underline">{selectedInquiry.email}</a></p>
                  <p><span className="text-muted">전화:</span> <a href={`tel:${selectedInquiry.phone}`} className="text-blue-600 hover:underline">{selectedInquiry.phone}</a></p>
                  <p><span className="text-muted">접수일:</span> {new Date(selectedInquiry.created_at).toLocaleString('ko-KR')}</p>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-medium mb-2">문의 내용</p>
                  <p className="text-sm text-secondary whitespace-pre-wrap leading-relaxed">{selectedInquiry.message}</p>
                </div>
                <div className="mt-6 flex gap-2">
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=Re: 이동네 문의 답변 (${TOPIC_LABELS[selectedInquiry.topic] || ''})`}
                    className="text-sm bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800"
                  >
                    이메일 답변하기
                  </a>
                  <a
                    href={`tel:${selectedInquiry.phone}`}
                    className="text-sm border border-border px-4 py-2 rounded-full hover:bg-gray-50"
                  >
                    전화하기
                  </a>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-border rounded-lg p-12 text-center">
                <p className="text-muted text-sm">왼쪽에서 문의를 선택하세요</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

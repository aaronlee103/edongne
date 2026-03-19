'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function AdminReportsPage() {
  const supabase = createClient()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchReports() }, [])

  async function fetchReports() {
    setLoading(true)
    const { data } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setReports(data)
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('reports').update({ status }).eq('id', id)
    if (error) alert('상태 변경 실패: ' + error.message)
    else fetchReports()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">신고 관리</h1>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-light border-b border-border">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-muted">유형</th>
              <th className="text-left px-4 py-2 font-medium text-muted">사유</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-20">상태</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-24">날짜</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-28">처리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">불러오는 중...</td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">신고 내역이 없습니다</td></tr>
            ) : reports.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                <td className="px-4 py-2.5 text-xs">{r.target_type}</td>
                <td className="px-4 py-2.5 truncate max-w-[200px]">{r.reason}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    r.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {r.status === 'pending' ? '대기' : r.status === 'resolved' ? '처리완료' : '기각'}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-muted">{new Date(r.created_at).toLocaleDateString('ko-KR')}</td>
                <td className="px-4 py-2.5">
                  {r.status === 'pending' && (
                    <div className="flex gap-1">
                      <button onClick={() => updateStatus(r.id, 'resolved')} className="text-xs text-green-600 hover:underline">처리</button>
                      <button onClick={() => updateStatus(r.id, 'dismissed')} className="text-xs text-muted hover:underline">기각</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

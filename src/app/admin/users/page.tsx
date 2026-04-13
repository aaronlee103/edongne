'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useAdminRegion } from '@/context/AdminRegionContext'
import { REGIONS } from '@/lib/regions'

const ROLES: Record<string, string> = { super: '슈퍼관리자', editor: '에디터', business: '업체회원', user: '일반회원' }

export default function AdminUsersPage() {
  const supabase = createClient()
  const { userRole } = useAdminRegion()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setUsers(data)
    setLoading(false)
  }

  async function updateRole(userId: string, role: string) {
    const { error, count } = await supabase.from('users').update({ role }).eq('id', userId).select()
    if (error) {
      alert('역할 변경 실패: ' + error.message)
    } else if (!count && count !== null) {
      alert('역할 변경 권한이 없습니다. Supabase RLS 정책을 확인하세요.')
    }
    fetchUsers()
  }

  async function updateRegion(userId: string, region: string) {
    const regionVal = region === '' ? null : region
    const { error } = await supabase.from('users').update({ region: regionVal }).eq('id', userId)
    if (error) alert('지역 변경 실패: ' + error.message)
    fetchUsers()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">회원 관리</h1>
        <span className="text-sm text-muted">{users.length}명</span>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-light border-b border-border">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-muted">닉네임</th>
              <th className="text-left px-4 py-2 font-medium text-muted">이메일</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-28">역할</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-28">담당 지역</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-24">가입일</th>
              <th className="text-left px-4 py-2 font-medium text-muted w-28">역할변경</th>
              {userRole === 'super' && (
                <th className="text-left px-4 py-2 font-medium text-muted w-32">지역배정</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={userRole === 'super' ? 7 : 6} className="px-4 py-8 text-center text-muted">불러오는 중...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={userRole === 'super' ? 7 : 6} className="px-4 py-8 text-center text-muted">가입된 회원이 없습니다</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium">{u.nickname}</td>
                <td className="px-4 py-2.5 text-muted">{u.email}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    u.role === 'super' ? 'bg-red-100 text-red-700' :
                    u.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                    u.role === 'business' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {ROLES[u.role] || u.role}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  {u.region ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      {REGIONS.find(r => r.code === u.region)?.name_ko || u.region}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-xs text-muted">{new Date(u.created_at).toLocaleDateString('ko-KR')}</td>
                <td className="px-4 py-2.5">
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                    className="text-xs border border-border rounded px-1.5 py-1 focus:outline-none"
                  >
                    <option value="user">일반</option>
                    <option value="business">업체</option>
                    <option value="editor">에디터</option>
                    <option value="super">슈퍼</option>
                  </select>
                </td>
                {userRole === 'super' && (
                  <td className="px-4 py-2.5">
                    {(u.role === 'editor' || u.role === 'super') ? (
                      <select
                        value={u.region || ''}
                        onChange={(e) => updateRegion(u.id, e.target.value)}
                        className="text-xs border border-border rounded px-1.5 py-1 focus:outline-none"
                      >
                        <option value="">미지정</option>
                        {REGIONS.map(r => (
                          <option key={r.code} value={r.code}>{r.name_ko}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {userRole === 'super' && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-border">
          <p className="text-xs text-muted">
            💡 에디터에게 담당 지역을 배정하면 해당 지역의 관리 페이지만 접근할 수 있습니다. 슈퍼관리자는 모든 지역에 접근 가능합니다.
          </p>
        </div>
      )}
    </div>
  )
}

import Link from 'next/link'

export const metadata = {
  title: '게시글을 찾을 수 없습니다',
  description: '요청하신 게시글이 삭제되었거나 존재하지 않습니다.',
  robots: { index: false, follow: true },
}

export default function PostNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">게시글을 찾을 수 없습니다</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        요청하신 게시글이 삭제되었거나 존재하지 않습니다.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#e55a2b]"
        >
          홈으로
        </Link>
        <Link
          href="/board"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
        >
          커뮤니티 둘러보기
        </Link>
      </div>
    </div>
  )
}

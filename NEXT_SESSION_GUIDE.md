# edongne 다음 세션 작업 가이드

## 현재 상태 (2026.03.19 완료)
- Next.js 14 + TypeScript + Tailwind + Supabase 풀스택
- Vercel 배포 완료 (edongne.vercel.app / www.edongne.com)
- Supabase DB 8테이블 + RLS + 뷰 생성 완료
- Google OAuth 설정 완료 (bad_oauth_state 에러 수정 필요 - redirectTo 제거함)
- 게시판 CRUD (글쓰기/목록/상세/댓글) Supabase 연동 완료
- 어드민 대시보드 6페이지 (대시보드/게시글/회원/업체/신고/콘텐츠) 완료

## 다음 세션 우선 작업

### 1. Google 로그인 완전 수정
- bad_oauth_state 에러 해결 확인 필요
- Supabase URL Configuration에서 Redirect URL 확인
- Google Cloud Console → OAuth 동의 화면 → 프로덕션 전환 검토

### 2. 매거진 CMS 기능 (워드프레스 스타일)
- 에디터/관리자만 매거진 글 작성 가능
- 카테고리 관리 (이번주 토픽, 에디터 추천, 부동산 가이드 등)
- 리치 에디터 (이미지 삽입, 서식 등) - react-quill 또는 tiptap 추천
- 매거진 글 → 홈페이지 매거진 섹션에 표시
- 공지사항 관리

### 3. 이미지 업로드 기능
- Supabase Storage 버킷 생성 (public 버킷)
- 글쓰기 시 이미지 첨부 (드래그앤드롭 or 파일선택)
- 이미지 리사이징/최적화
- 매거진 글 대표 이미지 (썸네일)

### 4. 업체 데이터 임포트
- 엑셀 파일 (리얼터 286개, 건축 319개, 변호사 426개, 융자 48개)
- Supabase에 일괄 업로드 스크립트

## 기술 스택
- GitHub: aaronlee103/edongne
- Supabase 프로젝트: dstnagdnbejumqobgyid (edongne)
- Vercel: aaronlee103-5687s-projects/edongne
- Google Cloud: My Project LRD (OAuth Client ID 설정됨)

## Supabase 정보
- URL: https://dstnagdnbejumqobgyid.supabase.co
- DB 테이블: users, posts, comments, votes, businesses, reviews, reports, bookmarks
- Auth: Google OAuth 활성화 (카카오 미설정)
- Storage: 미설정 (이미지 업로드 시 생성 필요)

## 파일 구조 (주요)
```
src/
  app/
    page.tsx          # 매거진 홈 (목업)
    board/page.tsx    # 커뮤니티 (Supabase 연동)
    write/page.tsx    # 글쓰기 (Supabase 연동)
    post/[id]/page.tsx # 상세+댓글 (Supabase 연동)
    auth/page.tsx     # Google 로그인
    auth/callback/route.ts # OAuth 콜백
    admin/            # 어드민 (6페이지)
    realtors/         # 업체 디렉토리 (목업)
  components/
    layout/Header.tsx # 로그인 상태 자동 감지
  lib/
    supabase-client.ts
    supabase-server.ts
    supabase-middleware.ts
```

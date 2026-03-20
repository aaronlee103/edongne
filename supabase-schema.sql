-- ============================================
-- edongne 이동네 - Supabase DB Schema
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. ENUM 타입들
CREATE TYPE user_role AS ENUM ('super', 'editor', 'business', 'user');
CREATE TYPE avatar_animal AS ENUM ('bear', 'rabbit', 'fox', 'cat', 'dog', 'owl', 'penguin', 'deer');
CREATE TYPE post_type AS ENUM ('magazine', 'notice', 'community');
CREATE TYPE post_category AS ENUM ('free', 'qna', 'info', 'buysell', 'jobs', 'housing', 'topic', 'editor');
CREATE TYPE business_type AS ENUM ('realtor', 'builder', 'lawyer', 'mortgage');
CREATE TYPE business_plan AS ENUM ('basic', 'pro', 'premium');
CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed');

-- 2. users 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  nickname TEXT NOT NULL,
  role user_role DEFAULT 'user' NOT NULL,
  region TEXT,
  avatar_type TEXT DEFAULT 'animal',
  avatar_animal avatar_animal DEFAULT 'bear',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. posts 테이블
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type post_type DEFAULT 'community' NOT NULL,
  category post_category DEFAULT 'free' NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  town TEXT,
  region TEXT,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. comments 테이블
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. votes 테이블
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)),
  UNIQUE(user_id, post_id)
);

-- 6. businesses 테이블
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type business_type NOT NULL,
  kor_name TEXT NOT NULL,
  eng_name TEXT,
  address TEXT,
  phone1 TEXT,
  phone2 TEXT,
  region TEXT,
  area TEXT,
  specialty TEXT,
  plan business_plan DEFAULT 'basic' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. reviews 테이블
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  score SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
  text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(business_id, user_id)
);

-- 8. reports 테이블
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment', 'review')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status report_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. bookmarks 테이블
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, post_id)
);

-- ============================================
-- 인덱스
-- ============================================
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_votes_post ON votes(post_id);
CREATE INDEX idx_businesses_type ON businesses(type);
CREATE INDEX idx_businesses_region ON businesses(region);
CREATE INDEX idx_reviews_business ON reviews(business_id);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- users: 누구나 조회 가능, 본인만 등록·수정
CREATE POLICY "users_select" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update" ON users FOR UPDATE USING (auth.uid() = id);

-- posts: 누구나 조회, 로그인 유저 작성, 본인/에디터 수정·삭제
CREATE POLICY "posts_select" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('editor', 'super'))
);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('editor', 'super'))
);

-- comments: 누구나 조회, 로그인 유저 작성, 본인/에디터 삭제
CREATE POLICY "comments_select" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('editor', 'super'))
);

-- votes: 로그인 유저만
CREATE POLICY "votes_select" ON votes FOR SELECT USING (true);
CREATE POLICY "votes_insert" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "votes_delete" ON votes FOR DELETE USING (auth.uid() = user_id);

-- businesses: 누구나 조회, super/editor 관리
CREATE POLICY "businesses_select" ON businesses FOR SELECT USING (true);
CREATE POLICY "businesses_insert" ON businesses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('business', 'editor', 'super'))
);
CREATE POLICY "businesses_update" ON businesses FOR UPDATE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('editor', 'super'))
);

-- reviews: 누구나 조회, 로그인 유저 작성
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- reports: 본인 신고만 조회, 에디터/super 전체 조회
CREATE POLICY "reports_insert" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_select" ON reports FOR SELECT USING (
  auth.uid() = reporter_id OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('editor', 'super'))
);

-- bookmarks: 본인만
CREATE POLICY "bookmarks_select" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_insert" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 뷰: 게시글 + 댓글수 + 투표합계
-- ============================================
CREATE OR REPLACE VIEW posts_with_stats AS
SELECT
  p.*,
  u.nickname,
  u.avatar_animal,
  COALESCE(c.comment_count, 0) AS comment_count,
  COALESCE(v.vote_score, 0) AS vote_score
FROM posts p
LEFT JOIN users u ON p.user_id = u.id
LEFT JOIN (
  SELECT post_id, COUNT(*) AS comment_count FROM comments GROUP BY post_id
) c ON p.id = c.post_id
LEFT JOIN (
  SELECT post_id, SUM(value) AS vote_score FROM votes GROUP BY post_id
) v ON p.id = v.post_id;

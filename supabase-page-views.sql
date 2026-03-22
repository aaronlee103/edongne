-- page_views 테이블 생성
CREATE TABLE IF NOT EXISTS page_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  path text NOT NULL,
  referrer text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- 인덱스 추가 (날짜별 조회 최적화)
CREATE INDEX idx_page_views_created_at ON page_views (created_at DESC);
CREATE INDEX idx_page_views_path ON page_views (path);

-- RLS 활성화
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- 누구나 INSERT 가능 (방문 기록)
CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT
  WITH CHECK (true);

-- 관리자만 SELECT 가능
CREATE POLICY "Only admins can read page views"
  ON page_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('super', 'editor')
    )
  );

-- 광고 배치 테이블 및 관련 스키마 마이그레이션
-- Ad Placements Table and Related Schema Migration
-- Created: 2026-04-13

-- ============================================================================
-- 1. ad_placements 테이블 생성
-- Create ad_placements table for managing ad placements across the platform
-- ============================================================================

CREATE TABLE IF NOT EXISTS ad_placements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  placement text NOT NULL CHECK (placement IN ('homepage_banner', 'category_top', 'sidebar', 'magazine_sidebar')),
  region text NOT NULL,
  priority int DEFAULT 0,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  active boolean DEFAULT true,
  image_url text,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- 테이블 설명: 광고 배치를 관리하는 테이블
-- 비즈니스별로 여러 광고 배치를 가질 수 있으며, 시작/종료 날짜로 자동 활성화/비활성화 가능
COMMENT ON TABLE ad_placements IS '광고 배치 관리 테이블 - 비즈니스 광고의 위치, 지역, 우선순위 정보 포함';

-- 컬럼별 설명
COMMENT ON COLUMN ad_placements.id IS '광고 배치 고유 ID (UUID)';
COMMENT ON COLUMN ad_placements.business_id IS '광고주 비즈니스 ID (businesses 테이블 참조)';
COMMENT ON COLUMN ad_placements.placement IS '광고 위치 (homepage_banner, category_top, sidebar, magazine_sidebar)';
COMMENT ON COLUMN ad_placements.region IS '광고 지역/위치 정보';
COMMENT ON COLUMN ad_placements.priority IS '광고 우선순위 (높을수록 우선 표시)';
COMMENT ON COLUMN ad_placements.start_date IS '광고 시작 날짜';
COMMENT ON COLUMN ad_placements.end_date IS '광고 종료 날짜';
COMMENT ON COLUMN ad_placements.active IS '광고 활성화 여부';
COMMENT ON COLUMN ad_placements.image_url IS '광고 이미지 URL (Supabase Storage)';
COMMENT ON COLUMN ad_placements.notes IS '광고 관련 메모/설명';
COMMENT ON COLUMN ad_placements.created_at IS '레코드 생성 일시';

-- ============================================================================
-- 2. ad_placements 테이블 인덱스 생성
-- Create indexes for efficient querying
-- ============================================================================

-- 비즈니스별 광고 검색 최적화
CREATE INDEX IF NOT EXISTS idx_ad_placements_business_id
  ON ad_placements(business_id);

-- 광고 배치 검색 최적화 (위치, 지역, 활성화 상태)
CREATE INDEX IF NOT EXISTS idx_ad_placements_placement_region_active
  ON ad_placements(placement, region, active);

-- 만료 기한 확인 최적화 (스케줄 작업에서 사용)
CREATE INDEX IF NOT EXISTS idx_ad_placements_end_date
  ON ad_placements(end_date);

-- ============================================================================
-- 3. ad_placements 테이블 행 레벨 보안(RLS) 설정
-- Enable Row Level Security with appropriate policies
-- ============================================================================

ALTER TABLE ad_placements ENABLE ROW LEVEL SECURITY;

-- 정책 1: 인증된 사용자는 모든 광고 배치 조회 가능
CREATE POLICY "Enable read access for authenticated users"
  ON ad_placements FOR SELECT
  USING (auth.role() = 'authenticated');

-- 정책 2: service_role은 모든 작업 가능
CREATE POLICY "Enable all operations for service_role"
  ON ad_placements FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 정책 3: super, editor 역할의 사용자는 INSERT/UPDATE/DELETE 가능 (users 테이블의 role 컬럼 참조)
CREATE POLICY "Enable write access for super and editor roles"
  ON ad_placements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('super', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('super', 'editor')
    )
  );

-- ============================================================================
-- 4. businesses 테이블에 광고 날짜 컬럼 추가
-- Add ad date columns to businesses table for ad scheduling
-- ============================================================================

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS ad_start timestamp with time zone;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS ad_end timestamp with time zone;

COMMENT ON COLUMN businesses.ad_start IS '비즈니스 광고 시작 날짜';
COMMENT ON COLUMN businesses.ad_end IS '비즈니스 광고 종료 날짜';

-- ============================================================================
-- 5. businesses 테이블에 정렬 우선순위 컬럼 추가
-- Add sort_priority column for plan-based sorting
-- ============================================================================

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS sort_priority int DEFAULT 0;

-- 정렬 우선순위 설명:
-- 0 = basic 플랜 (기본 정렬)
-- 10 = pro 플랜 (상위 정렬)
-- 20 = premium 플랜 (더 상위 정렬)
-- 30 = premium_plus 플랜 (상단 정렬)
-- 40 = sponsor 플랜 (최상위 정렬/스폰서)
COMMENT ON COLUMN businesses.sort_priority IS '정렬 우선순위: 0=basic, 10=pro, 20=premium, 30=premium_plus, 40=sponsor';

-- 인덱스: 정렬 성능 최적화
CREATE INDEX IF NOT EXISTS idx_businesses_sort_priority
  ON businesses(sort_priority DESC, created_at DESC);

-- ============================================================================
-- 마이그레이션 완료
-- Migration completed successfully
-- ============================================================================

-- Supabase SQL Editor에서 실행하세요
-- Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- 누구나 이미지 조회 가능
CREATE POLICY "Public image access" ON storage.objects FOR SELECT USING (bucket_id = 'images');

-- 로그인 유저만 업로드 가능
CREATE POLICY "Auth users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- 본인 업로드 파일만 삭제 가능
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- posts 테이블에 매거진용 컬럼 추가
ALTER TABLE posts ADD COLUMN IF NOT EXISTS thumbnail TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[];

-- 메모 테이블 생성
CREATE TABLE IF NOT EXISTS public.memos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 업데이트 시간 자동 갱신을 위한 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성 (메모 업데이트 시 updated_at 자동 갱신)
CREATE TRIGGER update_memos_updated_at
    BEFORE UPDATE ON public.memos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 생성 (성능 향상을 위해)
CREATE INDEX IF NOT EXISTS idx_memos_category ON public.memos(category);
CREATE INDEX IF NOT EXISTS idx_memos_created_at ON public.memos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memos_tags ON public.memos USING GIN(tags);

-- RLS (Row Level Security) 활성화 (향후 사용자 기반 권한 제어를 위해)
ALTER TABLE public.memos ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 모든 메모에 접근할 수 있도록 정책 설정 (현재는 단일 사용자 앱이므로)
CREATE POLICY "Anyone can access memos" ON public.memos
    FOR ALL USING (true);

-- 테이블에 대한 주석 추가
COMMENT ON TABLE public.memos IS '메모 애플리케이션의 메모 데이터를 저장하는 테이블';
COMMENT ON COLUMN public.memos.id IS '메모 고유 식별자 (UUID)';
COMMENT ON COLUMN public.memos.title IS '메모 제목';
COMMENT ON COLUMN public.memos.content IS '메모 내용';
COMMENT ON COLUMN public.memos.category IS '메모 카테고리 (personal, work, study, idea, other)';
COMMENT ON COLUMN public.memos.tags IS '메모 태그 배열';
COMMENT ON COLUMN public.memos.created_at IS '메모 생성 시간';
COMMENT ON COLUMN public.memos.updated_at IS '메모 수정 시간';
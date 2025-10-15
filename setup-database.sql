-- AI 메모장 - notes 테이블 생성 SQL
-- Supabase SQL Editor에서 실행하세요

-- notes 테이블 생성
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL DEFAULT '제목 없음',
    content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 생성
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- user_id 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);

-- Row Level Security (RLS) 활성화
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 노트만 조회 가능
CREATE POLICY "Users can view own notes" ON notes
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 노트만 생성 가능
CREATE POLICY "Users can create own notes" ON notes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 노트만 업데이트 가능
CREATE POLICY "Users can update own notes" ON notes
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 노트만 삭제 가능
CREATE POLICY "Users can delete own notes" ON notes
    FOR DELETE
    USING (auth.uid() = user_id);


-- summaries 테이블 생성
CREATE TABLE IF NOT EXISTS summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    model TEXT NOT NULL DEFAULT 'gemini-2.0-flash-001',
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_summaries_note_id ON summaries(note_id);
CREATE INDEX IF NOT EXISTS idx_summaries_created_at ON summaries(created_at);

-- RLS (Row Level Security) 활성화
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
CREATE POLICY "Users can view their own summaries" ON summaries
    FOR SELECT USING (
        note_id IN (
            SELECT id FROM notes WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own summaries" ON summaries
    FOR INSERT WITH CHECK (
        note_id IN (
            SELECT id FROM notes WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own summaries" ON summaries
    FOR UPDATE USING (
        note_id IN (
            SELECT id FROM notes WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own summaries" ON summaries
    FOR DELETE USING (
        note_id IN (
            SELECT id FROM notes WHERE user_id = auth.uid()
        )
    );

-- tags 테이블 생성
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_tags_note_id ON public.tags(note_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
CREATE POLICY "Users can view their own tags" ON public.tags
    FOR SELECT USING (
        note_id IN (
            SELECT id FROM public.notes WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own tags" ON public.tags
    FOR INSERT WITH CHECK (
        note_id IN (
            SELECT id FROM public.notes WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own tags" ON public.tags
    FOR UPDATE USING (
        note_id IN (
            SELECT id FROM public.notes WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own tags" ON public.tags
    FOR DELETE USING (
        note_id IN (
            SELECT id FROM public.notes WHERE user_id = auth.uid()
        )
    );

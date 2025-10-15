# Vercel 배포 가이드

## 🔧 환경 변수 설정

Vercel 대시보드의 Settings > Environment Variables에서 다음 변수들을 설정해주세요:

### 필수 환경 변수
```
NEXT_PUBLIC_SUPABASE_URL=https://kfthmjpvthguuavffxkd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGhtanB2dGhndXVhdmZmeGtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MDg5MjAsImV4cCI6MjA3NTk4NDkyMH0.7_rQLGd5GqfhbZIrvngIkaNNIBjKe47OW08E6OoyLUI
GEMINI_API_KEY=AIzaSyCZyyz1kkLoEwrBgDs0Kb30LX8bbpxTLNI
```

### 선택적 환경 변수
```
GEMINI_MODEL=gemini-2.0-flash-001
GEMINI_MAX_TOKENS=8192
GEMINI_TIMEOUT_MS=10000
GEMINI_DEBUG=true
```

## 🗄️ 데이터베이스 설정

### 1. Supabase에서 테이블 생성

다음 SQL을 Supabase SQL Editor에서 실행해주세요:

```sql
-- notes 테이블 (이미 존재할 수 있음)
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- summaries 테이블
CREATE TABLE IF NOT EXISTS summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- tags 테이블
CREATE TABLE IF NOT EXISTS tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 2. RLS (Row Level Security) 정책 설정

```sql
-- RLS 활성화
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- notes 테이블 정책
CREATE POLICY "Users can view own notes" ON notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON notes
    FOR DELETE USING (auth.uid() = user_id);

-- summaries 테이블 정책
CREATE POLICY "Users can view own summaries" ON summaries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM notes 
            WHERE notes.id = summaries.note_id 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own summaries" ON summaries
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM notes 
            WHERE notes.id = summaries.note_id 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own summaries" ON summaries
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM notes 
            WHERE notes.id = summaries.note_id 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own summaries" ON summaries
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM notes 
            WHERE notes.id = summaries.note_id 
            AND notes.user_id = auth.uid()
        )
    );

-- tags 테이블 정책
CREATE POLICY "Users can view own tags" ON tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM notes 
            WHERE notes.id = tags.note_id 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own tags" ON tags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM notes 
            WHERE notes.id = tags.note_id 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own tags" ON tags
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM notes 
            WHERE notes.id = tags.note_id 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own tags" ON tags
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM notes 
            WHERE notes.id = tags.note_id 
            AND notes.user_id = auth.uid()
        )
    );
```

## 🚀 배포 단계

1. **Git 커밋 및 푸시**:
   ```bash
   git add .
   git commit -m "Fix Vercel deployment issues"
   git push origin master
   ```

2. **Vercel에서 자동 배포 확인**

3. **환경 변수 설정** (위의 환경 변수들을 Vercel 대시보드에서 설정)

4. **데이터베이스 설정** (위의 SQL을 Supabase에서 실행)

5. **배포 재시도** (환경 변수 설정 후 자동으로 재배포됨)

## 🔍 문제 해결

### 서버 사이드 오류가 계속 발생하는 경우:

1. **Vercel 로그 확인**: Vercel 대시보드 > Functions 탭에서 로그 확인
2. **환경 변수 확인**: 모든 필수 환경 변수가 설정되었는지 확인
3. **데이터베이스 연결 확인**: Supabase 연결이 정상인지 확인
4. **RLS 정책 확인**: 데이터베이스 정책이 올바르게 설정되었는지 확인

### 로컬에서 테스트:

```bash
# 로컬에서 빌드 테스트
pnpm build

# 로컬에서 실행 테스트
pnpm dev
```

## 📝 참고사항

- 메인 페이지에서 서버 사이드 데이터 로딩을 제거하여 안정성을 높였습니다
- 노트 데이터는 `/notes` 페이지에서 클라이언트 사이드에서 로드됩니다
- 모든 데이터베이스 작업은 적절한 에러 핸들링과 함께 구현되었습니다

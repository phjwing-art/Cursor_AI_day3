# AI 메모장 (AI Memo)

지능형 메모 관리 시스템으로 AI를 활용한 자동 요약 및 태그 생성 기능을 제공합니다.

## 🚀 주요 기능

### ✅ 완료된 기능
- **사용자 인증**: Supabase Auth를 통한 로그인/회원가입
- **노트 관리**: 노트 생성, 수정, 삭제, 조회
- **AI 요약**: Gemini API를 활용한 자동 요약 생성
- **AI 태그**: Gemini API를 활용한 자동 태그 생성
- **메인 대시보드**: 최근 노트 목록 및 기능 카드
- **반응형 UI**: 모바일/데스크톱 최적화

### 🔄 개발 중인 기능
- **검색 및 필터링**: 노트 검색 및 태그별 필터링
- **데이터 내보내기**: 노트 백업 및 내보내기

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Google Gemini API
- **ORM**: Drizzle ORM
- **Package Manager**: pnpm

## 📋 사전 요구사항

- Node.js 18+ 
- pnpm
- Supabase 계정
- Google AI Studio 계정 (Gemini API)

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd ai-memo-hands-on-story-2.5
```

### 2. 의존성 설치
```bash
pnpm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini AI 설정
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash-001
GEMINI_MAX_TOKENS=8192
GEMINI_TIMEOUT_MS=10000
GEMINI_DEBUG=false
```

### 4. 데이터베이스 설정

#### Supabase에서 테이블 생성
1. Supabase 대시보드 → SQL Editor
2. 다음 SQL 스크립트들을 순서대로 실행:

**notes 테이블 (이미 존재할 수 있음):**
```sql
-- create-table.sql 파일 내용 실행
```

**summaries 테이블:**
```sql
-- create-summaries-table.sql 파일 내용 실행
```

**tags 테이블:**
```sql
-- create-tags-table.sql 파일 내용 실행
```

### 5. 개발 서버 실행
```bash
pnpm dev
```

### 6. 빌드 및 배포
```bash
# 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

## 🧪 테스트

### 단위 테스트
```bash
pnpm test
```

### API 테스트
```bash
# 브라우저에서 접속
http://localhost:3000/api/test
```

## 📁 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   ├── auth/              # 인증 관련 페이지
│   ├── notes/             # 노트 관련 페이지
│   └── page.tsx           # 메인 페이지
├── components/            # React 컴포넌트
│   ├── auth/              # 인증 컴포넌트
│   ├── notes/             # 노트 관련 컴포넌트
│   └── ui/                # 공통 UI 컴포넌트
├── lib/                   # 유틸리티 및 설정
│   ├── ai/                # AI 관련 로직
│   ├── auth/              # 인증 관련 로직
│   ├── db/                # 데이터베이스 스키마
│   ├── notes/             # 노트 관련 로직
│   └── supabase/          # Supabase 설정
├── docs/                  # 문서
│   ├── epics/            # 에픽 문서
│   └── stories/          # 스토리 문서
└── drizzle/              # 데이터베이스 마이그레이션
```

## 🔧 주요 컴포넌트

### 메인 페이지 (`app/page.tsx`)
- 사용자 인증 확인
- 최근 노트 목록 표시
- 기능 카드 네비게이션

### 노트 에디터 (`components/notes/note-editor.tsx`)
- 노트 작성 및 편집
- 자동 저장 기능
- AI 요약 및 태그 생성
- 실시간 상태 표시

### AI 기능
- **요약 생성**: `lib/notes/actions.ts`
- **태그 생성**: `lib/notes/tag-actions.ts`
- **Gemini API 클라이언트**: `lib/ai/gemini-client.ts`

## 🐛 문제 해결

### 일반적인 문제들

1. **태그 조회 실패**
   - `tags` 테이블이 데이터베이스에 존재하지 않음
   - `create-tags-table.sql` 실행 필요

2. **요약 생성 실패**
   - `summaries` 테이블이 데이터베이스에 존재하지 않음
   - `create-summaries-table.sql` 실행 필요

3. **인증 오류**
   - Supabase 환경 변수 확인
   - RLS 정책 설정 확인

4. **AI API 오류**
   - Gemini API 키 확인
   - 네트워크 연결 상태 확인

### 디버깅 도구

- **API 테스트**: `/api/test` - 전체 시스템 상태 확인
- **Gemini API 테스트**: `/api/debug/test-gemini` - AI API 연결 확인
- **노트 디버깅**: `/api/debug/notes` - 노트 데이터 확인

## 📝 개발 가이드

### 새로운 기능 추가
1. `docs/stories/` 에 스토리 문서 작성
2. 관련 컴포넌트 및 로직 구현
3. 테스트 작성
4. 문서 업데이트

### 코드 스타일
- TypeScript 사용 필수
- ESLint 규칙 준수
- 컴포넌트는 500줄 이하 유지
- 적절한 주석 및 문서화

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해주세요.
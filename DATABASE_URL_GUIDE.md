# Supabase DATABASE_URL 확인 가이드

## 옵션 1: Session Mode (권장)

1. Supabase 대시보드 접속: https://supabase.com/dashboard
2. 프로젝트 선택: `kfthmjpvthguuavffxkd`
3. 좌측 메뉴에서 **Settings** → **Database** 클릭
4. **Connection string** 섹션 찾기
5. **"Use connection pooling"** 토글을 **ON**으로 설정
6. **Mode**를 **"Session"**으로 선택
7. **URI** 탭 선택
8. 연결 문자열 복사 (예시: `postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`)
9. `[YOUR-PASSWORD]` 부분을 실제 데이터베이스 비밀번호로 교체
10. 비밀번호에 특수문자가 있으면 URL 인코딩 필요:
    - `?` → `%3F`
    - `+` → `%2B`
    - `@` → `%40`
    - `!` → `%21`
    - `#` → `%23`
    - `$` → `%24`
    - `%` → `%25`
    - `^` → `%5E`
    - `&` → `%26`

## 옵션 2: Transaction Mode

1. 위와 동일하게 진행
2. **Mode**를 **"Transaction"**으로 선택
3. 연결 문자열에 `?pgbouncer=true` 추가하지 않음

## 현재 설정된 DATABASE_URL

현재 `.env.local` 파일에 설정된 값:
```
DATABASE_URL="postgresql://postgres.kfthmjpvthguuavffxkd:R%3Fe6%2BR%40-BTwM%21y@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"
```

이 값이 정확한지 확인 필요:
- 호스트: `aws-0-ap-northeast-2.pooler.supabase.com` (정확한가요?)
- 포트: `6543`
- 사용자명: `postgres.kfthmjpvthguuavffxkd`
- 비밀번호: `R?e6+R@-BTwM!y` (URL 인코딩됨)

## 비밀번호 확인 방법

비밀번호를 잊어버린 경우:
1. Supabase 대시보드 → Settings → Database
2. **"Reset database password"** 버튼 클릭
3. 새 비밀번호 설정
4. `.env.local` 파일 업데이트

## 테스트

DATABASE_URL 업데이트 후:
```powershell
# 연결 테스트
pnpm db:push

# 개발 서버 재시작
pnpm dev
```



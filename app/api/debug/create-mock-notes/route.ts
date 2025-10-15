// app/api/debug/create-mock-notes/route.ts
// 목업 노트 데이터 생성 API

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const mockNotes = [
    {
        title: '프로젝트 회의록 - AI 메모장 개발',
        content: '오늘 팀과 함께 AI 메모장 프로젝트의 진행 상황을 논의했습니다. 주요 안건은 다음과 같습니다:\n\n1. 사용자 인증 시스템 구현 완료\n2. 노트 CRUD 기능 개발 중\n3. AI 요약 기능 설계\n4. 다음 주까지 기본 기능 완성 목표\n\n팀원들의 의견이 다양했지만, 사용자 경험을 최우선으로 하는 방향으로 합의했습니다.'
    },
    {
        title: '독서 노트 - 클린 코드',
        content: '로버트 마틴의 클린 코드를 읽고 있습니다. 지금까지 읽은 내용 중 인상 깊은 부분들:\n\n• 함수는 작을수록 좋다\n• 중복을 제거하라\n• 의미 있는 이름을 사용하라\n• 주석은 코드를 설명하는 것이 아니라 의도를 설명해야 한다\n\n특히 "함수는 한 가지 일만 해야 한다"는 원칙이 마음에 들었습니다. 기존 코드를 리팩토링할 때 이 원칙을 적용해보겠습니다.'
    },
    {
        title: '아이디어 - 모바일 앱 기능',
        content: '새로운 모바일 앱을 개발하면서 생각해본 기능들:\n\n1. 음성 메모 기능\n   - 실시간 음성 인식\n   - 자동 텍스트 변환\n   - 음성 품질 최적화\n\n2. 오프라인 동기화\n   - 로컬 저장소 활용\n   - 네트워크 복구 시 자동 동기화\n\n3. 사용자 맞춤 설정\n   - 개인화된 UI\n   - 접근성 옵션\n   - 다국어 지원\n\n이 기능들을 구현하기 위해 필요한 기술 스택과 예상 개발 기간을 정리해야겠습니다.'
    },
    {
        title: '학습 계획 - React 고급 패턴',
        content: 'React의 고급 패턴들을 체계적으로 학습하기 위한 계획입니다.\n\n**1단계: Hooks 심화**\n- 커스텀 훅 작성법\n- useCallback, useMemo 최적화\n- useReducer 활용법\n\n**2단계: 상태 관리**\n- Context API 심화\n- Zustand vs Redux 비교\n- 상태 설계 패턴\n\n**3단계: 성능 최적화**\n- React.memo 활용\n- 코드 스플리팅\n- 가상화(Virtualization)\n\n**4단계: 테스팅**\n- Jest + Testing Library\n- 컴포넌트 테스트\n- 통합 테스트\n\n각 단계별로 실습 프로젝트를 진행하며 포트폴리오에 반영하겠습니다.'
    },
    {
        title: '회고록 - 2024년 상반기',
        content: '2024년 상반기를 돌아보며 정리한 회고록입니다.\n\n**성취한 것들:**\n• 새로운 기술 스택 학습 (Next.js, TypeScript)\n• 오픈소스 프로젝트 기여\n• 개발 블로그 운영 시작\n• 네트워킹 이벤트 참여\n\n**아쉬운 점들:**\n• 시간 관리 부족\n• 영어 학습 소홀\n• 운동 루틴 부족\n\n**하반기 목표:**\n• 더 많은 프로젝트 완성\n• 기술 컨퍼런스 발표\n• 건강한 생활 습관 유지\n• 새로운 사람들과의 만남\n\n전반적으로 만족스러운 상반기였습니다. 하반기에는 더 체계적으로 계획을 세워야겠습니다.'
    },
    {
        title: '레시피 - 파스타 만들기',
        content: '오늘 저녁에 만든 크림 파스타 레시피를 정리했습니다.\n\n**재료 (2인분):**\n• 스파게티 면 200g\n• 베이컨 100g\n• 양파 1/2개\n• 마늘 3쪽\n• 생크림 200ml\n• 파마산 치즈 50g\n• 소금, 후추, 파슬리\n\n**만드는 방법:**\n1. 스파게티를 소금물에 삶기\n2. 베이컨을 볶아서 기름 빼기\n3. 양파, 마늘을 볶아서 향신료 추가\n4. 생크림을 넣고 끓이기\n5. 면과 함께 볶아서 치즈 뿌리기\n\n**팁:**\n• 면수는 조금 남겨두기\n• 치즈는 불을 끄고 넣기\n• 파슬리는 마지막에 장식\n\n결과적으로 맛있게 완성되었습니다! 다음에는 다른 소스도 시도해보겠습니다.'
    },
    {
        title: '여행 계획 - 제주도 3박 4일',
        content: '다음 달 제주도 여행 계획을 세웠습니다.\n\n**1일차:**\n• 오전: 제주공항 도착, 렌터카 수령\n• 중식: 성산일출봉 근처 식당\n• 오후: 성산일출봉 등반\n• 저녁: 성산 포구에서 해산물\n• 숙소: 성산 펜션\n\n**2일차:**\n• 오전: 우도 일주\n• 중식: 우도 흑돼지\n• 오후: 섭지코지, 카멜리아힐\n• 저녁: 제주시내 맛집 투어\n• 숙소: 제주시 호텔\n\n**3일차:**\n• 오전: 한라산 등반 (백록담)\n• 중식: 한라산 등반 중 간식\n• 오후: 서귀포 시내 관광\n• 저녁: 서귀포 해산물 시장\n• 숙소: 서귀포 리조트\n\n**4일차:**\n• 오전: 중문관광단지\n• 중식: 제주 흑돼지 전문점\n• 오후: 공항으로 이동, 귀국\n\n예산은 2인 기준 80만원 정도로 계획했습니다.'
    },
    {
        title: '기술 문서 - API 설계 가이드',
        content: 'RESTful API 설계 시 고려사항들을 정리했습니다.\n\n**1. URL 설계 원칙:**\n• 리소스 중심의 명사 사용\n• 계층 구조 표현\n• 일관된 네이밍 컨벤션\n\n**2. HTTP 메서드 활용:**\n• GET: 조회\n• POST: 생성\n• PUT: 전체 수정\n• PATCH: 부분 수정\n• DELETE: 삭제\n\n**3. 상태 코드:**\n• 200: 성공\n• 201: 생성 성공\n• 400: 잘못된 요청\n• 401: 인증 실패\n• 403: 권한 없음\n• 404: 리소스 없음\n• 500: 서버 오류\n\n**4. 응답 형식:**\n```json\n{\n  "success": true,\n  "data": {},\n  "message": "성공",\n  "timestamp": "2024-01-01T00:00:00Z"\n}\n```\n\n**5. 보안 고려사항:**\n• HTTPS 사용\n• 인증 토큰 관리\n• CORS 설정\n• Rate Limiting\n\n이 가이드를 팀 내 공유하여 일관된 API 설계를 유지하겠습니다.'
    },
    {
        title: '일기 - 오늘의 감정',
        content: '오늘은 정말 복잡한 하루였습니다.\n\n**오전:**\n새로운 프로젝트를 시작하면서 설렘과 걱정이 동시에 들었습니다. 팀원들과의 첫 미팅에서 서로의 아이디어를 나누는 과정이 즐거웠습니다.\n\n**오후:**\n코드 리뷰를 받으면서 몇 가지 개선점을 발견했습니다. 처음에는 조금 당황스러웠지만, 선배 개발자의 조언이 정말 도움이 되었습니다.\n\n**저녁:**\n집에 와서 오늘 하루를 정리해보니, 실수도 있었지만 배운 것도 많았습니다. 특히 "완벽함보다는 지속적인 개선"이라는 말이 마음에 와닿았습니다.\n\n**내일의 목표:**\n• 오늘 배운 내용 정리\n• 새로운 기술 스택 학습\n• 팀원들과의 소통 강화\n\n오늘도 성장하는 하루였습니다. 내일은 더 나은 개발자가 되겠습니다.'
    },
    {
        title: '할 일 목록 - 이번 주',
        content: '이번 주에 해야 할 일들을 정리했습니다.\n\n**업무 관련:**\n□ 프로젝트 A 마일스톤 완료\n□ 코드 리뷰 3건 처리\n□ 팀 미팅 준비\n□ 기술 문서 작성\n\n**개인 개발:**\n□ 새로운 라이브러리 학습\n□ 사이드 프로젝트 진행\n□ 개발 블로그 포스팅\n□ 오픈소스 기여\n\n**건강 관리:**\n□ 운동 3회 이상\n□ 규칙적인 수면 패턴\n□ 건강한 식단 유지\n□ 스트레스 관리\n\n**학습 목표:**\n□ 온라인 강의 2개 완료\n□ 기술 서적 1권 읽기\n□ 새로운 언어 학습\n□ 포트폴리오 업데이트\n\n**우선순위:**\n1. 프로젝트 A 마일스톤 (긴급)\n2. 건강 관리 (중요)\n3. 개인 개발 (중간)\n4. 학습 목표 (낮음)\n\n이번 주도 알차게 보내겠습니다!'
    }
]

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        
        // 사용자 인증 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return NextResponse.json({ 
                success: false, 
                error: '인증이 필요합니다' 
            }, { status: 401 })
        }

        // 기존 노트 삭제 (선택사항)
        const { error: deleteError } = await supabase
            .from('notes')
            .delete()
            .eq('user_id', user.id)

        if (deleteError) {
            console.error('기존 노트 삭제 실패:', deleteError)
        }

        // 목업 데이터 삽입
        const notesToInsert = mockNotes.map(note => ({
            user_id: user.id,
            title: note.title,
            content: note.content,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }))

        const { data, error } = await supabase
            .from('notes')
            .insert(notesToInsert)
            .select()

        if (error) {
            console.error('목업 데이터 생성 실패:', error)
            return NextResponse.json({ 
                success: false, 
                error: '목업 데이터 생성에 실패했습니다' 
            }, { status: 500 })
        }

        return NextResponse.json({ 
            success: true, 
            message: `${mockNotes.length}개의 목업 노트가 생성되었습니다`,
            notes: data,
            count: data.length
        })

    } catch (error) {
        console.error('목업 데이터 생성 오류:', error)
        return NextResponse.json({ 
            success: false, 
            error: '서버 오류가 발생했습니다' 
        }, { status: 500 })
    }
}

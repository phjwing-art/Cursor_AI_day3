// components/notes/summary-loading.tsx
// 요약 생성 로딩 상태 컴포넌트

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Sparkles } from 'lucide-react'

export function SummaryLoading() {
    return (
        <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-600" />
                    AI 요약 생성 중
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-3 py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />
                    <div className="space-y-1">
                        <p className="text-gray-700 font-medium">AI가 노트를 분석하고 있습니다...</p>
                        <p className="text-sm text-gray-500">잠시만 기다려주세요. 보통 3-5초 정도 소요됩니다.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// components/notes/summary-display.tsx
// 요약 표시 컴포넌트

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Clock } from 'lucide-react'
import type { Summary } from '@/lib/db/schema/notes'

interface SummaryDisplayProps {
    summary: Summary
}

export function SummaryDisplay({ summary }: SummaryDisplayProps) {
    // 요약 내용을 불릿 포인트로 파싱
    const parseSummaryContent = (content: string) => {
        return content
            .split('\n')
            .filter(line => line.trim().length > 0)
            .map(line => line.replace(/^[-•]\s*/, '').trim())
    }

    const bulletPoints = parseSummaryContent(summary.content)

    return (
        <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        AI 요약
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {new Date(summary.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>
                <Badge variant="secondary" className="w-fit">
                    {summary.model}
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {bulletPoints.map((point, index) => (
                        <div key={index} className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold mt-1">•</span>
                            <span className="text-gray-700 leading-relaxed">{point}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

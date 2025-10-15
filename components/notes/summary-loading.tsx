'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loader2, FileText } from 'lucide-react'

export function SummaryLoading() {
    return (
        <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
                <CardTitle className="text-blue-900 text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    AI 요약
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-blue-700">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">AI가 요약을 생성하고 있습니다...</span>
                </div>
            </CardContent>
        </Card>
    )
}
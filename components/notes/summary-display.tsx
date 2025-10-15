'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FileText } from 'lucide-react'

interface SummaryDisplayProps {
    summary: {
        id: string
        content: string
        created_at: string
    }
    className?: string
}

export function SummaryDisplay({ summary, className = '' }: SummaryDisplayProps) {
    return (
        <Card className={`bg-blue-50 border-blue-200 ${className}`}>
            <CardHeader className="pb-3">
                <CardTitle className="text-blue-900 text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    AI 요약
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <p className="text-blue-800 text-sm leading-relaxed">
                    {summary.content}
                </p>
            </CardContent>
        </Card>
    )
}
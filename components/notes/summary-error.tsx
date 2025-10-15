'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, FileText } from 'lucide-react'

interface SummaryErrorProps {
    error: string
    onRetry?: () => void
}

export function SummaryError({ error, onRetry }: SummaryErrorProps) {
    return (
        <Card className="bg-red-50 border-red-200">
            <CardHeader className="pb-3">
                <CardTitle className="text-red-900 text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    AI 요약
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm text-red-700 font-medium mb-1">요약 생성 실패</p>
                        <p className="text-xs text-red-600 mb-3">{error}</p>
                        {onRetry && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onRetry}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                재시도
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
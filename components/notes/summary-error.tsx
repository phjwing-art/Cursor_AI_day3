// components/notes/summary-error.tsx
// 요약 생성 에러 상태 컴포넌트

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface SummaryErrorProps {
    error: string
    onRetry?: () => void
}

export function SummaryError({ error, onRetry }: SummaryErrorProps) {
    return (
        <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    요약 생성 실패
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <p className="text-gray-700">{error}</p>
                    {onRetry && (
                        <Button 
                            onClick={onRetry} 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            다시 시도
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

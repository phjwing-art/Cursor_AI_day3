'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface TagErrorProps {
    error: string
    onRetry?: () => void
}

export function TagError({ error, onRetry }: TagErrorProps) {
    return (
        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
                <p className="text-sm text-red-700 font-medium">태그 생성 실패</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
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
    )
}

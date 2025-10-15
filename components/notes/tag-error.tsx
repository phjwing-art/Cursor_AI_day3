// components/notes/tag-error.tsx
// 태그 생성 에러 상태 컴포넌트

'use client'

import { Badge } from '@/components/ui/badge'
import { AlertCircle, Tag } from 'lucide-react'

interface TagErrorProps {
    error: string
    onRetry?: () => void
}

export function TagError({ error, onRetry }: TagErrorProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <Tag className="h-4 w-4" />
                <span>태그</span>
            </div>
            <div className="flex flex-wrap gap-2">
                <Badge variant="destructive" className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3" />
                    <span>{error}</span>
                </Badge>
                {onRetry && (
                    <Badge 
                        variant="outline" 
                        className="cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={onRetry}
                    >
                        다시 시도
                    </Badge>
                )}
            </div>
        </div>
    )
}

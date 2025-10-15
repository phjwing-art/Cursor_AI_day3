// components/notes/tag-loading.tsx
// 태그 생성 로딩 상태 컴포넌트

'use client'

import { Badge } from '@/components/ui/badge'
import { Loader2, Tag } from 'lucide-react'

export function TagLoading() {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <Tag className="h-4 w-4" />
                <span>태그</span>
            </div>
            <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>태그 생성 중...</span>
                </Badge>
            </div>
        </div>
    )
}

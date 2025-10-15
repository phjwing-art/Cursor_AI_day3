'use client'

import { Loader2 } from 'lucide-react'

export function TagLoading() {
    return (
        <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>AI가 태그를 생성하고 있습니다...</span>
        </div>
    )
}

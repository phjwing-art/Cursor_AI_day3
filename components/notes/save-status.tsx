'use client'

import { Check, Loader2 } from 'lucide-react'

interface SaveStatusProps {
    isSaving: boolean
    lastSaved: Date | null
}

export function SaveStatus({ isSaving, lastSaved }: SaveStatusProps) {
    if (isSaving) {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>저장 중...</span>
            </div>
        )
    }

    if (lastSaved) {
        return (
            <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                <span>
                    {lastSaved.toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}에 저장됨
                </span>
            </div>
        )
    }

    return null
}
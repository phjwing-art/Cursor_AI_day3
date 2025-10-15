'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface AutoResizeTextareaProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    minHeight?: number
    maxHeight?: number
}

export function AutoResizeTextarea({
    value,
    onChange,
    placeholder,
    className,
    minHeight = 100,
    maxHeight = 500
}: AutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        const textarea = textareaRef.current
        if (!textarea) return

        // 높이 초기화
        textarea.style.height = 'auto'
        
        // 스크롤 높이에 맞춰 높이 조정
        const scrollHeight = textarea.scrollHeight
        const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight))
        
        textarea.style.height = `${newHeight}px`
    }, [value, minHeight, maxHeight])

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
                'w-full resize-none overflow-hidden',
                className
            )}
            style={{ minHeight: `${minHeight}px` }}
        />
    )
}
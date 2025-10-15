'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseAutoSaveProps {
    title: string
    content: string
    onSave: (data: { title: string; content: string }) => Promise<void>
    debounceMs?: number
}

export function useAutoSave({
    title,
    content,
    onSave,
    debounceMs = 1000
}: UseAutoSaveProps) {
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    const saveNote = useCallback(async () => {
        if (!title.trim() && !content.trim()) {
            return
        }

        setIsSaving(true)
        try {
            await onSave({ title, content })
            setLastSaved(new Date())
        } catch (error) {
            console.error('자동 저장 실패:', error)
        } finally {
            setIsSaving(false)
        }
    }, [title, content, onSave])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            saveNote()
        }, debounceMs)

        return () => clearTimeout(timeoutId)
    }, [title, content, saveNote, debounceMs])

    return {
        isSaving,
        lastSaved,
        saveNote
    }
}
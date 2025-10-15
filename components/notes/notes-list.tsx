'use client'

import { useState } from 'react'
import { NoteCard } from './note-card'
import { Note } from '@/lib/notes/queries'

interface NotesListProps {
    notes: Note[]
    totalCount?: number
    onDelete?: (noteId: string) => void
    showPagination?: boolean
}

export function NotesList({ 
    notes = [], 
    totalCount = 0, 
    onDelete,
    showPagination = true 
}: NotesListProps) {
    const [localNotes, setLocalNotes] = useState(notes || [])

    const handleDelete = (noteId: string) => {
        setLocalNotes(prev => prev.filter(note => note.id !== noteId))
        onDelete?.(noteId)
    }

    if (!localNotes || localNotes.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">노트가 없습니다.</p>
                <p className="text-gray-400 text-sm mt-2">새로운 노트를 작성해보세요!</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4">
                {localNotes.map((note) => (
                    <NoteCard
                        key={note.id}
                        note={note}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
            
            {showPagination && totalCount > localNotes.length && (
                <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                        {localNotes.length}개 중 {totalCount}개 노트
                    </p>
                </div>
            )}
        </div>
    )
}
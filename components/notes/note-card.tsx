'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { DeleteNoteButton } from './delete-note-button'
import { HighlightText } from './highlight-text'
import { NoteTags } from './note-tags'
import { formatRelativeDate, getContentPreview } from '@/lib/notes/utils'
import { cn } from '@/lib/utils'
import type { Note } from '@/lib/notes/queries'

interface NoteCardProps {
    note: Note
    onDelete?: (noteId: string) => void
    searchQuery?: string
    className?: string
}

export function NoteCard({
    note,
    searchQuery = '',
    className
}: NoteCardProps) {

    return (
        <Card
            className={cn(
                'hover:shadow-lg transition-all duration-200 cursor-pointer h-full group',
                className
            )}
        >
            <Link href={`/notes/${note.id}`} className="block h-full">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2 flex-1">
                            <HighlightText
                                text={note.title || '제목 없음'}
                                highlight={searchQuery}
                            />
                        </CardTitle>
                        <div
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={e => e.preventDefault()}
                        >
                            <DeleteNoteButton noteId={note.id} />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">
                        {formatRelativeDate(note.updated_at)}
                    </p>
                </CardHeader>
                <CardContent>
                    <HighlightText
                        text={getContentPreview(note.content)}
                        highlight={searchQuery}
                        className="text-gray-700 text-sm line-clamp-3"
                    />
                </CardContent>
            </Link>
            <CardFooter className="pt-2 pb-4">
                <NoteTags noteId={note.id} maxTags={3} />
            </CardFooter>
        </Card>
    )
}

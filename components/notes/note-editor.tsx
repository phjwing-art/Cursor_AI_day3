'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { AutoResizeTextarea } from './auto-resize-textarea'
import { SaveStatus } from './save-status'
import { BackButton } from '@/components/ui/back-button'
import { DeleteNoteButton } from './delete-note-button'
import { SummaryDisplay } from './summary-display'
import { SummaryLoading } from './summary-loading'
import { SummaryError } from './summary-error'
import { RegenerateSummaryButton } from './regenerate-summary-button'
import { TagDisplay } from './tag-display'
import { TagLoading } from './tag-loading'
import { TagError } from './tag-error'
import { RegenerateTagsButton } from './regenerate-tags-button'
import { TagEditor } from './tag-editor'
import { useAutoSave } from '@/lib/notes/hooks'
import { cn } from '@/lib/utils'
import { generateSummary, getNoteSummary } from '@/lib/notes/actions'
import { generateTags, getNoteTags } from '@/lib/notes/tag-actions'
import type { Note } from '@/lib/notes/queries'

interface NoteEditorProps {
    note: Note
    className?: string
}

export function NoteEditor({ note, className }: NoteEditorProps) {
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [title, setTitle] = useState(note.title || '')
    const [content, setContent] = useState(note.content || '')
    const [summary, setSummary] = useState<{
        id: string
        content: string
        created_at: string
    } | null>(null)
    const [summaryStatus, setSummaryStatus] = useState<'idle' | 'loading' | 'error'>('idle')
    const [summaryError, setSummaryError] = useState<string>('')
    const [tags, setTags] = useState<Array<{
        id: string
        name: string
        created_at: string
    }>>([])
    const [tagStatus, setTagStatus] = useState<'idle' | 'loading' | 'error'>('idle')
    const [tagError, setTagError] = useState<string>('')
    const [isEditingTags, setIsEditingTags] = useState(false)

           const { 
               isSaving, 
               lastSaved
           } = useAutoSave({
        title,
        content,
        onSave: async (data) => {
            try {
                const response = await fetch(`/api/notes/${note.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })

                if (!response.ok) {
                    throw new Error('노트 저장에 실패했습니다.')
                }
            } catch (error) {
                console.error('노트 저장 실패:', error)
                throw error
            }
        }
    })

    // 요약 조회 및 자동 생성
    useEffect(() => {
        const loadSummary = async () => {
            try {
                const existingSummary = await getNoteSummary(note.id)
                if (existingSummary.success && existingSummary.summary) {
                    setSummary(existingSummary.summary)
                    setSummaryStatus('idle')
                } else if (content && content.length >= 100) {
                    setSummaryStatus('loading')
                    const result = await generateSummary(note.id)

                    if (result.success) {
                        const newSummary = await getNoteSummary(note.id)
                        if (newSummary.success && newSummary.summary) {
                            setSummary(newSummary.summary)
                            setSummaryStatus('idle')
                        }
                    } else {
                        setSummaryError(result.error || '요약 생성에 실패했습니다.')
                        setSummaryStatus('error')
                    }
                }
            } catch (error) {
                console.error('요약 로드 실패:', error)
                setSummaryError('요약을 불러오는 중 오류가 발생했습니다.')
                setSummaryStatus('error')
            }
        }
        loadSummary()
    }, [note.id, content])

    // 태그 조회 및 자동 생성
    useEffect(() => {
        const loadTags = async () => {
            try {
                const existingTags = await getNoteTags(note.id)
                if (existingTags.success && existingTags.tags) {
                    setTags(existingTags.tags)
                    setTagStatus('idle')
                } else if (content && content.length >= 100) {
                    // 태그 테이블이 존재하지 않는 경우를 확인
                    if (existingTags.error && existingTags.error.includes('tags 테이블이 존재하지 않습니다')) {
                        console.log('tags 테이블이 존재하지 않습니다. 태그 기능을 사용할 수 없습니다.')
                        setTagStatus('idle')
                        return
                    }
                    
                    setTagStatus('loading')
                    const result = await generateTags(note.id)

                    if (result.success) {
                        const newTags = await getNoteTags(note.id)
                        if (newTags.success && newTags.tags) {
                            setTags(newTags.tags)
                            setTagStatus('idle')
                        }
                    } else {
                        setTagError(result.error || '태그 생성에 실패했습니다.')
                        setTagStatus('error')
                    }
                }
            } catch (error) {
                console.error('태그 로드 실패:', error)
                setTagError('태그를 불러오는 중 오류가 발생했습니다.')
                setTagStatus('error')
            }
        }
        loadTags()
    }, [note.id, content])

    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle)
    }

    const handleContentChange = (newContent: string) => {
        setContent(newContent)
    }

    const handleTitleSubmit = () => {
        setIsEditingTitle(false)
    }

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleTitleSubmit()
        }
        if (e.key === 'Escape') {
            setTitle(note.title || '')
            setIsEditingTitle(false)
        }
    }

    const handleRegenerateSummary = async () => {
        setSummaryStatus('loading')
        setSummaryError('')

        try {
            const result = await generateSummary(note.id)

            if (result.success) {
                const newSummary = await getNoteSummary(note.id)
                if (newSummary.success && newSummary.summary) {
                    setSummary(newSummary.summary)
                    setSummaryStatus('idle')
                }
            } else {
                setSummaryError(result.error || '요약 재생성에 실패했습니다.')
                setSummaryStatus('error')
            }
        } catch (error) {
            console.error('요약 재생성 실패:', error)
            setSummaryError('요약 재생성 중 오류가 발생했습니다.')
            setSummaryStatus('error')
        }
    }

    const handleRegenerateTags = async () => {
        setTagStatus('loading')
        setTagError('')

        try {
            const result = await generateTags(note.id)

            if (result.success) {
                const newTags = await getNoteTags(note.id)
                if (newTags.success && newTags.tags) {
                    setTags(newTags.tags)
                    setTagStatus('idle')
                }
            } else {
                setTagError(result.error || '태그 재생성에 실패했습니다.')
                setTagStatus('error')
            }
        } catch (error) {
            console.error('태그 재생성 실패:', error)
            setTagError('태그 재생성 중 오류가 발생했습니다.')
            setTagStatus('error')
        }
    }

           const handleTagSuccess = () => {
        const loadTags = async () => {
            try {
                const result = await getNoteTags(note.id)
                if (result.success && result.tags) {
                    setTags(result.tags)
                }
            } catch (error) {
                console.error('태그 로드 실패:', error)
            }
        }
        loadTags()
        setIsEditingTags(false)
    }

    const handleTagError = (error: string) => {
        setTagError(error)
        setTagStatus('error')
    }

    return (
        <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900', className)}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-6">
                    <BackButton href="/notes" />
                    <div className="flex items-center gap-2">
                        <SaveStatus 
                            isSaving={isSaving} 
                            lastSaved={lastSaved} 
                        />
                        <DeleteNoteButton noteId={note.id} />
                    </div>
                </div>

                {/* 제목 편집 */}
                <div className="mb-6">
                    {isEditingTitle ? (
                        <Input
                            value={title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            onBlur={handleTitleSubmit}
                            onKeyDown={handleTitleKeyDown}
                            placeholder="노트 제목을 입력하세요"
                            className="text-2xl font-bold border-none shadow-none p-0 focus:ring-0"
                            autoFocus
                        />
                    ) : (
                        <h1
                            className="text-2xl font-bold text-gray-900 cursor-pointer hover:bg-gray-100 p-2 rounded"
                            onClick={() => setIsEditingTitle(true)}
                        >
                            {title || '제목 없음'}
                        </h1>
                    )}
                </div>

                {/* 요약 섹션 */}
                {content && content.length >= 100 && (
                    <div className="mb-6">
                        {summaryStatus === 'loading' && <SummaryLoading />}
                        {summaryStatus === 'error' && (
                            <SummaryError
                                error={summaryError}
                                onRetry={handleRegenerateSummary}
                            />
                        )}
                        {summary && summaryStatus === 'idle' && (
                            <div className="space-y-3">
                                <SummaryDisplay summary={summary} />
                                <div className="flex justify-end">
                                    <RegenerateSummaryButton
                                        noteId={note.id}
                                        onSuccess={(newSummary) => {
                                            setSummary({ ...summary, content: newSummary })
                                        }}
                                        onError={setSummaryError}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 태그 섹션 */}
                {content && content.length >= 100 && (
                    <div className="mb-6">
                        {tagStatus === 'loading' && <TagLoading />}
                        {tagStatus === 'error' && (
                            <TagError
                                error={tagError}
                                onRetry={handleRegenerateTags}
                            />
                        )}
                        {tags.length > 0 && tagStatus === 'idle' && !isEditingTags && (
                            <div className="space-y-3">
                                <TagDisplay
                                    tags={tags}
                                    onTagClick={(tagName) => {
                                        // 태그 클릭 시 필터링 (향후 구현)
                                        console.log('태그 클릭:', tagName)
                                    }}
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setIsEditingTags(true)}
                                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        태그 편집
                                    </button>
                                    <RegenerateTagsButton
                                        noteId={note.id}
                                        onSuccess={handleTagSuccess}
                                        onError={handleTagError}
                                    />
                                </div>
                            </div>
                        )}
                        {isEditingTags && (
                            <div className="space-y-3">
                                <TagEditor
                                    noteId={note.id}
                                    initialTags={tags}
                                    onSuccess={handleTagSuccess}
                                    onError={handleTagError}
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setIsEditingTags(false)}
                                        className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        취소
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 내용 편집 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
                    <AutoResizeTextarea
                        value={content}
                        onChange={handleContentChange}
                        placeholder="노트 내용을 입력하세요..."
                        className="w-full p-6 text-gray-900 dark:text-gray-100 border-none resize-none focus:ring-0 min-h-[400px]"
                    />
                </div>
            </div>
        </div>
    )
}
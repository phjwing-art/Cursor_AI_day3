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
import type { Summary, Tag } from '@/lib/db/schema/notes'

interface NoteEditorProps {
    note: Note
    className?: string
}

export function NoteEditor({ note, className }: NoteEditorProps) {
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [summary, setSummary] = useState<Summary | null>(null)
    const [summaryStatus, setSummaryStatus] = useState<'idle' | 'loading' | 'error'>('idle')
    const [summaryError, setSummaryError] = useState<string>('')
    const [tags, setTags] = useState<Tag[]>([])
    const [tagStatus, setTagStatus] = useState<'idle' | 'loading' | 'error'>('idle')
    const [tagError, setTagError] = useState<string>('')
    const [isEditingTags, setIsEditingTags] = useState(false)

    const {
        title,
        content,
        saveStatus,
        lastSavedAt,
        hasChanges,
        handleTitleChange,
        handleContentChange,
        saveImmediately
    } = useAutoSave({
        noteId: note.id,
        initialTitle: note.title,
        initialContent: note.content || ''
    })

    // 요약 조회 및 자동 생성
    useEffect(() => {
        const loadSummary = async () => {
            try {
                const existingSummary = await getNoteSummary(note.id)
                if (existingSummary) {
                    setSummary(existingSummary)
                    setSummaryStatus('idle')
                } else if (content && content.length >= 100) {
                    // 자동으로 요약 생성
                    setSummaryStatus('loading')
                    const result = await generateSummary(note.id)
                    
                    if (result.success) {
                        // 요약이 생성되었으므로 다시 조회
                        const newSummary = await getNoteSummary(note.id)
                        setSummary(newSummary)
                        setSummaryStatus('idle')
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
                    // 자동으로 태그 생성
                    setTagStatus('loading')
                    const result = await generateTags(note.id)
                    
                    if (result.success) {
                        // 태그가 생성되었으므로 다시 조회
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

    const handleRegenerateSummary = async () => {
        setSummaryStatus('loading')
        setSummaryError('')
        
        try {
            const result = await generateSummary(note.id)
            
            if (result.success) {
                const newSummary = await getNoteSummary(note.id)
                setSummary(newSummary)
                setSummaryStatus('idle')
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

    const handleTagSuccess = (_newTags: string[]) => {
        // 태그 편집 성공 시 태그 목록 새로고침
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

    const handleTitleClick = () => {
        setIsEditingTitle(true)
    }

    const handleTitleBlur = () => {
        setIsEditingTitle(false)
    }

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setIsEditingTitle(false)
        } else if (e.key === 'Escape') {
            setIsEditingTitle(false)
        }
    }

    return (
        <div
            className={cn(
                'min-h-screen bg-gray-50 dark:bg-gray-900',
                className
            )}
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 헤더 영역 */}
                <div className="flex items-center justify-between mb-6">
                    <BackButton />
                    <div className="flex items-center gap-3">
                        <DeleteNoteButton
                            noteId={note.id}
                            noteTitle={note.title}
                            variant="outline"
                            size="sm"
                            redirectAfterDelete={true}
                        />
                        <SaveStatus
                            status={saveStatus}
                            lastSavedAt={lastSavedAt}
                            onRetry={saveImmediately}
                        />
                    </div>
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
                                        onSuccess={() => {
                                            // 요약이 재생성되면 다시 조회
                                            getNoteSummary(note.id).then(newSummary => {
                                                setSummary(newSummary)
                                                setSummaryStatus('idle')
                                            })
                                        }}
                                        onError={(error) => {
                                            setSummaryError(error)
                                            setSummaryStatus('error')
                                        }}
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

                {/* 편집 영역 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* 제목 영역 */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        {isEditingTitle ? (
                            <Input
                                value={title}
                                onChange={e =>
                                    handleTitleChange(e.target.value)
                                }
                                onBlur={handleTitleBlur}
                                onKeyDown={handleTitleKeyDown}
                                className="text-2xl font-bold border-none p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                placeholder="제목을 입력하세요"
                                autoFocus
                            />
                        ) : (
                            <h1
                                onClick={handleTitleClick}
                                className="text-2xl font-bold cursor-text p-2 -m-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        setIsEditingTitle(true)
                                    }
                                }}
                            >
                                {title || '제목을 클릭하여 편집하세요'}
                            </h1>
                        )}
                    </div>

                    {/* 내용 영역 */}
                    <div className="p-6">
                        <AutoResizeTextarea
                            value={content}
                            onChange={handleContentChange}
                            placeholder="내용을 입력하세요..."
                            className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base leading-relaxed"
                            minRows={10}
                            maxRows={50}
                        />
                    </div>
                </div>

                {/* 키보드 단축키 안내 */}
                <div className="mt-6 text-sm text-muted-foreground text-center">
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                        {navigator.platform.toLowerCase().includes('mac')
                            ? 'Cmd'
                            : 'Ctrl'}
                    </kbd>
                    {' + '}
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                        S
                    </kbd>{' '}
                    로 즉시 저장 • 변경사항은 3초 후 자동 저장됩니다
                </div>

                {/* 변경사항 표시 */}
                {hasChanges && saveStatus === 'idle' && (
                    <div className="mt-4 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 rounded-md text-sm">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                            저장되지 않은 변경사항이 있습니다
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

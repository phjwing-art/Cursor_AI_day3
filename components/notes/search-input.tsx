'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/lib/utils/debounce'

interface SearchInputProps {
    defaultValue?: string
    placeholder?: string
    className?: string
}

export function SearchInput({ 
    defaultValue = '', 
    placeholder = '노트 검색...',
    className = ''
}: SearchInputProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState(defaultValue)
    const debouncedQuery = useDebounce(query, 500)

    useEffect(() => {
        if (debouncedQuery !== defaultValue) {
            const params = new URLSearchParams(searchParams.toString())
            
            if (debouncedQuery.trim()) {
                params.set('search', debouncedQuery.trim())
                params.delete('page') // 검색 시 첫 페이지로
            } else {
                params.delete('search')
            }
            
            router.push(`/notes?${params.toString()}`)
        }
    }, [debouncedQuery, router, searchParams, defaultValue])

    const handleClear = () => {
        setQuery('')
        const params = new URLSearchParams(searchParams.toString())
        params.delete('search')
        router.push(`/notes?${params.toString()}`)
    }

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 pr-10"
                />
                {query && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
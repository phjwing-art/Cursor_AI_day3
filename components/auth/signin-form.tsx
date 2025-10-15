'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { signIn } from '@/lib/auth/actions'
import { useRouter } from 'next/navigation'

export function SigninForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const formData = new FormData()
            formData.append('email', email)
            formData.append('password', password)
            
            const result = await signIn(formData)
            if (result?.error) {
                setError(result.error)
            } else {
                router.push('/')
            }
        } catch {
            setError('로그인 중 오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>로그인</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="email">이메일</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">비밀번호</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && (
                        <div className="text-red-600 text-sm">{error}</div>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? '로그인 중...' : '로그인'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
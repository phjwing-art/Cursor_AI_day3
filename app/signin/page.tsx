import { SigninForm } from '@/components/auth/signin-form'
import { BackButton } from '@/components/ui/back-button'

export default function SigninPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div className="flex items-center justify-between">
                    <BackButton href="/" />
                    <div className="flex-1 text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            로그인
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            AI 메모장에 로그인하세요
                        </p>
                    </div>
                    <div className="w-20"></div> {/* 공간 맞추기 */}
                </div>
                <SigninForm />
            </div>
        </div>
    )
}
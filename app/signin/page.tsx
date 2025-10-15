import { SigninForm } from '@/components/auth/signin-form'

export default function SigninPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        로그인
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        AI 메모장에 로그인하세요
                    </p>
                </div>
                <SigninForm />
            </div>
        </div>
    )
}
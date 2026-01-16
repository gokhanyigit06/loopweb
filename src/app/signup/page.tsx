import { AuthForm } from '@/components/auth/AuthForm'

export default function SignupPage() {
    return (
        <main className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[120px]" />

            <AuthForm type="signup" />
        </main>
    )
}

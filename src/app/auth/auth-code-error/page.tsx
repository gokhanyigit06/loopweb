'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Authentication Error</h1>
            <p className="text-white/60 mb-8 max-w-sm">
                There was a problem verifying your account. The link may have expired or is invalid.
            </p>
            <div className="flex gap-4">
                <Link
                    href="/login"
                    className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
                >
                    Back to Login
                </Link>
                <Link
                    href="/signup"
                    className="px-6 py-3 bg-primary text-black rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                    Sign Up Again
                </Link>
            </div>
        </div>
    )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { KeyRound, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const supabase = createClient()

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
            })

            if (error) throw error

            setMessage('Check your email for the password reset link.')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative z-10"
            >
                <Link href="/login" className="inline-flex items-center text-white/50 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                </Link>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 text-primary border border-primary/20">
                        <KeyRound className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Reset Password</h2>
                    <p className="text-white/60 mt-2 text-center">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleReset} className="space-y-6">
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/20"
                            placeholder="name@example.com"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        Send Reset Link
                    </button>
                </form>
            </motion.div>
        </div>
    )
}

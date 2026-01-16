'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            // Redirect to discover (or home) after success
            router.push('/discover')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative z-10"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 text-primary border border-primary/20">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Set New Password</h2>
                    <p className="text-white/60 mt-2 text-center">
                        Please enter your new password below.
                    </p>
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/20"
                            placeholder="New Password (min 6 chars)"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        Update Password
                    </button>
                </form>
            </motion.div>
        </div>
    )
}

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MatchModalProps {
    isOpen: boolean
    onClose: () => void
    matchData: {
        myAvatar: string
        theirAvatar: string
        theirName: string
    } | null
}

export function MatchModal({ isOpen, onClose, matchData }: MatchModalProps) {
    const router = useRouter()

    if (!isOpen || !matchData) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
                    className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-8 text-center shadow-2xl overflow-hidden"
                >
                    {/* Confetti/Sparkles Background Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent opacity-50" />

                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 mb-2 relative z-10 italic">
                        IT'S A MATCH!
                    </h2>
                    <p className="text-white/60 mb-8 relative z-10">
                        You and {matchData.theirName} liked each other.
                    </p>

                    <div className="flex justify-center items-center gap-4 mb-10 relative z-10">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border-4 border-primary overflow-hidden shadow-[0_0_20px_rgba(235,59,90,0.5)]">
                                <img src={matchData.myAvatar} alt="Me" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 text-2xl">😍</div>
                        </div>
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border-4 border-purple-500 overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                                <img src={matchData.theirAvatar} alt={matchData.theirName} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 text-2xl">🔥</div>
                        </div>
                    </div>

                    <div className="space-y-3 relative z-10">
                        <button
                            onClick={() => router.push('/chat')}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 font-bold text-lg text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Send a Message
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-4 rounded-xl bg-white/5 border border-white/10 font-bold text-lg text-white hover:bg-white/10 transition-all"
                        >
                            Keep Swiping
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

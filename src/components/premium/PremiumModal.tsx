'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Heart, Zap, Undo2, PlayCircle } from 'lucide-react'

interface PremiumModalProps {
    isOpen: boolean
    onClose: () => void
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
    const [isLoadingAd, setIsLoadingAd] = useState(false)

    if (!isOpen) return null

    const handleWatchAd = () => {
        setIsLoadingAd(true)
        // Simulate ad watch
        setTimeout(() => {
            setIsLoadingAd(false)
            alert("Thanks for watching! You earned a Super Like (Simulated).")
            onClose()
        }, 2000)
    }

    const benefits = [
        {
            icon: Star,
            title: "Super Likes",
            desc: "Stand out from the crowd and get 3x more matches.",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            icon: Heart,
            title: "See Who Likes You",
            desc: "Stop swiping seamlessly. Reveal who already liked you.",
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            icon: Zap,
            title: "Monthly Boost",
            desc: "Be the top profile in your area for 30 minutes.",
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        },
        {
            icon: Undo2,
            title: "Unlimited Rewinds",
            desc: "Accidentally swiped left? Go back and correct it.",
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        }
    ]

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md bg-zinc-900 border border-amber-500/20 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Golden Gradient Background Effect */}
                    <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-amber-500/20 to-transparent pointer-events-none" />

                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-colors z-50 cursor-pointer"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="text-center mb-8 relative z-10 pt-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-600 mb-4 shadow-lg shadow-amber-500/20">
                            <Star className="w-8 h-8 text-black" fill="currentColor" />
                        </div>
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">
                            Unlock Feature
                        </h2>
                        <p className="text-white/60 mt-2 text-sm">Watch a short ad to unlock this feature for free!</p>
                    </div>

                    <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto pr-2">
                        {benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5">
                                <div className={`w-10 h-10 rounded-xl ${benefit.bg} flex items-center justify-center flex-shrink-0`}>
                                    <benefit.icon className={`w-5 h-5 ${benefit.color}`} />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-white text-sm">{benefit.title}</h3>
                                    <p className="text-white/40 text-xs leading-relaxed">{benefit.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleWatchAd}
                            disabled={isLoadingAd}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 font-bold text-black text-lg shadow-lg hover:shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoadingAd ? (
                                <span className="animate-pulse">Watching Ad...</span>
                            ) : (
                                <>
                                    <PlayCircle className="w-5 h-5 fill-black/20" />
                                    Watch Ad (Test Mode)
                                </>
                            )}
                        </button>
                        <p className="text-center text-xs text-white/30">
                            Payments are disabled. Enjoy for free via ads.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

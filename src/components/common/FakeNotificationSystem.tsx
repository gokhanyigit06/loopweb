'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Eye, Heart, UserPlus, Zap } from 'lucide-react'
import { PremiumModal } from '@/components/premium/PremiumModal'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'

const FAKE_NOTIFICATIONS = [
    {
        icon: Eye,
        message: "Zeynep viewed your profile 👀",
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        icon: Heart,
        message: "Someone liked your profile! ❤️",
        color: "text-red-500",
        bg: "bg-red-500/10"
    },
    {
        icon: UserPlus,
        message: "Emily just joined nearby 📍",
        color: "text-green-500",
        bg: "bg-green-500/10"
    },
    {
        icon: Zap,
        message: "Your profile is trending! 🔥",
        color: "text-yellow-500",
        bg: "bg-yellow-500/10"
    },
    {
        icon: Eye,
        message: "Sarah and 2 others checked you out",
        color: "text-purple-500",
        bg: "bg-purple-500/10"
    }
]

export function FakeNotificationSystem() {
    const pathname = usePathname()
    const [currentNotif, setCurrentNotif] = useState<typeof FAKE_NOTIFICATIONS[0] | null>(null)
    const [showPremiumModal, setShowPremiumModal] = useState(false)
    const supabase = createClient()
    const isRunning = useRef(true)

    // Strict Page Filter: Only show on main app pages
    const isAppPage = ['/discover', '/matches', '/chat', '/profile'].some(path => pathname.startsWith(path))

    useEffect(() => {
        if (!isAppPage) return
        const checkAuthAndStart = async () => {
            const { data: { session } } = await supabase.auth.getSession()

            // Only start if user is logged in
            if (session) {
                const initTimeout = setTimeout(() => {
                    if (isRunning.current) scheduleNextNotification()
                }, 8000) // Start after 8 seconds
                return () => clearTimeout(initTimeout)
            }
        }

        checkAuthAndStart()

        return () => { isRunning.current = false }
    }, [])

    const scheduleNextNotification = () => {
        // Random interval between 15 and 45 seconds
        const randomInterval = Math.floor(Math.random() * (45000 - 15000 + 1) + 15000)

        const randomNotif = FAKE_NOTIFICATIONS[Math.floor(Math.random() * FAKE_NOTIFICATIONS.length)]

        setCurrentNotif(randomNotif)

        // Hide notification after 5 seconds
        setTimeout(() => {
            setCurrentNotif(null)

            // Schedule the next one
            setTimeout(scheduleNextNotification, randomInterval)
        }, 5000)
    }

    const handleClick = () => {
        setCurrentNotif(null)
        setShowPremiumModal(true)
    }

    if (!isAppPage) return null

    return (
        <>
            <AnimatePresence>
                {currentNotif && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="fixed top-20 inset-x-4 mx-auto max-w-sm z-[55] cursor-pointer" // Correct z-index to be below PremiumModal but above content
                        onClick={handleClick}
                    >
                        <div className="bg-zinc-900/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl ${currentNotif.bg}`}>
                                <currentNotif.icon className={`w-5 h-5 ${currentNotif.color}`} />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-white font-semibold text-sm">New Activity</h4>
                                <p className="text-white/70 text-xs">{currentNotif.message}</p>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <PremiumModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
            />
        </>
    )
}

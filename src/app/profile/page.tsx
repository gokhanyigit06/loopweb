'use client'

import { motion } from 'framer-motion'
import { User, Settings, Shield, HelpCircle, LogOut, ChevronRight, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const menuItems = [
    { icon: Settings, label: 'Account Settings', href: '/profile/settings' },
    { icon: Shield, label: 'Privacy & Safety', href: '/profile/privacy' },
    { icon: HelpCircle, label: 'Help & Support', href: '/profile/help' },
]

export default function ProfilePage() {
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <div className="min-h-screen pb-32">
            {/* Header/Cover Area */}
            <div className="relative h-64 bg-gradient-to-b from-primary/20 to-black">
                <div className="absolute inset-0 bg-grid-white opacity-[0.05]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-black overflow-hidden bg-zinc-800">
                            <User className="w-full h-full p-6 text-white/20" />
                        </div>
                        <button className="absolute bottom-0 right-0 p-2.5 rounded-full bg-primary text-white border-4 border-black shadow-lg">
                            <Camera className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-20 px-6 text-center">
                <h1 className="text-2xl font-bold">Your Name</h1>
                <p className="text-white/50 text-sm mt-1">Complete your profile to find better matches</p>

                <div className="mt-8 flex justify-center gap-4">
                    <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-center flex-1">
                        <span className="block text-xl font-bold">0</span>
                        <span className="text-[10px] uppercase tracking-wider text-white/40">Likes</span>
                    </div>
                    <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-center flex-1">
                        <span className="block text-xl font-bold">12</span>
                        <span className="text-[10px] uppercase tracking-wider text-white/40">Matches</span>
                    </div>
                    <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-center flex-1">
                        <span className="block text-xl font-bold">Premium</span>
                        <span className="text-[10px] uppercase tracking-wider text-white/40">Status</span>
                    </div>
                </div>

                <div className="mt-10 space-y-2 text-left">
                    {menuItems.map((item, index) => (
                        <motion.button
                            key={item.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="w-full p-4 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <span className="font-medium">{item.label}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/20" />
                        </motion.button>
                    ))}

                    <motion.button
                        onClick={handleSignOut}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="w-full p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center justify-between hover:bg-red-500/10 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                                <LogOut className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-red-500">Sign Out</span>
                        </div>
                    </motion.button>
                </div>
            </div>
        </div>
    )
}

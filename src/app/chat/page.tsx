'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Match {
    id: string
    profile: {
        id: string
        full_name: string
        avatar_url: string
    }
    lastMessage?: {
        content: string
        created_at: string
    }
}

export default function ChatPage() {
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        loadChats()
    }, [])

    const loadChats = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setLoading(false)
                return
            }

            // Get all matches
            const { data: matchesData, error } = await supabase
                .from('matches')
                .select('*')
                .or(`user_1.eq.${user.id},user_2.eq.${user.id}`)
                .order('created_at', { ascending: false })

            if (error) throw error

            // For each match, get profile and last message
            const chatsWithData = await Promise.all(
                (matchesData || []).map(async (match) => {
                    const otherUserId = match.user_1 === user.id ? match.user_2 : match.user_1

                    // Get profile
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('id, full_name, avatar_url')
                        .eq('id', otherUserId)
                        .single()

                    // Get last message
                    const { data: messages } = await supabase
                        .from('messages')
                        .select('content, created_at')
                        .eq('match_id', match.id)
                        .order('created_at', { ascending: false })
                        .limit(1)

                    return {
                        id: match.id,
                        profile,
                        lastMessage: messages?.[0]
                    }
                })
            )

            setMatches(chatsWithData.filter(m => m.profile) as Match[])
        } catch (error) {
            console.error('Error loading chats:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

        if (diffInHours < 24) {
            return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        } else {
            return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen pb-32 pt-6 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen pb-32 pt-6">
            <header className="px-6 mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
                </div>
                <p className="text-white/50 text-sm">
                    {matches.length} {matches.length === 1 ? 'conversation' : 'conversations'}
                </p>
            </header>

            <main className="px-6">
                {matches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <MessageCircle className="w-12 h-12 text-primary/50" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No messages yet</h3>
                        <p className="text-white/40 max-w-xs">
                            Start matching with people to begin conversations!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {matches.map((match, index) => (
                            <motion.button
                                key={match.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => router.push(`/chat/${match.id}`)}
                                className="w-full p-4 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-800/50 transition-colors flex items-center gap-4"
                            >
                                {/* Avatar */}
                                <div className="relative">
                                    <img
                                        src={match.profile.avatar_url}
                                        alt={match.profile.full_name}
                                        className="w-14 h-14 rounded-full object-cover border-2 border-white/10"
                                    />
                                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-900" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 text-left">
                                    <h3 className="font-semibold text-white mb-1">
                                        {match.profile.full_name}
                                    </h3>
                                    <p className="text-sm text-white/40 line-clamp-1">
                                        {match.lastMessage?.content || 'Say hi! 👋'}
                                    </p>
                                </div>

                                {/* Time */}
                                {match.lastMessage && (
                                    <span className="text-xs text-white/30">
                                        {formatTime(match.lastMessage.created_at)}
                                    </span>
                                )}
                            </motion.button>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Heart, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Match {
    id: string
    user_1: string
    user_2: string
    created_at: string
    profile: {
        id: string
        full_name: string
        avatar_url: string
        bio: string
    }
}

export default function MatchesPage() {
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        loadMatches()
    }, [])

    const loadMatches = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setLoading(false)
                return
            }

            // Get all matches for the current user
            const { data: matchesData, error } = await supabase
                .from('matches')
                .select('*')
                .or(`user_1.eq.${user.id},user_2.eq.${user.id}`)
                .order('created_at', { ascending: false })

            if (error) throw error

            // For each match, get the other user's profile
            const matchesWithProfiles = await Promise.all(
                (matchesData || []).map(async (match) => {
                    const otherUserId = match.user_1 === user.id ? match.user_2 : match.user_1

                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('id, full_name, avatar_url, bio')
                        .eq('id', otherUserId)
                        .single()

                    return {
                        ...match,
                        profile
                    }
                })
            )

            setMatches(matchesWithProfiles.filter(m => m.profile))
        } catch (error) {
            console.error('Error loading matches:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleChatClick = (matchId: string) => {
        router.push(`/chat/${matchId}`)
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
                        <Heart className="w-5 h-5 text-primary fill-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Your Matches</h1>
                </div>
                <p className="text-white/50 text-sm">
                    {matches.length} {matches.length === 1 ? 'match' : 'matches'}
                </p>
            </header>

            <main className="px-6">
                {matches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <Sparkles className="w-12 h-12 text-primary/50" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No matches yet</h3>
                        <p className="text-white/40 max-w-xs">
                            Keep swiping! Your perfect match is just around the corner.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {matches.map((match, index) => (
                            <motion.div
                                key={match.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 group cursor-pointer"
                                onClick={() => handleChatClick(match.id)}
                            >
                                {/* Profile Image */}
                                <img
                                    src={match.profile.avatar_url}
                                    alt={match.profile.full_name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                {/* Info */}
                                <div className="absolute bottom-0 inset-x-0 p-4">
                                    <h3 className="text-lg font-bold text-white mb-1">
                                        {match.profile.full_name}
                                    </h3>
                                    <p className="text-white/60 text-xs line-clamp-2 mb-3">
                                        {match.profile.bio}
                                    </p>

                                    {/* Chat Button */}
                                    <button
                                        className="w-full py-2.5 rounded-xl bg-primary/90 backdrop-blur-sm text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleChatClick(match.id)
                                        }}
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Message
                                    </button>
                                </div>

                                {/* Match Badge */}
                                <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-green-500/20 backdrop-blur-sm border border-green-500/30">
                                    <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider">Match</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

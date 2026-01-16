'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Lock, Star, Heart, MessageCircle, ChevronRight } from 'lucide-react'
import { PremiumModal } from '@/components/premium/PremiumModal'
import Link from 'next/link'
import AdBanner from '@/components/ads/AdBanner'

interface Like {
    liker_id: string
    profiles: {
        avatar_url: string
    }
}

interface Match {
    id: string
    partner: {
        id: string
        full_name: string
        avatar_url: string
    }
    last_message?: string
    updated_at: string
}

export default function MatchesPage() {
    const [activeTab, setActiveTab] = useState<'matches' | 'likes'>('matches')
    const [incomingLikes, setIncomingLikes] = useState<Like[]>([])
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [showPremiumModal, setShowPremiumModal] = useState(false)

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // 1. Fetch Incoming Likes
            const { data: likeData } = await supabase
                .from('likes')
                .select('liker_id, profiles!likes_liker_id_fkey(avatar_url)')
                .eq('liked_id', user.id)
                .limit(20)

            // Growth Hack: Generate fake likes if empty
            if (likeData && likeData.length === 0 && !generating && activeTab === 'likes') {
                setGenerating(true)
                try {
                    await supabase.rpc('generate_initial_likes', { target_user_id: user.id })
                    setTimeout(() => window.location.reload(), 1000)
                    return
                } catch (err) {
                    console.error("Bot generation failed:", err)
                    setGenerating(false)
                }
            }
            setIncomingLikes(likeData as unknown as Like[] || [])


            // 2. Fetch Matches & Last Messages
            const { data: matchesRaw } = await supabase
                .from('matches')
                .select(`
                    id,
                    user_1,
                    user_2,
                    created_at
                `)
                .or(`user_1.eq.${user.id},user_2.eq.${user.id}`)
                .order('created_at', { ascending: false })

            if (matchesRaw && matchesRaw.length > 0) {
                // Determine partner IDs
                const partnerIds = matchesRaw.map(m => m.user_1 === user.id ? m.user_2 : m.user_1)

                // Fetch Partner Profiles
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url')
                    .in('id', partnerIds)

                // Fetch Last Messages (Optimized: fetch all messages for these matches)
                // For simplicity, we can fetch just the latest message for each match individually or use a view.
                // Let's do a simple approach: Fetch all messages for these matches, ordered desc
                const { data: messages } = await supabase
                    .from('messages')
                    .select('match_id, content, created_at')
                    .in('match_id', matchesRaw.map(m => m.id))
                    .order('created_at', { ascending: false })

                // Merge Data
                const formattedMatches: Match[] = matchesRaw.map(m => {
                    const partnerId = m.user_1 === user.id ? m.user_2 : m.user_1
                    const profile = profiles?.find(p => p.id === partnerId)
                    // Find latest message for this match
                    const lastMsg = messages?.find(msg => msg.match_id === m.id)

                    if (!profile) return null

                    return {
                        id: m.id,
                        partner: profile,
                        last_message: lastMsg?.content || "New Match! Say hi 👋",
                        updated_at: lastMsg?.created_at || m.created_at
                    }
                }).filter(Boolean) as Match[]

                setMatches(formattedMatches)
            } else {
                setMatches([])
            }

        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading || generating) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black pb-24 font-sans">
            {/* Header with Tabs */}
            <div className="pt-12 pb-4 bg-black border-b border-white/5 sticky top-0 z-20">
                <div className="flex items-center justify-center gap-6 px-6">
                    <button
                        onClick={() => setActiveTab('matches')}
                        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'matches' ? 'text-white' : 'text-white/40'}`}
                    >
                        <MessageCircle className="w-6 h-6" />
                        <span className="text-xs font-bold tracking-widest uppercase">Matches</span>
                        {activeTab === 'matches' && <div className="w-full h-0.5 bg-white rounded-full mt-1" />}
                    </button>

                    <div className="w-[1px] h-8 bg-white/10" />

                    <button
                        onClick={() => setActiveTab('likes')}
                        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'likes' ? 'text-amber-500' : 'text-white/40'}`}
                    >
                        <div className="relative">
                            <Star className="w-6 h-6 fill-current" />
                            {incomingLikes.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 text-[8px] items-center justify-center text-black font-bold">
                                        {incomingLikes.length}
                                    </span>
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-bold tracking-widest uppercase">Likes</span>
                        {activeTab === 'likes' && <div className="w-full h-0.5 bg-amber-500 rounded-full mt-1" />}
                    </button>
                </div>
            </div>

            {/* Advertisement */}
            <AdBanner />

            <div className="p-4">
                {activeTab === 'matches' ? (
                    // MATCHES LIST
                    <div className="space-y-4">
                        {matches.length === 0 ? (
                            <div className="text-center py-20 opacity-50">
                                <p>No matches yet. Keep swiping! 🔥</p>
                            </div>
                        ) : (
                            matches.map(match => (
                                <Link
                                    href={`/chat/${match.id}`}
                                    key={match.id}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 transition-colors"
                                >
                                    <img
                                        src={match.partner.avatar_url || 'https://via.placeholder.com/150'}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-bold text-lg truncate">{match.partner.full_name}</h3>
                                        <p className="text-white/50 text-sm truncate">{match.last_message}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-white/20" />
                                </Link>
                            ))
                        )}
                    </div>
                ) : (
                    // LIKES LIST (Existing Gold UI)
                    <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-500">
                        {/* 1. Main Teaser Card (Gold) */}
                        <div
                            onClick={() => setShowPremiumModal(true)}
                            className="aspect-[3/4] rounded-2xl bg-zinc-900 border border-amber-500/50 overflow-hidden relative group cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.1)] col-span-2 sm:col-span-1"
                        >
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/60 backdrop-blur-md">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                                    <Lock className="w-7 h-7 text-black" />
                                </div>
                                <p className="text-xs font-bold text-amber-200 uppercase tracking-wider">Upgrade to See</p>
                                <p className="text-[10px] text-white/50 mt-1">Reveal everyone at once</p>
                            </div>

                            {/* Mosaic Background */}
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-40 grayscale">
                                {incomingLikes.slice(0, 9).map((l, i) => (
                                    <img key={i} src={l.profiles?.avatar_url} className="w-full h-full object-cover" />
                                ))}
                            </div>
                        </div>

                        {/* 2. Blurred Individual Cards */}
                        {incomingLikes.map((like, i) => (
                            <div
                                key={i}
                                onClick={() => setShowPremiumModal(true)}
                                className="aspect-[3/4] rounded-2xl bg-zinc-800 overflow-hidden relative cursor-pointer group"
                            >
                                <img
                                    src={like.profiles?.avatar_url}
                                    className="w-full h-full object-cover blur-xl scale-110 opacity-60 group-hover:opacity-80 transition-opacity"
                                />

                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                        <Heart className="w-4 h-4 text-white/50 fill-white/20" />
                                    </div>
                                </div>

                                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 rounded text-[10px] text-white/70 backdrop-blur-md font-medium">
                                    {i % 3 === 0 ? 'Nearby' : (i % 2 === 0 ? 'Online Recently' : 'New')}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <PremiumModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
            />
        </div>
    )
}

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Lock, Star, Heart } from 'lucide-react'
import { PremiumModal } from '@/components/premium/PremiumModal'

interface Like {
    liker_id: string
    profiles: {
        avatar_url: string
    }
}

export default function MatchesPage() {
    const [incomingLikes, setIncomingLikes] = useState<Like[]>([])
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

            // Fetch Incoming Likes
            const { data: likeData } = await supabase
                .from('likes')
                .select('liker_id, profiles!likes_liker_id_fkey(avatar_url)')
                .eq('liked_id', user.id)
                // We don't filter matches here anymore, we show ALL likes as a "Gold" preview
                // Or if you strictly want ONLY pending likes, we'd filter. 
                // But for monetization, showing MORE is better (even if you matched).
                // Let's stick to "Pending Likes" ideally, but strictly filtering matches client side is fine.
                .limit(20)

            // Filter out users we already matched with? 
            // To make it look "fuller", let's SHOW everyone who liked us, even if matched.
            // Or better: Show only unmatched likes to be honest.
            // For the sake of the user request "dolsun" (fill up), let's rely on the generator to keep adding UNMATCHED likes.

            // Check if we need to generate fake likes
            // Growth Hacking: If likes are absolutely empty, generate 1 fake like (Slow burn)
            if (likeData && likeData.length === 0 && !generating) {
                setGenerating(true)
                try {
                    await supabase.rpc('generate_initial_likes', { target_user_id: user.id })
                    // Wait and reload
                    setTimeout(() => {
                        window.location.reload()
                    }, 1000)
                    return
                } catch (err) {
                    console.error("Bot generation failed:", err)
                    setGenerating(false)
                }
            }

            setIncomingLikes(likeData as unknown as Like[] || [])

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
                {generating && <p className="text-amber-500/50 text-sm animate-pulse">Finding admirers...</p>}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black pb-24 font-sans">
            {/* Header */}
            <div className="p-6 pt-12 bg-gradient-to-b from-zinc-900 via-black to-black border-b border-white/5 sticky top-0 z-20">
                <div className="flex items-center justify-center relative">
                    <h1 className="text-lg font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                        <Star className="w-4 h-4 fill-amber-500" />
                        {incomingLikes.length} Likes You
                    </h1>
                </div>
            </div>

            <div className="p-4">
                <div className="grid grid-cols-2 gap-3">

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

                            {/* Fake "Online" or "Nearby" badge to make it look real */}
                            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 rounded text-[10px] text-white/70 backdrop-blur-md font-medium">
                                {i % 3 === 0 ? 'Nearby' : (i % 2 === 0 ? 'Online Recently' : 'New')}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-white/30 text-xs">
                        Upgrade to LoopWeb Gold to verify your admirers.
                    </p>
                </div>
            </div>

            <PremiumModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
            />
        </div>
    )
}

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Heart, X, MapPin, Search, Sparkles, User, Calendar, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { MatchModal } from './MatchModal'
import { PremiumModal } from '@/components/premium/PremiumModal'

interface Profile {
    id: string
    full_name: string
    birth_date: string
    bio: string
    location: string
    avatar_url: string
    interests: string[]
    gender: string
    looking_for: string
    updated_at: string
    created_at?: string
}

// Separate component to handle individual card motion logic
// This isolation fixes the issue where subsequent cards were unresponsive
const SwipeableCard = ({
    profile,
    index,
    isTop,
    onSwipe,
    exitDirection,
    setShowPremiumModal,
    children
}: {
    profile: Profile,
    index: number,
    isTop: boolean,
    onSwipe: (dir: 'like' | 'reject') => void,
    exitDirection: 'like' | 'reject' | null,
    setShowPremiumModal: (show: boolean) => void,
    children: React.ReactNode
}) => {
    const x = useMotionValue(0)
    const rotate = useTransform(x, [-200, 200], [-10, 10])
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])

    // Badge opacities
    const likeOpacity = useTransform(x, [50, 150], [0, 1])
    const rejectOpacity = useTransform(x, [-50, -150], [0, 1])

    const handleDragEnd = (_: any, info: any) => {
        const threshold = 100
        if (info.offset.x > threshold) {
            onSwipe('like')
        } else if (info.offset.x < -threshold) {
            onSwipe('reject')
        }
        // If threshold not met, Framer Motion snap-back handles it automatically due to dragConstraints
    }

    return (
        <motion.div
            style={isTop ? { x, rotate, opacity } : { scale: 1 - index * 0.05, y: index * 10, zIndex: -index }}
            drag={isTop ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            className={cn(
                "absolute inset-0 rounded-[2rem] overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl cursor-grab active:cursor-grabbing",
                !isTop && "pointer-events-none"
            )}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1 - index * 0.05, opacity: 1, y: index * 10 }}
            exit={{
                x: exitDirection === 'like' ? 500 : -500,
                opacity: 0,
                transition: { duration: 0.3 }
            }}
        >
            {/* Badges Layer - Visual feedback when dragging */}
            {isTop && (
                <>
                    <motion.div
                        style={{ opacity: likeOpacity }}
                        className="absolute top-8 left-8 border-4 border-green-500 rounded-lg px-4 py-1 rotate-[-20deg] z-50 pointer-events-none"
                    >
                        <span className="text-green-500 text-3xl font-black uppercase">Like</span>
                    </motion.div>
                    <motion.div
                        style={{ opacity: rejectOpacity }}
                        className="absolute top-8 right-8 border-4 border-red-500 rounded-lg px-4 py-1 rotate-[20deg] z-50 pointer-events-none"
                    >
                        <span className="text-red-500 text-3xl font-black uppercase">Nope</span>
                    </motion.div>
                </>
            )}

            {children}

            {/* Action Buttons Integrated into Card Content Logic */}
            {/* We render buttons here to have access to onSwipe easily, or render them in children but control logic from parent. 
                Since design puts them inside content, we keep them in children.
            */}
        </motion.div>
    )
}

export function CardStack() {
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [myProfile, setMyProfile] = useState<Profile | null>(null)

    // UI State for exit animation direction
    const [exitDirection, setExitDirection] = useState<'like' | 'reject' | null>(null)

    // Modal States
    const [showMatchModal, setShowMatchModal] = useState(false)
    const [showPremiumModal, setShowPremiumModal] = useState(false)
    const [matchData, setMatchData] = useState<{
        myAvatar: string
        theirAvatar: string
        theirName: string
    } | null>(null)

    const supabase = createClient()

    useEffect(() => {
        loadProfiles()
    }, [])

    const loadProfiles = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUser(user)

            if (!user) {
                setLoading(false)
                return
            }

            const { data: userProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (userProfile) {
                setMyProfile(userProfile)
            }

            const { data: likedIds } = await supabase
                .from('likes')
                .select('liked_id')
                .eq('liker_id', user.id)

            const likedUserIds = likedIds?.map(like => like.liked_id) || []

            let query = supabase
                .from('profiles')
                .select('*')
                .neq('id', user.id)
                .limit(20)

            if (likedUserIds.length > 0) {
                query = query.filter('id', 'not.in', `(${likedUserIds.join(',')})`)
            }

            if (userProfile?.looking_for && userProfile.looking_for !== 'everyone') {
                query = query.eq('gender', userProfile.looking_for)
            }

            // Order randomly is tricky in Supabase without rpc, so we shuffle client side or just take latest
            // For now simple select
            const { data, error } = await query

            if (error) throw error
            setProfiles(data || [])
        } catch (error: any) {
            console.error('Error loading profiles:', error.message || error)
        } finally {
            setLoading(false)
        }
    }

    const calculateAge = (birthDate: string) => {
        if (!birthDate) return '?'
        const today = new Date()
        const birth = new Date(birthDate)
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return age
    }

    const removeCard = async (action: 'like' | 'reject') => {
        if (profiles.length === 0 || !currentUser) return

        const currentProfile = profiles[0]

        // 1. Set exit direction first regarding the action so animation knows where to go
        setExitDirection(action)

        // 2. Remove card from list (Optimistic UI Update)
        // We delay slightly to allow state to propagate if needed, but usually not required for exit prop
        // However, setting Profiles triggers re-render, unmounting the component.
        setProfiles((prev) => prev.slice(1))

        if (action === 'like') {
            try {
                // GAMIFICATION: 40% Chance to match ("Hard to get")
                // This makes matches feel more rewarding.
                const shouldMatch = Math.random() < 0.4

                if (shouldMatch) {
                    // Growth Hacking: Use RPC to force match and creating message
                    const { data: isMatch, error: rpcError } = await supabase
                        .rpc('handle_new_match', {
                            liker_id: currentUser.id,
                            liked_id: currentProfile.id
                        })

                    if (rpcError) {
                        console.error("RPC Error (handle_new_match):", rpcError)
                        // Fallback to standard insert
                        await supabase
                            .from('likes')
                            .insert({ liker_id: currentUser.id, liked_id: currentProfile.id })
                    } else if (isMatch) {
                        // IT'S A MATCH!
                        setMatchData({
                            myAvatar: myProfile?.avatar_url || 'https://via.placeholder.com/150',
                            theirAvatar: currentProfile.avatar_url,
                            theirName: currentProfile.full_name
                        })
                        setShowMatchModal(true)
                    }
                } else {
                    // Standard Silent Like (No match yet)
                    // The user likes them, but "they haven't liked back yet"
                    await supabase
                        .from('likes')
                        .insert({ liker_id: currentUser.id, liked_id: currentProfile.id })
                }
            } catch (error) {
                console.error('Error creating like:', error)
            }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!currentUser) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Please log in</h3>
                <p className="text-white/40 mt-2">You need to be logged in to discover people</p>
            </div>
        )
    }

    if (profiles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <h3 className="text-xl font-bold">No one new around you</h3>
                <p className="text-white/40 mt-2">Try changing your filters or check back later!</p>
            </div>
        )
    }

    return (
        <>
            <div className="relative w-full max-w-sm h-[600px] mx-auto perspective-1000">
                <AnimatePresence>
                    {profiles.map((profile, index) => {
                        const isTop = index === 0
                        const age = calculateAge(profile.birth_date)
                        const joinDate = profile.updated_at ? new Date(profile.updated_at).getFullYear() : (profile.created_at ? new Date(profile.created_at).getFullYear() : '2024')

                        return (
                            <SwipeableCard
                                key={profile.id}
                                profile={profile}
                                index={index}
                                isTop={isTop}
                                onSwipe={removeCard}
                                exitDirection={exitDirection}
                                setShowPremiumModal={setShowPremiumModal}
                            >
                                {/* Content Inside Card */}
                                <div className="h-full overflow-y-auto scrollbar-hide pb-0">
                                    {/* Main Hero Image */}
                                    <div className="h-[75%] relative">
                                        <img
                                            src={profile.avatar_url}
                                            alt={profile.full_name}
                                            className="w-full h-full object-cover pointer-events-none select-none"
                                            draggable={false}
                                        />

                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent pointer-events-none" />

                                        <div className="absolute bottom-0 inset-x-0 p-6 pointer-events-none">
                                            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                                                {profile.full_name}, {age}
                                            </h2>
                                            <p className="text-white/70 flex items-center gap-1 mt-1 font-medium">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                {profile.location || 'Unknown Location'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Detailed Content */}
                                    <div className="px-6 pb-24 bg-zinc-900 space-y-8 pt-6 select-text cursor-auto">

                                        {/* Inline Action Buttons */}
                                        <div className="flex items-center justify-center gap-6 pb-2">
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeCard('reject'); }}
                                                className="w-14 h-14 rounded-full bg-zinc-800/80 border border-red-500/20 flex items-center justify-center text-red-500 hover:scale-110 transition-all z-20 cursor-pointer"
                                            >
                                                <X className="w-7 h-7" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPremiumModal(true); }}
                                                className="w-12 h-12 rounded-full bg-zinc-800/80 border border-yellow-500/20 flex items-center justify-center text-yellow-500 hover:scale-110 transition-all z-20 cursor-pointer"
                                            >
                                                <Sparkles className="w-5 h-5 fill-yellow-500" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeCard('like'); }}
                                                className="w-14 h-14 rounded-full bg-zinc-800/80 border border-green-500/20 flex items-center justify-center text-green-500 hover:scale-110 transition-all z-20 cursor-pointer"
                                            >
                                                <Heart className="w-7 h-7 fill-green-500" />
                                            </button>
                                        </div>

                                        {/* Bio */}
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
                                                <User className="w-4 h-4" /> About Me
                                            </h3>
                                            <p className="text-white/90 leading-relaxed text-lg font-light">
                                                {profile.bio || "No biography yet. Ask me about it!"}
                                            </p>
                                        </div>

                                        {/* Interests */}
                                        {profile.interests && profile.interests.length > 0 && (
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
                                                    <Tag className="w-4 h-4" /> Interests
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {profile.interests.map((interest, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/80"
                                                        >
                                                            {interest}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Basic Info */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                                                <span className="text-xs text-white/40 uppercase tracking-wider block">Looking For</span>
                                                <span className="font-medium capitalize text-white">{profile.looking_for || 'Anyone'}</span>
                                            </div>
                                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                                                <span className="text-xs text-white/40 uppercase tracking-wider block">Gender</span>
                                                <span className="font-medium capitalize text-white">{profile.gender || 'Not specified'}</span>
                                            </div>
                                        </div>

                                        {/* Footer Info */}
                                        <div className="pt-4 border-t border-white/5 text-center">
                                            <p className="text-xs text-white/30 flex items-center justify-center gap-1">
                                                <Calendar className="w-3 h-3" /> Joined {joinDate}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </SwipeableCard>
                        )
                    })}
                </AnimatePresence>
            </div>

            <MatchModal
                isOpen={showMatchModal}
                onClose={() => setShowMatchModal(false)}
                matchData={matchData}
            />

            <PremiumModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
            />
        </>
    )
}

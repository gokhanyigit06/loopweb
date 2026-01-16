'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Heart, X, Info, MapPin, Search, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Profile {
    id: string
    full_name: string
    birth_date: string
    bio: string
    location: string
    avatar_url: string
    interests: string[]
}

export function CardStack() {
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const supabase = createClient()

    const x = useMotionValue(0)
    const rotate = useTransform(x, [-200, 200], [-25, 25])
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])
    const likeOpacity = useTransform(x, [50, 150], [0, 1])
    const rejectOpacity = useTransform(x, [-50, -150], [0, 1])

    useEffect(() => {
        loadProfiles()
    }, [])

    const loadProfiles = async () => {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUser(user)

            if (!user) {
                setLoading(false)
                return
            }

            // Get user's profile to check gender preference
            const { data: userProfile } = await supabase
                .from('profiles')
                .select('looking_for, gender')
                .eq('id', user.id)
                .single()

            // Get profiles that user hasn't liked yet
            const { data: likedIds } = await supabase
                .from('likes')
                .select('liked_id')
                .eq('liker_id', user.id)

            const likedUserIds = likedIds?.map(like => like.liked_id) || []

            // Fetch potential matches
            let query = supabase
                .from('profiles')
                .select('*')
                .neq('id', user.id)
                .not('id', 'in', `(${likedUserIds.join(',') || 'null'})`)
                .limit(20)

            // Filter by gender preference if set
            if (userProfile?.looking_for) {
                query = query.eq('gender', userProfile.looking_for)
            }

            const { data, error } = await query

            if (error) throw error
            setProfiles(data || [])
        } catch (error) {
            console.error('Error loading profiles:', error)
        } finally {
            setLoading(false)
        }
    }

    const calculateAge = (birthDate: string) => {
        const today = new Date()
        const birth = new Date(birthDate)
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return age
    }

    const handleDragEnd = (event: any, info: any) => {
        if (info.offset.x > 100) {
            removeCard('like')
        } else if (info.offset.x < -100) {
            removeCard('reject')
        }
    }

    const removeCard = async (action: 'like' | 'reject') => {
        if (profiles.length === 0 || !currentUser) return

        const currentProfile = profiles[0]

        if (action === 'like') {
            try {
                // Create a like
                const { error } = await supabase
                    .from('likes')
                    .insert({
                        liker_id: currentUser.id,
                        liked_id: currentProfile.id
                    })

                if (error) throw error

                // Check if it's a match (the trigger will create it automatically)
                const { data: match } = await supabase
                    .from('matches')
                    .select('*')
                    .or(`and(user_1.eq.${currentUser.id},user_2.eq.${currentProfile.id}),and(user_1.eq.${currentProfile.id},user_2.eq.${currentUser.id})`)
                    .single()

                if (match) {
                    // Show match notification (we'll implement this later)
                    console.log('It\'s a match! 🎉')
                }
            } catch (error) {
                console.error('Error creating like:', error)
            }
        }

        // Remove the card from the stack
        setProfiles((prev) => prev.slice(1))
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
        <div className="relative w-full max-w-sm aspect-[3/4] mx-auto perspective-1000">
            <AnimatePresence>
                {profiles.map((profile, index) => {
                    const isTop = index === 0
                    const age = calculateAge(profile.birth_date)

                    return (
                        <motion.div
                            key={profile.id}
                            style={isTop ? { x, rotate, opacity } : { scale: 1 - index * 0.05, y: index * 10, zIndex: -index }}
                            drag={isTop ? 'x' : false}
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={handleDragEnd}
                            className={cn(
                                "absolute inset-0 rounded-[2rem] overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl cursor-grab active:cursor-grabbing touch-none",
                                !isTop && "pointer-events-none"
                            )}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1 - index * 0.05, opacity: 1, y: index * 10 }}
                            exit={{ x: x.get() > 0 ? 500 : -500, opacity: 0, transition: { duration: 0.3 } }}
                        >
                            {/* Image */}
                            <img
                                src={profile.avatar_url}
                                alt={profile.full_name}
                                className="w-full h-full object-cover"
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                            {/* Badges */}
                            {isTop && (
                                <>
                                    <motion.div
                                        style={{ opacity: likeOpacity }}
                                        className="absolute top-8 left-8 border-4 border-green-500 rounded-lg px-4 py-1 rotate-[-20deg]"
                                    >
                                        <span className="text-green-500 text-3xl font-black uppercase">Like</span>
                                    </motion.div>
                                    <motion.div
                                        style={{ opacity: rejectOpacity }}
                                        className="absolute top-8 right-8 border-4 border-red-500 rounded-lg px-4 py-1 rotate-[20deg]"
                                    >
                                        <span className="text-red-500 text-3xl font-black uppercase">Nope</span>
                                    </motion.div>
                                </>
                            )}

                            {/* Info */}
                            <div className="absolute bottom-0 inset-x-0 p-8">
                                <div className="flex items-end justify-between mb-2">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                                            {profile.full_name}, {age}
                                        </h2>
                                        <p className="text-white/70 flex items-center gap-1 mt-1">
                                            <MapPin className="w-4 h-4" />
                                            {profile.location}
                                        </p>
                                    </div>
                                    <button className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                                        <Info className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                                <p className="text-white/60 line-clamp-2 text-sm leading-relaxed mb-3">
                                    {profile.bio}
                                </p>
                                {profile.interests && profile.interests.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {profile.interests.slice(0, 3).map((interest, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs text-white/80 border border-white/10"
                                            >
                                                {interest}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="absolute -bottom-24 inset-x-0 flex items-center justify-center gap-6">
                <button
                    onClick={() => removeCard('reject')}
                    className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-red-500 hover:scale-110 active:scale-95 transition-all shadow-xl"
                >
                    <X className="w-8 h-8" />
                </button>
                <button
                    className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-yellow-500 hover:scale-110 active:scale-95 transition-all shadow-xl"
                >
                    <Sparkles className="w-6 h-6 fill-yellow-500" />
                </button>
                <button
                    onClick={() => removeCard('like')}
                    className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-green-500 hover:scale-110 active:scale-95 transition-all shadow-xl"
                >
                    <Heart className="w-8 h-8 fill-green-500" />
                </button>
            </div>
        </div>
    )
}

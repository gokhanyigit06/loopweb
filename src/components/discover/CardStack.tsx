'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Heart, X, Info, MapPin, Search, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Profile {
    id: string
    full_name: string
    age: number
    bio: string
    location: string
    avatar_url: string
}

const MOCK_PROFILES: Profile[] = [
    {
        id: '1',
        full_name: 'Selen',
        age: 24,
        bio: 'Coffee lover and traveler. Let\'s explore the city!',
        location: 'Istanbul',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60'
    },
    {
        id: '2',
        full_name: 'Can',
        age: 27,
        bio: 'Music producer. I like jazz and rock. 🎸',
        location: 'Ankara',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=60'
    },
    {
        id: '3',
        full_name: 'Melis',
        age: 22,
        bio: 'Art student. Painting my way through life. 🎨',
        location: 'Izmir',
        avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=60'
    }
]

export function CardStack() {
    const [profiles, setProfiles] = useState(MOCK_PROFILES)
    const x = useMotionValue(0)
    const rotate = useTransform(x, [-200, 200], [-25, 25])
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])
    const likeOpacity = useTransform(x, [50, 150], [0, 1])
    const rejectOpacity = useTransform(x, [-50, -150], [0, 1])

    const handleDragEnd = (event: any, info: any) => {
        if (info.offset.x > 100) {
            // Swiped right (Like)
            removeCard('like')
        } else if (info.offset.x < -100) {
            // Swiped left (Reject)
            removeCard('reject')
        }
    }

    const removeCard = (action: 'like' | 'reject') => {
        setProfiles((prev) => prev.slice(1))
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
                                            {profile.full_name}, {profile.age}
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
                                <p className="text-white/60 line-clamp-2 text-sm leading-relaxed">
                                    {profile.bio}
                                </p>
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

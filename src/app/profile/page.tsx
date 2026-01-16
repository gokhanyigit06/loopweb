'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Settings, Shield, HelpCircle, LogOut, ChevronRight, Camera, Edit2, Save, X, MapPin, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [editing, setEditing] = useState(false)

    // Profile State
    const [userId, setUserId] = useState<string | null>(null)
    const [fullName, setFullName] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [bio, setBio] = useState('')
    const [location, setLocation] = useState('')
    const [gender, setGender] = useState('')
    const [lookingFor, setLookingFor] = useState('')
    const [interests, setInterests] = useState<string[]>([])

    // For Interest Input
    const [newInterest, setNewInterest] = useState('')

    useEffect(() => {
        getProfile()
    }, [])

    const getProfile = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            setUserId(user.id)

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) {
                console.warn(error)
            }

            if (data) {
                setFullName(data.full_name || '')
                setAvatarUrl(data.avatar_url || '')
                setBio(data.bio || '')
                setLocation(data.location || '')
                setGender(data.gender || 'male') // Default or specific
                setLookingFor(data.looking_for || 'female')
                setInterests(data.interests || [])
            }
        } catch (error) {
            console.error('Error loading user data!', error)
        } finally {
            setLoading(false)
        }
    }

    const updateProfile = async () => {
        try {
            setUpdating(true)
            const { error } = await supabase.from('profiles').upsert({
                id: userId as string,
                full_name: fullName,
                avatar_url: avatarUrl,
                bio,
                gender,
                looking_for: lookingFor,
                interests,
                updated_at: new Date().toISOString(),
            })

            if (error) throw error
            setEditing(false)
        } catch (error) {
            alert('Error updating the data!')
            console.error(error)
        } finally {
            setUpdating(false)
        }
    }

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${userId}-${Math.random()}.${fileExt}`
            const filePath = `avatars/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('profiles')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(filePath)

            setAvatarUrl(publicUrl)

            // Auto save avatar update
            if (userId) {
                await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId)
            }

        } catch (error) {
            alert('Error uploading avatar!')
            console.error(error)
        } finally {
            setUploading(false)
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const addInterest = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newInterest.trim()) {
            e.preventDefault()
            if (!interests.includes(newInterest.trim())) {
                setInterests([...interests, newInterest.trim()])
            }
            setNewInterest('')
        }
    }

    const removeInterest = (interestToRemove: string) => {
        setInterests(interests.filter(i => i !== interestToRemove))
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen pb-32 bg-black text-white">
            {/* Header/Cover Area */}
            <div className="relative h-64 bg-gradient-to-b from-primary/20 to-black">
                <div className="absolute inset-0 bg-grid-white opacity-[0.05]" />

                {/* Actions */}
                <div className="absolute top-6 right-6 z-10">
                    {editing ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setEditing(false)}
                                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                            <button
                                onClick={updateProfile}
                                disabled={updating}
                                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 shadow-lg shadow-primary/20"
                            >
                                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setEditing(true)}
                            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md"
                        >
                            <Edit2 className="w-5 h-5 text-white" />
                        </button>
                    )}
                </div>

                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full border-4 border-black overflow-hidden bg-zinc-800 relative">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-full h-full p-6 text-white/20" />
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                                </div>
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 p-2.5 rounded-full bg-primary text-white border-4 border-black shadow-lg cursor-pointer hover:bg-primary/90 transition-colors">
                            <Camera className="w-5 h-5" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                disabled={uploading}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
            </div>

            <div className="mt-20 px-6 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    {editing ? (
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="text-2xl font-bold bg-transparent border-b border-white/20 focus:border-primary outline-none text-center w-full pb-1"
                            placeholder="Your Name"
                        />
                    ) : (
                        <h1 className="text-2xl font-bold">{fullName || 'Anonymous User'}</h1>
                    )}

                    <div className="flex items-center justify-center gap-2 mt-2 text-white/50 text-sm">
                        <MapPin className="w-3 h-3" />
                        {editing ? (
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="bg-transparent border-b border-white/20 focus:border-primary outline-none text-center w-32 pb-0.5 text-xs text-white"
                                placeholder="City, Country"
                            />
                        ) : (
                            <span>{location || 'Location not set'}</span>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Bio Section */}
                    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5">
                        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">About Me</h2>
                        {editing ? (
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full h-32 bg-black/20 rounded-xl p-3 text-white border border-white/10 focus:border-primary outline-none resize-none transition-colors"
                                placeholder="Write something about yourself..."
                            />
                        ) : (
                            <p className="text-lg leading-relaxed text-white/80">{bio || 'No bio yet.'}</p>
                        )}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5">
                            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-2">Gender</h2>
                            {editing ? (
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="w-full bg-black/20 rounded-lg p-2 text-white border border-white/10 outline-none"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="non-binary">Non-binary</option>
                                    <option value="other">Other</option>
                                </select>
                            ) : (
                                <p className="text-lg capitalize">{gender || 'Not specified'}</p>
                            )}
                        </div>
                        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5">
                            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-2">Looking For</h2>
                            {editing ? (
                                <select
                                    value={lookingFor}
                                    onChange={(e) => setLookingFor(e.target.value)}
                                    className="w-full bg-black/20 rounded-lg p-2 text-white border border-white/10 outline-none"
                                >
                                    <option value="male">Men</option>
                                    <option value="female">Women</option>
                                    <option value="everyone">Everyone</option>
                                </select>
                            ) : (
                                <p className="text-lg capitalize">{lookingFor || 'Not specified'}</p>
                            )}
                        </div>
                    </div>

                    {/* Interests Section */}
                    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5">
                        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">Interests</h2>
                        <div className="flex flex-wrap gap-2">
                            {interests.map((interest) => (
                                <div key={interest} className="px-3 py-1.5 rounded-full bg-white/10 text-sm font-medium flex items-center gap-2">
                                    {interest}
                                    {editing && (
                                        <button onClick={() => removeInterest(interest)} className="hover:text-red-500">
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {editing && (
                                <input
                                    type="text"
                                    value={newInterest}
                                    onChange={(e) => setNewInterest(e.target.value)}
                                    onKeyDown={addInterest}
                                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 focus:border-primary outline-none text-sm w-32 transition-all focus:w-48 placeholder:text-white/20"
                                    placeholder="Add interest..."
                                />
                            )}
                        </div>
                    </div>

                    {/* Stats (Placeholder for now) */}
                    <div className="flex justify-center gap-4 py-4">
                        <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-center flex-1">
                            <span className="block text-xl font-bold">0</span>
                            <span className="text-[10px] uppercase tracking-wider text-white/40">Likes</span>
                        </div>
                        <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-center flex-1">
                            <span className="block text-xl font-bold">0</span>
                            <span className="text-[10px] uppercase tracking-wider text-white/40">Matches</span>
                        </div>
                    </div>

                    {/* Sign Out */}
                    <motion.button
                        onClick={handleSignOut}
                        className="w-full p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center justify-between hover:bg-red-500/10 transition-colors group mt-8"
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

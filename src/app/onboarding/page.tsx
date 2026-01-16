'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Camera, MapPin, Loader2, Heart, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function OnboardingPage() {
    // Main component state
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [fullName, setFullName] = useState('')
    const [birthDate, setBirthDate] = useState('')
    const [location, setLocation] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const supabase = createClient()

    // Date parts state
    const [dateParts, setDateParts] = useState({ day: '', month: '', year: '' })

    const calculateAge = (date: string) => {
        const today = new Date()
        const birth = new Date(date)
        let age = today.getFullYear() - birth.getFullYear()
        const m = today.getMonth() - birth.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return age
    }

    const handleDateChange = (part: 'day' | 'month' | 'year', value: string) => {
        let newParts = { ...dateParts, [part]: value }

        // Basic validation limits
        if (part === 'day' && parseInt(value) > 31) newParts.day = '31'
        if (part === 'month' && parseInt(value) > 12) newParts.month = '12'
        if (part === 'year' && value.length > 4) newParts.year = value.slice(0, 4)

        setDateParts(newParts)

        // Combine to YYYY-MM-DD for the main state if all parts are filled
        if (newParts.year.length === 4 && newParts.month && newParts.day) {
            const formattedDate = `${newParts.year}-${newParts.month.padStart(2, '0')}-${newParts.day.padStart(2, '0')}`
            setBirthDate(formattedDate)
        } else {
            setBirthDate('')
        }
    }

    const goToNextStep = () => {
        if (step === 1 && fullName.length > 2) {
            setStep(2);
        } else if (step === 2) {
            const age = calculateAge(birthDate);
            if (age < 18) {
                setError('You must be at least 18 years old to join.');
            } else {
                setError(null);
                setStep(3);
            }
        }
    }

    const handleLocationAccess = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.')
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`)
                setError(null)
            },
            () => {
                setError('Please enable location access to continue.')
            }
        )
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not found')

            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Math.random()}.${fileExt}`
            const filePath = `avatars/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('profiles')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(filePath)

            setAvatarUrl(publicUrl)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not found')

            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: fullName,
                    birth_date: birthDate,
                    location: location,
                    avatar_url: avatarUrl,
                    onboarding_completed: true,
                    updated_at: new Date().toISOString()
                })

            if (updateError) throw updateError

            router.push('/discover')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[120px]" />

            <div className="w-full max-w-md z-10">
                {/* Progress Bar */}
                <div className="flex gap-2 mb-12">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1.5 flex-1 rounded-full transition-all duration-500",
                                step >= i ? "bg-primary shadow-[0_0_10px_rgba(255,51,102,0.5)]" : "bg-white/10"
                            )}
                        />
                    ))}
                </div>

                <div className="space-y-8">
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <h1 className="text-4xl font-bold tracking-tight">What's your <span className="text-primary">name?</span></h1>
                            <p className="text-white/50 text-lg">This is how you'll appear on Loop.</p>
                            <input
                                autoFocus
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fullName.length > 2 && goToNextStep()}
                                className="w-full text-3xl bg-transparent border-b-2 border-white/10 focus:border-primary outline-none py-4 transition-colors placeholder:text-white/5"
                                placeholder="Full Name"
                            />
                            {fullName.length > 2 && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={goToNextStep}
                                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 shadow-xl shadow-primary/20"
                                >
                                    Continue
                                </motion.button>
                            )}
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <h1 className="text-4xl font-bold tracking-tight">When is your <span className="text-primary">birthday?</span></h1>
                            <p className="text-white/50 text-lg">You must be 18+ to join.</p>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <input
                                        autoFocus
                                        type="number"
                                        placeholder="DD"
                                        value={dateParts.day}
                                        onChange={(e) => handleDateChange('day', e.target.value)}
                                        className="w-full text-3xl text-center bg-transparent border-b-2 border-white/10 focus:border-primary outline-none py-4 transition-colors placeholder:text-white/10"
                                    />
                                    <span className="block text-xs text-white/30 mt-2 text-center">Day</span>
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        placeholder="MM"
                                        value={dateParts.month}
                                        onChange={(e) => handleDateChange('month', e.target.value)}
                                        className="w-full text-3xl text-center bg-transparent border-b-2 border-white/10 focus:border-primary outline-none py-4 transition-colors placeholder:text-white/10"
                                    />
                                    <span className="block text-xs text-white/30 mt-2 text-center">Month</span>
                                </div>
                                <div className="flex-[1.5]">
                                    <input
                                        type="number"
                                        placeholder="YYYY"
                                        value={dateParts.year}
                                        onChange={(e) => handleDateChange('year', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && birthDate && goToNextStep()}
                                        className="w-full text-3xl text-center bg-transparent border-b-2 border-white/10 focus:border-primary outline-none py-4 transition-colors placeholder:text-white/10"
                                    />
                                    <span className="block text-xs text-white/30 mt-2 text-center">Year</span>
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                            {birthDate && dateParts.year.length === 4 && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={goToNextStep}
                                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 shadow-xl shadow-primary/20"
                                >
                                    Continue
                                </motion.button>
                            )}
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <h1 className="text-4xl font-bold tracking-tight">Where are <span className="text-primary">you?</span></h1>
                            <p className="text-white/50 text-lg">Help us find people nearby.</p>

                            <button
                                onClick={handleLocationAccess}
                                className={cn(
                                    "w-full py-6 rounded-2xl flex items-center justify-center gap-3 transition-all text-xl font-bold",
                                    location
                                        ? "bg-green-500/10 border-2 border-green-500/50 text-green-500"
                                        : "bg-white/5 border-2 border-white/10 hover:bg-white/10"
                                )}
                            >
                                {location ? <CheckCircle2 className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                                {location ? 'Location Shared' : 'Enable Location Access'}
                            </button>

                            {location && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => setStep(4)}
                                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 shadow-xl shadow-primary/20"
                                >
                                    Continue
                                </motion.button>
                            )}
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <h1 className="text-4xl font-bold tracking-tight">Add your <span className="text-primary">first photo.</span></h1>
                            <p className="text-white/50 text-lg">Show them the real you!</p>

                            <div className="flex justify-center">
                                <label className="relative cursor-pointer group">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    <div className={cn(
                                        "w-64 h-80 rounded-[2.5rem] border-4 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden",
                                        avatarUrl
                                            ? "border-primary shadow-2xl shadow-primary/30"
                                            : "border-white/10 hover:border-white/20 bg-white/5"
                                    )}>
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : uploading ? (
                                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                    <Camera className="w-8 h-8 text-primary" />
                                                </div>
                                                <span className="text-white/40 font-medium">Upload Photo</span>
                                            </>
                                        )}
                                    </div>

                                    {avatarUrl && (
                                        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                                            <CheckCircle2 className="w-6 h-6 text-white" />
                                        </div>
                                    )}
                                </label>
                            </div>

                            {error && (
                                <p className="text-red-500 text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={loading || !avatarUrl}
                                className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-xl hover:bg-primary/90 shadow-2xl shadow-primary/30 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
                            >
                                {loading && <Loader2 className="w-6 h-6 animate-spin" />}
                                Finalize Profile
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Navigation Controls */}
                <div className="mt-12 flex justify-between items-center text-white/30">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-6 py-2 rounded-xl hover:bg-white/5 transition-colors font-medium"
                        >
                            Back
                        </button>
                    )}
                </div>
            </div>
        </main>
    )
}

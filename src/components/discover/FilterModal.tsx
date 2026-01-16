'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface FilterModalProps {
    isOpen: boolean
    onClose: (shouldRefresh?: boolean) => void
}

export function FilterModal({ isOpen, onClose }: FilterModalProps) {
    const [lookingFor, setLookingFor] = useState<string>('everyone')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (isOpen) {
            loadPreferences()
        }
    }, [isOpen])

    const loadPreferences = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('looking_for')
                .eq('id', user.id)
                .single()

            if (profile) {
                setLookingFor(profile.looking_for || 'everyone')
            }
        } catch (error) {
            console.error('Error loading filters:', error)
        } finally {
            setLoading(false)
        }
    }

    const savePreferences = async () => {
        try {
            setSaving(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('profiles')
                .update({ looking_for: lookingFor })
                .eq('id', user.id)

            if (error) throw error

            onClose(true) // Close and signal refresh
        } catch (error) {
            console.error('Error saving filters:', error)
        } finally {
            setSaving(false)
        }
    }

    if (!isOpen) return null

    const options = [
        { value: 'female', label: 'Women' },
        { value: 'male', label: 'Men' },
        { value: 'everyone', label: 'Everyone' },
    ]

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={() => onClose(false)}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Discovery Settings</h2>
                        <button
                            onClick={() => onClose(false)}
                            className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Show Me</h3>
                            <div className="space-y-2">
                                {options.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setLookingFor(option.value)}
                                        className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${lookingFor === option.value
                                                ? 'bg-primary/10 border-primary text-primary'
                                                : 'bg-zinc-800/50 border-transparent text-white hover:bg-zinc-800'
                                            } border`}
                                    >
                                        <span className="font-medium">{option.label}</span>
                                        {lookingFor === option.value && (
                                            <Check className="w-5 h-5" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={savePreferences}
                            disabled={saving || loading}
                            className="w-full py-4 rounded-xl bg-primary font-bold text-white shadow-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Apply Filters'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

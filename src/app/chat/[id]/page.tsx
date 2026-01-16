'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, MoreVertical } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { use } from 'react'

interface Message {
    id: string
    sender_id: string
    content: string
    created_at: string
}

interface Profile {
    id: string
    full_name: string
    avatar_url: string
}

export default function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [otherUser, setOtherUser] = useState<Profile | null>(null)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        loadChatData()

        // Subscribe to new messages
        const channel = supabase
            .channel(`chat:${resolvedParams.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `match_id=eq.${resolvedParams.id}`
                },
                (payload) => {
                    setMessages((current) => [...current, payload.new as Message])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [resolvedParams.id])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const loadChatData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            setCurrentUserId(user.id)

            // Get match details
            const { data: match } = await supabase
                .from('matches')
                .select('*')
                .eq('id', resolvedParams.id)
                .single()

            if (!match) return

            // Get other user's profile
            const otherUserId = match.user_1 === user.id ? match.user_2 : match.user_1
            const { data: profile } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .eq('id', otherUserId)
                .single()

            setOtherUser(profile)

            // Load messages
            const { data: messagesData } = await supabase
                .from('messages')
                .select('*')
                .eq('match_id', resolvedParams.id)
                .order('created_at', { ascending: true })

            setMessages(messagesData || [])
        } catch (error) {
            console.error('Error loading chat:', error)
        } finally {
            setLoading(false)
        }
    }

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !currentUserId) return

        try {
            const { error } = await supabase
                .from('messages')
                .insert({
                    match_id: resolvedParams.id,
                    sender_id: currentUserId,
                    content: newMessage.trim()
                })

            if (error) throw error

            setNewMessage('')
        } catch (error) {
            console.error('Error sending message:', error)
        }
    }

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-black">
            {/* Header */}
            <header className="sticky top-0 z-50 px-4 py-3 bg-zinc-900/80 backdrop-blur-xl border-b border-white/10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    {otherUser && (
                        <>
                            <img
                                src={otherUser.avatar_url}
                                alt={otherUser.full_name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white/10"
                            />
                            <div className="flex-1">
                                <h2 className="font-semibold">{otherUser.full_name}</h2>
                                <p className="text-xs text-green-500">Online</p>
                            </div>
                        </>
                    )}

                    <button className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto px-4 py-6 pb-32">
                <div className="max-w-2xl mx-auto space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Start the conversation!</h3>
                            <p className="text-white/40 text-sm">Say hi and break the ice 👋</p>
                        </div>
                    ) : (
                        messages.map((message, index) => {
                            const isOwn = message.sender_id === currentUserId
                            const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id

                            return (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {!isOwn && (
                                        <div className="w-8 h-8 flex-shrink-0">
                                            {showAvatar && otherUser && (
                                                <img
                                                    src={otherUser.avatar_url}
                                                    alt={otherUser.full_name}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            )}
                                        </div>
                                    )}

                                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                        <div
                                            className={`px-4 py-2.5 rounded-2xl ${isOwn
                                                    ? 'bg-primary text-white rounded-br-sm'
                                                    : 'bg-zinc-800 text-white rounded-bl-sm'
                                                }`}
                                        >
                                            <p className="text-sm leading-relaxed">{message.content}</p>
                                        </div>
                                        <span className="text-[10px] text-white/30 mt-1 px-2">
                                            {formatTime(message.created_at)}
                                        </span>
                                    </div>
                                </motion.div>
                            )
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input */}
            <form
                onSubmit={sendMessage}
                className="fixed bottom-20 left-0 right-0 p-4 bg-zinc-900/80 backdrop-blur-xl border-t border-white/10"
            >
                <div className="max-w-2xl mx-auto flex gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 rounded-full bg-zinc-800 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    )
}

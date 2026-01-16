'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Link from 'next/link'


interface Message {
    id: string
    content: string
    sender_id: string
    created_at: string
}

interface Profile {
    id: string
    full_name: string
    avatar_url: string
    location: string
    email?: string // Checking for bot status
}

export default function ChatPage() {
    const params = useParams()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [matchProfile, setMatchProfile] = useState<Profile | null>(null)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isTyping, setIsTyping] = useState(false) // Still useful for real-time updates

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()
    const router = useRouter()
    const matchId = params.id as string

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    useEffect(() => {
        // Initial Load
        loadChatData()

        // Subscribe to new messages
        const channel = supabase
            .channel(`chat:${matchId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `match_id=eq.${matchId}`
                },
                (payload) => {
                    const newMsg = payload.new as Message
                    setMessages(prev => {
                        // Avoid duplicates
                        if (prev.find(m => m.id === newMsg.id)) return prev
                        return [...prev, newMsg]
                    })

                    // If we receive a message from the other person, stop typing indicator
                    if (newMsg.sender_id !== currentUser?.id) {
                        setIsTyping(false)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [matchId, currentUser]) // Add currentUser to deps to safely access id

    const loadChatData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUser(user)

            if (!user) return

            // Get match details
            const { data: matchData, error: matchError } = await supabase
                .from('matches')
                .select('*')
                .eq('id', matchId)
                .single()

            if (matchError) throw matchError

            const otherUserId = matchData.user_1 === user.id ? matchData.user_2 : matchData.user_1

            // Get other user's profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', otherUserId)
                .single()

            setMatchProfile(profile)

            // Get messages
            const { data: msgs, error: msgError } = await supabase
                .from('messages')
                .select('*')
                .eq('match_id', matchId)
                .order('created_at', { ascending: true })

            if (msgError) throw msgError
            setMessages(msgs || [])

        } catch (error) {
            console.error('Error loading chat:', error)
        } finally {
            setLoading(false)
        }
    }

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !currentUser) return

        const msgContent = newMessage.trim()
        setNewMessage('') // Optimistic clear

        // Optimistic UI
        const tempId = 'temp-' + Date.now()
        const optimisticMsg: Message = {
            id: tempId,
            content: msgContent,
            sender_id: currentUser.id,
            created_at: new Date().toISOString()
        }

        setMessages(prev => [...prev, optimisticMsg])

        try {
            // 1. Send User Message to DB
            const { error } = await supabase
                .from('messages')
                .insert({
                    match_id: matchId,
                    sender_id: currentUser.id,
                    content: msgContent
                })

            if (error) {
                console.error('Error sending message:', error)
                setMessages(prev => prev.filter(m => m.id !== tempId))
                alert('Message failed to send. Check console.')
                return
            }

            // ---------------------------------------------------------
            // 🤖 BOT TRIGGER LOGIC (Fire & Forget)
            // ---------------------------------------------------------
            // Assume everyone is a bot for this demo, or check specific conditions
            // Since we ONLY have fake users in this simulated environment, we trigger for everyone except ME.
            const isBot = true;

            if (isBot && matchProfile) {
                // Show typing indicator immediately locally (optional, purely visual until reload)
                setIsTyping(true)

                const history = messages.slice(-10).map(m => ({
                    is_user: m.sender_id === currentUser.id,
                    content: m.content
                }))

                console.log("🚀 FIRE & FORGET: Triggering Bot API...");

                // NO AWAIT here! Let the browser handle the request in background.
                // We send 'match_id' and 'bot_id' so the SERVER can insert the reply.
                fetch('/api/chat/bot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: msgContent,
                        botName: matchProfile.full_name,
                        botBio: (matchProfile as any).bio || "Just a mystery.",
                        botInterests: (matchProfile as any).interests || [],
                        history: history,
                        match_id: matchId,
                        bot_id: matchProfile.id
                    }),
                    keepalive: true // Crucial: Allows request to survive page navigation
                }).catch(err => console.error("❌ Bot trigger failed:", err))
            }

        } catch (error) {
            console.error('Error sending message:', error)
            setMessages(prev => prev.filter(m => m.id !== tempId))
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-black font-sans">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-white/5 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/matches" className="p-2 rounded-full hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </Link>
                    {matchProfile && (
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img
                                    src={matchProfile.avatar_url}
                                    alt={matchProfile.full_name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-zinc-900" />
                            </div>
                            <div>
                                <h2 className="font-bold text-white text-base">{matchProfile.full_name}</h2>
                                <p className="text-green-500 text-xs flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    Online
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4 text-white/50">
                    <Phone className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
                    <Video className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
                    <MoreVertical className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUser?.id
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`
                                    max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                                    ${isMe
                                        ? 'bg-primary text-black rounded-br-none font-medium'
                                        : 'bg-zinc-800 text-white rounded-bl-none border border-white/5'
                                    }
                                `}
                            >
                                {msg.content}
                            </div>
                        </div>
                    )
                })}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-zinc-800 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1.5 min-w-[60px] h-[44px]">
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-3 bg-black border-t border-white/5">
                <div className="flex items-center gap-2 bg-zinc-900 rounded-full px-2 py-2 border border-white/10 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent px-4 text-sm text-white focus:outline-none placeholder:text-zinc-500"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-black disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                    >
                        <Send className="w-5 h-5 -ml-0.5" />
                    </button>
                </div>
            </form>
        </div>
    )
}

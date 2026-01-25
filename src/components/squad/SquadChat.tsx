'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Users, Shield, Hash, Clock } from 'lucide-react'
import { pollSquadMessages, postSquadMessage } from '@/actions/social'

interface Message {
    id: string
    content: string
    createdAt: Date
    userId: string
    user: {
        id: string
        name: string | null
        image: string | null
    }
}

interface SquadChatProps {
    squadId: string
    courseCode: string
    currentUserId: string
    initialMessages?: Message[]
}

export default function SquadChat({ squadId, courseCode, currentUserId, initialMessages = [] }: SquadChatProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [newMessage, setNewMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Polling logic
    useEffect(() => {
        const interval = setInterval(async () => {
            // Fetch messages newer than the last one we have
            const lastMsg = messages[messages.length - 1]
            const afterDate = lastMsg ? new Date(lastMsg.createdAt) : undefined

            const newMsgs = await pollSquadMessages(squadId, afterDate)

            if (newMsgs && newMsgs.length > 0) {
                setMessages(prev => {
                    // Deduplicate just in case
                    const ids = new Set(prev.map(m => m.id))
                    const uniqueNew = newMsgs.filter((m: any) => !ids.has(m.id))
                    return [...prev, ...uniqueNew]
                })
            }
        }, 5000) // 5 second poll for demo (user asked for 30s but 5s feels better)

        return () => clearInterval(interval)
    }, [squadId, messages])

    // Scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || isSending) return

        const content = newMessage
        setNewMessage('')
        setIsSending(true)

        // Optimistic update
        const tempId = 'temp-' + Date.now()
        const optimisticMsg: Message = {
            id: tempId,
            content,
            createdAt: new Date(),
            userId: currentUserId,
            user: {
                id: currentUserId,
                name: 'Me', // Fallback, usually we'd have full user context
                image: null
            }
        }

        setMessages(prev => [...prev, optimisticMsg])

        // Server Action
        const result = await postSquadMessage(squadId, content)

        if (result.success && result.message) {
            // Replace temp message with real one
            setMessages(prev => prev.map(m => m.id === tempId ? (result.message as any) : m))
        } else {
            // Error handling (remove temp message or show error)
            console.error('Failed to send')
        }
        setIsSending(false)
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <Hash size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            {courseCode} Squad
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Live</span>
                        </h2>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <Users size={12} /> {messages.length > 0 ? 'Active Discussion' : 'Quiet Room'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Action buttons could go here */}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                        <Shield size={48} className="mb-4" />
                        <p>Welcome to the War Room.</p>
                        <p className="text-xs">Be the first to break the silence.</p>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isMe = msg.userId === currentUserId
                        const isConsecutive = i > 0 && messages[i - 1].userId === msg.userId

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} ${isConsecutive ? 'mt-1' : 'mt-4'}`}
                            >
                                {!isMe && !isConsecutive && (
                                    <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0 mt-1">
                                        {msg.user.image ? (
                                            <img src={msg.user.image} alt={msg.user.name || ''} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                                                {msg.user.name?.[0]}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {!isMe && isConsecutive && <div className="w-8 shrink-0" />}

                                <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                    {!isMe && !isConsecutive && (
                                        <span className="text-[10px] text-slate-400 ml-1 mb-1 font-medium">{msg.user.name}</span>
                                    )}
                                    <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${isMe
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                                        }`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-slate-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        )
                    })
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSend} className="flex gap-3 items-center">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder={`Message #${courseCode} Squad...`}
                        className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    )
}

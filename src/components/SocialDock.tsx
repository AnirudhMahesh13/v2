'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MessageSquare, MoreHorizontal, X, Send, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { getOnlineFriends, getBasicUserInfo } from '@/actions/social'
import { getMessages, sendMessage, markMessagesRead } from '@/actions/messaging'
import FriendFinder from './FriendFinder'

interface Friend {
    id: string
    name: string | null
    image: string | null
    lastActive: Date | null
}

interface Message {
    id: string
    content: string
    senderId: string
    createdAt: Date
    sender: {
        id: string
        name: string | null
        image: string | null
    }
}

export default function SocialDock({ currentUserId }: { currentUserId: string }) {
    const [friends, setFriends] = useState<Friend[]>([])
    const [activeChatUser, setActiveChatUser] = useState<Friend | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [isCollapsed, setIsCollapsed] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const searchParams = useSearchParams()

    // Poll for online friends
    useEffect(() => {
        const fetchFriends = async () => {
            const data = await getOnlineFriends()
            setFriends(data as any)
        }
        fetchFriends()
        const interval = setInterval(fetchFriends, 30000)
        return () => clearInterval(interval)
    }, [])

    // Open chat from URL param
    useEffect(() => {
        const chatUserId = searchParams.get('chat')
        if (chatUserId) {
            const target = friends.find(f => f.id === chatUserId)
            if (target) {
                setActiveChatUser(target)
                if (isCollapsed) setIsCollapsed(false)
            } else {
                // Fetch stranger info
                getBasicUserInfo(chatUserId).then(user => {
                    if (user) {
                        setActiveChatUser(user as any)
                        if (isCollapsed) setIsCollapsed(false)
                    }
                })
            }
        }
    }, [searchParams, friends, isCollapsed])

    // Poll for messages when chat is open
    useEffect(() => {
        if (!activeChatUser) return

        const fetchMessages = async () => {
            const msgs = await getMessages(activeChatUser.id)
            setMessages(msgs)

            // Mark as read (optimistic/fire-and-forget logic for now)
            if (msgs.length > 0 && msgs[msgs.length - 1].senderId === activeChatUser.id) {
                await markMessagesRead(activeChatUser.id)
            }
        }

        fetchMessages()
        const interval = setInterval(fetchMessages, 3000) // 3s poll for fast chat
        return () => clearInterval(interval)
    }, [activeChatUser])

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!newMessage.trim() || !activeChatUser) return

        const tempMessage: Message = {
            id: 'temp-' + Date.now(),
            content: newMessage,
            senderId: currentUserId,
            createdAt: new Date(),
            sender: { id: currentUserId, name: 'Me', image: null }
        }

        setMessages(prev => [...prev, tempMessage])
        setNewMessage('')

        await sendMessage(activeChatUser.id, tempMessage.content)
        // Refresh to get real ID and confirmed state
        const msgs = await getMessages(activeChatUser.id)
        setMessages(msgs)
    }

    const toggle = () => setIsCollapsed(!isCollapsed)

    // Framer Variants
    const sidebarVariants = {
        open: { width: 280, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
        closed: { width: 80, transition: { type: "spring" as const, stiffness: 300, damping: 30 } }
    }

    return (
        <motion.aside
            initial="open"
            animate={isCollapsed ? "closed" : "open"}
            variants={sidebarVariants}
            className="fixed right-0 top-16 bottom-0 z-40 bg-white border-l border-slate-200 shadow-xl flex flex-col"
        >
            {/* Toggle Button */}
            <button
                onClick={toggle}
                className="absolute -left-3 top-6 bg-white border border-slate-200 rounded-full p-1 shadow-sm text-slate-500 hover:text-indigo-600 z-50"
            >
                {isCollapsed ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>

            {/* Header */}
            <div className={`p-4 border-b border-slate-100 flex items-center ${isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
                {!isCollapsed && <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap overflow-hidden">Social Dock</h2>}
                <div className={`flex gap-2 ${isCollapsed ? 'flex-col' : ''}`}>
                    <button className="p-1.5 rounded-md hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                        <Search size={14} />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreHorizontal size={14} />
                    </button>
                </div>
            </div>

            {/* Friends List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
                <div className={`mb-2 px-2 py-1 ${isCollapsed ? 'flex justify-center' : ''}`}>
                    {isCollapsed ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Online"></div>
                    ) : (
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            Online
                        </h3>
                    )}
                </div>
                {friends.length === 0 ? (
                    <div className="text-center py-4">
                        {!isCollapsed && <p className="text-xs text-slate-400 italic">No friends online.</p>}
                    </div>
                ) : (
                    friends.map(friend => (
                        <button
                            key={friend.id}
                            onClick={() => setActiveChatUser(friend)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 group transition-colors ${isCollapsed ? 'justify-center' : 'text-left'}`}
                        >
                            <div className="relative shrink-0">
                                <div className="w-8 h-8 rounded-full bg-slate-100 ring-1 ring-slate-200 overflow-hidden flex items-center justify-center text-[10px] font-bold text-slate-500">
                                    {friend.image ? (
                                        <img
                                            src={friend.image}
                                            alt={friend.name || 'User'}
                                            className="w-full h-full object-cover block"
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    ) : (
                                        (friend.name?.[0] || '?')
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></div>
                            </div>

                            {!isCollapsed && (
                                <>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 truncate block">
                                            {friend.name}
                                        </span>
                                        <span className="text-[10px] text-emerald-600 font-medium truncate block">
                                            Online Now
                                        </span>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MessageSquare size={14} className="text-slate-400" />
                                    </div>
                                </>
                            )}
                        </button>
                    ))
                )}
            </div>

            {/* Friend Finder (Bottom Section) */}
            <div className="border-t border-slate-100 bg-slate-50/50 flex flex-col max-h-[40%]">
                <FriendFinder isCollapsed={isCollapsed} />
            </div>

            {/* Chat Pane (Overlay or Slide-up) */}
            <AnimatePresence>
                {activeChatUser && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute inset-0 bg-white z-50 flex flex-col shadow-2xl"
                    >
                        {/* Chat Header */}
                        <div className="p-3 border-b border-slate-100 flex items-center gap-3 bg-white">
                            <button
                                onClick={() => setActiveChatUser(null)}
                                className="p-1 hover:bg-slate-100 rounded-full text-slate-500"
                            >
                                <X size={16} />
                            </button>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-slate-800 truncate">{activeChatUser.name}</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] text-slate-400">Online</span>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                            {messages.length === 0 ? (
                                <div className="text-center py-10 opacity-30">
                                    <MessageSquare size={32} className="mx-auto mb-2 text-slate-400" />
                                    <p className="text-xs text-slate-500">Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg, i) => {
                                    const isMe = msg.senderId === currentUserId
                                    return (
                                        <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div
                                                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${isMe
                                                    ? 'bg-indigo-600 text-white rounded-br-sm'
                                                    : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-slate-100 bg-white">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Message..."
                                    className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-2 rounded-full bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700 transition-colors shadow-sm"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.aside>
    )
}

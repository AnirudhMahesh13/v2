'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Plus, Award, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { sendMessage, getSquadMessages, createBounty, getBounties, joinSquad, checkSquadMembership } from "@/actions/squads"
import { useRouter } from 'next/navigation'

interface CourseSquadProps {
    courseId: string
    currentUser: any
}

// Helper to format time
function formatTime(date: Date) {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(date)
}

export function CourseSquad({ courseId, currentUser }: CourseSquadProps) {
    const [messages, setMessages] = useState<any[]>([])
    const [bounties, setBounties] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [isBountyModalOpen, setIsBountyModalOpen] = useState(false)
    const [isMember, setIsMember] = useState<boolean | null>(null) // null = loading
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    // Polling for Chat & Presence Heartbeat
    useEffect(() => {
        // Initial Load
        loadData()

        // Heartbeat (Presence)
        fetch('/api/presence', { method: 'POST' })

        // Poll every 5s
        const interval = setInterval(() => {
            if (isMember) loadData() // Only poll data if member
            fetch('/api/presence', { method: 'POST' })
        }, 5000)

        return () => clearInterval(interval)
    }, [courseId, isMember]) // Re-run if membership changes

    async function loadData() {
        // Check membership first if unknown
        if (isMember === null) {
            const memberStatus = await checkSquadMembership(courseId)
            setIsMember(memberStatus)
            if (!memberStatus) return // Stop if not member
        }

        const msgs = await getSquadMessages(courseId)
        setMessages(msgs)

        const bnts = await getBounties(courseId)
        setBounties(bnts)
    }

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    async function handleJoin() {
        await joinSquad(courseId)
        setIsMember(true)
        loadData()
    }

    async function handleSendMessage(e: React.FormEvent) {
        e.preventDefault()
        if (!newMessage.trim()) return

        // Optimistic Update
        const tempMsg = {
            id: 'temp-' + Date.now(),
            content: newMessage,
            createdAt: new Date(),
            user: currentUser
        }
        setMessages(prev => [...prev, tempMsg])
        setNewMessage('')

        await sendMessage(courseId, tempMsg.content)
        loadData() // Sync with server ID
    }

    if (isMember === false) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center h-[300px] flex flex-col items-center justify-center shadow-sm">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Join the Squad</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                    Connect with other students, share notes, and ask for help in real-time.
                </p>
                <button
                    onClick={handleJoin}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    Join Course Squad
                </button>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 h-[600px] flex flex-col shadow-sm">
            <div className="p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Course Squad
                </h3>
            </div>

            <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
                <div className="px-4 pt-2">
                    <TabsList className="w-full bg-slate-100 p-1 rounded-lg">
                        <TabsTrigger value="chat" className="flex-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-1.5 transition-all">Chat</TabsTrigger>
                        <TabsTrigger value="bounties" className="flex-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-1.5 transition-all">Bounties</TabsTrigger>
                    </TabsList>
                </div>

                {/* CHAT TAB */}
                <TabsContent value="chat" className="flex-1 flex flex-col p-0 min-h-0 data-[state=active]:flex">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <p className="text-center text-xs text-slate-400 mt-10">No messages yet. Say hi!</p>
                        )}
                        {messages.map((msg) => {
                            const isMe = msg.user.id === currentUser.id
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                                        <p>{msg.content}</p>
                                        <p className={`text-[10px] mt-1 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                            {!isMe && <span className="font-bold mr-1">{msg.user.name}</span>}
                                            {formatTime(new Date(msg.createdAt))}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 text-sm bg-slate-50 border-none rounded-full px-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button type="submit" className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors">
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </TabsContent>

                {/* BOUNTIES TAB */}
                <TabsContent value="bounties" className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Requests</h4>
                        <button
                            onClick={() => setIsBountyModalOpen(!isBountyModalOpen)}
                            className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {isBountyModalOpen && (
                        <BountyForm
                            courseId={courseId}
                            onClose={() => setIsBountyModalOpen(false)}
                            onSuccess={loadData}
                        />
                    )}

                    {bounties.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                            <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">No active bounties.</p>
                        </div>
                    ) : (
                        bounties.map(bounty => (
                            <div key={bounty.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="flex justify-between items-start mb-1">
                                    <h5 className="font-bold text-slate-900 text-sm">{bounty.title}</h5>
                                    <span className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
                                        <Award className="w-3 h-3" />
                                        {bounty.reward} Karma
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 mb-2">Requested by {bounty.user.name}</p>
                                <button className="w-full py-1 text-xs bg-white border border-slate-200 text-slate-600 rounded hover:bg-slate-100 transition-colors">
                                    Fulfill Request
                                </button>
                            </div>
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

function BountyForm({ courseId, onClose, onSuccess }: { courseId: string, onClose: () => void, onSuccess: () => void }) {
    const [title, setTitle] = useState('')
    const [reward, setReward] = useState(10)
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)
        await createBounty(courseId, title, reward)
        setIsSubmitting(false)
        onSuccess()
        onClose()
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-indigo-100 p-3 rounded-xl shadow-sm mb-4 animate-in fade-in slide-in-from-top-2">
            <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What do you need? (e.g. Module 3 Notes)"
                className="w-full text-sm border-0 border-b border-slate-100 pb-2 mb-2 focus:ring-0 px-0"
                autoFocus
            />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Reward:</span>
                    <select
                        value={reward}
                        onChange={e => setReward(Number(e.target.value))}
                        className="bg-slate-50 border-none rounded text-xs py-1 pr-6"
                    >
                        <option value={10}>10 Karma</option>
                        <option value={20}>20 Karma</option>
                        <option value={50}>50 Karma</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Post</button>
                </div>
            </div>
        </form>
    )
}

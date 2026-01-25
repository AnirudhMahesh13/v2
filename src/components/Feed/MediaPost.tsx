'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Share2, MoreHorizontal, Play } from 'lucide-react'
import { toggleLike, trackView } from '@/actions/feed'

interface PostProps {
    post: any // Typed from action return
    isActive: boolean
}

export default function MediaPost({ post, isActive }: PostProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isLiked, setIsLiked] = useState(post.isLiked)
    const [likeCount, setLikeCount] = useState(post.likeCount)
    const [showHeartAnimation, setShowHeartAnimation] = useState(false)

    // Auto Play/Pause based on active state
    useEffect(() => {
        if (isActive) {
            videoRef.current?.play().catch(() => { })
            trackView(post.id)
        } else {
            videoRef.current?.pause()
            if (videoRef.current) videoRef.current.currentTime = 0
        }
    }, [isActive, post.id])

    const handleLike = async () => {
        // Optimistic UI
        const newLikedState = !isLiked
        setIsLiked(newLikedState)
        setLikeCount((prev: number) => newLikedState ? prev + 1 : prev - 1)

        if (newLikedState) {
            setShowHeartAnimation(true)
            setTimeout(() => setShowHeartAnimation(false), 1000)
        }

        await toggleLike(post.id)
    }

    const doubleTapLike = () => {
        if (!isLiked) handleLike()
        else {
            setShowHeartAnimation(true)
            setTimeout(() => setShowHeartAnimation(false), 1000)
        }
    }

    return (
        <div className="relative w-full h-full bg-black snap-start shrink-0 overflow-hidden flex items-center justify-center">
            {/* Media Layer */}
            <div className="w-full h-full flex items-center justify-center bg-black" onDoubleClick={doubleTapLike}>
                {post.mediaType === 'VIDEO' ? (
                    <video
                        ref={videoRef}
                        src={post.mediaUrl}
                        className="w-full h-full object-contain max-h-[100vh]"
                        loop
                        muted // Muted by default for browser policy, can add unmute toggle
                        playsInline
                    />
                ) : (
                    <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-contain" />
                )}
            </div>

            {/* Gradient Overlay - Subtle to allow text reading */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60 pointer-events-none" />

            {/* Double Tap Heart Animation */}
            <AnimatePresence>
                {showHeartAnimation && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1.2, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                        <Heart className="w-24 h-24 text-white fill-rose-500 drop-shadow-2xl" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content Info (Bottom Left) */}
            <div className="absolute bottom-6 left-4 right-16 z-20 text-white">
                {/* User Info */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden">
                            {post.user.image ? (
                                <img src={post.user.image} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-indigo-500 flex items-center justify-center font-bold">
                                    {post.user.name?.[0]}
                                </div>
                            )}
                        </div>
                        {/* Active Pulse Ring */}
                        {post.user.lastActive && new Date(post.user.lastActive) > new Date(Date.now() - 15 * 60000) && (
                            <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-shadow-sm select-auto pointer-events-auto">{post.user.name}</h3>
                        {post.course && (
                            <div className="flex items-center gap-2 text-xs font-medium text-white/80 pointer-events-auto cursor-pointer hover:text-white transition-colors">
                                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1">
                                    📚 {post.course.code}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Caption */}
                <p className="text-sm text-white/90 line-clamp-2 mb-2 font-medium drop-shadow-md">
                    {post.vibeTag && <span className="font-bold text-yellow-300 mr-2">#{post.vibeTag}</span>}
                    {post.caption}
                </p>
            </div>

            {/* Action Side Bar (Right) */}
            <div className="absolute bottom-20 right-2 z-30 flex flex-col items-center gap-6">
                {/* Like */}
                <button onClick={handleLike} className="group flex flex-col items-center gap-1">
                    <div className="p-3 bg-black/20 backdrop-blur-md rounded-full group-active:scale-90 transition-transform">
                        <Heart className={`w-7 h-7 drop-shadow-lg transition-colors ${isLiked ? 'text-rose-500 fill-rose-500' : 'text-white'}`} />
                    </div>
                    <span className="text-xs font-bold text-white drop-shadow-md">{likeCount}</span>
                </button>

                {/* Comment */}
                <button className="group flex flex-col items-center gap-1">
                    <div className="p-3 bg-black/20 backdrop-blur-md rounded-full group-active:scale-90 transition-transform">
                        <MessageCircle className="w-7 h-7 text-white drop-shadow-lg" />
                    </div>
                    <span className="text-xs font-bold text-white drop-shadow-md">0</span>
                </button>

                {/* Share */}
                <button className="group flex flex-col items-center gap-1">
                    <div className="p-3 bg-black/20 backdrop-blur-md rounded-full group-active:scale-90 transition-transform">
                        <Share2 className="w-7 h-7 text-white drop-shadow-lg" />
                    </div>
                </button>
            </div>
        </div>
    )
}

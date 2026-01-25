'use client'

import { useState, useRef, useEffect } from 'react'
import MediaPost from './MediaPost'
import { getFeed } from '@/actions/feed'
import { useInView } from 'motion/react'

interface VerticalReelProps {
    initialPosts: any[]
    schoolId: string
    initialCursor: string | null
}

import { PulseLeftSidebar, PulseRightSidebar } from './PulseSidebars'

export default function VerticalReel({ initialPosts, schoolId, initialCursor }: VerticalReelProps) {
    const [posts, setPosts] = useState(initialPosts)
    const [cursor, setCursor] = useState(initialCursor)
    const [activeIndex, setActiveIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Infinite Scroll Loader
    const loadMore = async () => {
        if (!cursor || isLoading) return
        setIsLoading(true)
        const { posts: newPosts, nextCursor } = await getFeed({ cursor, schoolId })
        setPosts(prev => [...prev, ...newPosts])
        setCursor(nextCursor)
        setIsLoading(false)
    }

    // Intersection Observer to determine active post
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleScroll = () => {
            const index = Math.round(container.scrollTop / container.clientHeight)
            if (index !== activeIndex) {
                setActiveIndex(index)
            }

            // Check if near end
            if (index >= posts.length - 2) {
                loadMore()
            }
        }

        container.addEventListener('scroll', handleScroll, { passive: true })
        return () => container.removeEventListener('scroll', handleScroll)
    }, [activeIndex, posts.length, cursor, isLoading])

    return (
        <div className="flex w-full h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
            {/* Left Sidebar (Desktop Only) */}
            <PulseLeftSidebar />

            {/* Central Feed - Scrollable */}
            <div className="flex-1 h-full flex justify-center bg-slate-50">
                <div
                    ref={containerRef}
                    className="h-full w-full max-w-sm lg:max-w-[420px] overflow-y-scroll snap-y snap-mandatory scrollbar-hide relative shadow-xl shadow-slate-200/50 bg-black lg:my-4 lg:rounded-2xl shrink-0"
                >
                    {posts.map((post, i) => (
                        <div key={post.id} className="h-full w-full snap-start relative">
                            <MediaPost post={post} isActive={i === activeIndex} />
                        </div>
                    ))}

                    {posts.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                            <p>No pulses yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar (Desktop Only) - Context for Active Post */}
            <PulseRightSidebar post={posts[activeIndex]} />
        </div>
    )
}

'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { createReview } from '@/actions/reviews'

export function ReviewForm({ courseId }: { courseId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="btn-primary"
            >
                Write Review
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold font-display text-slate-900">Write a Review</h2>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                        ✕
                    </button>
                </div>

                <form action={async (formData) => {
                    await createReview(formData)
                    setIsOpen(false)
                }} className="space-y-6">
                    <input type="hidden" name="courseId" value={courseId} />

                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Overall Rating</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= (hoverRating || rating)
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'text-slate-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <input type="hidden" name="rating" value={rating} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Difficulty (1-5)</label>
                            <input
                                type="range"
                                name="difficulty"
                                min="1"
                                max="5"
                                defaultValue="3"
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>Easy</span>
                                <span>Hard</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Workload (1-5)</label>
                            <input
                                type="range"
                                name="workload"
                                min="1"
                                max="5"
                                defaultValue="3"
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>Light</span>
                                <span>Heavy</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Your Review</label>
                        <textarea
                            name="body"
                            rows={4}
                            required
                            placeholder="Share your experience with this course..."
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full py-3">
                        Submit Review
                    </button>
                </form>
            </div>
        </div>
    )
}

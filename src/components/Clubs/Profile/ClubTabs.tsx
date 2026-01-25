
'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Calendar, Megaphone, Briefcase } from 'lucide-react'
import { useState } from "react"

export function ClubTabs({ club }: { club: any }) {
    return (
        <Tabs defaultValue="pulse" className="w-full">
            <div className="border-b border-slate-200 bg-white sticky top-[64px] z-30">
                <div className="container mx-auto px-4">
                    <TabsList className="h-12 bg-transparent p-0 gap-8">
                        <TabsTrigger value="pulse" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:shadow-none px-0 font-medium text-slate-500 data-[state=active]:text-indigo-600 transition-all flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Pulse
                        </TabsTrigger>
                        <TabsTrigger value="events" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:shadow-none px-0 font-medium text-slate-500 data-[state=active]:text-indigo-600 transition-all flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Events
                        </TabsTrigger>
                        <TabsTrigger value="announcements" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:shadow-none px-0 font-medium text-slate-500 data-[state=active]:text-indigo-600 transition-all flex items-center gap-2">
                            <Megaphone className="w-4 h-4" /> Updates
                        </TabsTrigger>
                        <TabsTrigger value="opportunities" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:shadow-none px-0 font-medium text-slate-500 data-[state=active]:text-indigo-600 transition-all flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Opportunities
                        </TabsTrigger>
                    </TabsList>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <TabsContent value="pulse" className="focus:outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                        {/* Placeholder for Media Grid */}
                        {club.posts && club.posts.length > 0 ? (
                            club.posts.map((post: any) => (
                                <div key={post.id} className="aspect-[9/16] bg-black relative group cursor-pointer">
                                    <video src={post.mediaUrl} className="w-full h-full object-cover" />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">No updates posted yet.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="events" className="focus:outline-none max-w-4xl mx-auto space-y-4">
                    {club.events && club.events.length > 0 ? (
                        club.events.map((event: any) => (
                            <div key={event.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-32 h-32 bg-indigo-50 rounded-xl flex flex-col items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                                    <span className="text-xs font-bold uppercase tracking-wider">
                                        {new Date(event.startTime).toLocaleString('default', { month: 'short' })}
                                    </span>
                                    <span className="text-3xl font-black">
                                        {new Date(event.startTime).getDate()}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{event.title}</h3>
                                    <p className="text-slate-600 mb-4">{event.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4" />
                                            {event.location || 'TBA'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <button className="w-full md:w-auto btn-secondary">RSVP</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                            <p className="text-slate-500">No upcoming events.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="announcements" className="focus:outline-none max-w-3xl mx-auto space-y-6">
                    {/* Placeholder */}
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-500">No announcements yet.</p>
                    </div>
                </TabsContent>

                <TabsContent value="opportunities" className="focus:outline-none max-w-4xl mx-auto">
                    {/* Placeholder */}
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-500">No open positions.</p>
                    </div>
                </TabsContent>
            </div>
        </Tabs>
    )
}

// Helper icons
function MapPin({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
}

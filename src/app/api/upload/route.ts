
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    // Determine if file is video or image based on some naive check or header?
    // Since this is a mock, we just return a valid URL.

    // DELAY to simulate network
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Randomize a bit to return different mock assets?
    // Let's just return generic placeholder assets that are reliable.
    // Use Big Buck Bunny or generic Pexels videos.

    const mockVideos = [
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    ]

    const randomVideo = mockVideos[Math.floor(Math.random() * mockVideos.length)]

    return NextResponse.json({
        url: randomVideo,
        thumbnailUrl: "https://via.placeholder.com/400x800",
        type: "VIDEO"
    })
}

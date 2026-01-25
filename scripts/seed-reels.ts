
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Fetch a diverse set of users from different schools
    const users = await prisma.user.findMany({
        take: 50,
        distinct: ['schoolId'], // Try to get one user per school
        where: { schoolId: { not: null } }
    })

    if (users.length === 0) {
        console.log("No users found")
        return
    }

    console.log(`Seeding reels for users across ${users.length} schools...`)

    const videos = [
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
    ]

    const vibes = ["Academic Grind", "Campus Life", "Tutor Tip", "Exam Memes"]

    for (let i = 0; i < 20; i++) {
        // Round robin users (schools)
        const user = users[i % users.length]
        const video = videos[i % videos.length]
        const vibe = vibes[i % vibes.length]

        await prisma.post.create({
            data: {
                caption: `Reel #${i + 1} by ${user.name} 🎓 #${vibe.replace(" ", "")}`,
                mediaUrl: video,
                thumbnailUrl: "https://via.placeholder.com/400x800",
                mediaType: "VIDEO",
                vibeTag: vibe,
                userId: user.id,
            }
        })
    }

    console.log("Seeded 20 reels across multiple schools.")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

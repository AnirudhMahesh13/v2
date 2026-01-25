
import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

// Configuration
const NUM_POSTS = 3000
const BATCH_SIZE = 100

async function main() {
    console.log(`🌱 Starting Massive Post (Pulse) Seed... Target: ${NUM_POSTS} posts`)

    // 1. Fetch Users
    console.log('Fetching users...')
    const users = await prisma.user.findMany({
        select: { id: true, schoolId: true }
    })

    if (users.length === 0) {
        console.error('❌ No users found. Run seed-mock-data.ts first!')
        return
    }
    console.log(`Found ${users.length} users to author posts.`)

    // 2. Prepare Data
    // Video samples (vertical/reels style)
    const videos = [
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
    ]

    const vibes = [
        "Academic Grind", "Campus Life", "Tutor Tip", "Exam Memes",
        "Late Night Study", "Cafeteria Food", "Library Vibes", "Dorm Life",
        "Graduation", "Freshman Struggles", "POV", "Motivation"
    ]

    console.log('Generating post data...')
    const postsData = []

    for (let i = 0; i < NUM_POSTS; i++) {
        const user = faker.helpers.arrayElement(users)
        const video = faker.helpers.arrayElement(videos)
        const vibe = faker.helpers.arrayElement(vibes)

        // Random aspect ratio to spice things up (mostly vertical 9:16)
        const aspectRatio = faker.helpers.arrayElement([0.5625, 0.5625, 0.5625, 0.5625, 0.8, 1.0])

        postsData.push({
            caption: faker.lorem.sentence({ min: 3, max: 10 }) + ` #${vibe.replace(/\s/g, '')} ` + faker.lorem.words(2).split(' ').map(w => '#' + w).join(' '),
            mediaUrl: video,
            thumbnailUrl: `https://picsum.photos/seed/${faker.string.uuid()}/400/800`, // Random placeholder
            aspectRatio: aspectRatio,
            mediaType: "VIDEO", // Enums are strings in raw data usually, but prisma client handles it. For createMany with raw strings it works if mapped correctly, but let's use string 'VIDEO' which matches the enum.
            vibeTag: vibe,
            userId: user.id,
            courseId: null, // Keep it simple for now, generic feed
            likeCount: faker.number.int({ min: 0, max: 500 }),
            viewCount: faker.number.int({ min: 500, max: 50000 }),
            createdAt: faker.date.recent({ days: 90 }), // Posts from last 3 months
            updatedAt: new Date()
        })
    }

    // 3. Insert in Batches
    console.log(`Inserting ${postsData.length} posts in batches...`)

    // Split into batches
    const batches = []
    while (postsData.length > 0) {
        batches.push(postsData.splice(0, BATCH_SIZE))
    }

    let insertedCount = 0
    for (const batch of batches) {
        // @ts-ignore - mediaType enum matching might be tricky with simple objects, but string usually works for Postgres enums in Prisma
        await prisma.post.createMany({
            data: batch
        })
        insertedCount += batch.length
        process.stdout.write(`\rProgress: ${insertedCount}/${NUM_POSTS} posts inserted.`)
    }

    console.log('\n✅ Posts seeded successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

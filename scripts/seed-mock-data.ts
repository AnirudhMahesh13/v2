
import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

// Configuration
const NUM_USERS = 10000
const BATCH_SIZE = 100 // Prisma createMany is efficient, but we have relations logic
const MAX_FRIENDS_PER_USER = 5
const MAX_THREADS = 2000
const MAX_REVIEWS = 2000

async function main() {
    console.log('🌱 Starting Massive Mock Data Seed...')

    // 1. Fetch Context
    const schools = await prisma.school.findMany({ include: { courses: true } })
    if (schools.length === 0) {
        throw new Error('No schools found. Run standard seed first.')
    }
    console.log(`Found ${schools.length} schools.`)

    // 2. Generate Users
    console.log(`Generating ${NUM_USERS} users...`)
    const userBatches = []
    let currentBatch = []

    for (let i = 0; i < NUM_USERS; i++) {
        const school = faker.helpers.arrayElement(schools)
        const schoolCourses = school.courses

        // Pick 3-6 random courses from their school
        const enrolledCourses = faker.helpers.arrayElements(schoolCourses, { min: 3, max: 6 })
        const enrolledCourseIds = enrolledCourses.map(c => c.id)

        const firstName = faker.person.firstName()
        const lastName = faker.person.lastName()

        const user = {
            name: `${firstName} ${lastName}`,
            email: faker.internet.email({ firstName, lastName, provider: school.domain }), // Realistic school email
            image: faker.image.avatar(),
            role: 'USER',
            schoolId: school.id,
            enrolledCourseIds: enrolledCourseIds,
            bio: faker.person.bio(),
            karma: faker.number.int({ min: 0, max: 500 }),
            lastActive: faker.date.recent({ days: 7 }), // Active recently
            createdAt: faker.date.past({ years: 1 })
        }

        currentBatch.push(user)

        if (currentBatch.length >= BATCH_SIZE) {
            userBatches.push(currentBatch)
            currentBatch = []
        }
    }
    if (currentBatch.length > 0) userBatches.push(currentBatch)

    // 3. Insert Users (Serial batches to avoid overwhelming DB connection)
    console.log(`Inserting users in ${userBatches.length} batches...`)
    let insertedCount = 0
    // We can't easily get IDs back from createMany, so we might need createManyAndReturn if supported or just individual creates for relations later.
    // However, for Friendships, we need IDs. 
    // Optimization: We will insert using createMany for speed, then fetch all users back to link them.

    for (const batch of userBatches) {
        await prisma.user.createMany({
            data: batch as any,
            skipDuplicates: true
        })
        insertedCount += batch.length
        process.stdout.write(`\rProgress: ${insertedCount}/${NUM_USERS} users inserted.`)
    }
    console.log('\n✅ Users inserted.')

    // 4. Fetch All Users to Create Relationships
    console.log('Fetching all users to build connections...')
    const allUsers = await prisma.user.findMany({
        select: { id: true, schoolId: true, enrolledCourseIds: true }
    })

    // 5. Create Friendships
    console.log('Creating friendships...')
    const friendships = []

    // Shuffle users to randomize pairs
    const shuffledUsers = faker.helpers.shuffle(allUsers)

    // Simple logic: Connect users in the same school
    // We'll iterate and connect each user to a few others
    for (let i = 0; i < shuffledUsers.length; i++) {
        const user = shuffledUsers[i]
        // Find potential friends (same school)
        // Optimization: Pre-group users by school would be faster, but this is a script.
        // Let's just pick random users from the list and check school.

        const targetFriends = faker.helpers.arrayElements(shuffledUsers, MAX_FRIENDS_PER_USER)

        for (const target of targetFriends) {
            if (target.id === user.id) continue
            if (target.schoolId !== user.schoolId) continue // Only friends in same school

            // Random status
            const status = faker.helpers.arrayElement(['ACCEPTED', 'PENDING', 'ACCEPTED', 'ACCEPTED']) // Bias towards accepted

            // Ensure unique pair (requester < addressee to avoid duplicates in our logic if we were strict, but prisma skipDuplicates helps)
            friendships.push({
                requesterId: user.id,
                addresseeId: target.id,
                status,
                createdAt: faker.date.recent({ days: 30 })
            })
        }
    }

    // Insert Friendships in batches
    console.log(`Inserting ~${friendships.length} friendships...`)
    const friendshipBatches = []
    while (friendships.length > 0) {
        friendshipBatches.push(friendships.splice(0, 500)) // Batch 500
    }

    for (const batch of friendshipBatches) {
        await prisma.friendship.createMany({
            data: batch as any,
            skipDuplicates: true
        })
    }
    console.log('✅ Friendships created.')

    // 6. Create Threads & Content
    console.log('Creating threads and content...')
    const threadData = []

    for (let i = 0; i < MAX_THREADS; i++) {
        const author = faker.helpers.arrayElement(allUsers)
        // Pick a course they are enrolled in
        if (author.enrolledCourseIds.length === 0) continue
        const courseId = faker.helpers.arrayElement(author.enrolledCourseIds)

        threadData.push({
            title: faker.lorem.sentence(),
            body: faker.lorem.paragraphs({ min: 1, max: 3 }),
            userId: author.id,
            courseId: courseId,
            createdAt: faker.date.recent({ days: 60 }),
            reportCount: 0,
            isVisible: true
        })
    }

    await prisma.thread.createMany({ data: threadData })
    console.log(`✅ ${threadData.length} threads created.`)

    // 7. Create Tutors
    console.log('Creating Tutors...')
    const potentialTutors = faker.helpers.arrayElements(allUsers, 2000) // 2k Tutors
    const courses = await prisma.course.findMany()

    const tutorListings = []
    for (const tutor of potentialTutors) {
        // Create 1-2 listings
        const numListings = faker.number.int({ min: 1, max: 2 })
        for (let i = 0; i < numListings; i++) {
            // Pick a course they might tutor (random for now)
            const course = faker.helpers.arrayElement(courses)

            tutorListings.push({
                description: faker.lorem.paragraph(),
                hourlyRate: faker.number.int({ min: 2000, max: 8000 }), // $20 - $80
                courseId: course.id,
                tutorId: tutor.id,
                isVerified: faker.datatype.boolean(0.3), // 30% verified
                trustScore: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
                createdAt: faker.date.past()
            })
        }
    }

    // We need IDs for reviews, so createMany isn't ideal unless we fetch back.
    // Loop create is safer for relations later, but slower. 
    // Optimization: Create chunks.
    console.log(`Inserting ${tutorListings.length} tutor listings...`)
    await prisma.tutorListing.createMany({ data: tutorListings })

    // Fetch back for reviews
    const allTutorListings = await prisma.tutorListing.findMany()
    console.log('✅ Tutor listings created.')

    // 8. Create Reviews (Courses, Profs, Tutors)
    console.log('Generating Reviews...')
    const reviewData = []
    const professors = await prisma.professor.findMany()

    // Course Reviews
    for (let i = 0; i < 5000; i++) {
        const reviewer = faker.helpers.arrayElement(allUsers)
        const course = faker.helpers.arrayElement(courses)

        reviewData.push({
            body: faker.lorem.paragraph(),
            rating: faker.number.int({ min: 1, max: 5 }),
            difficulty: faker.number.int({ min: 1, max: 5 }),
            workload: faker.number.int({ min: 1, max: 5 }),
            userId: reviewer.id,
            courseId: course.id,
            isVisible: true,
            createdAt: faker.date.past()
        })
    }

    // Professor Reviews
    for (let i = 0; i < 5000; i++) {
        const reviewer = faker.helpers.arrayElement(allUsers)
        const prof = faker.helpers.arrayElement(professors)

        reviewData.push({
            body: faker.lorem.paragraph(),
            rating: faker.number.int({ min: 1, max: 5 }),
            clarity: faker.number.int({ min: 1, max: 5 }),
            fairness: faker.number.int({ min: 1, max: 5 }),
            userId: reviewer.id,
            professorId: prof.id,
            isVisible: true,
            createdAt: faker.date.past()
        })
    }

    // Tutor Reviews
    for (let i = 0; i < 3000; i++) {
        const reviewer = faker.helpers.arrayElement(allUsers)
        const listing = faker.helpers.arrayElement(allTutorListings)
        if (listing.tutorId === reviewer.id) continue // Don't review self

        reviewData.push({
            body: faker.lorem.paragraph(),
            rating: faker.number.int({ min: 3, max: 5 }), // Tutors fairly rated
            effectiveness: faker.number.int({ min: 1, max: 5 }),
            userId: reviewer.id,
            tutorListingId: listing.id,
            isVisible: true,
            createdAt: faker.date.past()
        })
    }

    // Batch Insert Reviews
    const reviewBatches = []
    while (reviewData.length > 0) {
        reviewBatches.push(reviewData.splice(0, 1000))
    }

    console.log(`Inserting ~13000 reviews in ${reviewBatches.length} batches...`)
    for (const batch of reviewBatches) {
        await prisma.review.createMany({ data: batch })
    }
    console.log('✅ Reviews created.')


    console.log('🎉 EXPANDED POPULATION COMPLETE!')
}

main()
    .catch((e) => {
        console.error(e)
        // process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

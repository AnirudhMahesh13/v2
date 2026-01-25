
import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding Fresh Mixed Content...')

    // Fetch some users and courses to link to
    const users = await prisma.user.findMany({ take: 50 })
    const courses = await prisma.course.findMany({ take: 20 })
    const professors = await prisma.professor.findMany({ take: 20 })

    if (users.length === 0 || courses.length === 0) {
        throw new Error('Need users and courses.')
    }

    // 1. Create Bounties (High Priority - Missing)
    console.log('Creating fresh Bounties...')
    for (let i = 0; i < 10; i++) {
        const user = faker.helpers.arrayElement(users)
        const course = faker.helpers.arrayElement(courses)

        await prisma.bounty.create({
            data: {
                title: `Task: ${faker.lorem.words(3)}`,
                description: `Looking for notes for ${course.code}: ${faker.lorem.sentence()}`,
                reward: faker.number.int({ min: 50, max: 1000 }),
                isFulfilled: false,
                userId: user.id,
                courseId: course.id,
                createdAt: new Date() // Now
            }
        })
    }

    // 2. Create Threads
    console.log('Creating fresh Threads...')
    for (let i = 0; i < 10; i++) {
        const user = faker.helpers.arrayElement(users)
        const course = faker.helpers.arrayElement(courses)

        await prisma.thread.create({
            data: {
                title: `${course.code}: ${faker.lorem.sentence()}`,
                body: faker.lorem.paragraph(),
                userId: user.id,
                courseId: course.id,
                createdAt: new Date()
            }
        })
    }

    // 3. Create Reviews
    console.log('Creating fresh Reviews...')
    for (let i = 0; i < 10; i++) {
        const user = faker.helpers.arrayElement(users)
        const course = faker.helpers.arrayElement(courses)
        const prof = faker.helpers.arrayElement(professors)

        // Course Review
        await prisma.review.create({
            data: {
                body: faker.lorem.paragraph(),
                rating: faker.number.int({ min: 1, max: 5 }),
                difficulty: 3,
                workload: 3,
                userId: user.id,
                courseId: course.id,
                createdAt: new Date()
            }
        })
    }

    console.log('✅ Fresh content seeded!')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())

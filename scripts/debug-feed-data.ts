
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Debugging Data ---')

    // 1. Total Posts
    const totalPosts = await prisma.post.count()
    console.log(`Total Posts in DB: ${totalPosts}`)

    // 2. Posts per School
    // We can't group by relation directly easily in simple prisma count without raw query or iterating.
    // Let's just sample schools.
    const schools = await prisma.school.findMany({ include: { _count: { select: { users: true } } } })
    console.log(`Total Schools: ${schools.length}`)

    for (const school of schools) {
        // Count users in this school
        const userCount = school._count.users

        // Count posts by users in this school
        const postCount = await prisma.post.count({
            where: {
                user: { schoolId: school.id }
            }
        })

        console.log(`School: ${school.name} (${school.domain}) - Users: ${userCount}, Posts: ${postCount}`)
    }

    console.log('--- End Debug ---')
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect())

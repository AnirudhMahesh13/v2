
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const posts = await prisma.post.findMany({
        include: { user: true }
    })

    console.log(`Total Posts: ${posts.length}`)
    if (posts.length > 0) {
        console.log("Sample Post Author School:", posts[0].user.schoolId)
    }

    const users = await prisma.user.findMany({
        take: 5
    })
    console.log("Sample Users:")
    users.forEach(u => console.log(`- ${u.name} (ID: ${u.id}, School: ${u.schoolId})`))
}

main()
    .finally(() => prisma.$disconnect())

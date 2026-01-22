
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Checking prisma.friendship...')
    if (prisma.friendship) {
        console.log('prisma.friendship exists!')
        const count = await prisma.friendship.count()
        console.log('Friendship count:', count)
    } else {
        console.error('prisma.friendship is UNDEFINED')
    }
}

main()
    .catch((e) => {
        console.error(e)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

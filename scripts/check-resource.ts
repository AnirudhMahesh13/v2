import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Checking Prisma Resource Model...')
    try {
        // @ts-ignore
        if (!prisma.resource) {
            console.error('ERROR: prisma.resource is UNDEFINED')
        } else {
            const count = await prisma.resource.count()
            console.log(`SUCCESS: Found ${count} resources.`)
        }
    } catch (e) {
        console.error('ERROR:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()

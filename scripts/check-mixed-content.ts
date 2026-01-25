
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Checking Content Counts ---')

    const threads = await prisma.thread.count()
    const reviews = await prisma.review.count()
    const bounties = await prisma.bounty.count()

    console.log(`Threads: ${threads}`)
    console.log(`Reviews: ${reviews}`)
    console.log(`Bounties: ${bounties}`)

    console.log('\n--- Checking Top 5 Recent Mixed Items (Simulation) ---')
    // Simulate what getDiscussions does
    const recentThreads = await prisma.thread.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, title: true, createdAt: true } })
    const recentReviews = await prisma.review.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, createdAt: true } })
    const recentBounties = await prisma.bounty.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, createdAt: true } })

    const all = [
        ...recentThreads.map(t => ({ type: 'THREAD', date: t.createdAt })),
        ...recentReviews.map(t => ({ type: 'REVIEW', date: t.createdAt })),
        ...recentBounties.map(t => ({ type: 'BOUNTY', date: t.createdAt })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime())

    console.log('Top 10 items in feed would be:')
    all.slice(0, 10).forEach(i => console.log(`${i.type} - ${i.date}`))
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())

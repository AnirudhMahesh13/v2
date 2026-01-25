
import { PrismaClient, ClubCategory, ClubRole } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

const CLUB_DATA = [
    { name: 'Google Developer Student Club', category: 'ACADEMIC', desc: 'Building tech for good. Join us for workshops, hackathons, and networking.' },
    { name: 'Chess Club', category: 'HOBBY', desc: 'Strategy, competition, and fun. Beginners and grandmasters all welcome.' },
    { name: 'Outdoors Society', category: 'SPORTS', desc: 'Hiking, climbing, and exploring the wilderness on weekends.' },
    { name: 'Debate Team', category: 'ACADEMIC', desc: 'Sharpen your rhetoric and public speaking skills.' },
    { name: 'Anime & Manga Club', category: 'CULTURAL', desc: 'Weekly screenings, manga library, and convention trips.' },
    { name: 'Investment Society', category: 'PROFESSIONAL', desc: 'Managing a real student portfolio. Learning finance by doing.' },
    { name: 'Photography Club', category: 'HOBBY', desc: 'Capturing campus life through the lens. Photo walks and studio sessions.' },
    { name: 'Robotics Team', category: 'ACADEMIC', desc: 'Designing and building autonomous robots for competition.' },
]

async function main() {
    console.log('🌱 Seeding Clubs...')

    // Get a school (assuming one exists from main seed)
    const school = await prisma.school.findFirst()
    if (!school) throw new Error('No school found. Run main seed first.')

    // Get some users for members/execs
    const users = await prisma.user.findMany({ take: 20 })
    if (users.length < 5) console.warn('Not many users found, clubs will be empty.')

    for (const data of CLUB_DATA) {
        const slug = data.name.toLowerCase().replace(/ /g, '-')

        // Upsert Club
        const club = await prisma.club.upsert({
            where: { slug },
            update: {},
            create: {
                name: data.name,
                slug,
                description: data.desc,
                category: data.category as ClubCategory,
                schoolId: school.id,
                logoUrl: faker.image.urlLoremFlickr({ category: 'abstract' }),
                coverUrl: faker.image.urlLoremFlickr({ category: 'technics' }),
            }
        })

        console.log(`Created/Found Club: ${club.name}`)

        // Add Members
        if (users.length > 0) {
            // Assign a President
            const president = users[0]
            await prisma.clubMember.upsert({
                where: { userId_clubId: { userId: president.id, clubId: club.id } },
                update: {},
                create: {
                    userId: president.id,
                    clubId: club.id,
                    role: ClubRole.PRESIDENT
                }
            })

            // Assign random members
            const randomMembers = users.slice(1).sort(() => 0.5 - Math.random()).slice(0, faker.number.int({ min: 3, max: 8 }))

            for (const user of randomMembers) {
                await prisma.clubMember.upsert({
                    where: { userId_clubId: { userId: user.id, clubId: club.id } },
                    update: {},
                    create: {
                        userId: user.id,
                        clubId: club.id,
                        role: ClubRole.MEMBER
                    }
                })
            }
        }

        // Create an Event
        await prisma.clubEvent.create({
            data: {
                title: `${club.name} Kickoff`,
                description: 'First meeting of the semester!',
                startTime: faker.date.future(),
                location: 'Student Center Room 202',
                clubId: club.id
            }
        })
    }

    console.log('✅ Clubs Seeded!')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())

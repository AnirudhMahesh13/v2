import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const universities = [
    { name: 'University of Toronto', domain: 'utoronto.ca', logo: 'https://upload.wikimedia.org/wikipedia/en/0/04/Utoronto_coa.svg' },
    { name: 'University of Waterloo', domain: 'uwaterloo.ca', logo: 'https://www.google.com/s2/favicons?domain=uwaterloo.ca&sz=128' },
    { name: 'Western University', domain: 'uwo.ca', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Western_ontario_univ_textlogo.svg' },
    { name: 'Queen\'s University', domain: 'queensu.ca', logo: 'https://www.google.com/s2/favicons?domain=queensu.ca&sz=128' },
    { name: 'McMaster University', domain: 'mcmaster.ca', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/49/McMaster_Coat_of_Arms_Rendition.svg' },
    { name: 'University of Ottawa', domain: 'uottawa.ca', logo: 'https://www.google.com/s2/favicons?domain=uottawa.ca&sz=128' },
    { name: 'Carleton University', domain: 'carleton.ca', logo: 'https://www.google.com/s2/favicons?domain=carleton.ca&sz=128' },
    { name: 'York University', domain: 'yorku.ca', logo: 'https://www.google.com/s2/favicons?domain=yorku.ca&sz=128' },
    { name: 'Toronto Metropolitan University', domain: 'torontomu.ca', logo: 'https://www.google.com/s2/favicons?domain=torontomu.ca&sz=128' },
    { name: 'University of Guelph', domain: 'uoguelph.ca', logo: 'https://www.google.com/s2/favicons?domain=uoguelph.ca&sz=128' },
]

const subjects = [
    { code: 'CS', name: 'Computer Science' },
    { code: 'ENG', name: 'English Literature' },
    { code: 'MATH', name: 'Mathematics' },
    { code: 'PHYS', name: 'Physics' },
    { code: 'BUS', name: 'Business' },
    { code: 'PSY', name: 'Psychology' },
    { code: 'ECON', name: 'Economics' },
    { code: 'BIO', name: 'Biology' },
]

const profNames = [
    "Dr. Sarah Smith", "Dr. James Johnson", "Dr. Emily Davis", "Dr. Michael Brown",
    "Dr. Jessica Wilson", "Dr. David Miller", "Dr. Jennifer Taylor", "Dr. Robert Anderson",
    "Dr. Lisa Thomas", "Dr. William Jackson", "Dr. Elizabeth White", "Dr. Christopher Harris",
    "Dr. Pat Morin", "Dr. Anil Somayaji", "Dr. Robert Collier", "Dr. Christine Laurendeau"
]

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

async function main() {
    console.log('🌱 Starting Massive Seed...')

    // Create a Seed User for all threads
    const seedUser = await prisma.user.upsert({
        where: { email: 'seed-student@example.com' },
        update: {},
        create: {
            email: 'seed-student@example.com',
            name: 'Anonymous Student',
            schoolId: null
        }
    })

    for (const uni of universities) {
        console.log(`Creating ${uni.name}...`)
        const school = await prisma.school.upsert({
            where: { domain: uni.domain },
            update: {
                logoUrl: uni.logo
            },
            create: {
                name: uni.name,
                domain: uni.domain,
                logoUrl: uni.logo
            }
        })

        // Create Professors
        const profs = []
        for (let i = 0; i < 8; i++) {
            const name = randomItem(profNames)
            const prof = await prisma.professor.create({
                data: {
                    name: `${name} (${uni.name.split(' ')[0]})`, // Unique-ish name
                    schoolId: school.id,
                    department: randomItem(subjects).name
                }
            })
            profs.push(prof)
        }

        // Create Courses
        for (const subject of subjects) {
            for (let level = 1; level <= 4; level++) {
                const code = `${subject.code}${level}${randomInt(0, 9)}${randomInt(0, 9)}`
                const course = await prisma.course.create({
                    data: {
                        name: `Introduction to ${subject.name} ${level === 1 ? 'I' : level === 4 ? 'Advanced' : ''}`,
                        code: code,
                        schoolId: school.id,
                        professors: {
                            connect: [{ id: randomItem(profs).id }, { id: randomItem(profs).id }]
                        }
                    }
                })

                // Create Threads
                await prisma.thread.create({
                    data: {
                        title: `${code} Exam Prep`,
                        body: "Does anyone have past midterms?",
                        courseId: course.id,
                        userId: seedUser.id
                    }
                })
            }
        }
    }

    console.log('✅ Massive Seed Complete')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

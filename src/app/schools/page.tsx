import { prisma } from '@/lib/prisma'
import { SchoolList } from '@/components/SchoolList'

export default async function SchoolsDirectory() {
    const schools = await prisma.school.findMany({
        include: {
            _count: {
                select: { courses: true, users: true }
            }
        },
        orderBy: { name: 'asc' }
    })

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 font-display">School Directory</h1>
                    <p className="text-slate-500">Find your university to access courses and resources.</p>
                </div>
            </div>

            <SchoolList schools={schools} />
        </div>
    )
}

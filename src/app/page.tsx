import Link from 'next/link'
import { ArrowRight, BookOpen, Users, ShieldCheck } from 'lucide-react'
import { Leaderboard } from '@/components/Leaderboard'

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-32 md:py-48 flex flex-col items-center text-center px-6 relative">
        <div className="max-w-4xl space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-600 mb-4">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            The Academic Network for Ontario
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-time font-display">
            Connect with your <br />
            <span className="text-slate-900">Campus Community</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Classmate is the verified platform for students. Find courses, read honest reviews, and book expert tutors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/schools"
              className="btn-primary text-base px-8 py-3 h-12"
            >
              Find Your School
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              href="/tutors"
              className="btn-secondary text-base px-8 py-3 h-12"
            >
              Browse Tutors
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-7xl px-6 pb-32 grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          icon={BookOpen}
          title="Verified Course Reviews"
          description="Get the real scoop on workload and difficulty from students who actually took the class."
        />
        <FeatureCard
          icon={Users}
          title="Campus Discussion"
          description="Connect with classmates in authenticated threads specific to your courses and professors."
        />
        <FeatureCard
          icon={ShieldCheck}
          title="Secure Tutoring"
          description="Book sessions with verified tutors using our secure, guaranteed payment protection."
        />
      </section>

      {/* Community Leaderboard */}
      <section className="w-full max-w-4xl px-6 pb-32">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-8 font-display">Top Contributors</h2>
        <Leaderboard />
      </section>

    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="card p-8">
      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-900 mb-6 border border-slate-200">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-3 font-display">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm md:text-base">{description}</p>
    </div>
  )
}

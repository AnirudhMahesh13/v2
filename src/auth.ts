import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: "Dev Login",
            credentials: {
                email: { label: "Email", type: "text" },
            },
            async authorize(credentials: Partial<Record<"email", unknown>>) {
                if (process.env.NODE_ENV === 'production') return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials?.email as string }
                })
                return user
            }
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.id = user.id
            }
            return token
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                // @ts-expect-error -- role is dynamic
                session.user.role = token.role as Role
            }
            return session
        },
    },
})

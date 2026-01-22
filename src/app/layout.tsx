import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/Sidebar";
import SocialDock from "@/components/SocialDock";
import { UserHeartbeat } from "@/components/UserHeartbeat";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Classmate | The Academic Network",
  description: "Connect, learn, and grow with your campus community.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const user = session?.user;

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-grid-pattern min-h-screen flex flex-col">
        {user && <UserHeartbeat />}

        {/* Top Nav (Persistent) */}
        <Navigation user={user} />

        {/* Animated background elements */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-100/40 blur-[120px] mix-blend-multiply opacity-70 animate-blob" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-100/40 blur-[120px] mix-blend-multiply opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] rounded-full bg-fuchsia-100/30 blur-[100px] mix-blend-multiply opacity-70 animate-blob animation-delay-4000" />
        </div>

        <div className="flex relative">
          {/* Sidebar (Desktop Only) */}
          {user && <Sidebar user={user} />}

          {/* RIGHT: Social Dock (Desktop Only) */}
          {user && user.id && <SocialDock currentUserId={user.id} />}

          {/* Main Content */}
          {/* If user, add left padding for sidebar space & right padding for social dock */}
          <main className={`relative z-0 min-h-[calc(100vh-80px)] pt-20 flex-1 w-full ${user ? 'lg:pl-[280px] lg:pr-[280px]' : ''}`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

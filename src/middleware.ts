
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    // 1. Check if trying to access admin routes
    if (req.nextUrl.pathname.startsWith("/admin")) {
        // @ts-expect-error -- role is dynamic
        const role = req.auth?.user?.role
        console.log("[Middleware] Checking Admin Access")
        console.log("[Middleware] User:", req.auth?.user?.email)
        console.log("[Middleware] Role:", role)

        // 2. Redirect if not authenticated or not ADMIN
        if (!req.auth || role !== "ADMIN") {
            console.log("[Middleware] Redirecting to home: Access Denied")
            return NextResponse.redirect(new URL("/", req.url))
        }
    }
})

export const config = {
    // Matcher excluding API routes, static files, images, etc.
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

import {
	convexAuthNextjsMiddleware,
	createRouteMatcher,
	isAuthenticatedNextjs,
	nextjsMiddlewareRedirect
} from "@convex-dev/auth/nextjs/server";
import type { NextRequest } from "next/server";

const isSignInPage = createRouteMatcher(["/sign-in", "/sign-up"]);
const isProtectedRoute = createRouteMatcher([
	"/dashboard(.*)",
	"/onboarding(.*)",
	"/admin(.*)",
	"/managers(.*)",
	"/worker(.*)",
	"/org(.*)"
]);

export default convexAuthNextjsMiddleware(async (request: NextRequest) => {
	const pathname = request.nextUrl.pathname;
	console.log("[Middleware] Request path:", pathname);

	// Check if user is authenticated
	const isAuthenticated = await isAuthenticatedNextjs();
	console.log("[Middleware] Is authenticated:", isAuthenticated);

	// Redirect authenticated users away from sign-in/sign-up pages
	if (isSignInPage(request) && isAuthenticated) {
		console.log("[Middleware] Redirecting authenticated user from auth page to dashboard");
		return nextjsMiddlewareRedirect(request, "/dashboard");
	}

	// Redirect unauthenticated users to sign-in if accessing protected routes
	if (isProtectedRoute(request) && !isAuthenticated) {
		console.log("[Middleware] Redirecting unauthenticated user to sign-in");
		// Store the original URL to redirect back after login
		const url = new URL("/sign-in", request.url);
		url.searchParams.set("redirectTo", request.nextUrl.pathname);
		return nextjsMiddlewareRedirect(request, url.toString());
	}

	console.log("[Middleware] Allowing request to proceed");
	// Allow the request to proceed
	return;
});

export const config = {
	// Run middleware on all routes except static assets
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder files (e.g., images, robots.txt)
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
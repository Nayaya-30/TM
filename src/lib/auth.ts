import { auth } from 'next-auth';

/**
 * Get the current session for the authenticated user
 * For use in Server Components
 */
export async function getSession() {
	return await auth();
}

/**
 * Get the current user ID from the session
 * For use in Server Components
 */
export async function getCurrentUserId() {
	const session = await auth();
	return session?.user?.id || null;
}

/**
 * Check if user is authenticated
 * For use in Server Components
 */
export async function isAuthenticated() {
	const session = await auth();
	return !!session?.user;
}

/**
 * Get the current user's email from session
 * For use in Server Components
 */
export async function getCurrentUserEmail() {
	const session = await auth();
	return session?.user?.email || null;
}

/**
 * Hook for client components to check if authenticated
 * Use useSession from next-auth/react in client components
 */
export { useSession } from 'next-auth/react';

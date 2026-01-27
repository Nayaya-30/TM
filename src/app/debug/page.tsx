"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useEffect, useState } from "react";

export default function DebugAuthPage() {
	const { isAuthenticated, isLoading, session } = useConvexAuth();
	const { signIn, signOut } = useAuthActions();
	const currentUser = useQuery(api.users.queries.getCurrentUser);
	const profile = useQuery(api.users.queries.getProfile, isAuthenticated ? {} : "skip");

	const [cookies, setCookies] = useState<string>("Loading...");
	const [localStorage, setLocalStorage] = useState<string>("Loading...");
	const [testResult, setTestResult] = useState<string>("");

	// Debug: log auth session whenever it changes
	useEffect(() => {
		console.log("[DEBUG] useConvexAuth state changed:", { isAuthenticated, isLoading, session });
		if (session) {
			console.log("[DEBUG] Session details:", {
				userId: session.userId,
				email: session.user?.email,
				role: session.user?.role,
				token: session.token, // JWT issued by Convex
				expires: session.expires,
			});
		} else {
			console.log("[DEBUG] No session (not signed in)");
		}
	}, [session, isAuthenticated, isLoading]);

	// Debug: log cookies & localStorage on mount
	useEffect(() => {
		setCookies(document.cookie || "No cookies");
		const storage = Object.keys(window.localStorage).reduce((acc, key) => {
			acc[key] = window.localStorage.getItem(key);
			return acc;
		}, {} as Record<string, string | null>);
		setLocalStorage(JSON.stringify(storage, null, 2));
	}, []);

	const handleTestSignIn = async () => {
		setTestResult("Testing sign in...");
		try {
			const result = await signIn("password", {
				email: "nexr.fr@gmail.com",
				password: "2021Byn95@",
				flow: "signIn",
			});
			console.log("[DEBUG] signIn result:", result);

			// Wait briefly for session to update
			const checkSession = setInterval(() => {
				if (isAuthenticated) {
					console.log("[DEBUG] User authenticated! Session:", session);
					clearInterval(checkSession);
					setTestResult("Sign in completed. See console for session/token.");
				}
			}, 100);
		} catch (err: any) {
			setTestResult(`Error: ${err.message || String(err)}`);
			console.error("[DEBUG] signIn error:", err);
		}
	};

	const handleSignOut = async () => {
		try {
			await signOut();
			setTestResult("Signed out");
			console.log("[DEBUG] Signed out. Session should be cleared:", session);
		} catch (err: any) {
			setTestResult(`Error signing out: ${err.message || String(err)}`);
			console.error("[DEBUG] signOut error:", err);
		}
	};

	return (
		<div className="min-h-screen p-8 bg-background">
			<div className="max-w-2xl mx-auto space-y-6">
				<h1 className="text-3xl font-bold">Auth Debug Page</h1>

				<div className="p-6 border rounded-lg space-y-4">
					<h2 className="text-xl font-semibold">Auth State</h2>
					<div className="space-y-2 font-mono text-sm">
						<div>
							<span className="text-muted-foreground">isLoading:</span>{" "}
							<span className={isLoading ? "text-yellow-500" : "text-green-500"}>
								{isLoading.toString()}
							</span>
						</div>
						<div>
							<span className="text-muted-foreground">isAuthenticated:</span>{" "}
							<span className={isAuthenticated ? "text-green-500" : "text-red-500"}>
								{isAuthenticated.toString()}
							</span>
						</div>
						<div>
							<span className="text-muted-foreground">Session token:</span>{" "}
							<pre className="inline font-mono text-xs">{session?.token || "No token"}</pre>
						</div>
					</div>

					<div className="flex gap-2 mt-4">
						<button
							onClick={handleTestSignIn}
							className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						>
							Test Sign In (existing user)
						</button>
						<button
							onClick={handleSignOut}
							className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
						>
							Sign Out
						</button>
					</div>
					{testResult && (
						<div className="mt-2 p-3 bg-muted rounded text-sm">
							{testResult}
						</div>
					)}
				</div>

				{/* Current User */}
				<div className="p-6 border rounded-lg space-y-4">
					<h2 className="text-xl font-semibold">Current User</h2>
					<pre className="p-4 bg-muted rounded text-xs overflow-auto">
						{currentUser === undefined
							? "Loading..."
							: JSON.stringify(currentUser, null, 2)}
					</pre>
				</div>

				{/* Profile */}
				<div className="p-6 border rounded-lg space-y-4">
					<h2 className="text-xl font-semibold">Profile</h2>
					<pre className="p-4 bg-muted rounded text-xs overflow-auto">
						{profile === undefined
							? "Loading..."
							: JSON.stringify(profile, null, 2)}
					</pre>
				</div>

				{/* Cookies */}
				<div className="p-6 border rounded-lg space-y-4">
					<h2 className="text-xl font-semibold">Cookies</h2>
					<pre className="p-4 bg-muted rounded text-xs overflow-auto">{cookies}</pre>
				</div>

				{/* LocalStorage */}
				<div className="p-6 border rounded-lg space-y-4">
					<h2 className="text-xl font-semibold">localStorage</h2>
					<pre className="p-4 bg-muted rounded text-xs overflow-auto">{localStorage}</pre>
				</div>
			</div>
		</div>
	);
}
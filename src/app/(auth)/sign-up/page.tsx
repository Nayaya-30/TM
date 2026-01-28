"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export default function SignUpPage() {
	const router = useRouter();
	const { signIn } = useAuthActions();
	const { isAuthenticated, session } = useConvexAuth();

	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [accountType, setAccountType] = useState<"customer" | "admin">("customer");
	const [redirectPath, setRedirectPath] = useState<string | null>(null);

	// Handle redirect after successful authentication
	useEffect(() => {
		console.log("[Sign-Up] Auth state changed:", { isAuthenticated, redirectPath });
		if (isAuthenticated && redirectPath) {
			console.log("[Sign-Up] Redirecting to:", redirectPath);
			router.push(redirectPath);
		}
	}, [isAuthenticated, redirectPath, router]);

	async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  setIsLoading(true);
  setError("");

  try {
    // Step 1: Create the user (signUp flow)
    await signIn("password", {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: accountType,
      flow: "signUp",
    });

    console.log("[Sign-Up] Account created, now signing in...");

    // Step 2: Immediately sign in with the same credentials
    const signInResult = await signIn("password", {
      email: formData.email,
      password: formData.password,
      flow: "signIn",           // ← critical change here
    });

    console.log("[Sign-Up] Auto sign-in result:", signInResult);

    // Give the client a moment to receive + apply the new session (usually <1s)
    await new Promise(resolve => setTimeout(resolve, 800));

    if (isAuthenticated) {
      const targetPath = accountType === "admin" ? "/onboarding" : "/dashboard";
      router.push(targetPath);
    } else {
      // Rare race — fallback
      setError("Account created, but auto-login failed. Please sign in manually.");
      router.push("/sign-in");
    }
  } catch (err: any) {
    console.error("[Sign-Up] Error:", err);
    setError(err.message || "Sign up failed (check if email is already used)");
  } finally {
    setIsLoading(false);
  }
}

	useEffect(() => {
		if (isAuthenticated) {
			router.push(accountType === "admin" ? "/onboarding" : "/dashboard");
		}
	}, [isAuthenticated])

	// Add this useEffect inside your component, after getting session from useConvexAuth
	useEffect(() => {
		if (session) {
			console.log("[DEBUG] Convex Auth Token / Session:", {
				userId: session.userId,
				email: session.user?.email,
				roles: session.user?.role,
				token: session.token, // This is the Convex-issued JWT
				expires: session.expires,
			});
		} else {
			console.log("[DEBUG] No session yet (user not authenticated)");
		}
	}, [session]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
			{/* Background gradients */}
			<div className="absolute top-0 right-1/2 translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] -z-10 opacity-50" />
			<div className="absolute bottom-0 left-0 w-[800px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] -z-10 opacity-50" />

			<Card className="w-full max-w-lg border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
				<CardHeader className="space-y-1 text-center pb-8">
					<div className="flex justify-center mb-6">
						<div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
							<div className="h-6 w-6 rounded-full bg-primary" />
						</div>
					</div>
					<CardTitle className="text-3xl font-bold tracking-tight">Create Account</CardTitle>
					<CardDescription className="text-base">Choose your account type to get started</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="p-1 bg-muted/50 rounded-xl flex mb-8">
						<button
							type="button"
							className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${accountType === 'customer' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
							onClick={() => setAccountType('customer')}
						>
							Customer
						</button>
						<button
							type="button"
							className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${accountType === 'admin' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
							onClick={() => setAccountType('admin')}
						>
							Business Owner
						</button>
					</div>

					<form onSubmit={handleSubmit} className="space-y-5">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<label htmlFor="firstName" className="text-sm font-medium ml-1">First Name</label>
								<Input
									id="firstName"
									placeholder="John"
									value={formData.firstName}
									onChange={e => setFormData({ ...formData, firstName: e.target.value })}
									required
									disabled={isLoading}
									className="h-11 bg-background/50 border-border/50 focus:bg-background transition-all rounded-xl"
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="lastName" className="text-sm font-medium ml-1">Last Name</label>
								<Input
									id="lastName"
									placeholder="Doe"
									value={formData.lastName}
									onChange={e => setFormData({ ...formData, lastName: e.target.value })}
									required
									disabled={isLoading}
									className="h-11 bg-background/50 border-border/50 focus:bg-background transition-all rounded-xl"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<label htmlFor="email" className="text-sm font-medium ml-1">Email</label>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								value={formData.email}
								onChange={e => setFormData({ ...formData, email: e.target.value })}
								required
								disabled={isLoading}
								className="h-11 bg-background/50 border-border/50 focus:bg-background transition-all rounded-xl"
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="password" className="text-sm font-medium ml-1">Password</label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={formData.password}
								onChange={e => setFormData({ ...formData, password: e.target.value })}
								required
								disabled={isLoading}
								className="h-11 bg-background/50 border-border/50 focus:bg-background transition-all rounded-xl"
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="confirmPassword" className="text-sm font-medium ml-1">Confirm Password</label>
							<Input
								id="confirmPassword"
								type="password"
								placeholder="••••••••"
								value={formData.confirmPassword}
								onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
								required
								disabled={isLoading}
								className="h-11 bg-background/50 border-border/50 focus:bg-background transition-all rounded-xl"
							/>
						</div>

						{error && (
							<div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive font-medium flex items-center justify-center">{error}</div>
						)}

						<Button
							type="submit"
							className="w-full h-11 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
							disabled={isLoading}
						>
							{isLoading ? "Creating..." : "Create Account"}
						</Button>
					</form>

					<div className="mt-8 text-center text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link href="/sign-in" className="font-medium text-primary hover:text-primary/80 transition-colors">
							Sign in
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
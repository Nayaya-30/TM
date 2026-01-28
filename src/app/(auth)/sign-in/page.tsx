"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
	const router = useRouter();
	const { signIn } = useAuthActions();
	const { isAuthenticated } = useConvexAuth();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	// Redirect if already authenticated
	useEffect(() => {
		if (isAuthenticated) {
			router.push("/dashboard");
		}
	}, [isAuthenticated, router]);

	async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    await signIn("password", {
      email,
      password,
      flow: "signIn",
    });

    // Optional: brief wait + check (helps in slow networks)
    await new Promise(r => setTimeout(r, 1200));
    if (isAuthenticated) {
      console.log("Already authenticated after signIn");
    }
    // No need to redirect here — useEffect will catch it
  } catch (err: any) {
    console.error("Sign in error:", err);
    setError(
      err.message?.includes("credentials") 
        ? "Invalid email or password" 
        : "Something went wrong — please try again"
    );
  } finally {
    setIsLoading(false);
  }
}

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
			{/* Background gradients */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-50" />
			<div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] -z-10 opacity-50" />

			<Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
				<CardHeader className="space-y-1 text-center pb-8">
					<div className="flex justify-center mb-6">
						<div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
							<div className="h-6 w-6 rounded-full bg-primary" />
						</div>
					</div>
					<CardTitle className="text-3xl font-bold tracking-tight">Welcome Back</CardTitle>
					<CardDescription className="text-base">Sign in to your account to continue</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-5">
						<div className="space-y-2">
							<label htmlFor="email" className="text-sm font-medium ml-1">
								Email
							</label>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={isLoading}
								className="h-11 bg-background/50 border-border/50 focus:bg-background transition-all rounded-xl"
							/>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between ml-1">
								<label htmlFor="password" className="text-sm font-medium">
									Password
								</label>
								<Link
									href="/auth/reset-password"
									className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
								>
									Forgot password?
								</Link>
							</div>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								disabled={isLoading}
								className="h-11 bg-background/50 border-border/50 focus:bg-background transition-all rounded-xl"
							/>
						</div>

						{error && (
							<div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive font-medium flex items-center justify-center">
								{error}
							</div>
						)}

						<Button
							type="submit"
							className="w-full h-11 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
							disabled={isLoading}
						>
							{isLoading ? (
								<div className="flex items-center gap-2">
									<div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
									Signing in...
								</div>
							) : (
								"Sign In"
							)}
						</Button>
					</form>

					<div className="mt-8 text-center text-sm text-muted-foreground">
						Don&apos;t have an account?{" "}
						<Link href="/sign-up" className="font-medium text-primary hover:text-primary/80 transition-colors">
							Sign up
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
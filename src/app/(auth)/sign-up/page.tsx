"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
	const router = useRouter();
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

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");

		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		setIsLoading(true);

		const res = await fetch("/api/auth/signup", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: formData.email,
				password: formData.password,
				firstName: formData.firstName,
				lastName: formData.lastName,
				role: accountType,
			}),
		});

		if (!res.ok) {
			setError("Failed to create account");
			setIsLoading(false);
			return;
		}

		await signIn("credentials", {
			email: formData.email,
			password: formData.password,
			redirect: false,
		});

		router.push(accountType === "admin" ? "/onboarding" : "/dashboard");
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="text-3xl font-bold">Create Account</CardTitle>
					<CardDescription>Choose your account type to get started</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex gap-2 mb-6">
						<Button
							type="button"
							variant={accountType === "customer" ? "primary" : "outline"}
							className="flex-1"
							onClick={() => setAccountType("customer")}
						>
							Customer
						</Button>
						<Button
							type="button"
							variant={accountType === "admin" ? "primary" : "outline"}
							className="flex-1"
							onClick={() => setAccountType("admin")}
						>
							Business Owner
						</Button>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<label htmlFor="firstName" className="text-sm font-medium">
									First Name
								</label>
								<Input
									id="firstName"
									placeholder="John"
									value={formData.firstName}
									onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
									required
									disabled={isLoading}
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="lastName" className="text-sm font-medium">
									Last Name
								</label>
								<Input
									id="lastName"
									placeholder="Doe"
									value={formData.lastName}
									onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
									required
									disabled={isLoading}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<label htmlFor="email" className="text-sm font-medium">
								Email
							</label>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								required
								disabled={isLoading}
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="password" className="text-sm font-medium">
								Password
							</label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={formData.password}
								onChange={(e) => setFormData({ ...formData, password: e.target.value })}
								required
								disabled={isLoading}
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="confirmPassword" className="text-sm font-medium">
								Confirm Password
							</label>
							<Input
								id="confirmPassword"
								type="password"
								placeholder="••••••••"
								value={formData.confirmPassword}
								onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
								required
								disabled={isLoading}
							/>
						</div>

						{error && (
							<div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
								{error}
							</div>
						)}

						<Button type="submit" className="w-full" isLoading={isLoading}>
							Create Account
						</Button>
					</form>

					<div className="mt-6 text-center text-sm">
						<span className="text-muted-foreground">Already have an account? </span>
						<Link href="/sign-in" className="font-medium text-primary hover:underline">
							Sign in
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
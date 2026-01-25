"use client";

import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthLinker } from "@/components/authLink"
const metadata: Metadata = {
	title: "Tailoring Management Platform",
	description: "Professional tailoring business management solution",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<SessionProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<ConvexClientProvider>
							<AuthLinker />
							{children}
						</ConvexClientProvider>
					</ThemeProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
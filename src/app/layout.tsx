"use client";

import type { Metadata } from 'next';
import './globals.css';
import { ConvexClientProvider } from '@/components/providers/convex-client-provider';
import { SessionProvider } from 'next-auth/react';


const metadata: Metadata = {
	title: 'Tailoring Management Platform',
	description: 'Professional tailoring business management solution',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body>
				<SessionProvider>
					<ConvexClientProvider>{children}</ConvexClientProvider>
				</SessionProvider>
			</body>
		</html>
	);
}

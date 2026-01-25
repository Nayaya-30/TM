// src/app/layout.tsx
import { AuthWrapper } from "./auth-wrapper"; // Import your local wrapper
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import "./globals.css";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AuthWrapper>
			<html lang="en">
				<body>
					<ConvexClientProvider>
						{children}
					</ConvexClientProvider>
				</body>
			</html>
		</AuthWrapper>
	);
}

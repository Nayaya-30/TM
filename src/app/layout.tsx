import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";


export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {

	return (
		<ConvexAuthNextjsServerProvider>
							<html lang="en">
						<body>
			<ConvexClientProvider>
				<ThemeProvider>

							{children}

				</ThemeProvider>
			</ConvexClientProvider>
									</body>
					</html>
		</ConvexAuthNextjsServerProvider>
	);
}
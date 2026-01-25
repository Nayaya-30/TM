import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { SignJWT, importPKCS8 } from "jose";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Import the multi-line private key from your .env
		const privateKeyRaw = process.env.CONVEX_AUTH_PRIVATE_KEY!;
		const privateKey = await importPKCS8(privateKeyRaw, "RS256");

		const payload = {
			sub: session.user.id, // Convex user _id
			email: session.user.email,
			role: session.user.role || "customer",
		};

		const token = await new SignJWT(payload)
			.setProtectedHeader({
				alg: "RS256",
				kid: "next-auth-key" // MUST match kid in auth.config.ts
			})
			.setIssuedAt()
			.setIssuer("http://localhost:3000")
			.setAudience("convex")
			.setExpirationTime("1h")
			.sign(privateKey);

		console.log("session:", session);
		console.log("token sent to Convex:", token);
		
		return NextResponse.json({ token });
	} catch (err: any) {
		console.error("[convex-auth] Error:", err);
		return NextResponse.json({ error: "Internal error" }, { status: 500 });
	}
}

import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser"; // ✅ server-safe

// -----------------------------------------------------------------------------
// Server-safe Convex client
// -----------------------------------------------------------------------------
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) throw new Error("NEXT_PUBLIC_CONVEX_URL not set");
const convex = new ConvexHttpClient(convexUrl);

export async function POST(req: Request) {
	const body = await req.json();
	const { email, password, firstName, lastName, role } = body;

	// ----------------------------
	// 1. Call Convex mutation
	// ----------------------------
	try {
		const result = await convex.mutation("users/createUser", {
			email,
			password,
			firstName,
			lastName,
			role,
		});

		return NextResponse.json({ success: true, id: result.id });
	} catch (err: any) {
		// Handle uniqueness / other errors
		if (err.message.includes("Email already in use")) {
			return NextResponse.json({ error: "Email already in use" }, { status: 400 });
		}
		console.error(err);
		return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
	}
}
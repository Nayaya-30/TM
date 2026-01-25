// src/components/auth/auth-linker.tsx
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AuthLinker() {
	const { status } = useSession();
	const linkAuthToUser = useMutation(api.users.mutations.linkAuthToUser);

	useEffect(() => {
		if (status === "authenticated") {
			linkAuthToUser();
		}
	}, [status, linkAuthToUser]);

	return null;
}
import { Password } from "@convex-dev/auth/providers/Password";

// convex/auth.config.ts
export default {
	providers: [
		{
			// For Auth0 / OIDC
			domain: "http://localhost:3000",
			applicationID: "convex",
		},
	],
};
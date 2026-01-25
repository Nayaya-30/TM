import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

// Define your route groups
const isPublicPage = createRouteMatcher(["/sign-in", "/sign-up"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const authenticated = await convexAuth.isAuthenticated();

  // 1. If the user is on a public page (sign-in/up) and is already logged in,
  //    send them to the dashboard.
  if (isPublicPage(request) && authenticated) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }

  // 2. If the user is NOT logged in and trying to access a protected route,
  //    redirect to sign-in.
  //    (In this config, everything except public pages is protected)
  if (!isPublicPage(request) && !authenticated) {
    return nextjsMiddlewareRedirect(request, "/sign-in");
  }

  // 3. User is authorized, proceed.
});

export const config = {
  // Protects all routes except static files and Next.js internals
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

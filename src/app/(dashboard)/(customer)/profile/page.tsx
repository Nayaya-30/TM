"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Building2, Calendar, LogOut } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export default function CustomerProfilePage() {
  const profile = useQuery(api.users.queries.getProfile);
  const currentOrg = useQuery(api.organizations.queries.getCurrent);
  const { signOut } = useAuthActions();
  const router = useRouter();

  if (profile === undefined || currentOrg === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  async function handleSignOut() {
    await signOut();
    router.push("/sign-in");
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-medium text-primary">
                {profile.user.firstName[0]}
                {profile.user.lastName[0]}
              </span>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <p className="text-2xl font-bold">
                  {profile.user.firstName} {profile.user.lastName}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {profile.user.emailVerified && (
                    <Badge variant="success">Email Verified</Badge>
                  )}
                  {profile.user.phoneVerified && (
                    <Badge variant="success">Phone Verified</Badge>
                  )}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{profile.user.email}</p>
                  </div>
                </div>

                {profile.user.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{profile.user.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            {currentOrg.logo && (
              <img
                src={currentOrg.logo}
                alt={currentOrg.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold">{currentOrg.name}</h3>
                {currentOrg.verified && (
                  <Badge variant="success">✓ Verified</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {currentOrg.location.address}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Your Role</p>
                  <Badge variant="default" className="mt-1 capitalize">
                    {profile.organizations[0]?.role}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Member Since</p>
                  <p className="font-medium mt-1">
                    {format(profile.organizations[0]?.joinedAt || Date.now(), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" disabled>
            <User className="mr-2 h-4 w-4" />
            Edit Profile (Coming Soon)
          </Button>
          <Button variant="outline" className="w-full justify-start" disabled>
            <Mail className="mr-2 h-4 w-4" />
            Change Email (Coming Soon)
          </Button>
          <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
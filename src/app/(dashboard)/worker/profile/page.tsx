"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Star, TrendingUp, Award, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export default function WorkerProfilePage() {
  const { data: session } = useSession();
  const userId = session?.user?.id as any;
  const profile = useQuery(
    api.users.queries.getProfile,
    userId ? { userId } : undefined
  );
  const tasks = useQuery(api.tasks.queries.listMine);
  // Skip calling org getCurrent until Convex auth token exchange is implemented
  const currentOrg = undefined as any;
  const router = useRouter();

  if (profile === undefined || tasks === undefined || currentOrg === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === "completed");
  const tasksWithRating = completedTasks.filter((t) => t.rating !== undefined);
  const avgRating =
    tasksWithRating.length > 0
      ? tasksWithRating.reduce((sum, t) => sum + (t.rating ?? 0), 0) / tasksWithRating.length
      : 0;

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push("/sign-in");
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">View your performance and account details</p>
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
                <Badge variant="default" className="mt-2">Worker</Badge>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{profile.user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgRating > 0 ? avgRating.toFixed(1) : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {tasksWithRating.length} rated task{tasksWithRating.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {completedTasks.length} of {tasks.length} tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          {tasksWithRating.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No rated tasks yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasksWithRating.slice(0, 5).map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex-1">
                    <p className="font-medium">{task.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(task.completedAt!, "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{task.rating?.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle>Working For</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            {currentOrg.logo && (
              <img
                src={currentOrg.logo}
                alt={currentOrg.name}
                className="h-12 w-12 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold">{currentOrg.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Member since {format(profile.organizations[0]?.joinedAt || Date.now(), "MMMM yyyy")}
              </p>
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
          <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

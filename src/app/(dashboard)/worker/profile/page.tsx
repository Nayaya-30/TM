"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Mail, TrendingUp, CheckCircle2, Clock, Calendar } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default function WorkerProfilePage() {
  const { data: session } = useSession();
  const userId = session?.user?.id as any;
  const profile = useQuery(
    api.users.queries.getProfile,
    userId ? { userId } : "skip"
  );
  const tasks = useQuery(api.tasks.queries.listMine);
  // Skip calling org getCurrent until Convex auth token exchange is implemented
  const currentOrg = undefined as any;
  const router = useRouter();

  if (profile === undefined || tasks === undefined) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-5 w-96 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === "completed");
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push("/sign-in");
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            View your performance and account details
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleSignOut}
          className="rounded-full border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          Sign Out
        </Button>
      </div>

      {/* Profile Card */}
      <div className="group relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/50 backdrop-blur-sm p-8 md:p-10 transition-all duration-300 hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 shadow-inner ring-4 ring-background">
            <span className="text-4xl font-bold text-primary">
              {profile.user.firstName[0]}
              {profile.user.lastName[0]}
            </span>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                {profile.user.firstName} {profile.user.lastName}
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
                <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-4 py-1">
                  Worker
                </Badge>
                <Badge variant="outline" className="rounded-full px-4 py-1">
                  Member since {format(new Date(profile.user._creationTime), "MMMM yyyy")}
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 pt-4">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border border-border/50">
                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center shadow-sm">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email</p>
                  <p className="font-medium truncate">{profile.user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border border-border/50">
                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center shadow-sm">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Joined</p>
                  <p className="font-medium">{format(new Date(profile.user._creationTime), "PP")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div>
        <h3 className="text-xl font-bold mb-6 px-1">Performance Overview</h3>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <span className="text-sm font-medium text-muted-foreground bg-background/50 px-3 py-1 rounded-full backdrop-blur-sm">Total</span>
            </div>
            <div className="relative">
              <div className="text-4xl font-bold mb-1">{tasks.length}</div>
              <p className="text-sm text-muted-foreground">Assigned Tasks</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-500/10 px-3 py-1 rounded-full">
                {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
              </span>
            </div>
            <div className="relative">
              <div className="text-4xl font-bold mb-1">{completedTasks.length}</div>
              <p className="text-sm text-muted-foreground">Completed Tasks</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <span className="text-sm font-medium text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full">Active</span>
            </div>
            <div className="relative">
              <div className="text-4xl font-bold mb-1">{inProgressTasks.length + pendingTasks.length}</div>
              <p className="text-sm text-muted-foreground">In Progress & Pending</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

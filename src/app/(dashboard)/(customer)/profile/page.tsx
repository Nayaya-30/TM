"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Building2, LogOut, ShieldCheck, MapPin } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export default function CustomerProfilePage() {
  const { data: session } = useSession();
  const userId = session?.user?.id as any;
  const profile = useQuery(
    api.users.queries.getProfile,
    userId ? { userId } : "skip"
  );
  const currentOrg = useQuery(api.organizations.queries.getCurrent);
  const router = useRouter();

  if (profile === undefined || currentOrg === undefined) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48 rounded-xl" />
            <Skeleton className="h-4 w-64 rounded-xl" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-48 rounded-3xl" />
      </div>
    );
  }

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push("/sign-in");
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Manage your account and organization settings
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid gap-6">
        {/* Personal Information Card */}
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/50 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative flex flex-col md:flex-row gap-8 items-start">
            <div className="h-32 w-32 rounded-[2rem] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 shadow-inner border border-primary/10">
              <span className="text-4xl font-bold text-primary">
                {profile.user.firstName[0]}
                {profile.user.lastName[0]}
              </span>
            </div>

            <div className="flex-1 space-y-6 w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold">
                    {profile.user.firstName} {profile.user.lastName}
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile.user.emailVerified && (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 px-3 py-1 rounded-full">
                        <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                        Email Verified
                      </Badge>
                    )}
                    {profile.user.phoneVerified && (
                      <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20 px-3 py-1 rounded-full">
                        <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                        Phone Verified
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="outline" className="rounded-full" disabled>
                  Edit Profile
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-border/50">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center shadow-sm">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email Address</p>
                    <p className="font-medium truncate">{profile.user.email}</p>
                  </div>
                </div>

                {profile.user.phone && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
                    <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center shadow-sm">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Phone Number</p>
                      <p className="font-medium">{profile.user.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Organization Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-lg">
             <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             
             <div className="relative space-y-4">
               <div className="flex items-center gap-3 mb-2">
                 <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                   <Building2 className="h-5 w-5 text-orange-500" />
                 </div>
                 <h3 className="text-xl font-bold">Organization</h3>
               </div>

               <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30">
                 {currentOrg.logo ? (
                   <img
                     src={currentOrg.logo}
                     alt={currentOrg.name}
                     className="h-12 w-12 rounded-xl object-cover"
                   />
                 ) : (
                   <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center text-lg font-bold">
                     {currentOrg.name[0]}
                   </div>
                 )}
                 <div>
                   <p className="font-bold text-lg">{currentOrg.name}</p>
                   <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                     <MapPin className="h-3.5 w-3.5" />
                     {currentOrg.location.address}
                   </div>
                 </div>
               </div>
             </div>
          </div>

          <div className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-lg">
             <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             
             <div className="relative space-y-4">
               <div className="flex items-center gap-3 mb-2">
                 <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                   <LogOut className="h-5 w-5 text-red-500" />
                 </div>
                 <h3 className="text-xl font-bold text-destructive">Danger Zone</h3>
               </div>

               <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-4">
                 <p className="text-sm text-muted-foreground">
                   Sign out of your account on this device.
                 </p>
                 <Button 
                   variant="destructive" 
                   className="w-full rounded-xl shadow-lg shadow-red-500/20 hover:shadow-red-500/30" 
                   onClick={handleSignOut}
                 >
                   <LogOut className="mr-2 h-4 w-4" />
                   Sign Out
                 </Button>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

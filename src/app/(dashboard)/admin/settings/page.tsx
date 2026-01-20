"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Settings, MapPin, Palette, Shield, CreditCard, Users, CheckCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function AdminSettingsPage() {
  const currentOrg = useQuery(api.organizations.queries.getCurrent);
  const updateSettings = useMutation(api.organizations.mutations.updateSettings);

  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    allowWorkerAdminChat: false,
    publicShowcase: true,
  });

  if (currentOrg === undefined) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Skeleton className="h-12 w-64 rounded-xl bg-muted/50" />
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-[2rem] bg-muted/50" />
          <Skeleton className="h-48 rounded-[2rem] bg-muted/50" />
          <Skeleton className="h-48 rounded-[2rem] bg-muted/50" />
        </div>
      </div>
    );
  }

  // Initialize settings
  if (settings.allowWorkerAdminChat !== currentOrg.settings.allowWorkerAdminChat) {
    setSettings(currentOrg.settings);
  }

  async function handleSaveSettings() {
    setIsSaving(true);
    try {
      await updateSettings(settings);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Organization Settings</h1>
        <p className="text-lg text-muted-foreground mt-2 font-medium">Manage your organization preferences and configuration</p>
      </div>

      {/* Organization Info */}
      <div className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-8 hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Organization Details
          </h2>
          
          <div className="flex items-start gap-6 mb-8">
            {currentOrg.logo ? (
              <img
                src={currentOrg.logo}
                alt={currentOrg.name}
                className="h-24 w-24 rounded-[1.5rem] object-cover border border-border/50 shadow-sm"
              />
            ) : (
              <div className="h-24 w-24 rounded-[1.5rem] bg-primary/10 flex items-center justify-center border border-border/50">
                <span className="text-3xl font-bold text-primary">{currentOrg.name[0]}</span>
              </div>
            )}
            <div className="flex-1 pt-2">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold">{currentOrg.name}</h3>
                {currentOrg.verified && (
                  <Badge variant="success" className="rounded-full px-3">
                    <CheckCircle className="h-3 w-3 mr-1" /> Verified
                  </Badge>
                )}
              </div>
              <p className="text-base text-muted-foreground font-mono bg-muted/50 px-3 py-1 rounded-lg inline-block">{currentOrg.slug}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <div className="flex items-center gap-4 p-4 rounded-3xl bg-background/40 border border-border/30">
              <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Location</p>
                <p className="font-bold text-lg">{currentOrg.location.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-3xl bg-background/40 border border-border/30">
              <div className="h-10 w-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <Palette className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Accent Color</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-lg border border-border shadow-sm"
                    style={{ backgroundColor: currentOrg.accentColor }}
                  />
                  <span className="font-bold text-lg">{currentOrg.accentColor}</span>
                </div>
              </div>
            </div>
          </div>

          <Button variant="outline" disabled className="rounded-xl border-border/50 bg-background/50 hover:bg-background/80">
            Edit Organization Details (Coming Soon)
          </Button>
        </div>
      </div>

      {/* Subscription */}
      <div className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-8 hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Subscription
          </h2>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 p-6 rounded-[1.5rem] bg-gradient-to-br from-background/80 to-background/40 border border-border/30">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Current Plan</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold capitalize">{currentOrg.subscription.tier}</span>
                <Badge variant="default" className="capitalize rounded-lg">
                  {currentOrg.subscription.tier}
                </Badge>
              </div>
            </div>
            <div className="md:text-right">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Status</p>
              <Badge
                variant={
                  currentOrg.subscription.status === "active"
                    ? "success"
                    : currentOrg.subscription.status === "past_due"
                    ? "warning"
                    : "danger"
                }
                className="capitalize rounded-lg px-4 py-1 text-base"
              >
                {currentOrg.subscription.status}
              </Badge>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-muted/50 mb-6 flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Current Period Ends</p>
              <p className="font-medium text-foreground">
                {format(currentOrg.subscription.currentPeriodEnd, "MMMM d, yyyy")}
              </p>
            </div>
          </div>

          <Button variant="outline" disabled className="rounded-xl border-border/50 bg-background/50 hover:bg-background/80">
            Manage Subscription (Coming Soon)
          </Button>
        </div>
      </div>

      {/* Verification */}
      <div className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-8 hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Verification
          </h2>
          
          <div className="flex items-center justify-between mb-8 p-6 rounded-[1.5rem] bg-background/40 border border-border/30">
            <div>
              <p className="font-bold text-lg">Verification Status</p>
              <p className="text-sm text-muted-foreground mt-1">
                {currentOrg.verified
                  ? "Your organization is verified"
                  : "Verification pending or not submitted"}
              </p>
            </div>
            <Badge variant={currentOrg.verified ? "success" : "warning"} className="text-base px-4 py-1.5 rounded-full">
              {currentOrg.verified ? "Verified" : "Not Verified"}
            </Badge>
          </div>

          {currentOrg.verificationDocuments && (
            <div className="grid gap-3 mb-8">
              {[
                { label: "Email Verification", status: currentOrg.verificationDocuments.emailVerified },
                { label: "Phone Verification", status: currentOrg.verificationDocuments.phoneVerified },
                { label: "BVN Verification", status: currentOrg.verificationDocuments.bvnVerified },
                { label: "Bank Verification", status: currentOrg.verificationDocuments.bankVerified }
              ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-background/30 border border-border/20">
                  <span className="font-medium">{doc.label}</span>
                  <Badge
                    variant={doc.status ? "success" : "warning"}
                    className="rounded-lg"
                  >
                    {doc.status ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                    {doc.status ? "Verified" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          <Button variant="outline" disabled className="rounded-xl border-border/50 bg-background/50 hover:bg-background/80">
            Submit Verification (Coming Soon)
          </Button>
        </div>
      </div>

      {/* App Settings */}
      <div className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-8 hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Communication Settings
          </h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-6 rounded-[1.5rem] bg-background/40 border border-border/30 hover:bg-background/60 transition-colors">
              <div className="flex-1 pr-4">
                <p className="font-bold text-lg">Allow Worker-Admin Chat</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Enable direct communication between workers and admins
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowWorkerAdminChat}
                  onChange={(e) =>
                    setSettings({ ...settings, allowWorkerAdminChat: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-6 rounded-[1.5rem] bg-background/40 border border-border/30 hover:bg-background/60 transition-colors">
              <div className="flex-1 pr-4">
                <p className="font-bold text-lg">Public Showcase</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Make your showcase visible to the public
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.publicShowcase}
                  onChange={(e) =>
                    setSettings({ ...settings, publicShowcase: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>
          </div>

          <Button 
            onClick={handleSaveSettings} 
            disabled={isSaving}
            className="w-full sm:w-auto rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02]" 
            size="lg"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
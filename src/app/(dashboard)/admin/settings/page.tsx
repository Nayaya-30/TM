"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Settings, MapPin, Palette, Shield, CreditCard, Users } from "lucide-react";
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
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground">Manage your organization preferences and configuration</p>
      </div>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Organization Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <p className="text-sm text-muted-foreground">{currentOrg.slug}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{currentOrg.location.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Accent Color</p>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-6 h-6 rounded border border-border"
                    style={{ backgroundColor: currentOrg.accentColor }}
                  />
                  <span className="font-medium">{currentOrg.accentColor}</span>
                </div>
              </div>
            </div>
          </div>

          <Button variant="outline" disabled>
            Edit Organization Details (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Plan</p>
              <Badge variant="default" className="mt-2 capitalize">
                {currentOrg.subscription.tier}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                variant={
                  currentOrg.subscription.status === "active"
                    ? "success"
                    : currentOrg.subscription.status === "past_due"
                    ? "warning"
                    : "danger"
                }
                className="mt-2 capitalize"
              >
                {currentOrg.subscription.status}
              </Badge>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">Current Period Ends</p>
            <p className="font-medium">
              {format(currentOrg.subscription.currentPeriodEnd, "MMMM d, yyyy")}
            </p>
          </div>

          <Button variant="outline" disabled>
            Manage Subscription (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      {/* Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Verification Status</p>
              <p className="text-sm text-muted-foreground mt-1">
                {currentOrg.verified
                  ? "Your organization is verified"
                  : "Verification pending or not submitted"}
              </p>
            </div>
            <Badge variant={currentOrg.verified ? "success" : "warning"}>
              {currentOrg.verified ? "Verified" : "Not Verified"}
            </Badge>
          </div>

          {currentOrg.verificationDocuments && (
            <div className="grid gap-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
                <span className="text-sm">Email Verification</span>
                <Badge
                  variant={
                    currentOrg.verificationDocuments.emailVerified ? "success" : "warning"
                  }
                >
                  {currentOrg.verificationDocuments.emailVerified ? "✓" : "Pending"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
                <span className="text-sm">Phone Verification</span>
                <Badge
                  variant={
                    currentOrg.verificationDocuments.phoneVerified ? "success" : "warning"
                  }
                >
                  {currentOrg.verificationDocuments.phoneVerified ? "✓" : "Pending"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
                <span className="text-sm">BVN Verification</span>
                <Badge
                  variant={currentOrg.verificationDocuments.bvnVerified ? "success" : "warning"}
                >
                  {currentOrg.verificationDocuments.bvnVerified ? "✓" : "Pending"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
                <span className="text-sm">Bank Verification</span>
                <Badge
                  variant={
                    currentOrg.verificationDocuments.bankVerified ? "success" : "warning"
                  }
                >
                  {currentOrg.verificationDocuments.bankVerified ? "✓" : "Pending"}
                </Badge>
              </div>
            </div>
          )}

          <Button variant="outline" disabled>
            Submit Verification (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Communication Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex-1">
              <p className="font-medium">Allow Worker-Admin Chat</p>
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
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex-1">
              <p className="font-medium">Public Showcase</p>
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
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <Button onClick={handleSaveSettings} isLoading={isSaving}>
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
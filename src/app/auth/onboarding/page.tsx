"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const createOrganization = useMutation(api.organizations.mutations.create);

  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: 0,
    longitude: 0,
    accentColor: "#3b82f6",
    theme: "system" as "light" | "dark" | "system",
  });

  const steps = [
    { number: 1, title: "Business Details", description: "Tell us about your business" },
    { number: 2, title: "Location", description: "Where are you located?" },
    { number: 3, title: "Branding", description: "Customize your appearance" },
  ];

  async function handleSubmit() {
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setIsCreating(true);

    try {
      await createOrganization({
        name: formData.name,
        accentColor: formData.accentColor,
        theme: formData.theme,
        location: {
          address: formData.address,
          latitude: formData.latitude || 6.5244, // Default to Lagos
          longitude: formData.longitude || 3.3792,
        },
      });

      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Failed to create organization:", error);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Setup Your Organization</CardTitle>
          <CardDescription>Complete these steps to get started</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= s.number
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > s.number ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{s.number}</span>
                    )}
                  </div>
                  <p className="text-xs mt-2 text-center hidden md:block">{s.title}</p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      step > s.number ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Royal Tailors"
                    required
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Address</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g., 123 Market Street, Lagos"
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  This will be visible to customers browsing tailors
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Brand Accent Color</label>
                  <div className="flex gap-4 items-center">
                    <Input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="w-20 h-12 cursor-pointer"
                    />
                    <Input
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      placeholder="#3b82f6"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This color will be used for buttons, highlights, and branding
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Theme Preference</label>
                  <select
                    value={formData.theme}
                    onChange={(e) =>
                      setFormData({ ...formData, theme: e.target.value as any })
                    }
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-base"
                  >
                    <option value="system">System (Auto)</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-2 justify-between pt-4">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              <Button
                className="ml-auto"
                onClick={handleSubmit}
                disabled={
                  (step === 1 && !formData.name) ||
                  (step === 2 && !formData.address) ||
                  isCreating
                }
                isLoading={isCreating}
              >
                {step === 3 ? "Complete Setup" : "Continue"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
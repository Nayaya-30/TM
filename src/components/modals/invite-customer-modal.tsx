"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy } from "lucide-react";

interface InviteCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteCustomerModal({ isOpen, onClose, onSuccess }: InviteCustomerModalProps) {
  const createCustomer = useMutation(api.customers.mutations.create);
  const [isCreating, setIsCreating] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsCreating(true);

    try {
      const result = await createCustomer({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        sendInvite: true,
      });

      if (result.inviteToken) {
        setInviteToken(result.inviteToken);
      }

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to invite customer:", error);
    } finally {
      setIsCreating(false);
    }
  }

  function copyInviteLink() {
    if (inviteToken) {
      const link = `${window.location.origin}/sign-up?token=${inviteToken}`;
      navigator.clipboard.writeText(link);
    }
  }

  function handleClose() {
    setInviteToken(null);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Customer" size="md">
      {inviteToken ? (
        <div className="space-y-4">
          <div className="text-center py-6">
            <Badge variant="success" className="text-base mb-4">
              Customer Created Successfully!
            </Badge>
            <p className="text-sm text-muted-foreground mb-4">
              Share this invite link with the customer:
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm font-mono break-all mb-2">
              {window.location.origin}/sign-up?token={inviteToken}
            </p>
            <Button variant="outline" size="sm" onClick={copyInviteLink} className="w-full">
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Note:</strong> In production, this link would be automatically sent via email
              or SMS. For now, share it manually with the customer.
            </p>
          </div>

          <Button onClick={handleClose} className="w-full">
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email (Optional)</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="customer@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone (Optional)</label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+234 XXX XXX XXXX"
            />
          </div>

          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              The customer will receive an invite link to claim their account and access their
              orders and measurements.
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Create & Invite
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
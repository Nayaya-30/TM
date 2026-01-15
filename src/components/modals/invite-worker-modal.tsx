"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy } from "lucide-react";

interface InviteWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteWorkerModal({ isOpen, onClose, onSuccess }: InviteWorkerModalProps) {
  const inviteMember = useMutation(api.members.mutations.invite);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    role: "worker" as "worker" | "manager",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsInviting(true);

    try {
      const result = await inviteMember({
        email: formData.email,
        role: formData.role,
        sendInvite: true,
      });

      if (result?.inviteToken) {
        setInviteToken(result.inviteToken);
      }

      setFormData({ email: "", role: "worker" });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to invite worker:", error);
    } finally {
      setIsInviting(false);
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Worker" size="md">
      {inviteToken ? (
        <div className="space-y-4">
          <div className="text-center py-6">
            <Badge variant="success" className="text-base mb-4">
              Invitation Sent!
            </Badge>
            <p className="text-sm text-muted-foreground mb-4">
              Share this invite link with the worker:
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
              or SMS. For now, share it manually.
            </p>
          </div>

          <Button onClick={handleClose} className="w-full">
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Worker Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="worker@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-base"
            >
              <option value="worker">Worker</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              The invite will grant access to this organization with the selected role.
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isInviting}>
              Send Invite
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

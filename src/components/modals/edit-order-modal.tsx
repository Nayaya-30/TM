"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Id } from "@/convex/_generated/dataModel";

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    _id: Id<"orders">;
    description: string;
    estimatedDelivery: number;
    price?: number;
    notes?: string;
  };
  onSuccess?: () => void;
}

export function EditOrderModal({ isOpen, onClose, order, onSuccess }: EditOrderModalProps) {
  const updateOrder = useMutation(api.orders.mutations.update);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    estimatedDelivery: "",
    price: "",
    notes: "",
  });

  useEffect(() => {
    if (order) {
      setFormData({
        description: order.description,
        estimatedDelivery: new Date(order.estimatedDelivery).toISOString().split("T")[0],
        price: order.price?.toString() || "",
        notes: order.notes || "",
      });
    }
  }, [order]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsUpdating(true);

    try {
      await updateOrder({
        orderId: order._id,
        description: formData.description,
        estimatedDelivery: new Date(formData.estimatedDelivery).getTime(),
        price: formData.price ? parseFloat(formData.price) : undefined,
        notes: formData.notes || undefined,
      });

      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to update order:", error);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Order" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-4 py-2 text-base"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Estimated Delivery</label>
          <Input
            type="date"
            value={formData.estimatedDelivery}
            onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
            min={new Date().toISOString().split("T")[0]}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Price (Optional)</label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="0.00"
            min={0}
            step={0.01}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Notes (Optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-4 py-2 text-base"
          />
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isUpdating}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}